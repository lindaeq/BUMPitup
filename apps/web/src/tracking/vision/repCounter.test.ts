import { describe, expect, it } from "vitest";
import { RepCounter, type RepCounterConfig } from "./repCounter";

const FRAME_MS = 33;

const armConfig: RepCounterConfig = {
  startPosition: "low",
  lowThreshold: 25,
  highThreshold: 75,
  minRepDurationMs: 600,
  minRepIntervalMs: 800,
  trackingLossResetMs: 1500,
};

const squatConfig: RepCounterConfig = { ...armConfig, startPosition: "high", lowThreshold: 115, highThreshold: 155 };

/** Linear ramp of `frames` values from `from` to `to` (inclusive). */
function ramp(from: number, to: number, frames: number): number[] {
  return Array.from({ length: frames }, (_, i) => from + ((to - from) * i) / (frames - 1));
}

function hold(value: number, frames: number): (number | null)[] {
  return Array(frames).fill(value);
}

/** One full cycle: rest -> peak -> rest, ~1.3 s of movement. */
function cycle(rest: number, peak: number): number[] {
  return [...ramp(rest, peak, 20), ...ramp(peak, rest, 20)];
}

function run(counter: RepCounter, angles: (number | null)[], start = 0) {
  let t = start;
  let snap = counter.snapshot();
  for (const a of angles) {
    snap = counter.update(a, t);
    t += FRAME_MS;
  }
  return { snap, t };
}

describe("RepCounter: seated arm raise (start low)", () => {
  it("counts complete movement cycles and records range", () => {
    const c = new RepCounter(armConfig);
    const { snap } = run(c, [...hold(10, 10), ...cycle(10, 90), ...cycle(10, 85), ...cycle(10, 80), ...hold(10, 10)]);
    expect(snap.reps).toBe(3);
    expect(snap.repRanges[0]).toBeCloseTo(80, 5);
    expect(snap.repRanges[1]).toBeCloseTo(75, 5);
    expect(snap.repRanges[2]).toBeCloseTo(70, 5);
    expect(snap.averageRange).toBeCloseTo(75, 5);
    expect(snap.sessionMaxAngle).toBeCloseTo(90, 5);
    expect(snap.sessionMinAngle).toBeCloseTo(10, 5);
  });

  it("does not count while stationary, even with jitter between thresholds", () => {
    const c = new RepCounter(armConfig);
    const jitter = Array.from({ length: 300 }, (_, i) => 50 + Math.sin(i) * 15); // 35-65°, never crosses thresholds
    expect(run(c, [...hold(10, 30), ...jitter, ...hold(10, 300)]).snap.reps).toBe(0);
  });

  it("does not count partial repetitions that miss the upper threshold", () => {
    const c = new RepCounter(armConfig);
    const { snap } = run(c, [...hold(10, 10), ...cycle(10, 60), ...cycle(10, 70), ...hold(10, 10)]);
    expect(snap.reps).toBe(0);
    expect(snap.repRanges).toEqual([]);
  });

  it("counts only the full rep when a partial attempt precedes it", () => {
    const c = new RepCounter(armConfig);
    // Partial to 60°, back to rest, then a full rep to 80°.
    const { snap } = run(c, [...hold(10, 10), ...cycle(10, 60), ...hold(10, 10), ...cycle(10, 80), ...hold(10, 5)]);
    expect(snap.reps).toBe(1);
    expect(snap.repRanges).toHaveLength(1);
    expect(snap.repRanges[0]).toBeCloseTo(70, 5);
  });

  it("waits for the starting position before counting", () => {
    const c = new RepCounter(armConfig);
    // Starts with arm already raised, lowers it: no rep. Then one full rep.
    const { snap } = run(c, [...hold(90, 10), ...ramp(90, 10, 20), ...cycle(10, 90), ...hold(10, 5)]);
    expect(snap.reps).toBe(1);
  });

  it("rejects movements faster than the minimum repetition duration", () => {
    const c = new RepCounter(armConfig);
    const fast = [...ramp(10, 90, 4), ...ramp(90, 10, 4)]; // ~230 ms
    expect(run(c, [...hold(10, 10), ...fast, ...hold(10, 10)]).snap.reps).toBe(0);
  });

  it("never counts on frames where tracking is lost", () => {
    const c = new RepCounter(armConfig);
    const { snap } = run(c, [...hold(10, 10), ...ramp(10, 90, 20), ...hold(null as never, 30)]);
    expect(snap.reps).toBe(0);
  });

  it("recovers after brief tracking loss mid-repetition", () => {
    const c = new RepCounter(armConfig);
    const briefLoss = Array(10).fill(null); // ~330 ms
    const { snap } = run(c, [...hold(10, 10), ...ramp(10, 90, 20), ...briefLoss, ...ramp(90, 10, 20), ...hold(10, 5)]);
    expect(snap.reps).toBe(1);
  });

  it("discards the partial repetition after prolonged tracking loss", () => {
    const c = new RepCounter(armConfig);
    const longLoss = Array(60).fill(null); // ~2 s > 1.5 s
    const { snap } = run(c, [...hold(10, 10), ...ramp(10, 90, 20), ...longLoss, ...ramp(90, 10, 20), ...hold(10, 5)]);
    expect(snap.reps).toBe(0);
    expect(snap.phase).toBe("start");
  });

  it("reset clears all counts", () => {
    const c = new RepCounter(armConfig);
    run(c, [...hold(10, 10), ...cycle(10, 90), ...hold(10, 5)]);
    c.reset();
    const snap = c.snapshot();
    expect(snap).toEqual({
      reps: 0,
      phase: "waiting",
      repRanges: [],
      averageRange: null,
      sessionMinAngle: null,
      sessionMaxAngle: null,
    });
  });
});

describe("RepCounter: squat (start high)", () => {
  it("counts standing -> squatting -> standing cycles", () => {
    const c = new RepCounter(squatConfig);
    const { snap } = run(c, [...hold(170, 10), ...cycle(170, 100), ...cycle(170, 105), ...hold(170, 10)]);
    expect(snap.reps).toBe(2);
    expect(snap.sessionMinAngle).toBeCloseTo(100, 5);
    expect(snap.repRanges[0]).toBeCloseTo(70, 5);
  });

  it("does not count shallow squats above the lower threshold", () => {
    const c = new RepCounter(squatConfig);
    expect(run(c, [...hold(170, 10), ...cycle(170, 125), ...hold(170, 10)]).snap.reps).toBe(0);
  });
});
