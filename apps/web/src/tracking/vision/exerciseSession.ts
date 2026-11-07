import { AngleSmoother, measureJoint } from "./angle";
import { getExerciseConfig, withOverrides } from "./exerciseConfigs";
import { HoldDetector } from "./holdDetector";
import { RepCounter } from "./repCounter";
import { TipCoach, type CoachEvent, type TipCoachOptions } from "./movementTips";
import type {
  CVResult,
  ExerciseConfig,
  HoldExerciseConfig,
  JointTriple,
  PoseLandmark,
  RepExerciseConfig,
  RepThresholds,
  Side,
  TrackingQuality,
} from "./trackingTypes";

const opposite = (side: Side): Side => (side === "left" ? "right" : "left");

export function emptyResult(hold = false): CVResult {
  return {
    reps: 0,
    currentAngle: null,
    movementRange: null,
    trackingQuality: "unavailable",
    repRanges: [],
    sessionMinAngle: null,
    sessionMaxAngle: null,
    phase: "waiting",
    tip: null,
    ...(hold
      ? { hold: { holding: false, currentHoldSeconds: 0, completedHoldSeconds: [], armAngle: null, legAngle: null } }
      : {}),
  };
}

/**
 * Framework-free per-frame processor: landmarks in, CVResult out.
 * The React component owns the camera and MediaPipe; this class owns the maths,
 * which keeps it unit-testable with synthetic landmarks.
 */
interface FrameOutput {
  result: CVResult;
  event: CoachEvent | null;
}

export class ExerciseSession {
  readonly config: ExerciseConfig;
  /** Landmark triples to highlight on the preview. */
  readonly highlightedJoints: JointTriple[];
  private readonly impl: RepSessionImpl | HoldSessionImpl;
  private readonly coach: TipCoach;

  constructor(
    exerciseId: string,
    side: Side = "left",
    overrides?: Partial<RepThresholds>,
    tipOptions?: Partial<TipCoachOptions>,
  ) {
    const base = getExerciseConfig(exerciseId);
    if (!base) throw new Error(`Unknown exerciseId "${exerciseId}"`);

    if (base.kind === "rep") {
      const config = withOverrides(base, overrides);
      this.config = config;
      this.impl = new RepSessionImpl(config, side);
      this.highlightedJoints = [config.landmarks[side]];
    } else {
      this.config = base;
      this.impl = new HoldSessionImpl(base, side);
      const leg = base.leg[opposite(side)];
      const arm = base.arm[side];
      this.highlightedJoints = [arm.shoulderFlexion, arm.elbow, leg.hipExtension, leg.knee];
    }
    this.coach = new TipCoach(this.config.tips, this.config.cameraHint, tipOptions);
  }

  /**
   * Process one video frame.
   * @param landmarks the first detected pose, or null if no person was detected.
   */
  process(landmarks: readonly PoseLandmark[] | null, width: number, height: number, timestampMs: number): CVResult {
    const { result, event } = this.impl.process(landmarks, width, height, timestampMs);
    result.tip = this.coach.update({ quality: result.trackingQuality, phase: result.phase, event }, timestampMs);
    return result;
  }

  /** Hide the current tip (e.g. when the camera stops) without resetting counts. */
  clearTip(): void {
    this.coach.clear();
  }

  reset(): void {
    this.impl.reset();
    this.coach.reset();
  }
}

class RepSessionImpl {
  private readonly smoother: AngleSmoother;
  private readonly counter: RepCounter;

  constructor(
    private readonly config: RepExerciseConfig,
    private readonly side: Side,
  ) {
    this.smoother = new AngleSmoother(config.smoothingAlpha);
    this.counter = new RepCounter(config);
  }

