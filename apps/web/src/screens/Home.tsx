import { useState } from 'react'
import { useApp } from '../store'
import Icon from '../components/Icon'
import Fruit from '../components/Fruit'
import { CURRENT_WEEK, TIPS, TODAY_IDX, WEEKLY_GOAL, fruitFor } from '../data'
import { useArduinoSerial } from '../useArduinoSerial'

const WEEK_START = Date.now() - 7 * 86400000

export default function Home() {
  const { s, go } = useApp()
  const [tipI, setTipI] = useState(TODAY_IDX % TIPS.length)
  const tip = TIPS[tipI]
  const n = s.ex.filter((e) => e.done).length
  const mins = Math.floor(s.hist.filter(h => h.at >= WEEK_START).reduce((a, h) => a + h.t, 0) / 60)
  const week = s.pregnancyWeek ?? CURRENT_WEEK
  const fruit = fruitFor(week)
  const { supported, connected, connecting, live, restHR, error, connect, disconnect } = useArduinoSerial()
  const heartRateChange = live.hr != null && restHR != null ? live.hr - restHR : null
  return (
    <>
      <div className="row sp" style={{ marginTop: 6 }}>
        <div>
          <p className="sub">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Hello, {s.patientName}</h1>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="ico" aria-label="Care team messages" onClick={() => go('care', null, 'care')}>
            <Icon n="bell" />
          </button>
          <button type="button" className="home-fruit" aria-label={`Baby size: ${fruit.name}. Open baby page`} title={`Baby size: ${fruit.name}`} onClick={() => go('baby', null, 'home')}>
            <Fruit type={fruit.type} size={46} />
          </button>
        </div>
      </div>
      <div className="row" style={{ marginTop: 2 }}>
        <span className="pill">Week {s.pregnancyWeek ?? CURRENT_WEEK}</span>
        {s.pregnancyWeek != null && <span className="pill">{s.pregnancyWeek < 13 ? 'First' : s.pregnancyWeek < 28 ? 'Second' : 'Third'} trimester</span>}
      </div>

      {s.checked ? (
        <div className="card row">
          <div className="ico" style={{ background: 'var(--okbg)', color: 'var(--ok)' }}><Icon n="check" /></div>
          <div>
            <b>Check-in sent</b>
            <p className="sub">Pain {s.ci.pain}/10 · {s.ci.loc} · Fatigue {s.ci.fat.toLowerCase()}</p>
          </div>
        </div>
      ) : (
        <div className="hero">
          <b style={{ fontSize: 18 }}>Daily check-in</b>
          <p className="sub" style={{ marginTop: 4 }}>Tell your care team how you feel today. It takes about a minute.</p>
          <button type="button" className="btn" style={{ background: '#fff', color: 'var(--rosed)', marginTop: 14, height: 46 }} onClick={() => go('checkin')}>Start check-in</button>
        </div>
      )}

      <div className="card" aria-label="Wristband heart rate">
        <div className="row sp"><b>Wristband</b><span className={`pill ${connected ? 'ok' : ''}`}>{connected ? 'Connected' : 'Not connected'}</span></div>
        <div className="stats">
          <div className="stat"><b>{live.hr ?? '—'}</b><small>Current bpm</small></div>
          <div className="stat"><b>{restHR ?? '—'}</b><small>Resting bpm</small></div>
          <div className="stat"><b>{heartRateChange == null ? '—' : `${heartRateChange >= 0 ? '+' : ''}${heartRateChange}`}</b><small>Change (bpm)</small></div>
        </div>
        {supported ? <button type="button" className="chip" style={{ margin: '12px 0 0' }} disabled={connecting} onClick={() => { if (connected) void disconnect(); else void connect() }}>{connecting ? 'Connecting…' : connected ? 'Disconnect' : 'Connect wristband'}</button>
          : <p className="sub" style={{ marginTop: 10 }}>Open this page in Chrome or Edge to connect.</p>}
        {connected && live.hr == null && <p className="sub" style={{ marginTop: 8 }}>Waiting for a reading…</p>}
        {error && <p className="sub" role="alert" style={{ marginTop: 8 }}>{error}</p>}
      </div>

      <h2>This week</h2>
      <div className="card">
        <div className="row sp"><b>{mins} of {WEEKLY_GOAL} active minutes</b><span className={`pill ${mins >= WEEKLY_GOAL ? 'ok' : ''}`}>{mins >= WEEKLY_GOAL ? 'Goal met' : `${WEEKLY_GOAL - mins} to go`}</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${Math.min(100, (mins / WEEKLY_GOAL) * 100)}%` }} /></div>
      </div>

      <h2>Today’s exercise plan</h2>
      <div className="card">
        <div className="row sp">
          <b>{n} of {s.ex.length} completed</b>
          <span className={`pill ${n === s.ex.length ? 'ok' : ''}`}>{s.ex.length === 0 ? 'No plan yet' : n === s.ex.length ? 'All done' : 'In progress'}</span>
        </div>
        <div className="bar" style={{ margin: '10px 0 6px' }}><i style={{ width: `${s.ex.length ? (n / s.ex.length) * 100 : 0}%` }} /></div>
        {s.ex.length === 0 && <p className="sub" style={{ marginTop: 8 }}>Your care team has not assigned an exercise yet.</p>}
        {s.ex.map((e) => (
          <button key={e.id} type="button" className="item" onClick={() => go('detail', e.id, 'plan')}>
            <div className="ico"><Icon n={e.mode === 'cam' ? 'cam' : 'ex'} /></div>
            <div><b>{e.name}</b><small>{e.reps} reps · {e.targetDurationSeconds} sec target</small></div>
            {e.done ? <span className="pill ok" style={{ marginLeft: 'auto' }}>Done</span> : <Icon n="chev" className="chev" />}
          </button>
        ))}
      </div>

      <h2>From your care team</h2>
      <button type="button" className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('care', null, 'care')}>
        {s.msgs.filter(message => message.w === 'them').length ? <>
          <div className="row sp"><b>Care team message</b><small className="sub">{s.msgs.filter(message => message.w === 'them').at(-1)?.tm}</small></div>
          <p className="sub" style={{ marginTop: 6 }}>{s.msgs.filter(message => message.w === 'them').at(-1)?.t}</p>
        </> : <p className="sub">No feedback yet. Open Care team to send a question.</p>}
      </button>
      <div className="tip" style={{ marginTop: 16 }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon n="bulb" className="tick" />
          <span className="pill">Tip of the day</span>
        </div>
        <p style={{ marginTop: 6 }}><b>{tip.title}</b></p>
        <p>{tip.body}</p>
        <button type="button" className="more" onClick={() => setTipI((tipI + 1) % TIPS.length)}>Show another tip</button>
      </div>
    </>
  )
}
