import { describe, expect, it } from "vitest";
import { AngleSmoother, calculateAngle, measureJoint } from "./angle";

describe("calculateAngle", () => {
  it("returns 90° for a right angle", () => {
    expect(calculateAngle({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90, 6);
  });

  it("returns 180° for a straight line", () => {
    expect(calculateAngle({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(180, 6);
  });

  it("returns 0° when both arms point the same way", () => {
    expect(calculateAngle({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(0, 6);
  });

  it("returns null for degenerate input", () => {
    expect(calculateAngle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeNull();
  });
});

describe("measureJoint", () => {
  const visible = (x: number, y: number) => ({ x, y, visibility: 0.99 });

  it("corrects for non-square frames by using pixel coordinates", () => {
    // In a 1280x720 frame these normalized points form a true 90° angle in pixels:
    // A is 0.25*720=180px above B, C is 180/1280=0.140625 to the right of B.
    const landmarks = [visible(0.5, 0.25), visible(0.5, 0.5), visible(0.5 + 0.140625, 0.5)];
    const reading = measureJoint(landmarks, [0, 1, 2], 1280, 720, 0.5);
    expect(reading.reliable).toBe(true);
    expect(reading.angle).toBeCloseTo(45 * 2, 6);
  });

  it("is unreliable when any landmark is below the visibility threshold", () => {
    const landmarks = [visible(0, 0), { x: 0.5, y: 0.5, visibility: 0.2 }, visible(1, 1)];
    expect(measureJoint(landmarks, [0, 1, 2], 640, 480, 0.5)).toEqual({ angle: null, reliable: false });
  });

  it("is unreliable when a landmark is missing or far out of frame", () => {
    expect(measureJoint([visible(0.1, 0.1)], [0, 1, 2], 640, 480, 0.5).reliable).toBe(false);
    const outOfFrame = [visible(0.1, 0.1), visible(0.5, 0.5), visible(1.5, 0.5)];
    expect(measureJoint(outOfFrame, [0, 1, 2], 640, 480, 0.5).reliable).toBe(false);
  });
});

describe("AngleSmoother", () => {
  it("smooths jitter and clears on tracking loss", () => {
    const s = new AngleSmoother(0.5);
    expect(s.next(100)).toBe(100);
    expect(s.next(120)).toBe(110);
    expect(s.next(null)).toBeNull();
    // After loss the next value starts fresh rather than blending with stale data.
    expect(s.next(40)).toBe(40);
  });
});
