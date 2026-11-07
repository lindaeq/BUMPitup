/* eslint-disable react-hooks/set-state-in-effect -- Resetting tracker state when the camera session changes is intentional. */
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DrawingUtils, FilesetResolver, PoseLandmarker, type NormalizedLandmark } from "@mediapipe/tasks-vision";
import { ExerciseSession, emptyResult } from "./exerciseSession";
import { getExerciseConfig } from "./exerciseConfigs";
import type { CVResult, ExerciseTrackerProps, JointTriple, RepExerciseConfig } from "./trackingTypes";

/** Keep in sync with the installed @mediapipe/tasks-vision version. */
export const DEFAULT_WASM_BASE_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2/wasm";
/** Lightweight pose model, chosen for real-time performance in the browser. */
export const DEFAULT_MODEL_ASSET_PATH =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";

/** Callback rate limit. State changes (reps, quality, phase) are always emitted immediately. */
const EMIT_INTERVAL_MS = 100;

// ---------------------------------------------------------------------------
// Shared PoseLandmarker: model loading is slow, so reuse one instance across
// mounts. VIDEO mode requires strictly increasing timestamps per instance.
// ---------------------------------------------------------------------------
const landmarkerCache = new Map<string, Promise<PoseLandmarker>>();
let lastDetectTimestamp = 0;

function loadPoseLandmarker(wasmBasePath: string, modelAssetPath: string): Promise<PoseLandmarker> {
  const key = `${wasmBasePath}|${modelAssetPath}`;
  let promise = landmarkerCache.get(key);
  if (!promise) {
    promise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(wasmBasePath);
      const options = (delegate: "GPU" | "CPU") => ({
        baseOptions: { modelAssetPath, delegate },
        runningMode: "VIDEO" as const,
        numPoses: 1,
      });
      try {
        return await PoseLandmarker.createFromOptions(vision, options("GPU"));
      } catch {
        return await PoseLandmarker.createFromOptions(vision, options("CPU"));
      }
    })();
    // Allow a retry if loading failed (e.g. offline).
    promise.catch(() => landmarkerCache.delete(key));
    landmarkerCache.set(key, promise);
  }
  return promise;
}

type Status = "idle" | "loading" | "running" | "error";

/**
 * Webcam + MediaPipe pose tracker for a single exercise.
 *
 * Video is processed locally in the browser and is never recorded or sent
 * anywhere. Measurements are 2D camera estimates, not clinical measurements.
 */
