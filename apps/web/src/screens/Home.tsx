import { useApp } from '../store'
import Icon from '../components/Icon'

export default function Home() {
  const { s, go } = useApp()
  const n = s.ex.filter((e) => e.done).length
  return (
    <>
      <div className="row sp" style={{ marginTop: 6 }}>
        <div>
          <p className="sub">Saturday, November 7</p>
          <h1><span className="font-medium">Hello, Maya</span></h1>
        </div>
        <button type="button" className="ico" aria-label="Care team messages" onClick={() => go('care', null, 'care')}>
          <Icon n="bell" />
        </button>
      </div>
      <div className="row" style={{ marginTop: 2 }}>
        <span className="pill">Week 24</span>
        <span className="pill">Second trimester</span>
      </div>

      {s.checked ? (
        <div className="card row">
          <div className="ico" style={{ background: 'var(--okbg)', color: 'var(--ok)' }}>
            <Icon n="check" />
          </div>
          <div>
            <b>Check-in sent</b>
            <p className="sub">
              Pain {s.ci.pain}/10 · {s.ci.loc} · Fatigue {s.ci.fat.toLowerCase()}
            </p>
          </div>
        </div>
      ) : (
        <div className="hero">
          <b style={{ fontSize: 18 }}>Daily check-in</b>
          <p className="sub" style={{ marginTop: 4 }}>Tell your care team how you feel today. It takes about a minute.</p>
          <button type="button" className="btn" style={{ background: '#fff', color: 'var(--rosed)', marginTop: 14, height: 46 }} onClick={() => go('checkin')}>
            Start check-in
          </button>
        </div>
      )}

      <h2>Today’s exercise plan</h2>
      <div className="card">
        <div className="row sp">
          <b>{n} of {s.ex.length} completed</b>
          <span className={`pill ${n === s.ex.length ? 'ok' : ''}`}>{n === s.ex.length ? 'All done' : 'In progress'}</span>
        </div>
        <div className="bar" style={{ margin: '10px 0 6px' }}>
          <i style={{ width: `${(n / s.ex.length) * 100}%` }} />
        </div>
        {s.ex.map((e) => (
          <button key={e.id} type="button" className="item" onClick={() => go('detail', e.id, 'plan')}>
            <div className="ico"><Icon n={e.mode === 'cam' ? 'cam' : 'band'} /></div>
            <div>
              <b>{e.name}</b>
              <small>{e.reps} reps · {e.sets} sets</small>
            </div>
            {e.done ? <span className="pill ok" style={{ marginLeft: 'auto' }}>Done</span> : <Icon n="chev" className="chev" />}
          </button>
        ))}
      </div>

      <h2>From your care team</h2>
      <button type="button" className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('care', null, 'care')}>
        <div className="row sp">
          <b>Dr. Priya Nair</b>
          <small className="sub">Fri 09:05</small>
        </div>
        <p className="sub" style={{ marginTop: 6 }}>Let’s keep the arm raises gentle this week and move slowly through bird dog.</p>
      </button>
      <div className="alert">Your plan is chosen by your care team. BumpBridge does not diagnose or decide whether activity is safe for you.</div>
    </>
  )
}
