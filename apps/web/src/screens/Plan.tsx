import { useApp } from '../store'
import Icon from '../components/Icon'

export default function Plan() {
  const { s, go } = useApp()
  return (
    <>
      <h1 style={{ marginTop: 10 }}>Exercise</h1>
      <p className="sub">Assigned by Dr. Grey on Mon, Nov 2. Tap an exercise to see instructions.</p>
      {s.ex.map((e) => (
        <button key={e.id} type="button" className="card row" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('detail', e.id)}>
          <div className="ico"><Icon n={e.mode === 'cam' ? 'cam' : 'band'} /></div>
          <div style={{ flex: 1 }}>
            <b>{e.name}</b>
            <p className="sub">{e.reps} reps · {e.sets} sets</p>
            <span className="pill" style={{ marginTop: 6, display: 'inline-block' }}>{e.mode === 'cam' ? 'Camera tracking' : 'Wristband tracking'}</span>
          </div>
          {e.done ? <span className="pill ok">Done</span> : <Icon n="chev" className="chev" />}
        </button>
      ))}
      <div className="alert">Stop and contact your care team if you feel pain, dizziness, or anything unusual during an exercise.</div>
    </>
  )
}
