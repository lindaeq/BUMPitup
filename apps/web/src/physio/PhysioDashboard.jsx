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
      setFeedback('Exercise saved.');
    } catch (failure) { setFeedback(firebaseError(failure)); }
    finally { setBusy(false); }
  }
  return <section className="card"><h3>Assign exercise</h3>
    <form onSubmit={assign}><fieldset disabled={busy}>
      <label>Exercise<select value={selected} onChange={event => choose(event.target.value)}>
        {EXERCISES.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}
      </select></label>
      <label>Reps<input type="number" min="0" max="10000" required value={reps} onChange={event => setReps(event.target.value)} /></label>
      <label>Duration (seconds)<input type="number" min="1" max="86400" required value={duration} onChange={event => setDuration(event.target.value)} /></label>
      <label>Note (optional)<textarea rows={3} maxLength={2000} value={instructions} onChange={event => setInstructions(event.target.value)} /></label>
      <button type="submit">Save exercise</button></fieldset><p role="status" aria-live="polite">{feedback}</p>
    </form>
    {status !== 'Live · connected to Firestore' && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}
  </section>;
}
function Feed({ kind }) {
  const { items, status, error } = usePatientCollection(kind);
  const visibleItems = kind === 'sessions' ? items.slice(0, 3) : items;
  return <section className="card"><h3>{kind === 'checkins' ? 'Daily check-ins' : 'Exercise sessions'}</h3>
    {status !== 'Live · connected to Firestore' && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}
    {!items.length && !error && <p>No submissions received yet.</p>}
    {visibleItems.map(item => <article key={item.id}>
      <small>{displayTime(item.createdAt)}</small>
      {kind === 'checkins' ? <>
        <p><strong>Pain {item.painLevel}/10</strong> · Fatigue {item.fatigue}/10</p>
        <p>{item.discomfortLocation}</p>{item.notes && <p className="notes">{item.notes}</p>}
      </> : <>
        <h4>{exerciseById(item.exerciseId)?.name ?? (item.exercise === 'bomba' ? 'Exercise session' : item.exercise) ?? 'Exercise session'}</h4>
        <p>{item.repsCompleted ?? item.reps} reps · {item.durationSeconds}s · Pain {item.painLevel}/10</p>
        {item.movementRangeDegrees != null && <p>Range {Math.round(item.movementRangeDegrees)}°</p>}
        {(item.heartRateBefore != null || item.heartRateAfter != null) && <p>Heart rate {item.heartRateBefore ?? '—'} → {item.heartRateAfter ?? '—'} bpm</p>}
        {item.notes && <p className="notes">{item.notes}</p>}
      </>}
    </article>)}
  </section>;
}
export default function PhysioDashboard() {
  return <main className="provider-dashboard">
    <div className="provider-heading"><h2>Physiotherapist dashboard</h2></div>
    <div className="provider-overview"><PatientDetails /><AISummary /></div>
    <PatientGraphs />
    <div className="columns"><div><AssignmentEditor /><Messages sender="provider" /></div><div><Feed kind="checkins" /><Feed kind="sessions" /></div></div>
  </main>;
}