export function ExerciseTracker({
  exerciseId,
  active,
  side = "left",
  resetKey,
  onUpdate,
  thresholdOverrides,
  onError,
  showOverlay = true,
  showReadout = true,
  mirrored = true,
  wasmBasePath = DEFAULT_WASM_BASE_PATH,
  modelAssetPath = DEFAULT_MODEL_ASSET_PATH,
  className,
  style,
}: ExerciseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Keep latest callbacks in refs so changing them does not restart the camera.
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const showOverlayRef = useRef(showOverlay);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onErrorRef.current = onError;
    showOverlayRef.current = showOverlay;
  });

  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hud, setHud] = useState<CVResult>(() => emptyResult());

  // Serialise overrides so an inline object literal does not reset the session every render.
  const overridesKey = JSON.stringify(thresholdOverrides ?? {});
  const config = getExerciseConfig(exerciseId);

  // A new session (fresh counters) whenever the exercise, side, overrides or resetKey change.
  const session = useMemo(() => {
    try {
      return new ExerciseSession(exerciseId, side, JSON.parse(overridesKey));
    } catch (err) {
      return err instanceof Error ? err : new Error(String(err));
    }
  // resetKey intentionally creates a fresh tracker session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId, side, overridesKey, resetKey]);

  /** Config with per-patient overrides applied, for the on-screen prompt. */
  const activeConfig = session instanceof Error ? null : session.config;

  const sessionRef = useRef<ExerciseSession | null>(null);
  const lastEmitRef = useRef<{ at: number; result: CVResult } | null>(null);

  useEffect(() => {
    if (session instanceof Error) {
      sessionRef.current = null;
      setStatus("error");
      setErrorMessage(session.message);
      onErrorRef.current?.(session);
      return;
    }
    sessionRef.current = session;
    const initial = emptyResult(session.config.kind === "hold");
    lastEmitRef.current = { at: 0, result: initial };
    setHud(initial);
    onUpdateRef.current(initial);
  }, [session]);

  const sessionInvalid = session instanceof Error;

  // Camera + detection loop. Runs only while active. Session resets do not
  // restart the camera: the loop always reads the current session from a ref.
  useEffect(() => {
    if (sessionInvalid) return;
    if (!active) {
      setStatus("idle");
      return;
    }

    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let rafId = 0;
    let lastVideoTime = -1;
    let drawer: DrawingUtils | null = null;

    const fail = (err: unknown) => {
      if (cancelled) return;
      const error = toFriendlyError(err);
      setStatus("error");
      setErrorMessage(error.message);
      onErrorRef.current?.(error);
    };

    const emit = (result: CVResult, now: number) => {
      const last = lastEmitRef.current;
      const changed =
        !last ||
        last.result.reps !== result.reps ||
        last.result.trackingQuality !== result.trackingQuality ||
        last.result.phase !== result.phase ||
        last.result.hold?.holding !== result.hold?.holding ||
        last.result.tip?.id !== result.tip?.id;
      if (changed || now - last.at >= EMIT_INTERVAL_MS) {
        lastEmitRef.current = { at: now, result };
        setHud(result);
        onUpdateRef.current(result);
      }
    };

    const loop = (landmarker: PoseLandmarker) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const current = sessionRef.current;
      if (cancelled || !video || !canvas || !current) return;

      if (video.readyState >= 2 && video.currentTime !== lastVideoTime && video.videoWidth > 0) {
        lastVideoTime = video.currentTime;
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }

        const now = performance.now();
        const ts = Math.max(now, lastDetectTimestamp + 1);
        lastDetectTimestamp = ts;

        let landmarks: NormalizedLandmark[] | null;
        try {
          const detection = landmarker.detectForVideo(video, ts);
          landmarks = detection.landmarks[0] ?? null;
        } catch (err) {
          fail(err);
          return;
        }

        const result = current.process(landmarks, width, height, now);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          if (showOverlayRef.current && landmarks) {
            drawer ??= new DrawingUtils(ctx);
            drawPose(drawer, ctx, landmarks, current.highlightedJoints, result.trackingQuality);
          }
        }

        emit(result, now);
      }
      rafId = requestAnimationFrame(() => loop(landmarker));
    };

    (async () => {
      setStatus("loading");
      setErrorMessage(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported in this browser (a secure https or localhost page is required).");
        }
        const [landmarker, media] = await Promise.all([
          loadPoseLandmarker(wasmBasePath, modelAssetPath),
          navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          }),
        ]);
        if (cancelled) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = media;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = media;
        await video.play();
        if (cancelled) return;
        setStatus("running");
        rafId = requestAnimationFrame(() => loop(landmarker));
      } catch (err) {
        fail(err);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((t) => t.stop());
      if (videoElement) {
        videoElement.pause();
        videoElement.srcObject = null;
      }
      canvasElement?.getContext("2d")?.clearRect(0, 0, canvasElement.width, canvasElement.height);
      // Report that tracking stopped, keeping the session's counts.
      const last = lastEmitRef.current?.result;
      sessionRef.current?.clearTip();
      if (last && (last.trackingQuality !== "unavailable" || last.tip)) {
        const stopped: CVResult = { ...last, currentAngle: null, trackingQuality: "unavailable", tip: null };
        lastEmitRef.current = { at: performance.now(), result: stopped };
        setHud(stopped);
        onUpdateRef.current(stopped);
      }
    };
  }, [active, sessionInvalid, wasmBasePath, modelAssetPath]);

  const flip = mirrored ? "scaleX(-1)" : undefined;

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", maxWidth: 640, aspectRatio: "4 / 3", background: "#111", borderRadius: 8, overflow: "hidden", ...style }}
    >
      <video
        ref={videoRef}
        playsInline
        muted
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: flip }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: flip, pointerEvents: "none" }}
      />

      {showOverlay && showReadout && (
        <div style={hudStyle} aria-live="polite">
          <div style={{ fontWeight: 600 }}>{config?.label ?? exerciseId}</div>
          {config?.kind === "hold" ? (
            <>
              <div>Holds: {hud.reps}</div>
              <div>Hold: {hud.hold?.holding ? `${hud.hold.currentHoldSeconds.toFixed(1)} s` : "-"}</div>
            </>
          ) : (
            <>
              <div>Reps: {hud.reps}</div>
              {activeConfig?.kind === "rep" && <div style={{ color: "#93c5fd" }}>Next: {nextStepText(activeConfig, hud.phase)}</div>}
            </>
          )}
          <div>Angle: {hud.currentAngle === null ? "-" : `${Math.round(hud.currentAngle)}°`}</div>
          {hud.movementRange !== null && <div>Avg range: {Math.round(hud.movementRange)}°</div>}
          <div>
            Tracking: <span style={{ color: qualityColor[hud.trackingQuality] }}>{hud.trackingQuality}</span>
          </div>
        </div>
      )}

      {status !== "running" && (
        <div style={statusStyle}>
          {status === "idle" && "Camera off"}
          {status === "loading" && "Starting camera and pose model..."}
          {status === "error" && (errorMessage ?? "Something went wrong")}
        </div>
      )}
      {status === "running" && showOverlay && showReadout && hud.trackingQuality !== "good" && config && (
        <div style={{ ...hintStyle }}>{config.cameraHint}</div>
      )}
    </div>
  );
}

