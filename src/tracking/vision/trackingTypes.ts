/**
 * Shared types for the BumpBridge computer-vision module.
 *
 * All angles are 2D camera estimates in degrees. They are not medically
 * validated joint measurements and must be presented as estimates.
 */

import type { CSSProperties } from "react";

export interface Point {
  x: number;
  y: number;
}

/** Subset of MediaPipe's NormalizedLandmark that the module relies on. */
export interface PoseLandmark {
  /** Normalized [0, 1] horizontal position. */
  x: number;
  /** Normalized [0, 1] vertical position. */
  y: number;
  /** MediaPipe visibility probability [0, 1]. */
  visibility?: number;
}

export type Side = "left" | "right";

export type TrackingQuality = "good" | "partial" | "unavailable";

/** Landmark index triple [A, B, C]; the angle is measured at B. */
export type JointTriple = readonly [number, number, number];

export type RepPhase = "waiting" | "start" | "target";

export interface CVResult {
  /** Completed repetitions (or completed holds for hold-based exercises). */
  reps: number;
  /** Smoothed joint angle for the current frame, or null if not reliably tracked. */
  currentAngle: number | null;
  /** Average (max - min) angle across completed repetitions, or null if none. */
  movementRange: number | null;
  trackingQuality: TrackingQuality;

  // ---- Additional measurements (always present) ----
  /** Per-repetition movement range in degrees, in completion order. */
  repRanges: number[];
  /** Smallest valid smoothed angle seen this session. */
  sessionMinAngle: number | null;
  /** Largest valid smoothed angle seen this session. */
  sessionMaxAngle: number | null;
  /** Current state of the repetition state machine. */
  phase: RepPhase;

  // ---- Hold-based exercises only (bird-dog) ----
  hold?: HoldMeasurements;
}

export interface HoldMeasurements {
  /** True while the configured position is currently held. */
  holding: boolean;
  /** Seconds the current hold has lasted (0 when not holding). */
  currentHoldSeconds: number;
  /** Durations (seconds) of each completed hold. */
  completedHoldSeconds: number[];
  /** Arm elevation angle (hip-shoulder-elbow) on the selected side. */
  armAngle: number | null;
  /** Hip extension angle (shoulder-hip-knee) on the opposite side. */
  legAngle: number | null;
}

export interface ExerciseTrackerProps {
  exerciseId: string;
  active: boolean;
  side?: Side;
  /** Change this value to reset counters (e.g. a session number). */
  resetKey?: number;
  onUpdate: (result: CVResult) => void;

  // ---- Optional integration hooks ----
  /** Override thresholds for the selected exercise (e.g. a patient's approved range). */
  thresholdOverrides?: Partial<RepThresholds>;
  /** Called when the camera or model cannot be started. */
  onError?: (error: Error) => void;
  /** Draw the pose skeleton and live readout on the preview. Default true. */
  showOverlay?: boolean;
  /** Mirror the preview like a selfie camera. Does not affect angles. Default true. */
  mirrored?: boolean;
  /** Override where MediaPipe's WASM files are loaded from. */
  wasmBasePath?: string;
  /** Override the pose model URL. */
  modelAssetPath?: string;
  className?: string;
  style?: CSSProperties;
}

/** Tunable timing and reliability parameters shared by rep-based exercises. */
export interface RepThresholds {
  lowThreshold: number;
  highThreshold: number;
  /** Minimum time from leaving the start zone to returning to it. */
  minRepDurationMs: number;
  /** Minimum time between two counted repetitions. */
  minRepIntervalMs: number;
  /** Tracking loss longer than this discards the partial repetition. */
  trackingLossResetMs: number;
  /** Minimum MediaPipe visibility required for each joint landmark. */
  minVisibility: number;
  /** Exponential smoothing factor (0-1). Higher follows the signal faster. */
  smoothingAlpha: number;
}

export interface RepExerciseConfig extends RepThresholds {
  kind: "rep";
  label: string;
  /** What the angle represents, for display. */
  angleLabel: string;
  landmarks: Record<Side, JointTriple>;
  /**
   * "low": the starting position has a small angle (e.g. arm lowered).
   * "high": the starting position has a large angle (e.g. standing knee).
   */
  startPosition: "low" | "high";
  cameraHint: string;
}

export interface HoldExerciseConfig {
  kind: "hold";
  label: string;
  angleLabel: string;
  /** Arm landmarks per selected side. The leg used is always the opposite side. */
  arm: Record<Side, { shoulderFlexion: JointTriple; elbow: JointTriple }>;
  leg: Record<Side, { hipExtension: JointTriple; knee: JointTriple }>;
  /** Shoulder-hip-knee angle range that counts as the hands-and-knees start. */
  startHipRange: readonly [number, number];
  /** Minimum arm elevation (hip-shoulder-elbow) for an extended arm. */
  minArmElevation: number;
  /** Minimum elbow angle for a straight arm. */
  minElbowExtension: number;
  /** Minimum hip angle (shoulder-hip-knee) for an extended leg. */
  minHipExtension: number;
  /** Minimum knee angle for a straight leg. */
  minKneeExtension: number;
  /** A hold shorter than this is not counted. */
  minHoldMs: number;
  /** Brief drops out of position shorter than this do not end a hold. */
  holdGraceMs: number;
  trackingLossResetMs: number;
  minVisibility: number;
  smoothingAlpha: number;
  cameraHint: string;
}

export type ExerciseConfig = RepExerciseConfig | HoldExerciseConfig;
