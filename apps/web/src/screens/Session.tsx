import { useEffect, useState } from 'react'
import { fmt, useApp } from '../store'
import Icon from '../components/Icon'
import { ExerciseTracker, type CVResult, type Side } from '../tracking/vision'

export default function Session() {
  const { s, set, go } = useApp()
  const [exercise] = useState(() => s.ex.find(item => item.id === s.arg))
  const [seconds, setSeconds] = useState(0)
  const [active, setActive] = useState(true)
  const [result, setResult] = useState<CVResult | null>(null)
  const [cameraError, setCameraError] = useState('')
  const [manual, setManual] = useState(false)
  const [manualReps, setManualReps] = useState('0')
  const [side, setSide] = useState<Side>('left')
  const camera = exercise?.mode === 'cam' && !manual

  useEffect(() => {
    if (!active) return
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [active])

  if (!exercise) return null
  const reps = camera ? result?.reps ?? 0 : Number(manualReps) || 0
  const finish = () => {
    setActive(false)
    set({
      sess: {
        exId: exercise.id, exerciseId: exercise.exerciseId, assignmentId: exercise.assignmentId, count: reps, t: Math.max(1, seconds),
        rom: camera && result?.trackingQuality !== 'unavailable' ? result?.movementRange ?? null : null,
        trackingMode: camera ? 'cv' : 'manual',
        trackingQuality: camera ? result?.trackingQuality ?? 'unavailable' : 'unavailable',
      },
      rp: { pain: 3, diff: 'Moderate' }, view: 'report', arg: exercise.id,
    })
  }
  const exit = () => {
    if (window.confirm('End this exercise without saving?')) { setActive(false); go('detail', exercise.id) }
  }

  return <>
    <div className="top"><button type="button" className="back" onClick={exit}><Icon n="back" />Exit</button></div>
    <div className="row sp"><h1>{exercise.name}</h1><span className="pill ok">{camera ? 'Camera tracking' : 'Manual logging'}</span></div>
    <p className="sub">Provider target: {exercise.reps} reps · {exercise.targetDurationSeconds} seconds</p>
    {camera ? <>
      <label className="sub" style={{ display: 'block', marginTop: 12 }}>Side closest to camera
        <select value={side} onChange={event => setSide(event.target.value as Side)}>
          <option value="left">My left side</option><option value="right">My right side</option>
        </select>
      </label>
      <div className="cam"><ExerciseTracker exerciseId={exercise.exerciseId} side={side} active={active} onUpdate={setResult} onError={error => setCameraError(error.message)} style={{ height: '100%', maxWidth: 'none' }} /></div>
      {cameraError && <div className="alert red" role="alert">{cameraError}</div>}
      <p className="sub" style={{ marginTop: 8 }}>Video stays on this device. Angles are estimates.</p>
      <button type="button" className="btn alt" onClick={() => { setActive(false); setManualReps(String(result?.reps ?? 0)); setManual(true); setCameraError(''); setActive(true) }}>Use manual count instead</button>
    </> : <div className="card">
      <label>Repetitions completed<input type="number" min="0" max="10000" step="1" value={manualReps} onChange={event => setManualReps(event.target.value)} /></label>
      <p className="sub">Enter what you actually completed. No sensor measurements are assumed.</p>
    </div>}
    <div className="row sp" style={{ marginTop: 14 }}>
      <div><div className="big">{reps}</div><small className="sub">of {exercise.reps} target reps</small></div>
      <div style={{ textAlign: 'right' }}><div style={{ fontSize: 30, fontWeight: 700 }}>{fmt(seconds)}</div><small className="sub">Duration</small></div>
    </div>
    <div className="bar" style={{ marginTop: 12 }}><i style={{ width: `${exercise.reps ? Math.min(100, reps / exercise.reps * 100) : 0}%` }} /></div>
    <div className="stats">
      <div className="stat"><b>{camera && result?.movementRange != null ? `${Math.round(result.movementRange)}°` : '—'}</b><small>Estimated range</small></div>
      <div className="stat"><b>{camera && result?.currentAngle != null ? `${Math.round(result.currentAngle)}°` : '—'}</b><small>Current angle</small></div>
      <div className="stat"><b>{camera ? result?.trackingQuality ?? 'Starting' : 'Manual'}</b><small>Tracking</small></div>
    </div>
    <button type="button" className="btn" onClick={finish}>Finish and report</button>
  </>
}
