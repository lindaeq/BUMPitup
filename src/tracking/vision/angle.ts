import type { JointTriple, Point, PoseLandmark } from "./trackingTypes";

/**
 * Angle at B (degrees, 0-180) formed by points A-B-C.
 * Returns null when A or C coincides with B.
 */
export function calculateAngle(a: Point, b: Point, c: Point): number | null {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const magnitude = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);

  if (magnitude < 1e-8) return null;

  const cosine = Math.max(-1, Math.min(1, dot / magnitude));
  return (Math.acos(cosine) * 180) / Math.PI;
}

/**
 * Convert a normalized MediaPipe landmark to pixel space so that angles are
 * not distorted by a non-square video frame.
 */
export function toPixel(landmark: PoseLandmark, width: number, height: number): Point {
  return { x: landmark.x * width, y: landmark.y * height };
}

export interface JointReading {
  angle: number | null;
  /** True when every landmark in the triple meets the visibility threshold and is in frame. */
  reliable: boolean;
}

/** Margin (normalized) outside the frame still accepted, since MediaPipe extrapolates slightly. */
const FRAME_MARGIN = 0.05;

export function isLandmarkReliable(landmark: PoseLandmark | undefined, minVisibility: number): boolean {
  if (!landmark) return false;
  if (!Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) return false;
  if ((landmark.visibility ?? 0) < minVisibility) return false;
  return (
    landmark.x >= -FRAME_MARGIN &&
    landmark.x <= 1 + FRAME_MARGIN &&
    landmark.y >= -FRAME_MARGIN &&
    landmark.y <= 1 + FRAME_MARGIN
  );
}

/**
 * Measure the joint angle for a landmark triple. If any landmark is
 * unreliable the angle is reported as null so it cannot drive rep counting.
 */
export function measureJoint(
  landmarks: readonly PoseLandmark[],
  triple: JointTriple,
  width: number,
  height: number,
  minVisibility: number,
): JointReading {
  const [ia, ib, ic] = triple;
  const a = landmarks[ia];
  const b = landmarks[ib];
  const c = landmarks[ic];

  const reliable =
    isLandmarkReliable(a, minVisibility) &&
    isLandmarkReliable(b, minVisibility) &&
    isLandmarkReliable(c, minVisibility);

  if (!reliable) return { angle: null, reliable: false };

  const angle = calculateAngle(toPixel(a, width, height), toPixel(b, width, height), toPixel(c, width, height));
  return { angle, reliable: angle !== null };
}

/**
 * Exponential moving average for angle readings. A null input clears the
 * filter so stale values are never blended with readings after tracking loss.
 */
export class AngleSmoother {
  private value: number | null = null;

  constructor(private readonly alpha: number) {
    if (!(alpha > 0 && alpha <= 1)) {
      throw new RangeError("smoothing alpha must be in (0, 1]");
    }
  }

  next(raw: number | null): number | null {
    if (raw === null || !Number.isFinite(raw)) {
      this.value = null;
      return null;
    }
    this.value = this.value === null ? raw : this.alpha * raw + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset(): void {
    this.value = null;
  }
}
