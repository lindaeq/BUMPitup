import { useState } from 'react'
import { firebaseError } from '../lib/firebase'
import { fmt, useApp } from '../store'

export default function Report() {
  const { s, set, go, showToast, saveSession } = useApp()
  const exercise = s.ex.find(item => item.id === s.sess?.exId)
  const session = s.sess
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (!exercise || !session) return null
  const r = s.rp
  const save = async () => {
    if (busy) return
    setBusy(true); setError('')
    try {
      await saveSession()
      set({ sess: null })
      go('plan', null, 'plan')
      showToast('Session saved and sent to your care team')
    } catch (failure) { setError(firebaseError(failure)) }
    finally { setBusy(false) }
  }
  return <>
    <h1 style={{ marginTop: 10 }}>How did that feel?</h1>
    <p className="sub">{exercise.name} · {session.count} reps in {fmt(session.t)}</p>
    <div className="stats">
      <div className="stat"><b>{session.count}</b><small>Reps</small></div>
      <div className="stat"><b>{session.rom == null ? '—' : `${Math.round(session.rom)}°`}</b><small>Estimated range</small></div>
      <div className="stat"><b>{fmt(session.t)}</b><small>Duration</small></div>
    </div>
    <div className="card"><div className="row sp"><b>Pain after exercise</b><span className="big" style={{ fontSize: 30 }}>{r.pain}</span></div>
      <input type="range" min={0} max={10} value={r.pain} aria-label="Pain after exercise" onChange={event => set({ rp: { ...r, pain: Number(event.target.value) } })} />
    </div>
    <h2>How difficult was it?</h2>
    <div className="seg">{['Easy', 'Moderate', 'Hard'].map(value => <button key={value} type="button" className={r.diff === value ? 'on' : ''} onClick={() => set({ rp: { ...r, diff: value } })}>{value}</button>)}</div>
    {r.pain >= 7 && <div className="alert red">That is a high pain score. Please contact your care team before doing this exercise again.</div>}
    {error && <div className="alert red" role="alert">{error}</div>}
    <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save and send to care team'}</button>
  </>
}
