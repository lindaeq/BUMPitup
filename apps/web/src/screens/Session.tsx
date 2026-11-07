import { useEffect, useState } from 'react'
import { fmt, useApp } from '../store'
import Icon from '../components/Icon'

const PERIOD = 2.4

/**
 * Demo session. The motion here is simulated so the UI is demonstrable.
 * Replace `ph`-derived values with live output from the MediaPipe tracker
 * (mode 'cam') or the BMX160 serial/WebSocket bridge (mode 'band').
 */
export default function Session() {
  const { s, set, go } = useApp()
  const e = s.ex.find((x) => x.id === s.arg)
  const [ph, setPh] = useState(0)

  const tot = e ? e.reps * e.sets : 0
  const count = Math.min(tot, Math.floor(ph / PERIOD))
  const complete = count >= tot

  useEffect(() => {
    if (complete) return
    const id = window.setInterval(() => setPh((p) => p + 0.1), 100)
    return () => window.clearInterval(id)
  }, [complete])

  if (!e) return null
  const cam = e.mode === 'cam'
  const cyc = (ph / PERIOD) * 2 * Math.PI
  const a = 45 - 45 * Math.cos(cyc)
  const r = (a * Math.PI) / 180
  const rom = count ? (e.id === 'bd' ? 58 : 72) + Math.min(count, 10) : 0
  const t = Math.floor(ph)
  const setNo = Math.min(e.sets, Math.floor(Math.max(count - 1, 0) / e.reps) + 1)

  const wave = Array.from({ length: 60 }, (_, i) => {
    const tt = ph - (59 - i) * 0.1
    const y = 150 - 70 * Math.sin((tt / PERIOD) * 2 * Math.PI) + Math.sin(tt * 13) * 4
    return `${(i * 5.7).toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  const finish = () => {
    set({ sess: { exId: e.id, count: Math.max(count, 1), t, rom: rom || 72 }, rp: { pain: 3, diff: 'Moderate' }, view: 'report', arg: e.id })
  }
  const exit = () => {
    if (window.confirm('End this exercise without saving?')) go('detail', e.id)
  }

  const m1 = cam ? (rom ? `${rom}°` : '–') : count ? `${90 + (count % 5)}%` : '–'
  const m2 = cam ? `${Math.round(a * 1.8)}°` : `${84 + Math.round(a / 9)} bpm`
  const m3 = cam ? (count ? (count % 4 ? 'Good' : 'Great') : '–') : count ? '25' : '–'

  return (
    <>
      <div className="top">
        <button type="button" className="back" onClick={exit}><Icon n="back" />Exit</button>
      </div>
      <div className="row sp">
        <h1>{e.name}</h1>
        <span className="pill ok">{complete ? 'Complete' : cam ? 'Camera ready' : 'Band connected'}</span>
      </div>

      <div className="cam">
        <span className="tag">{cam ? 'Pose tracking' : 'BMX160 sensor'}</span>
        <span className="tag rec">Demo</span>
        {cam ? (
          <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Pose tracking preview">
            <g stroke="#ffd9e5" strokeWidth="7" strokeLinecap="round" fill="none">
              <circle cx="150" cy="88" r="20" fill="#3b1f1a" />
              <path d="M150 108v90M150 198l-26 70M150 198l26 70" />
              <path d={`M150 125L${150 - 62 * Math.cos(r)} ${125 - 62 * Math.sin(r)}`} />
              <path d={`M150 125L${150 + 62 * Math.cos(r)} ${125 - 62 * Math.sin(r)}`} />
            </g>
            <g fill="#ff5a7e">
              <circle cx={150 - 62 * Math.cos(r)} cy={125 - 62 * Math.sin(r)} r="6" />
              <circle cx={150 + 62 * Math.cos(r)} cy={125 - 62 * Math.sin(r)} r="6" />
              <circle cx="150" cy="125" r="6" />
              <circle cx="150" cy="198" r="6" />
            </g>
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 342 300" width="100%" height="100%" style={{ paddingTop: 20 }} role="img" aria-label="Wrist movement over time">
              <line x1="0" y1="150" x2="342" y2="150" stroke="#ffffff22" />
              <polyline fill="none" stroke="#ff9dbb" strokeWidth="4" strokeLinejoin="round" points={wave} />
            </svg>
            <div style={{ position: 'absolute', bottom: 12, left: 14, fontSize: 13, opacity: 0.8 }}>
              Gyroscope · {Math.round(Math.abs(Math.cos(cyc)) * 120)} °/s
            </div>
          </>
        )}
      </div>

      <div className="row sp" style={{ marginTop: 14 }}>
        <div>
          <div className="big">{count}</div>
          <small className="sub">of {tot} reps · Set {setNo} of {e.sets}</small>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{fmt(t)}</div>
          <small className="sub">Duration</small>
        </div>
      </div>
      <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${(count / tot) * 100}%` }} /></div>
      <div className="stats">
        <div className="stat"><b>{m1}</b><small>{cam ? 'Range' : 'Smoothness'}</small></div>
        <div className="stat"><b>{m2}</b><small>{cam ? 'Angle' : 'Heart rate'}</small></div>
        <div className="stat"><b>{m3}</b><small>{cam ? 'Form' : 'Cycles/min'}</small></div>
      </div>
      <button type="button" className="btn" onClick={finish}>{complete ? 'Finish and report' : 'Finish exercise'}</button>
    </>
  )
}
