import type { HoldExerciseConfig, RepPhase } from "./trackingTypes";

/** Smoothed angles for one frame; null means the joint is not reliably tracked. */
export interface HoldFrame {
  armElevation: number | null;
  elbow: number | null;
  hipExtension: number | null;
  knee: number | null;
}

export type HoldDetectorConfig = Pick<
  HoldExerciseConfig,
  | "startHipRange"
  | "minArmElevation"
  | "minElbowExtension"
  | "minHipExtension"
  | "minKneeExtension"
  | "minHoldMs"
  | "holdGraceMs"
  | "trackingLossResetMs"
>;

export interface HoldSnapshot {
  /** "waiting" = start position not yet seen, "start" = ready, "target" = holding. */
  phase: RepPhase;
  holding: boolean;
  currentHoldMs: number;
  completedHoldsMs: number[];
}

/** "hold": a hold was counted. "hold-short": a hold ended before minHoldMs. */
export type HoldEvent = "hold" | "hold-short";

export interface HoldUpdate extends HoldSnapshot {
  event: HoldEvent | null;
}

/**
 * Hold detector for bird-dog style exercises.
 *
 *   waiting --(hands-and-knees seen)--> start --(arm + leg extended)--> target
 *   target  --(position lost > holdGraceMs)--> waiting  (+1 hold if long enough)
 *
 * A new hold requires returning to the start position first, so one long
 * wobble cannot be counted as several holds.
 */
export class HoldDetector {
  private phase: RepPhase = "waiting";
  private holdStartedAt: number | null = null;
  /** Last timestamp the extended position was confirmed. */
  private lastInPositionAt: number | null = null;
  private lostSince: number | null = null;
  private completed: number[] = [];
  private lastTimestamp = 0;
  private frameEvent: HoldEvent | null = null;

  constructor(private readonly config: HoldDetectorConfig) {}

  private isStart(f: HoldFrame): boolean {
    const [lo, hi] = this.config.startHipRange;
    return f.hipExtension !== null && f.hipExtension >= lo && f.hipExtension <= hi;
  }

  private isExtended(f: HoldFrame): boolean {
    const c = this.config;
    return (
      f.armElevation !== null &&
      f.elbow !== null &&
      f.hipExtension !== null &&
      f.knee !== null &&
      f.armElevation >= c.minArmElevation &&
      f.elbow >= c.minElbowExtension &&
      f.hipExtension >= c.minHipExtension &&
      f.knee >= c.minKneeExtension
    );
  }

  /** Pass `null` when the pose is not detected at all. */
  update(frame: HoldFrame | null, timestampMs: number): HoldUpdate {
    this.frameEvent = null;
    const snap = this.step(frame, timestampMs);
    return { ...snap, event: this.frameEvent };
  }

  private step(frame: HoldFrame | null, timestampMs: number): HoldSnapshot {
    this.lastTimestamp = timestampMs;
    const tracked =
      frame !== null &&
      frame.armElevation !== null &&
      frame.elbow !== null &&
      frame.hipExtension !== null &&
      frame.knee !== null;

    if (!tracked) {
      if (this.lostSince === null) this.lostSince = timestampMs;
      if (timestampMs - this.lostSince >= this.config.trackingLossResetMs) {
        // Prolonged loss: end any hold using the last confirmed time, and require a fresh start.
        if (this.phase === "target") this.endHold();
        this.phase = "waiting";
      }
      return this.snapshot();
    }
    this.lostSince = null;

    switch (this.phase) {
      case "waiting":
        if (this.isStart(frame)) this.phase = "start";
        break;

      case "start":
        if (this.isExtended(frame)) {
          this.phase = "target";
          this.holdStartedAt = timestampMs;
          this.lastInPositionAt = timestampMs;
        }
        break;

      case "target":
        if (this.isExtended(frame)) {
          this.lastInPositionAt = timestampMs;
        } else if (this.lastInPositionAt !== null && timestampMs - this.lastInPositionAt > this.config.holdGraceMs) {
          this.endHold();
          this.phase = this.isStart(frame) ? "start" : "waiting";
        }
        break;
    }

    return this.snapshot();
  }

  private endHold(): void {
    if (this.holdStartedAt !== null && this.lastInPositionAt !== null) {
      const duration = this.lastInPositionAt - this.holdStartedAt;
      if (duration >= this.config.minHoldMs) {
        this.completed.push(duration);
        this.frameEvent = "hold";
      } else {
        this.frameEvent = "hold-short";
      }
    }
    this.holdStartedAt = null;
    this.lastInPositionAt = null;
  }

  reset(): void {
    this.phase = "waiting";
    this.holdStartedAt = null;
    this.lastInPositionAt = null;
    this.lostSince = null;
    this.completed = [];
  }

  snapshot(): HoldSnapshot {
    const holding = this.phase === "target" && this.holdStartedAt !== null;
    const end = this.lastInPositionAt ?? this.lastTimestamp;
    return {
      phase: this.phase,
      holding,
      currentHoldMs: holding && this.holdStartedAt !== null ? end - this.holdStartedAt : 0,
      completedHoldsMs: [...this.completed],
    };
  }
}
