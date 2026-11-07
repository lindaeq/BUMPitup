import type { MovementTip, RepPhase, TipKind, TipMessages, TrackingQuality } from "./trackingTypes";

/** Frame-level signal the coach looks at. Events come from the rep counter or hold detector. */
export type CoachEvent = "rep" | "partial" | "too-fast" | "hold" | "hold-short";

export interface TipCoachOptions {
  /** Minimum time between two tips. */
  intervalMs: number;
  /** How long a tip stays visible. */
  visibleMs: number;
  /** Tracking must be poor for this long before the camera tip appears. */
  poorTrackingMs: number;
  /** Tracked but never reaching the start position for this long. */
  stuckWaitingMs: number;
  /** Reached the target but not returning to the start for this long. */
  stuckTargetMs: number;
}

export const DEFAULT_TIP_OPTIONS: TipCoachOptions = {
  intervalMs: 10_000,
  visibleMs: 8_000,
  poorTrackingMs: 4_000,
  stuckWaitingMs: 5_000,
  stuckTargetMs: 6_000,
};

const EVENT_TIPS: Partial<Record<CoachEvent, keyof TipMessages>> = {
  partial: "more-range",
  "too-fast": "too-fast",
  "hold-short": "hold-longer",
};

/**
 * Turns live tracking signals into occasional, plain-language tips.
 *
 * Tips describe how the movement compares with the configured software
 * thresholds. They are not medical advice and do not judge whether an
 * exercise is safe.
 */
export class TipCoach {
  private readonly options: TipCoachOptions;
  private nextId = 1;
  private current: { tip: MovementTip; shownAt: number } | null = null;
  private lastShownAt: number | null = null;

  private phase: RepPhase | null = null;
  private phaseSince = 0;
  private goodSince: number | null = null;
  private poorSince: number | null = null;

  constructor(
    private readonly messages: TipMessages,
    private readonly trackingHint: string,
    options: Partial<TipCoachOptions> = {},
  ) {
    this.options = { ...DEFAULT_TIP_OPTIONS, ...options };
  }

  update(
    input: { quality: TrackingQuality; phase: RepPhase; event: CoachEvent | null },
    t: number,
  ): MovementTip | null {
    const o = this.options;

    if (input.phase !== this.phase) {
      this.phase = input.phase;
      this.phaseSince = t;
    }
    if (input.quality === "good") {
      this.goodSince ??= t;
      this.poorSince = null;
    } else {
      this.poorSince ??= t;
      this.goodSince = null;
    }

    const candidate = this.pickCandidate(input, t);
    const cooledDown = this.lastShownAt === null || t - this.lastShownAt >= o.intervalMs;

    if (candidate && cooledDown) {
      const message = candidate === "tracking" ? this.trackingHint : this.messages[candidate];
      if (message) {
        this.current = { tip: { id: this.nextId++, kind: candidate, message }, shownAt: t };
        this.lastShownAt = t;
        // Restart the timer behind a "stuck" tip so it is not repeated straight away.
        if (candidate === "tracking") this.poorSince = t;
        if (candidate === "start-position" || candidate === "finish-rep") this.phaseSince = t;
      }
    }

    if (this.current && t - this.current.shownAt >= o.visibleMs) this.current = null;
    return this.current?.tip ?? null;
  }

  private pickCandidate(
    input: { quality: TrackingQuality; phase: RepPhase; event: CoachEvent | null },
    t: number,
  ): TipKind | null {
    const o = this.options;

    const eventTip = input.event ? EVENT_TIPS[input.event] : undefined;
    if (eventTip && this.messages[eventTip]) return eventTip;

    if (this.poorSince !== null && t - this.poorSince >= o.poorTrackingMs) return "tracking";

    if (this.goodSince !== null) {
      // Only count time where the body has been tracked well.
      const stuckFor = t - Math.max(this.phaseSince, this.goodSince);
      if (input.phase === "waiting" && stuckFor >= o.stuckWaitingMs) return "start-position";
      if (input.phase === "target" && stuckFor >= o.stuckTargetMs && this.messages["finish-rep"]) return "finish-rep";
    }
    return null;
  }

  /** Clear the visible tip, e.g. when the camera stops. Keeps the cooldown. */
  clear(): void {
    this.current = null;
  }

  reset(): void {
    this.current = null;
    this.lastShownAt = null;
    this.phase = null;
    this.phaseSince = 0;
    this.goodSince = null;
    this.poorSince = null;
  }
}
