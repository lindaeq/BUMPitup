import { fmt, useApp } from '../store'

export default function Report() {
  const { s, set, go, showToast } = useApp()
  const e = s.ex.find((x) => x.id === s.sess?.exId)
  const sess = s.sess
  if (!e || !sess) return null
  const r = s.rp

  const save = () => {
    set((st) => ({
      ex: st.ex.map((x) => (x.id === e.id ? { ...x, done: true } : x)),
      hist: [{ n: e.name, d: 'Sat, Nov 7', r: sess.count, rom: sess.rom, p: r.pain, df: r.diff }, ...st.hist],
      week: st.week.map((d, i) => (i === 6 ? { ...d, s: 1 } : d)),
      sess: null,
    }))
    go('plan', null, 'plan')
    showToast('Session saved and sent to your care team')
  }

  return (
    <>
      <h1 style={{ marginTop: 10 }}>How did that feel?</h1>
      <p className="sub">{e.name} · {sess.count} reps in {fmt(sess.t)}</p>
      <div className="stats">
        <div className="stat"><b>{sess.count}</b><small>Reps</small></div>
        <div className="stat"><b>{sess.rom}°</b><small>Max range</small></div>
        <div className="stat"><b>{fmt(sess.t)}</b><small>Duration</small></div>
      </div>
      <div className="card">
        <div className="row sp">
          <b>Pain after exercise</b>
          <span className="big" style={{ fontSize: 30 }}>{r.pain}</span>
        </div>
        <input type="range" min={0} max={10} value={r.pain} aria-label="Pain after exercise" onChange={(ev) => set({ rp: { ...r, pain: Number(ev.target.value) } })} />
      </div>
      <h2>How difficult was it?</h2>
      <div className="seg">
        {['Easy', 'Moderate', 'Hard'].map((f) => (
          <button key={f} type="button" className={r.diff === f ? 'on' : ''} onClick={() => set({ rp: { ...r, diff: f } })}>{f}</button>
        ))}
      </div>
      {r.pain >= 7 && <div className="alert red">That is a high pain score. Please contact your care team before doing this exercise again.</div>}
      <button type="button" className="btn" onClick={save}>Save and send to care team</button>
    </>
  )
}
