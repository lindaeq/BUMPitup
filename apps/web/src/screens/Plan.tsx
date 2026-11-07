import { useApp } from '../store'
import Icon from '../components/Icon'

export default function Plan() {
  const { s, go } = useApp()
  return (
    <>
      <h1 style={{ marginTop: 10 }}>Exercise</h1>
      <p className="sub">Exercises assigned by your care team appear here automatically. Tap one for instructions.</p>
      {s.ex.length === 0 && <div className="card">No exercises assigned yet. Your care team can add one from the physiotherapist dashboard.</div>}
      {s.ex.map((e) => (
        <button key={e.id} type="button" className="card row" style={{ width: '100%', textAlign: 'left' }} onClick={() => go('detail', e.id)}>
          <div className="ico"><Icon n={e.mode === 'cam' ? 'cam' : 'ex'} /></div>
          <div style={{ flex: 1 }}>
            <b>{e.name}</b>
            <p className="sub">{e.reps} reps · {e.targetDurationSeconds} sec target</p>
            <span className="pill" style={{ marginTop: 6, display: 'inline-block' }}>{e.mode === 'cam' ? 'Camera tracking' : 'Manual logging'}</span>
          </div>
          {e.done ? <span className="pill ok">Done</span> : <Icon n="chev" className="chev" />}
        </button>
      ))}
      <div className="alert">Stop and contact your care team if you feel pain, dizziness, or anything unusual during an exercise.</div>
    </>
  )
}
