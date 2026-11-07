import { useApp } from '../store'
import Icon from '../components/Icon'

const X = (i: number) => 30 + i * 50
const Y = (p: number) => 130 - p * 11

export default function Progress() {
  const { s } = useApp()
  const w = s.week
  const avg = (w.reduce((a, d) => a + d.p, 0) / w.length).toFixed(1)
  return (
    <>
      <h1 style={{ marginTop: 10 }}>Progress</h1>
      <p className="sub">Your last 7 days</p>
      <div className="stats">
        <div className="stat"><b>{avg}</b><small>Avg. pain</small></div>
        <div className="stat"><b>{s.hist.length}</b><small>Sessions</small></div>
        <div className="stat"><b>6/7</b><small>Check-ins</small></div>
      </div>
      <div className="card">
        <b>Pain and exercise days</b>
        <svg viewBox="0 0 350 170" width="100%" style={{ marginTop: 8 }} role="img" aria-label="Pain level and exercise days for the past week">
          {[0, 5, 10].map((p) => (
            <g key={p}>
              <line x1="20" x2="340" y1={Y(p)} y2={Y(p)} stroke="#eadfda" />
              <text x="0" y={Y(p) + 4} fontSize="10" fill="#7d6a64">{p}</text>
            </g>
          ))}
          {w.map((d, i) => (
            <g key={d.d}>
              {d.s ? <rect x={X(i) - 12} y={Y(10)} width="24" height={Y(0) - Y(10)} rx="5" fill="#fdecf1" /> : null}
              <text x={X(i)} y="160" fontSize="11" fill="#7d6a64" textAnchor="middle">{d.d}</text>
            </g>
          ))}
          <polyline fill="none" stroke="#c81e55" strokeWidth="3" strokeLinejoin="round" points={w.map((d, i) => `${X(i)},${Y(d.p)}`).join(' ')} />
          {w.map((d, i) => <circle key={d.d} cx={X(i)} cy={Y(d.p)} r="4" fill="#c81e55" />)}
        </svg>
        <div className="row sub" style={{ gap: 16, fontSize: 12 }}>
          <span><b style={{ color: 'var(--rose)' }}>●</b> Pain (0–10)</span>
          <span><b style={{ color: '#f3b6c9' }}>■</b> Exercise day</span>
        </div>
      </div>
      <h2>Completed sessions</h2>
      <div className="card" style={{ padding: '4px 16px' }}>
        {s.hist.map((h, i) => (
          <div key={`${h.n}-${i}`} className="item">
            <div className="ico"><Icon n="check" /></div>
            <div>
              <b>{h.n}</b>
              <small>{h.d} · {h.r} reps · {h.rom}° range</small>
            </div>
            <span className="pill" style={{ marginLeft: 'auto' }}>Pain {h.p}</span>
          </div>
        ))}
      </div>
      <div className="alert">Your care team can see these trends. Share any concerns in Care team.</div>
    </>
  )
}
