import { describe, expect, it } from "vitest";
import { ExerciseSession } from "./exerciseSession";
import { LM } from "./exerciseConfigs";
import type { PoseLandmark } from "./trackingTypes";

const W = 640;
const H = 480;
const FRAME_MS = 33;

/** 33 visible landmarks parked at the frame centre. */
function blankPose(): PoseLandmark[] {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
}

/**
 * Side-view seated pose with the shoulder elevated by `deg` degrees.
 * Hip is directly below the shoulder; the elbow rotates forward from straight down.
 */
function armPose(deg: number, side: "left" | "right" = "left"): PoseLandmark[] {
  const pose = blankPose();
  const [hipIdx, shoulderIdx, elbowIdx] =
    side === "left" ? [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW] : [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW];
  const shoulder = { x: 320, y: 160 };
  const rad = (deg * Math.PI) / 180;
  const elbow = { x: shoulder.x + 120 * Math.sin(rad), y: shoulder.y + 120 * Math.cos(rad) };
  pose[shoulderIdx] = { x: shoulder.x / W, y: shoulder.y / H, visibility: 0.95 };
  pose[hipIdx] = { x: shoulder.x / W, y: (shoulder.y + 180) / H, visibility: 0.95 };
  pose[elbowIdx] = { x: elbow.x / W, y: elbow.y / H, visibility: 0.95 };
  return pose;
}

function feed(session: ExerciseSession, frames: (PoseLandmark[] | null)[], start = 0) {
  let t = start;
  let result = session.process(null, W, H, t);
  for (const f of frames) {
    result = session.process(f, W, H, t);
    t += FRAME_MS;
  }
  return result;
}

function armCycle(rest: number, peak: number, side: "left" | "right" = "left") {
  const up = Array.from({ length: 20 }, (_, i) => rest + ((peak - rest) * i) / 19);
  return [...up, ...[...up].reverse()].map((d) => armPose(d, side));
}

describe("ExerciseSession: seated arm raise", () => {
  it("reports the measured shoulder angle", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const r = feed(s, Array(5).fill(armPose(90)));
    expect(r.trackingQuality).toBe("good");
    expect(r.currentAngle).toBeCloseTo(90, 0);
  });

  it("counts reps end-to-end from synthetic landmarks", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const rest = Array(15).fill(armPose(10));
    const r = feed(s, [...rest, ...armCycle(10, 100), ...rest, ...armCycle(10, 100), ...rest]);
    expect(r.reps).toBe(2);
    expect(r.movementRange).not.toBeNull();
    // Smoothing trims the extremes slightly, so the range is a bit under 90°.
    expect(r.movementRange!).toBeGreaterThan(70);
    expect(r.movementRange!).toBeLessThanOrEqual(90);
    expect(r.repRanges).toHaveLength(2);
  });

  it("uses the requested side", () => {
    const s = new ExerciseSession("seated-arm-raise", "right");
    const rest = Array(15).fill(armPose(10, "right"));
    expect(feed(s, [...rest, ...armCycle(10, 100, "right"), ...rest]).reps).toBe(1);
    // Movement on the other arm is ignored.
    const s2 = new ExerciseSession("seated-arm-raise", "right");
    expect(feed(s2, [...rest.map(() => armPose(10)), ...armCycle(10, 100, "left")]).reps).toBe(0);
  });

  it("reports partial tracking when a joint is not visible", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const pose = armPose(90);
    pose[LM.LEFT_ELBOW] = { ...pose[LM.LEFT_ELBOW], visibility: 0.1 };
    const r = feed(s, [pose]);
    expect(r.trackingQuality).toBe("partial");
    expect(r.currentAngle).toBeNull();
  });

  it("reports unavailable when no person is detected", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const r = feed(s, [null, null]);
    expect(r.trackingQuality).toBe("unavailable");
    expect(r.currentAngle).toBeNull();
    expect(r.reps).toBe(0);
  });

  it("applies per-patient threshold overrides", () => {
    // With a 105° upper threshold, a raise to 100° is not a full rep.
    const s = new ExerciseSession("seated-arm-raise", "left", { highThreshold: 105 });
    const rest = Array(15).fill(armPose(10));
    expect(feed(s, [...rest, ...armCycle(10, 100), ...rest]).reps).toBe(0);
  });

  it("rejects invalid overrides and unknown exercises", () => {
    expect(() => new ExerciseSession("seated-arm-raise", "left", { lowThreshold: 90, highThreshold: 80 })).toThrow();
    expect(() => new ExerciseSession("handstand", "left")).toThrow(/Unknown exerciseId/);
  });

  it("reset returns to an empty result", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const rest = Array(15).fill(armPose(10));
    feed(s, [...rest, ...armCycle(10, 100), ...rest]);
    s.reset();
    const r = s.process(null, W, H, 100000);
    expect(r.reps).toBe(0);
    expect(r.movementRange).toBeNull();
    expect(r.sessionMaxAngle).toBeNull();
  });
});

