import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, where, type DocumentData } from 'firebase/firestore'
import PhoneFrame from './components/PhoneFrame'
import { AppCtx, exerciseTemplates, initialState, type Ctx, type Exercise, type Hist, type State } from './store'
import { db, PATIENT_ID, configError, firebaseError } from './lib/firebase'
import PhysioDashboard from './physio/PhysioDashboard.jsx'
import './physio/physio.css'
import Home from './screens/Home'
import CheckIn from './screens/CheckIn'
import CheckInDone from './screens/CheckInDone'
import Plan from './screens/Plan'
import ExerciseDetail from './screens/ExerciseDetail'
import Session from './screens/Session'
import Report from './screens/Report'
import Calendar from './screens/Calendar'
import Baby from './screens/Baby'
import Care from './screens/Care'

const localIds: Record<string, string> = {
  'wide-stance-squat': 'sq', 'bird-dog': 'bd', 'wall-push-up': 'wp', 'seated-arm-raise': 'ar',
}
type RecordWithId = DocumentData & { id: string }
const millis = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') return value.toMillis()
  return typeof value === 'string' ? Date.parse(value) || 0 : 0
}
const todayKey = () => new Date().toDateString()
const isToday = (timestamp: unknown) => millis(timestamp) > 0 && new Date(millis(timestamp)).toDateString() === todayKey()
const latestPlan = (items: RecordWithId[]) => {
  const used = new Set<string>()
  return items.filter(item => {
    if (used.has(item.exerciseId)) return false
    used.add(item.exerciseId)
    return true
  })
}
function toExercise(item: RecordWithId, sessions: RecordWithId[]): Exercise | null {
  const template = exerciseTemplates.find(exercise => exercise.id === localIds[item.exerciseId])
  if (!template) return null
  return {
    ...template, exerciseId: item.exerciseId, assignmentId: item.id,
    reps: Number(item.targetReps), sets: 1, targetDurationSeconds: Number(item.targetDurationSeconds),
    note: item.instructions || template.note,
    done: sessions.some(session => session.assignmentId === item.id && isToday(session.createdAt)),
  }
}

