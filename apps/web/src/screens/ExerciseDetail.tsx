import { useApp } from '../store'
import BackBar from '../components/BackBar'
import StickFigure from '../components/StickFigure'
import Icon from '../components/Icon'

export default function ExerciseDetail() {
  const { s, go } = useApp()
  const e = s.ex.find((x) => x.id === s.arg)
  if (!e) return <BackBar to="plan" label="Exercise" />
  return (
    <>
      <BackBar to="plan" label="Exercise" />
      <h1>{e.name}</h1>
      <div className="row" style={{ margin: '4px 0', flexWrap: 'wrap' }}>
        <span className="pill">{e.reps} reps · {e.sets} sets</span>
        <span className="pill">{e.mode === 'cam' ? 'Camera' : 'Wristband'}</span>
        {e.done && <span className="pill ok">Done today</span>}
      </div>
      <StickFigure id={e.id} />
      <div className="card" style={{ background: 'var(--blush)', border: 0 }}>
        <b style={{ color: 'var(--rosed)' }}>Note from Dr. Grey</b>
        <p className="sub" style={{ marginTop: 4, color: 'var(--ink)' }}>{e.note}</p>
      </div>
      <h2>Before you start</h2>
      <div className="card">
        {e.tips.map((t) => (
          <div key={t} className="row" style={{ alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <Icon n="check" className="tick" />
            <span style={{ fontSize: 14, lineHeight: 1.4 }}>{t}</span>
          </div>
        ))}
        <p className="sub" style={{ fontSize: 12 }}>Have water nearby and wear comfortable shoes. Stop if you feel pain, dizziness or shortness of breath.</p>
      </div>
      <h2>Step by step</h2>
      {e.steps.map((t, i) => (
        <div key={t} className="row" style={{ alignItems: 'flex-start', marginBottom: 12 }}>
          <span className="pill" style={{ minWidth: 26, textAlign: 'center' }}>{i + 1}</span>
          <span style={{ fontSize: 14, lineHeight: 1.45 }}>{t}</span>
        </div>
      ))}
      <div className="card">
        <b>What we measure</b>
        <p className="sub" style={{ marginTop: 4 }}>
          Repetitions, duration and {e.rom.toLowerCase()}. {e.mode === 'cam' ? 'Video is processed on your phone and never saved.' : 'Data comes from your wristband sensor.'}
        </p>
      </div>
      <button type="button" className="btn" onClick={() => go('session', e.id)}>Start exercise</button>
    </>
  )
}