/** Bird-dog pose: left arm (selected) + right leg (opposite). Angles are set directly. */
function birdDogPose(armElevation: number, hipAngle: number): PoseLandmark[] {
  const pose = blankPose();
  const toNorm = (p: { x: number; y: number }) => ({ x: p.x / W, y: p.y / H, visibility: 0.9 });
  const at = (origin: { x: number; y: number }, deg: number, len: number) => ({
    x: origin.x + len * Math.cos((deg * Math.PI) / 180),
    y: origin.y - len * Math.sin((deg * Math.PI) / 180),
  });
  // Horizontal torso, head to the left: shoulder at (200,240), hip at (400,240).
  const shoulder = { x: 200, y: 240 };
  const hip = { x: 400, y: 240 };
  // Arm direction measured from shoulder->hip vector (pointing right, 0°) rotating clockwise in image coordinates (downward).
  const elbow = at(shoulder, -armElevation, 60);
  const wrist = at(shoulder, -armElevation, 120);
  // Leg direction measured from hip->shoulder vector (pointing left, 180°).
  const knee = at(hip, 180 + hipAngle, 80);
  const ankle = at(hip, 180 + hipAngle, 160);
  pose[LM.LEFT_SHOULDER] = toNorm(shoulder);
  pose[LM.LEFT_HIP] = toNorm(hip);
  pose[LM.LEFT_ELBOW] = toNorm(elbow);
  pose[LM.LEFT_WRIST] = toNorm(wrist);
  pose[LM.RIGHT_SHOULDER] = toNorm(shoulder);
  pose[LM.RIGHT_HIP] = toNorm(hip);
  pose[LM.RIGHT_KNEE] = toNorm(knee);
  pose[LM.RIGHT_ANKLE] = toNorm(ankle);
  return pose;
}

describe("ExerciseSession: bird-dog hold", () => {
  it("counts a hold only after the minimum duration", () => {
    const s = new ExerciseSession("bird-dog", "left");
    const start = Array(15).fill(birdDogPose(90, 90));
    const extended = (frames: number) => Array(frames).fill(birdDogPose(170, 170));

    // ~1 s hold: too short.
    let r = feed(s, [...start, ...extended(30), ...start]);
    expect(r.reps).toBe(0);

    // ~3 s hold: counted.
    r = feed(s, [...start, ...extended(90), ...start], 10000);
    expect(r.reps).toBe(1);
    expect(r.hold?.completedHoldSeconds[0]).toBeGreaterThanOrEqual(2);
    expect(r.hold?.holding).toBe(false);
  });

  it("reports an in-progress hold", () => {
    const s = new ExerciseSession("bird-dog", "left");
    const r = feed(s, [...Array(15).fill(birdDogPose(90, 90)), ...Array(40).fill(birdDogPose(170, 170))]);
    expect(r.hold?.holding).toBe(true);
    expect(r.hold?.currentHoldSeconds).toBeGreaterThan(0.5);
  });
});
