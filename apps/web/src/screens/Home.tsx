import { useState } from 'react'
import { useApp } from '../store'
import Icon from '../components/Icon'
import Fruit from '../components/Fruit'
import { CURRENT_WEEK, TIPS, TODAY_IDX, WEEKLY_GOAL, fruitFor } from '../data'

const WEEK_START = Date.now() - 7 * 86400000

export default function Home() {
  const { s, go } = useApp()
  const [tipI, setTipI] = useState(TODAY_IDX % TIPS.length)
  const tip = TIPS[tipI]
  const n = s.ex.filter((e) => e.done).length
  const mins = Math.floor(s.hist.filter(h => h.at >= WEEK_START).reduce((a, h) => a + h.t, 0) / 60)
  const week = s.pregnancyWeek ?? CURRENT_WEEK
  const fruit = fruitFor(week)
  return (
    <>
      <div className="row sp" style={{ marginTop: 6 }}>
        <div>
          <p className="sub">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>Hello, {s.patientName}</h1>
        </div>
        <button type="button" className="ico" aria-label="Care team messages" onClick={() => go('care', null, 'care')}>
          <Icon n="bell" />
        </button>
      </div>
      <div className="row" style={{ marginTop: 2 }}>
        <span className="pill">Week {s.pregnancyWeek ?? '—'}</span>
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

      <div className="tip" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon n="bulb" className="tick" />
          <span className="pill">Tip of the day</span>
        </div>
        <p style={{ marginTop: 6 }}><b>{tip.title}</b></p>
        <p>{tip.body}</p>
        <button type="button" className="more" onClick={() => setTipI((tipI + 1) % TIPS.length)}>Show another tip</button>
      </div>


      {s.pregnancyWeek != null && <button type="button" className="card row" style={{ width: '100%', textAlign: 'left', padding: 12 }} onClick={() => go('baby', null, 'baby')}>
        <div className="babyrow" style={{ flex: 1 }}>
          <Fruit type={fruit.type} size={56} />
          <div>
            <b>Your baby is the size of a {fruit.name}</b>
            <p className="sub" style={{ marginTop: 2 }}>About {fruit.cm} and {fruit.g}. See this week’s tips.</p>
          </div>
        </div>
        <Icon n="chev" className="chev" />
      </button>}

      <h2>This week</h2>
      <div className="card">
        <div className="row sp"><b>{mins} of {WEEKLY_GOAL} active minutes</b><span className={`pill ${mins >= WEEKLY_GOAL ? 'ok' : ''}`}>{mins >= WEEKLY_GOAL ? 'Goal met' : `${WEEKLY_GOAL - mins} to go`}</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${Math.min(100, (mins / WEEKLY_GOAL) * 100)}%` }} /></div>
        <p className="sub" style={{ marginTop: 8, fontSize: 12 }}>Demo weekly goal. Your recorded sessions appear in the exercise history.</p>
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
      <div className="alert">Your plan is chosen by your care team. BumpBridge does not diagnose or decide whether activity is safe for you.</div>
    </>
  )
}
