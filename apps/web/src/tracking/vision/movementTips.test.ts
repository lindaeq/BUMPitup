import { describe, expect, it } from "vitest";
import { TipCoach, type CoachEvent } from "./movementTips";
import { ExerciseSession } from "./exerciseSession";
import { LM } from "./exerciseConfigs";
import type { PoseLandmark, RepPhase, TrackingQuality } from "./trackingTypes";

const messages = {
  "start-position": "start",
  "more-range": "more",
  "finish-rep": "finish",
  "too-fast": "slow",
};

type Frame = { quality?: TrackingQuality; phase?: RepPhase; event?: CoachEvent | null };

function step(coach: TipCoach, t: number, f: Frame = {}) {
  return coach.update({ quality: f.quality ?? "good", phase: f.phase ?? "start", event: f.event ?? null }, t);
}

describe("TipCoach", () => {
  it("shows a tip for an incomplete rep", () => {
    const coach = new TipCoach(messages, "camera");
    expect(step(coach, 0)).toBeNull();
    expect(step(coach, 100, { event: "partial" })?.kind).toBe("more-range");
  });

  it("shows at most one new tip every 10 seconds", () => {
    const coach = new TipCoach(messages, "camera");
    const first = step(coach, 0, { event: "partial" });
    expect(first?.message).toBe("more");

    // Further mistakes inside the 10 s window do not replace or add tips.
    for (let t = 1000; t < 10_000; t += 1000) {
      const tip = step(coach, t, { event: "too-fast" });
      expect(tip === null || tip.id === first!.id).toBe(true);
    }

    const next = step(coach, 10_000, { event: "too-fast" });
    expect(next?.kind).toBe("too-fast");
    expect(next?.id).not.toBe(first?.id);
  });

  it("hides a tip after it has been visible for 8 seconds", () => {
    const coach = new TipCoach(messages, "camera");
    step(coach, 0, { event: "partial" });
    expect(step(coach, 7_900)).not.toBeNull();
    expect(step(coach, 8_000)).toBeNull();
  });

  it("asks for the start position when stuck waiting while tracked", () => {
    const coach = new TipCoach(messages, "camera");
    for (let t = 0; t < 5_000; t += 100) expect(step(coach, t, { phase: "waiting" })).toBeNull();
    expect(step(coach, 5_000, { phase: "waiting" })?.kind).toBe("start-position");
  });

  it("asks to finish the rep when stuck at the target", () => {
    const coach = new TipCoach(messages, "camera");
    step(coach, 0, { phase: "target" });
    expect(step(coach, 5_900, { phase: "target" })).toBeNull();
    expect(step(coach, 6_000, { phase: "target" })?.kind).toBe("finish-rep");
  });

  it("gives a camera tip after sustained poor tracking, not a movement tip", () => {
    const coach = new TipCoach(messages, "camera");
    expect(step(coach, 0, { quality: "partial", phase: "waiting" })).toBeNull();
    const tip = step(coach, 4_000, { quality: "partial", phase: "waiting" });
    expect(tip?.kind).toBe("tracking");
    expect(tip?.message).toBe("camera");
  });

  it("does not show tips with no configured message", () => {
    const coach = new TipCoach({}, "camera");
    expect(step(coach, 0, { event: "partial" })).toBeNull();
    step(coach, 0, { phase: "target" });
    expect(step(coach, 20_000, { phase: "target" })).toBeNull();
  });

  it("stays quiet during good, complete reps", () => {
    const coach = new TipCoach(messages, "camera");
    const phases: RepPhase[] = ["start", "target", "start"];
    for (let t = 0; t < 60_000; t += 100) {
      const phase = phases[Math.floor(t / 1500) % phases.length];
      const event = t % 3000 === 0 && t > 0 ? "rep" : null;
      expect(step(coach, t, { phase, event })).toBeNull();
    }
  });
});

// ---- End-to-end with synthetic landmarks ----

const W = 640;
const H = 480;

function armPose(deg: number): PoseLandmark[] {
  const pose: PoseLandmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.95 }));
  const shoulder = { x: 320, y: 160 };
  const rad = (deg * Math.PI) / 180;
  pose[LM.LEFT_SHOULDER] = { x: shoulder.x / W, y: shoulder.y / H, visibility: 0.95 };
  pose[LM.LEFT_HIP] = { x: shoulder.x / W, y: (shoulder.y + 180) / H, visibility: 0.95 };
  pose[LM.LEFT_ELBOW] = {
    x: (shoulder.x + 120 * Math.sin(rad)) / W,
    y: (shoulder.y + 120 * Math.cos(rad)) / H,
    visibility: 0.95,
  };
  return pose;
}

describe("ExerciseSession tips", () => {
  it("tells the patient to lift higher after an arm raise that stops short", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    const angles = [
      ...Array(15).fill(10),
      ...Array.from({ length: 20 }, (_, i) => 10 + (55 * i) / 19), // up to 65°, below the 75° target
      ...Array.from({ length: 20 }, (_, i) => 65 - (55 * i) / 19),
      ...Array(15).fill(10),
    ];
    let t = 0;
    let tip = null;
    for (const a of angles) {
      const r = s.process(armPose(a), W, H, t);
      tip = r.tip ?? tip;
      t += 33;
    }
    expect(tip?.kind).toBe("more-range");
    expect(tip?.message).toMatch(/higher/);
  });

  it("does not report resting jitter around the start threshold as an incomplete rep", () => {
    const s = new ExerciseSession("seated-arm-raise", "left");
    let t = 0;
    for (let i = 0; i < 600; i++) {
      // Wobbles between 35° and 45° around the 40° start threshold.
      const r = s.process(armPose(40 + 5 * Math.sin(i / 3)), W, H, t);
      expect(r.tip?.kind).not.toBe("more-range");
      t += 33;
    }
  });
});
