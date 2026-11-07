import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';
import { EXERCISES, exerciseById } from './exercises.js';
import { displayTime, latestAssignments, usePatientCollection } from './usePatientCollection.js';
import PatientDetails from './PatientDetails.jsx';
import Messages from './Messages.jsx';
import PatientGraphs from './PatientGraphs.jsx';
import AISummary from './AISummary.jsx';

function AssignmentEditor() {
  const { items, status, error } = usePatientCollection('assignments');
  const current = latestAssignments(items);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selected, setSelected] = useState(EXERCISES[0].id);
  const [reps, setReps] = useState('10');
  const [duration, setDuration] = useState('60');
  const [instructions, setInstructions] = useState('');
  function choose(id) {
    setSelected(id);
    const previous = current.find(item => item.exerciseId === id);
    setReps(String(previous?.targetReps ?? 10));
    setDuration(String(previous?.targetDurationSeconds ?? 60));
    setInstructions(previous?.instructions ?? '');
  }
  async function assign(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback('Saving plan…');
    try {
      await addDoc(collection(db, 'assignments'), {
        patientId: PATIENT_ID, exerciseId: selected,
        targetReps: Number(reps), targetDurationSeconds: Number(duration),
        instructions: instructions.trim(), createdAt: serverTimestamp(),
      });
      setFeedback('Plan saved. The patient dashboard updates automatically.');
    } catch (failure) { setFeedback(firebaseError(failure)); }
    finally { setBusy(false); }
  }
  return <section className="card"><h3>Assign or adjust exercises</h3>
    <p>Select a library exercise and set an individual target. A new assignment replaces the previous plan for that exercise.</p>
    <form onSubmit={assign}><fieldset disabled={busy}>
      <label>Exercise<select value={selected} onChange={event => choose(event.target.value)}>
        {EXERCISES.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
      </select></label>
      <label>Target repetitions<input type="number" min="0" max="10000" required value={reps} onChange={event => setReps(event.target.value)} /></label>
      <label>Target duration (seconds)<input type="number" min="1" max="86400" required value={duration} onChange={event => setDuration(event.target.value)} /></label>
      <label>Instructions for patient (optional)<textarea rows={3} maxLength={2000} value={instructions} onChange={event => setInstructions(event.target.value)} /></label>
      <button type="submit">Save assignment</button></fieldset><p role="status" aria-live="polite">{feedback}</p>
    </form>
    <p role="status">{status}</p>{error && <p role="alert">{error}</p>}
    <h4>Current plan</h4>{!current.length && !error && <p>No exercises assigned yet.</p>}
    {current.map(item => <article key={item.id}><strong>{exerciseById(item.exerciseId)?.name ?? item.exerciseId}</strong>
      <p>Target: {item.targetReps} reps · {item.targetDurationSeconds} seconds</p>
      {item.instructions && <p className="notes">{item.instructions}</p>}
      <small>Updated {displayTime(item.createdAt)}</small></article>)}
  </section>;
}
function Feed({ kind }) {
  const { items, status, error } = usePatientCollection(kind);
  return <section className="card"><h3>{kind === 'checkins' ? 'Daily check-ins' : 'Exercise sessions'}</h3>
    <p role="status">{status}</p>{error && <p role="alert">{error}</p>}
    {!items.length && !error && <p>No submissions received yet.</p>}
    {items.map(item => <article key={item.id}>
      <small>{displayTime(item.createdAt)}</small>
      {kind === 'checkins' ? <>
        <h4>Daily check-in</h4><p>Pain: {item.painLevel}/10 · Fatigue: {item.fatigue}/10</p>
        <p>Discomfort: {item.discomfortLocation}</p>{item.notes && <p className="notes">Notes: {item.notes}</p>}
      </> : <>
        <h4>{exerciseById(item.exerciseId)?.name ?? item.exercise ?? 'Exercise'}</h4>
        <p>{item.repsCompleted ?? item.reps} repetitions · {item.durationSeconds} seconds</p>
        <p>Pain: {item.painLevel}/10{item.difficulty ? ` · Difficulty: ${item.difficulty}` : ''}</p>
        {item.trackingMode && <p>Tracking: {item.trackingMode === 'cv' ? 'Camera' : 'Manual'}{item.movementRangeDegrees != null ? ` · Estimated range: ${Math.round(item.movementRangeDegrees)}°` : ''}</p>}
        {item.notes && <p className="notes">Notes: {item.notes}</p>}
        <p>Heart rate before: {item.heartRateBefore == null ? 'Not provided' : `${item.heartRateBefore} bpm`}</p>
        <p>Heart rate after: {item.heartRateAfter == null ? 'Not provided' : `${item.heartRateAfter} bpm`}</p>
      </>}
    </article>)}
  </section>;
}
export default function PhysioDashboard() {
  return <main className="provider-dashboard">
    <div className="provider-heading"><div><span className="provider-eyebrow">PATIENT OVERVIEW</span><h2>Physiotherapist dashboard</h2><p>Review activity, adjust exercises, and respond to your patient.</p></div><span className="provider-live">Live updates</span></div>
    <div className="provider-overview"><PatientDetails /><AISummary /></div>
    <h3 className="provider-section-title">Activity trends</h3>
    <PatientGraphs />
    <h3 className="provider-section-title">Plan and communication</h3>
    <div className="columns"><div><AssignmentEditor /><Messages sender="provider" /></div><div><Feed kind="checkins" /><Feed kind="sessions" /></div></div>
  </main>;
}
