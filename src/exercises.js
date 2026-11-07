// Stable IDs let the patient app, provider app, and future tracker share one contract.
export const EXERCISES = [
  { id: 'wide-stance-squat', name: 'Wide-stance bodyweight squats', trackingMode: 'cv' },
  { id: 'bird-dog', name: 'Bird-dog', trackingMode: 'manual' },
  { id: 'wall-push-up', name: 'Wall push-ups', trackingMode: 'manual' },
  { id: 'seated-arm-raise', name: 'Seated arm raises', trackingMode: 'cv' },
];
export const exerciseById = id => EXERCISES.find(exercise => exercise.id === id);
