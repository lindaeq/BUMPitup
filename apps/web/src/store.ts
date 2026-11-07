import { createContext, useContext } from 'react'

export type View = 'home' | 'checkin' | 'cidone' | 'plan' | 'detail' | 'session' | 'report' | 'progress' | 'care'
export type Tab = 'home' | 'plan' | 'progress' | 'care'
export type Exercise = {
  id: string
  name: string
  mode: 'cam' | 'band'
  reps: number
  sets: number
  done: boolean
  rom: string
  note: string
  steps: string[]
}
export type CheckInData = { pain: number; loc: string; fat: string; sym: string[]; notes: string }
export type Msg = { w: 'me' | 'them'; t: string; tm: string }
export type Hist = { n: string; d: string; r: number; rom: number; p: number; df: string }
export type Day = { d: string; p: number; s: number }
export type SessionResult = { exId: string; count: number; t: number; rom: number }

export type State = {
  view: View
  arg: string | null
  tab: Tab
  checked: boolean
  res: 'ok' | 'urgent' | null
  ci: CheckInData
  rp: { pain: number; diff: string }
  unread: number
  ex: Exercise[]
  hist: Hist[]
  week: Day[]
  msgs: Msg[]
  sess: SessionResult | null
  toast: string | null
}

export type Ctx = {
  s: State
  set: (p: Partial<State> | ((s: State) => Partial<State>)) => void
  go: (view: View, arg?: string | null, tab?: Tab) => void
  showToast: (m: string) => void
}

export const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used inside the app provider')
  return c
}

export const initialState: State = {
  view: 'home',
  arg: null,
  tab: 'home',
  checked: false,
  res: null,
  ci: { pain: 4, loc: 'Lower back', fat: 'Moderate', sym: [], notes: '' },
  rp: { pain: 3, diff: 'Moderate' },
  unread: 1,
  sess: null,
  toast: null,
  ex: [
    { id: 'sq', name: 'Bodyweight squats', mode: 'cam', reps: 10, sets: 2, done: false, rom: 'Knee angle', note: 'Keep your feet shoulder-width apart and use a chair for balance.', steps: ['Stand tall facing the camera, 6 feet back.', 'Lower slowly as if sitting, keeping knees over toes.', 'Pause, then press through your heels to stand.', 'Stop if you feel pain or dizziness.'] },
    { id: 'bd', name: 'Bird dog', mode: 'cam', reps: 6, sets: 2, done: false, rom: 'Hip extension', note: 'Move slowly. Keep your back flat and hips level.', steps: ['Start on hands and knees, side-on to the camera.', 'Extend one arm and the opposite leg together.', 'Hold for two seconds, then return.', 'Repeat on the other side.'] },
    { id: 'wp', name: 'Wall push-ups', mode: 'band', reps: 8, sets: 2, done: false, rom: 'Wrist motion', note: 'Wear the wristband on your right wrist before starting.', steps: ['Put the wristband on and wait for the green light.', 'Stand an arm’s length from a wall.', 'Bend your elbows to bring your chest toward the wall.', 'Push back slowly to the start.'] },
    { id: 'ar', name: 'Seated arm raises', mode: 'cam', reps: 10, sets: 2, done: false, rom: 'Shoulder angle', note: 'Let’s keep the arm raises gentle this week.', steps: ['Sit upright on a firm chair facing the camera.', 'Raise both arms out to the sides to shoulder height.', 'Lower with control.', 'Breathe steadily throughout.'] },
  ],
  hist: [
    { n: 'Seated arm raises', d: 'Thu, Nov 5', r: 20, rom: 78, p: 3, df: 'Easy' },
    { n: 'Bird dog', d: 'Wed, Nov 4', r: 12, rom: 64, p: 4, df: 'Moderate' },
    { n: 'Bodyweight squats', d: 'Tue, Nov 3', r: 20, rom: 71, p: 4, df: 'Moderate' },
  ],
  week: [
    { d: 'Sun', p: 5, s: 0 }, { d: 'Mon', p: 6, s: 0 }, { d: 'Tue', p: 4, s: 1 }, { d: 'Wed', p: 4, s: 1 },
    { d: 'Thu', p: 3, s: 1 }, { d: 'Fri', p: 4, s: 0 }, { d: 'Sat', p: 4, s: 0 },
  ],
  msgs: [
    { w: 'them', t: 'Hi Maya, I’ve set up your plan for this week. Let me know how the squats feel.', tm: 'Mon 10:12' },
    { w: 'me', t: 'Thanks! Some lower back tightness after the bird dog.', tm: 'Wed 18:40' },
    { w: 'them', t: 'Thanks for the update. Let’s keep the arm raises gentle this week and move slowly through bird dog. I’ll review your check-ins on Monday.', tm: 'Fri 09:05' },
  ],
}

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
