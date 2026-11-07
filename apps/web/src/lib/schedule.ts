import { TODAY, addDays } from '../data'

export function plannedFor<T>(date: Date, exercises: T[]): T[] {
  if (date < TODAY || !exercises.length) return []
  if (date.getDay() === 1) return exercises.slice(0, 1)
  if (date.getDay() === 3) return [exercises[1] ?? exercises[0]]
  if (date.getDay() === 5) return exercises
  return []
}

export function upcomingPlan<T>(exercises: T[], count = 3) {
  return Array.from({ length: 14 }, (_, index) => addDays(TODAY, index))
    .filter(date => plannedFor(date, exercises).length > 0)
    .slice(0, count)
}
