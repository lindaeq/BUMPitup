import type { ExerciseConfig, HoldExerciseConfig, RepExerciseConfig, RepThresholds } from "./trackingTypes";

/**
 * MediaPipe Pose landmark indices (subject's left/right).
 * https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker
 */
export const LM = {
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

/**
 * Shared reliability defaults. These are software demo values chosen for a
 * webcam at ~30 fps; tune them with real demo footage.
 */
const DEFAULT_TIMING = {
  minRepDurationMs: 600,
  minRepIntervalMs: 800,
  trackingLossResetMs: 1500,
  minVisibility: 0.6,
  smoothingAlpha: 0.35,
} satisfies Partial<RepThresholds>;

/**
 * IMPORTANT: Thresholds below are illustrative software thresholds for the
 * hackathon demo. They are NOT medical targets and do not indicate whether a
 * movement is safe or appropriate. Override them per patient via
 * `thresholdOverrides` using the clinician-approved range.
 */
export const exerciseConfigs = {
  "seated-arm-raise": {
    kind: "rep",
    label: "Seated forward arm raise",
    angleLabel: "Shoulder elevation (hip-shoulder-elbow)",
    landmarks: {
      left: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
      right: [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
    },
    startPosition: "low",
    // 40° rather than 25°: seated, a relaxed arm (or hand on the thigh) often
    // rests at 25-45°, so a stricter value never registers the start position.
    lowThreshold: 40,
    highThreshold: 75,
    ...DEFAULT_TIMING,
    cameraHint: "Sit side-on to the camera with the tracked arm closest to it. Keep hip, shoulder and elbow in view.",
    tips: {
      "start-position": "Start with your arm relaxed down by your side.",
      "more-range": "Try lifting your arm a little higher, toward shoulder height, if it feels comfortable.",
      "finish-rep": "Lower your arm all the way back down to finish each rep.",
      "too-fast": "Slow down a little. Lift and lower your arm in a smooth, controlled way.",
    },
  },

  "wide-stance-squat": {
    kind: "rep",
    label: "Wide-stance bodyweight squat",
    angleLabel: "Knee angle (hip-knee-ankle)",
    landmarks: {
      left: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
      right: [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
    },
    startPosition: "high",
    lowThreshold: 115,
    highThreshold: 155,
    ...DEFAULT_TIMING,
    minRepDurationMs: 800,
    cameraHint: "Stand side-on to the camera with your full body, including ankles, in view.",
    tips: {
      "start-position": "Start by standing tall with your knees straight but not locked.",
      "more-range": "Try bending your knees a little more, only as far as feels comfortable.",
      "finish-rep": "Stand all the way back up to finish each rep.",
      "too-fast": "Take it slower. Lower and rise in a steady, controlled way.",
    },
  },

  "wall-push-up": {
    kind: "rep",
    label: "Wall push-up",
    angleLabel: "Elbow angle (shoulder-elbow-wrist)",
    landmarks: {
      left: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
      right: [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
    },
    startPosition: "high",
    lowThreshold: 100,
    highThreshold: 155,
    ...DEFAULT_TIMING,
    cameraHint: "Stand side-on to the camera with the tracked elbow and wrist visible.",
    tips: {
      "start-position": "Start with your arms straight and your hands on the wall.",
      "more-range": "Try bending your elbows a little more to bring your chest closer to the wall, if comfortable.",
      "finish-rep": "Push back until your arms are straight to finish each rep.",
      "too-fast": "Take it slower. Move toward and away from the wall in a controlled way.",
    },
  },

  "bird-dog": {
    kind: "hold",
    label: "Bird-dog (experimental)",
    angleLabel: "Arm elevation (hip-shoulder-elbow)",
    arm: {
      left: {
        shoulderFlexion: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
        elbow: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST],
      },
      right: {
        shoulderFlexion: [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
        elbow: [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
      },
    },
    leg: {
      left: {
        hipExtension: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE],
        knee: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
      },
      right: {
        hipExtension: [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE],
        knee: [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
      },
    },
    startHipRange: [60, 120],
    minArmElevation: 140,
    minElbowExtension: 140,
    minHipExtension: 145,
    minKneeExtension: 140,
    minHoldMs: 2000,
    holdGraceMs: 300,
    trackingLossResetMs: 1500,
    // The far-side limb is partly occluded in a side view, so accept lower visibility.
    minVisibility: 0.3,
    smoothingAlpha: 0.35,
    cameraHint: "Kneel side-on to the camera on hands and knees. `side` selects the arm; the opposite leg is tracked.",
    tips: {
      "start-position": "Start on your hands and knees with your back flat.",
      "hold-longer": "Try holding the position a little longer before returning, if comfortable.",
    },
  },
} as const satisfies Record<string, ExerciseConfig>;

export type ExerciseId = keyof typeof exerciseConfigs;

export const exerciseIds = Object.keys(exerciseConfigs) as ExerciseId[];

export function isExerciseId(id: string): id is ExerciseId {
  return Object.prototype.hasOwnProperty.call(exerciseConfigs, id);
}

export function getExerciseConfig(id: string): ExerciseConfig | null {
  return isExerciseId(id) ? (exerciseConfigs[id] as ExerciseConfig) : null;
}

/** Merge per-patient threshold overrides into a rep exercise config. */
export function withOverrides(config: RepExerciseConfig, overrides?: Partial<RepThresholds>): RepExerciseConfig {
  if (!overrides) return config;
  const merged: RepExerciseConfig = { ...config };
  for (const [key, value] of Object.entries(overrides) as [keyof RepThresholds, number | undefined][]) {
    if (typeof value === "number" && Number.isFinite(value)) merged[key] = value;
  }
  if (merged.lowThreshold >= merged.highThreshold) {
    throw new RangeError(
      `lowThreshold (${merged.lowThreshold}) must be below highThreshold (${merged.highThreshold})`,
    );
  }
  return merged;
}

export type { HoldExerciseConfig, RepExerciseConfig };
