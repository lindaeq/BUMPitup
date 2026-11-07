import { createContext, useContext } from 'react'

export type View = 'home' | 'checkin' | 'cidone' | 'plan' | 'detail' | 'session' | 'report' | 'calendar' | 'baby' | 'care'
export type Tab = 'home' | 'plan' | 'calendar' | 'baby' | 'care'
export type Exercise = {
  id: string
  name: string
  mode: 'cam' | 'manual'
  exerciseId: string
  assignmentId: string
  targetDurationSeconds: number
  reps: number
  sets: number
  done: boolean
  rom: string
  note: string
  tips: string[]
  steps: string[]
}
export type CheckInData = { pain: number; loc: string; fat: string; sym: string[]; notes: string }
export type Msg = { w: 'me' | 'them'; t: string; tm: string }
export type Hist = { n: string; d: string; r: number; rom: number | null; p: number; df: string; t: number; at: number }
export type SessionResult = { exId: string; exerciseId: string; assignmentId: string; count: number; t: number; rom: number | null; trackingMode: 'cv' | 'manual'; trackingQuality: 'good' | 'partial' | 'unavailable' }

export type State = {
  view: View
  patientName: string
  pregnancyWeek: number | null
  error: string | null
  arg: string | null
  tab: Tab
  checked: boolean
  res: 'ok' | 'urgent' | null
  ci: CheckInData
  rp: { pain: number; diff: string }
  unread: number
  ex: Exercise[]
  hist: Hist[]
  msgs: Msg[]
  sess: SessionResult | null
  toast: string | null
}

export type Ctx = {
  s: State
  set: (p: Partial<State> | ((s: State) => Partial<State>)) => void
  go: (view: View, arg?: string | null, tab?: Tab) => void
  showToast: (m: string) => void
  saveCheckin: () => Promise<void>
  sendMessage: (text: string) => Promise<void>
  saveSession: () => Promise<void>
}

export const AppCtx = createContext<Ctx | null>(null)

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp must be used inside the app provider')
  return c
}

export const initialState: State = {
  view: 'home',
  patientName: 'Demo patient',
  pregnancyWeek: null,
  error: null,
  arg: null,
  tab: 'home',
  checked: false,
  res: null,
  ci: { pain: 4, loc: 'Lower back', fat: 'Moderate', sym: [], notes: '' },
  rp: { pain: 3, diff: 'Moderate' },
  unread: 0,
  sess: null,
  toast: null,
  ex: [],
  hist: [],
  msgs: [],
}

export const exerciseTemplates: Exercise[] = [
    { id: 'sq', name: 'Wide-stance bodyweight squats', mode: 'cam', exerciseId: '', assignmentId: '', targetDurationSeconds: 60, reps: 10, sets: 2, done: false, rom: 'Knee angle', note: 'Keep your feet shoulder-width apart and use a chair for balance.', tips: ['Hold a chair or counter for balance.', 'Go only as deep as feels comfortable.', 'Breathe out as you stand up.'], steps: ['Stand tall facing the camera, 6 feet back.', 'Lower slowly as if sitting, keeping knees over toes.', 'Pause, then press through your heels to stand.', 'Stop if you feel pain or dizziness.'] },
    { id: 'bd', name: 'Bird dog', mode: 'manual', exerciseId: '', assignmentId: '', targetDurationSeconds: 60, reps: 6, sets: 2, done: false, rom: 'Hip extension', note: 'Move slowly. Keep your back flat and hips level.', tips: ['Keep your hips level, like carrying a cup on your back.', 'Move slowly and stop before your back arches.', 'Place a folded towel under your knees.'], steps: ['Start on hands and knees, side-on to the camera.', 'Extend one arm and the opposite leg together.', 'Hold for two seconds, then return.', 'Repeat on the other side.'] },
    { id: 'wp', name: 'Wall push-ups', mode: 'manual', exerciseId: '', assignmentId: '', targetDurationSeconds: 60, reps: 8, sets: 2, done: false, rom: 'Wrist motion', note: 'Keep the movement comfortable and follow your care team’s instructions.', tips: ['Stand an arm’s length from the wall.', 'Keep your body in one straight line.', 'Exhale as you push away from the wall.'], steps: ['Stand an arm’s length from a wall.', 'Bend your elbows to bring your chest toward the wall.', 'Push back slowly to the start.'] },
    { id: 'ar', name: 'Seated arm raises', mode: 'cam', exerciseId: '', assignmentId: '', targetDurationSeconds: 60, reps: 10, sets: 2, done: false, rom: 'Shoulder angle', note: 'Let’s keep the arm raises gentle this week.', tips: ['Sit tall with your shoulders relaxed.', 'Stop at shoulder height. No need to go higher.', 'Breathe steadily and don’t hold your breath.'], steps: ['Sit upright on a firm chair facing the camera.', 'Raise both arms out to the sides to shoulder height.', 'Lower with control.', 'Breathe steadily throughout.'] },
  ]

export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
