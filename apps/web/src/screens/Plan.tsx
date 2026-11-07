import { useApp } from '../store'
import Icon from '../components/Icon'

const IDEAS = [
  { name: 'Walking', detail: 'A comfortable walk at your own pace.' },
  { name: 'Swimming or water walking', detail: 'Gentle movement in the water.' },
  { name: 'Stationary cycling', detail: 'Low-impact cycling without balancing on a road bike.' },
  { name: 'Modified prenatal yoga', detail: 'Pregnancy-adapted stretches and breathing.' },
  { name: 'Modified prenatal Pilates', detail: 'Pregnancy-adapted strength and posture work.' },
]

export default function Plan() {
  const { s, go } = useApp()
  return (
    <>
      <h1 style={{ marginTop: 10 }}>Exercise</h1>
      <p className="sub">Your care team's exercises appear here automatically. Tap one for instructions.</p>
      <h2>Your assigned exercises</h2>
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
      <button type="button" className="chip" style={{ marginTop: 16 }} onClick={() => go('calendar', null, 'calendar')}>See sample schedule in Calendar →</button>
      <h2>Other exercise ideas</h2>
      <p className="sub">General examples to discuss with your physiotherapist. These are not part of your assigned plan and do not have tracking.</p>
      {IDEAS.map(idea => <div key={idea.name} className="card row exercise-idea">
        <div className="ico"><Icon n="ex" /></div>
        <div><b>{idea.name}</b><p className="sub">{idea.detail}</p><span className="pill">Example only</span></div>
      </div>)}
    </>
  )
}
