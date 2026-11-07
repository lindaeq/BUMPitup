import { describe, expect, it } from 'vitest'
import { addDays, TODAY } from '../data'
import { plannedFor } from './schedule'

const exercises = [{ exerciseId: 'wide-stance-squat' }, { exerciseId: 'seated-arm-raise' }]

describe('weekly exercise schedule', () => {
  it('uses the existing daily rotation until a weekly plan is saved', () => {
    expect(plannedFor(TODAY, exercises)).toEqual([exercises[0]])
    expect(plannedFor(addDays(TODAY, 1), exercises)).toEqual([exercises[1]])
  })

  it('repeats chosen exercises and keeps rest days empty', () => {
    const days = Array(7).fill('')
    days[TODAY.getDay()] = 'seated-arm-raise'
    expect(plannedFor(TODAY, exercises, days)).toEqual([exercises[1]])
    expect(plannedFor(addDays(TODAY, 1), exercises, days)).toEqual([])
    expect(plannedFor(addDays(TODAY, 7), exercises, days)).toEqual([exercises[1]])
  })
})
