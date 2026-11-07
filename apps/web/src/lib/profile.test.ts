import { describe, expect, it } from 'vitest'
import { pregnancyWeekFromDueDate } from './profile'

describe('profile due date', () => {
  it('updates the pregnancy week from the chosen due date', () => {
    expect(pregnancyWeekFromDueDate('2027-02-27', new Date(2026, 10, 7))).toBe(24)
  })

  it('rejects impossible dates', () => {
    expect(() => pregnancyWeekFromDueDate('2027-02-30', new Date(2026, 10, 7))).toThrow('valid due date')
  })
})
