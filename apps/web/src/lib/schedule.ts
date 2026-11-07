import { TODAY, TODAY_IDX, addDays, dayIndex } from '../data'

export function plannedFor<T extends { exerciseId: string }>(date: Date, exercises: T[], days?: string[] | null): T[] {
  if (date < TODAY || !exercises.length) return []
  if (days?.length === 7) return exercises.filter(exercise => exercise.exerciseId === days[date.getDay()])
  return [exercises[(dayIndex(date) - TODAY_IDX) % exercises.length]]
}

export function upcomingPlan<T>(exercises: T[], count = 7, today = new Date()) {
  if (!exercises.length) return []
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Array.from({ length: count }, (_, index) => addDays(start, index))
}
