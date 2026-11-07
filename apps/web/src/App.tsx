import { useCallback, useMemo, useRef, useState } from 'react'
import PhoneFrame from './components/PhoneFrame'
import { AppCtx, initialState, type Ctx, type State } from './store'
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

export default function App() {
  const [s, setS] = useState<State>(initialState)
  const toastTimer = useRef<number | undefined>(undefined)

  const set = useCallback<Ctx['set']>((p) => {
    setS((st) => ({ ...st, ...(typeof p === 'function' ? p(st) : p) }))
  }, [])

  const go = useCallback<Ctx['go']>((view, arg = null, tab) => {
    setS((st) => ({ ...st, view, arg, tab: tab ?? st.tab, unread: view === 'care' ? 0 : st.unread }))
  }, [])

  const showToast = useCallback((m: string) => {
    setS((st) => ({ ...st, toast: m }))
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setS((st) => ({ ...st, toast: null })), 2400)
  }, [])

  const ctx = useMemo<Ctx>(() => ({ s, set, go, showToast }), [s, set, go, showToast])

  const screens = {
    home: <Home />,
    checkin: <CheckIn />,
    cidone: <CheckInDone />,
    plan: <Plan />,
    detail: <ExerciseDetail />,
    session: <Session key={s.arg} />,
    report: <Report />,
    calendar: <Calendar />,
    baby: <Baby />,
    care: <Care />,
  }

  return (
    <AppCtx.Provider value={ctx}>
      <PhoneFrame>{screens[s.view]}</PhoneFrame>
    </AppCtx.Provider>
  )
}
