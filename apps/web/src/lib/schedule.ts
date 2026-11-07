import { TODAY, TODAY_IDX, addDays, dayIndex } from '../data'

export function plannedFor<T>(date: Date, exercises: T[]): T[] {
  if (date < TODAY || !exercises.length) return []
  return [exercises[(dayIndex(date) - TODAY_IDX) % exercises.length]]
}

export function upcomingPlan<T>(exercises: T[], count = 7) {
  if (!exercises.length) return []
  return Array.from({ length: count }, (_, index) => addDays(TODAY, index))
}
