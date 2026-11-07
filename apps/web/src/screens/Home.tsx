import { useState } from 'react'
import { useApp } from '../store'
import Icon from '../components/Icon'
import Fruit from '../components/Fruit'
import { CURRENT_WEEK, RECS, TIPS, TODAY_IDX, WEEKLY_GOAL, fruitFor, streak } from '../data'

export default function Home() {
  const { s, go } = useApp()
  const [tipI, setTipI] = useState(TODAY_IDX % TIPS.length)
  const tip = TIPS[tipI]
  const n = s.ex.filter((e) => e.done).length
  const mins = RECS.slice(-6).reduce((a, r) => a + r.mins, 0) + n * 9
  const fruit = fruitFor(CURRENT_WEEK)
  return (
    <>
      <div className="row sp" style={{ marginTop: 6 }}>
        <div>
          <p className="sub">Saturday, November 7</p>
          <h1>Hello, Selina</h1>
        </div>
        <button type="button" className="ico" aria-label="Care team messages" onClick={() => go('care', null, 'care')}>
          <Icon n="bell" />
        </button>
      </div>
      <div className="row" style={{ marginTop: 2 }}>
        <span className="pill">Week {CURRENT_WEEK}</span>
        <span className="pill">Second trimester</span>
        <span className="pill ok">{streak()}-day streak</span>
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

      <div className={`tip ${tip.kind}`} style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          <Icon n="bulb" className="tick" />
          <span className={`pill ${tip.kind === 'myth' ? 'warn' : ''}`}>{tip.kind === 'myth' ? 'Myth buster' : 'Tip of the day'}</span>
        </div>
        <p style={{ marginTop: 6 }}><b>{tip.title}</b></p>
        <p>{tip.body}</p>
        <button type="button" className="more" onClick={() => setTipI((tipI + 1) % TIPS.length)}>Show another tip</button>
      </div>


      <button type="button" className="card row" style={{ width: '100%', textAlign: 'left', padding: 12 }} onClick={() => go('baby', null, 'baby')}>
        <div className="babyrow" style={{ flex: 1 }}>
          <Fruit type={fruit.type} size={56} />
          <div>
            <b>Your baby is the size of a {fruit.name}</b>
            <p className="sub" style={{ marginTop: 2 }}>About {fruit.cm} and {fruit.g}. See this week’s tips.</p>
          </div>
        </div>
        <Icon n="chev" className="chev" />
      </button>

      <h2>This week</h2>
      <div className="card">
        <div className="row sp"><b>{mins} of {WEEKLY_GOAL} active minutes</b><span className={`pill ${mins >= WEEKLY_GOAL ? 'ok' : ''}`}>{mins >= WEEKLY_GOAL ? 'Goal met' : `${WEEKLY_GOAL - mins} to go`}</span></div>
        <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${Math.min(100, (mins / WEEKLY_GOAL) * 100)}%` }} /></div>
        <p className="sub" style={{ marginTop: 8, fontSize: 12 }}>Goal set by Dr. Grey. See the Calendar tab for your full history.</p>
      </div>

      <h2>Today’s exercise plan</h2>
      <div className="card">
        <div className="row sp">
          <b>{n} of {s.ex.length} completed</b>
          <span className={`pill ${n === s.ex.length ? 'ok' : ''}`}>{n === s.ex.length ? 'All done' : 'In progress'}</span>
        </div>
        <div className="bar" style={{ margin: '10px 0 6px' }}><i style={{ width: `${(n / s.ex.length) * 100}%` }} /></div>
        {s.ex.map((e) => (
          <button key={e.id} type="button" className="item" onClick={() => go('detail', e.id, 'plan')}>
            <div className="ico"><Icon n={e.mode === 'cam' ? 'cam' : 'band'} /></div>
            <div><b>{e.name}</b><small>{e.reps} reps · {e.sets} sets</small></div>
            {e.done ? <span className="pill ok" style={{ marginLeft: 'auto' }}>Done</span> : <Icon n="chev" className="chev" />}
          </button>
        ))}
      </div>

      <h2>From your care team</h2>
      <button type="button" className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('care', null, 'care')}>
        <div className="row sp"><b>Dr. Meredith Grey</b><small className="sub">Fri 09:05</small></div>
        <p className="sub" style={{ marginTop: 6 }}>Let’s keep the arm raises gentle this week and move slowly through bird dog.</p>
      </button>
      <div className="alert">Your plan is chosen by your care team. BumpBridge does not diagnose or decide whether activity is safe for you.</div>
    </>
  )
}
