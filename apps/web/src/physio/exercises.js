// Stable IDs let the patient app, provider app, and future tracker share one contract.
export const EXERCISES = [
  { id: 'wide-stance-squat', name: 'Wide-stance bodyweight squats', trackingMode: 'cv', defaultReps: 10, defaultDurationSeconds: 60 },
  { id: 'bird-dog', name: 'Bird-dog', trackingMode: 'cv', defaultReps: 6, defaultDurationSeconds: 60 },
  { id: 'wall-push-up', name: 'Wall push-ups', trackingMode: 'cv', defaultReps: 8, defaultDurationSeconds: 60 },
  { id: 'seated-arm-raise', name: 'Seated arm raises', trackingMode: 'cv', defaultReps: 10, defaultDurationSeconds: 60 },
];
export const exerciseById = id => EXERCISES.find(exercise => exercise.id === id);