  process(landmarks: readonly PoseLandmark[] | null, width: number, height: number, t: number): FrameOutput {
    let quality: TrackingQuality = "unavailable";
    let raw: number | null = null;

    if (landmarks && landmarks.length > 0) {
      const reading = measureJoint(landmarks, this.config.landmarks[this.side], width, height, this.config.minVisibility);
      quality = reading.reliable ? "good" : "partial";
      raw = reading.reliable ? reading.angle : null;
    }

    const angle = this.smoother.next(raw);
    const snap = this.counter.update(angle, t);

    const result: CVResult = {
      reps: snap.reps,
      currentAngle: angle === null ? null : round1(angle),
      movementRange: snap.averageRange === null ? null : round1(snap.averageRange),
      trackingQuality: quality,
      repRanges: snap.repRanges.map(round1),
      sessionMinAngle: snap.sessionMinAngle === null ? null : round1(snap.sessionMinAngle),
      sessionMaxAngle: snap.sessionMaxAngle === null ? null : round1(snap.sessionMaxAngle),
      phase: snap.phase,
      tip: null,
    };
    return { result, event: snap.event };
  }

  reset(): void {
    this.smoother.reset();
    this.counter.reset();
  }
}

class HoldSessionImpl {
  private readonly smoothers: Record<"arm" | "elbow" | "hip" | "knee", AngleSmoother>;
  private readonly detector: HoldDetector;
  private sessionMin: number | null = null;
  private sessionMax: number | null = null;

  constructor(
    private readonly config: HoldExerciseConfig,
    private readonly side: Side,
  ) {
    const a = config.smoothingAlpha;
    this.smoothers = {
      arm: new AngleSmoother(a),
      elbow: new AngleSmoother(a),
      hip: new AngleSmoother(a),
      knee: new AngleSmoother(a),
    };
    this.detector = new HoldDetector(config);
  }

  process(landmarks: readonly PoseLandmark[] | null, width: number, height: number, t: number): FrameOutput {
    const arm = this.config.arm[this.side];
    const leg = this.config.leg[opposite(this.side)];
    const v = this.config.minVisibility;

    let quality: TrackingQuality = "unavailable";
    const readings = { arm: null, elbow: null, hip: null, knee: null } as Record<keyof typeof this.smoothers, number | null>;

    if (landmarks && landmarks.length > 0) {
      const raw = {
        arm: measureJoint(landmarks, arm.shoulderFlexion, width, height, v),
        elbow: measureJoint(landmarks, arm.elbow, width, height, v),
        hip: measureJoint(landmarks, leg.hipExtension, width, height, v),
        knee: measureJoint(landmarks, leg.knee, width, height, v),
      };
      quality = Object.values(raw).every((r) => r.reliable) ? "good" : "partial";
      for (const key of Object.keys(raw) as (keyof typeof raw)[]) {
        readings[key] = raw[key].reliable ? raw[key].angle : null;
      }
    }

    const smoothed = {
      armElevation: this.smoothers.arm.next(readings.arm),
      elbow: this.smoothers.elbow.next(readings.elbow),
      hipExtension: this.smoothers.hip.next(readings.hip),
      knee: this.smoothers.knee.next(readings.knee),
    };

    const snap = this.detector.update(quality === "unavailable" ? null : smoothed, t);

    if (smoothed.armElevation !== null) {
      this.sessionMin = this.sessionMin === null ? smoothed.armElevation : Math.min(this.sessionMin, smoothed.armElevation);
      this.sessionMax = this.sessionMax === null ? smoothed.armElevation : Math.max(this.sessionMax, smoothed.armElevation);
    }

    const result: CVResult = {
      reps: snap.completedHoldsMs.length,
      currentAngle: smoothed.armElevation === null ? null : round1(smoothed.armElevation),
      movementRange: null,
      trackingQuality: quality,
      repRanges: [],
      sessionMinAngle: this.sessionMin === null ? null : round1(this.sessionMin),
      sessionMaxAngle: this.sessionMax === null ? null : round1(this.sessionMax),
      phase: snap.phase,
      tip: null,
      hold: {
        holding: snap.holding,
        currentHoldSeconds: round1(snap.currentHoldMs / 1000),
        completedHoldSeconds: snap.completedHoldsMs.map((ms) => round1(ms / 1000)),
        armAngle: smoothed.armElevation === null ? null : round1(smoothed.armElevation),
        legAngle: smoothed.hipExtension === null ? null : round1(smoothed.hipExtension),
      },
    };
    return { result, event: snap.event };
  }

  reset(): void {
    Object.values(this.smoothers).forEach((s) => s.reset());
    this.detector.reset();
    this.sessionMin = null;
    this.sessionMax = null;
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
