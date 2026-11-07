import type { RepPhase, RepThresholds } from "./trackingTypes";

export interface RepCounterConfig
  extends Pick<RepThresholds, "lowThreshold" | "highThreshold" | "minRepDurationMs" | "minRepIntervalMs" | "trackingLossResetMs"> {
  startPosition: "low" | "high";
}

export interface RepCounterSnapshot {
  reps: number;
  phase: RepPhase;
  /** Range (max - min) of each completed repetition. */
  repRanges: number[];
  /** Mean of repRanges, or null if no repetition has completed. */
  averageRange: number | null;
  sessionMinAngle: number | null;
  sessionMaxAngle: number | null;
}

/**
 * Something notable that happened on this frame:
 * - "rep": a repetition was counted.
 * - "partial": the joint clearly left the start position but came back without reaching the target.
 * - "too-fast": the movement completed but was rejected by the timing checks.
 */
export type RepEvent = "rep" | "partial" | "too-fast";

export interface RepUpdate extends RepCounterSnapshot {
  event: RepEvent | null;
}

/**
 * A partial attempt must move at least this far past the start threshold
 * before it is reported, so resting jitter around the threshold is ignored.
 */
const MIN_PARTIAL_EXCURSION_DEG = 8;
const MIN_PARTIAL_EXCURSION_FRACTION = 0.25;

/**
 * Generic hysteresis state machine for joint-angle repetitions.
 *
 *   waiting --(enter start zone)--> start --(enter target zone)--> target
 *   target  --(return to start zone)--> start   (+1 rep if timing checks pass)
 *
 * For startPosition "low" (e.g. arm raise), the start zone is angle <= lowThreshold
 * and the target zone is angle >= highThreshold. For "high" (e.g. squat) it is the
 * reverse. Angles between the thresholds never change state, which gives
 * hysteresis against jitter.
 *
 * Partial movements (leaving the start zone and returning without reaching the
 * target zone) are discarded. Null angles (tracking lost) never advance the
 * state; tracking loss longer than trackingLossResetMs discards the partial rep
 * and returns to "waiting".
 */
export class RepCounter {
  private phase: RepPhase = "waiting";
  private reps = 0;
  private repRanges: number[] = [];
  private sessionMin: number | null = null;
  private sessionMax: number | null = null;

  /** Min/max of the repetition currently in progress. */
  private repMin = Infinity;
  private repMax = -Infinity;
  /** Last timestamp the angle was inside the start zone. */
  private lastInStartAt: number | null = null;
  private lastRepAt: number | null = null;
  private lostSince: number | null = null;

  constructor(private readonly config: RepCounterConfig) {
    if (config.lowThreshold >= config.highThreshold) {
      throw new RangeError("lowThreshold must be below highThreshold");
    }
  }

  private inStartZone(angle: number): boolean {
    return this.config.startPosition === "low"
      ? angle <= this.config.lowThreshold
      : angle >= this.config.highThreshold;
  }

  private inTargetZone(angle: number): boolean {
    return this.config.startPosition === "low"
      ? angle >= this.config.highThreshold
      : angle <= this.config.lowThreshold;
  }

  private beginWindow(angle: number): void {
    this.repMin = angle;
    this.repMax = angle;
  }

  /**
   * Feed one frame. `angle` must already be smoothed and visibility-checked;
   * pass null when the joint is not reliably tracked.
   */
  update(angle: number | null, timestampMs: number): RepUpdate {
    let event: RepEvent | null = null;

    if (angle === null || !Number.isFinite(angle)) {
      this.handleLoss(timestampMs);
      return { ...this.snapshot(), event };
    }
    this.lostSince = null;

    this.sessionMin = this.sessionMin === null ? angle : Math.min(this.sessionMin, angle);
    this.sessionMax = this.sessionMax === null ? angle : Math.max(this.sessionMax, angle);

    const inStart = this.inStartZone(angle);
    const inTarget = this.inTargetZone(angle);

    switch (this.phase) {
      case "waiting":
        if (inStart) {
          this.phase = "start";
          this.beginWindow(angle);
          this.lastInStartAt = timestampMs;
        }
        break;

      case "start":
        if (inStart) {
          // A partial excursion that came back without reaching the target is
          // discarded: restart the window from the current resting position.
          if (this.lastInStartAt !== null && this.repMovedOutOfStart()) {
            if (this.partialExcursionIsMeaningful()) event = "partial";
            this.beginWindow(angle);
          }
          this.trackWindow(angle);
          this.lastInStartAt = timestampMs;
        } else {
          this.trackWindow(angle);
          if (inTarget) this.phase = "target";
        }
        break;

      case "target":
        this.trackWindow(angle);
        if (inStart) {
          event = this.completeRep(timestampMs) ? "rep" : "too-fast";
          this.phase = "start";
          this.beginWindow(angle);
          this.lastInStartAt = timestampMs;
        }
        break;
    }

    return { ...this.snapshot(), event };
  }

  /** True when the current window contains angles outside the start zone. */
  private repMovedOutOfStart(): boolean {
    const extreme = this.config.startPosition === "low" ? this.repMax : this.repMin;
    return !this.inStartZone(extreme);
  }

  /** True when the abandoned attempt moved far enough to look intentional. */
  private partialExcursionIsMeaningful(): boolean {
    const { lowThreshold, highThreshold, startPosition } = this.config;
    const excursion = startPosition === "low" ? this.repMax - lowThreshold : highThreshold - this.repMin;
    const minimum = Math.max(MIN_PARTIAL_EXCURSION_DEG, MIN_PARTIAL_EXCURSION_FRACTION * (highThreshold - lowThreshold));
    return excursion >= minimum;
  }

  private trackWindow(angle: number): void {
    this.repMin = Math.min(this.repMin, angle);
    this.repMax = Math.max(this.repMax, angle);
  }

  /** Returns true if the repetition was counted. */
  private completeRep(timestampMs: number): boolean {
    const duration = this.lastInStartAt === null ? 0 : timestampMs - this.lastInStartAt;
    const sinceLast = this.lastRepAt === null ? Infinity : timestampMs - this.lastRepAt;
    if (duration < this.config.minRepDurationMs || sinceLast < this.config.minRepIntervalMs) {
      return false; // Too fast to be a genuine repetition, or jitter.
    }
    this.reps += 1;
    this.repRanges.push(this.repMax - this.repMin);
    this.lastRepAt = timestampMs;
    return true;
  }

  private handleLoss(timestampMs: number): void {
    if (this.lostSince === null) this.lostSince = timestampMs;
    if (this.phase !== "waiting" && timestampMs - this.lostSince >= this.config.trackingLossResetMs) {
      this.phase = "waiting";
      this.repMin = Infinity;
      this.repMax = -Infinity;
      this.lastInStartAt = null;
    }
  }

  reset(): void {
    this.phase = "waiting";
    this.reps = 0;
    this.repRanges = [];
    this.sessionMin = null;
    this.sessionMax = null;
    this.repMin = Infinity;
    this.repMax = -Infinity;
    this.lastInStartAt = null;
    this.lastRepAt = null;
    this.lostSince = null;
  }

  snapshot(): RepCounterSnapshot {
    const total = this.repRanges.reduce((sum, r) => sum + r, 0);
    return {
      reps: this.reps,
      phase: this.phase,
      repRanges: [...this.repRanges],
      averageRange: this.repRanges.length ? total / this.repRanges.length : null,
      sessionMinAngle: this.sessionMin,
      sessionMaxAngle: this.sessionMax,
    };
  }
}