export default function App() {
  const isPhysio = new URLSearchParams(window.location.search).get('view') === 'physio'
  const [s, setS] = useState<State>(initialState)
  const toastTimer = useRef<number | undefined>(undefined)
  const sessionsRef = useRef<RecordWithId[]>([])

  const set = useCallback<Ctx['set']>(p => {
    setS(st => ({ ...st, ...(typeof p === 'function' ? p(st) : p) }))
  }, [])
  const go = useCallback<Ctx['go']>((view, arg = null, tab) => {
    setS(st => ({ ...st, view, arg, tab: tab ?? st.tab, unread: view === 'care' ? 0 : st.unread }))
  }, [])
  const showToast = useCallback((message: string) => {
    setS(st => ({ ...st, toast: message }))
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setS(st => ({ ...st, toast: null })), 2400)
  }, [])

  useEffect(() => {
    if (isPhysio) return
    const database = db
    if (!database) return
    const fail = (error: unknown) => setS(st => ({ ...st, error: firebaseError(error) }))
    const patient = onSnapshot(doc(database, 'patients', PATIENT_ID), snapshot => {
      if (!snapshot.exists()) { setS(st => ({ ...st, error: `Patient ${PATIENT_ID} was not found in Firestore.` })); return }
      setS(st => ({ ...st, patientName: snapshot.data().name || 'Patient', pregnancyWeek: snapshot.data().pregnancyWeek ?? null }))
    }, fail)
    const listen = (name: string, onData: (items: RecordWithId[]) => void) => onSnapshot(
      query(collection(database, name), where('patientId', '==', PATIENT_ID)),
      snapshot => onData(snapshot.docs.map(item => ({ ...item.data(), id: item.id }) as RecordWithId).sort((a, b) => millis(b.createdAt) - millis(a.createdAt))), fail)
    const assignments = listen('assignments', items => setS(st => ({ ...st, ex: latestPlan(items).map(item => toExercise(item, sessionsRef.current)).filter((item): item is Exercise => item !== null) })))
    const sessions = listen('sessions', items => {
      sessionsRef.current = items
      const hist: Hist[] = items.map(item => ({
        n: exerciseTemplates.find(exercise => exercise.id === localIds[item.exerciseId])?.name || item.exercise || 'Exercise',
        d: millis(item.createdAt) ? new Date(millis(item.createdAt)).toLocaleDateString() : 'Pending',
        r: Number(item.repsCompleted ?? item.reps ?? 0), rom: typeof item.movementRangeDegrees === 'number' ? item.movementRangeDegrees : null,
        p: Number(item.painLevel ?? 0), df: String(item.difficulty || 'Not reported'), t: Number(item.durationSeconds ?? 0), at: millis(item.createdAt),
      }))
      setS(st => ({ ...st, hist, ex: st.ex.map(exercise => ({ ...exercise, done: items.some(item => item.assignmentId === exercise.assignmentId && isToday(item.createdAt)) })) }))
    })
    const messages = listen('messages', items => setS(st => ({ ...st,
      msgs: items.reverse().map(item => ({ w: item.sender === 'patient' ? 'me' : 'them', t: String(item.text), tm: millis(item.createdAt) ? new Date(millis(item.createdAt)).toLocaleString() : 'Now' })),
    })))
    const checkins = listen('checkins', items => {
      const latest = items.find(item => isToday(item.createdAt))
      setS(st => latest ? ({ ...st, checked: true, ci: {
        pain: Number(latest.painLevel), loc: String(latest.discomfortLocation),
        fat: Number(latest.fatigue) >= 7 ? 'High' : Number(latest.fatigue) >= 4 ? 'Moderate' : 'Low',
        sym: [], notes: String(latest.notes || ''),
      } }) : ({ ...st, checked: false }))
    })
    return () => { patient(); assignments(); sessions(); messages(); checkins() }
  }, [isPhysio])

  const saveCheckin = useCallback(async () => {
    if (!db) throw new Error(configError)
    const notes = [s.ci.sym.length ? `Symptoms: ${s.ci.sym.join(', ')}` : '', s.ci.notes.trim()].filter(Boolean).join('\n').slice(0, 2000)
    await addDoc(collection(db, 'checkins'), {
      patientId: PATIENT_ID, painLevel: s.ci.pain,
      fatigue: { Low: 2, Moderate: 5, High: 8 }[s.ci.fat] ?? 5,
      discomfortLocation: s.ci.loc, notes, createdAt: serverTimestamp(),
    })
  }, [s.ci])
  const sendMessage = useCallback(async (text: string) => {
    if (!db) throw new Error(configError)
    const message = text.trim()
    if (!message) return
    await addDoc(collection(db, 'messages'), { patientId: PATIENT_ID, sender: 'patient', text: message, createdAt: serverTimestamp() })
  }, [])
  const saveSession = useCallback(async () => {
    if (!db) throw new Error(configError)
    const result = s.sess
    if (!result || !result.assignmentId) throw new Error('The exercise plan changed. Start a new session from the current plan.')
    await addDoc(collection(db, 'sessions'), {
      patientId: PATIENT_ID, exerciseId: result.exerciseId, assignmentId: result.assignmentId,
      trackingMode: result.trackingMode, trackingQuality: result.trackingQuality,
      repsCompleted: result.count, durationSeconds: Math.max(1, result.t),
      movementRangeDegrees: result.rom, painLevel: s.rp.pain,
      difficulty: s.rp.diff.toLowerCase(), notes: '',
      heartRateBefore: null, heartRateAfter: null, createdAt: serverTimestamp(),
    })
  }, [s.sess, s.rp])

  const ctx = useMemo<Ctx>(() => ({ s, set, go, showToast, saveCheckin, sendMessage, saveSession }), [s, set, go, showToast, saveCheckin, sendMessage, saveSession])
  if (isPhysio) return <div className="provider-root">
    <header><h1>BumpBridge</h1><p>Pregnancy check-ins & exercise tracking</p></header>
    <nav aria-label="Dashboards"><a href="/">Patient</a><a href="/?view=physio" aria-current="page">Physiotherapist</a></nav>
    {configError ? <p role="alert">{configError}</p> : <PhysioDashboard />}
  </div>
  const screens = {
    home: <Home />, checkin: <CheckIn />, cidone: <CheckInDone />,
    plan: <Plan />, detail: <ExerciseDetail />, session: <Session key={s.arg} />,
    report: <Report />, calendar: <Calendar />, baby: <Baby />, care: <Care />,
  }
  return <AppCtx.Provider value={ctx}><PhoneFrame>
    {(configError || s.error) && <div className="alert red" role="alert">{configError || s.error}</div>}
    {screens[s.view]}
  </PhoneFrame></AppCtx.Provider>
}