export default ExerciseTracker;

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

const qualityColor: Record<CVResult["trackingQuality"], string> = {
  good: "#4ade80",
  partial: "#facc15",
  unavailable: "#f87171",
};

function drawPose(
  drawer: DrawingUtils,
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  highlighted: readonly JointTriple[],
  quality: CVResult["trackingQuality"],
) {
  drawer.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, { color: "rgba(255,255,255,0.35)", lineWidth: 2 });
  drawer.drawLandmarks(landmarks, { color: "rgba(255,255,255,0.6)", radius: 2 });

  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.strokeStyle = qualityColor[quality];
  ctx.fillStyle = qualityColor[quality];
  ctx.lineWidth = 5;
  for (const [a, b, c] of highlighted) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    const pc = landmarks[c];
    if (!pa || !pb || !pc) continue;
    ctx.beginPath();
    ctx.moveTo(pa.x * width, pa.y * height);
    ctx.lineTo(pb.x * width, pb.y * height);
    ctx.lineTo(pc.x * width, pc.y * height);
    ctx.stroke();
    for (const p of [pa, pb, pc]) {
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Plain-language description of what the rep counter is waiting for. */
function nextStepText(config: RepExerciseConfig, phase: CVResult["phase"]): string {
  const low = `below ${config.lowThreshold}°`;
  const high = `above ${config.highThreshold}°`;
  const [startZone, targetZone] = config.startPosition === "low" ? [low, high] : [high, low];
  if (phase === "waiting") return `get into the start position (${startZone})`;
  if (phase === "start") return `move to ${targetZone}`;
  return `return to ${startZone} to count the rep`;
}

function toFriendlyError(err: unknown): Error {
  if (err instanceof DOMException) {
    if (err.name === "NotAllowedError") return new Error("Camera permission was denied. Allow camera access to track exercises.");
    if (err.name === "NotFoundError") return new Error("No camera was found.");
    if (err.name === "NotReadableError") return new Error("The camera is already in use by another application.");
  }
  return err instanceof Error ? err : new Error(String(err));
}

const hudStyle: CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  padding: "6px 10px",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  font: "14px/1.4 system-ui, sans-serif",
  borderRadius: 6,
};

const statusStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  textAlign: "center",
  color: "#fff",
  font: "15px system-ui, sans-serif",
};

const hintStyle: CSSProperties = {
  position: "absolute",
  left: 8,
  right: 8,
  bottom: 8,
  padding: "6px 10px",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  font: "13px system-ui, sans-serif",
  borderRadius: 6,
};
