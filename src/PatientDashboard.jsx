import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';
import { EXERCISES, exerciseById } from './exercises.js';
import { displayTime, latestAssignments, usePatientCollection } from './usePatientCollection.js';
import PatientDetails from './PatientDetails.jsx';
import Messages from './Messages.jsx';

function NumberField({ name, label, max, optional = false, min = 0 }) {
  return <label>{label}{optional && ' (optional)'}<input type="number" name={name} min={min} max={max} step="1" required={!optional} /></label>;
}
function CheckinForm() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const location = String(values.get('discomfortLocation') || '').trim();
    if (!location || busy) { setStatus('Enter a discomfort location, or “none”.'); return; }
    setBusy(true);
    setStatus('Saving…');
    try {
      await addDoc(collection(db, 'checkins'), {
        patientId: PATIENT_ID, painLevel: Number(values.get('painLevel')),
        fatigue: Number(values.get('fatigue')), discomfortLocation: location,
        notes: String(values.get('notes') || '').trim(), createdAt: serverTimestamp(),
      });
      form.reset(); setStatus('Check-in saved.');
    } catch (failure) { setStatus(firebaseError(failure)); }
    finally { setBusy(false); }
  }
  return <form className="card" onSubmit={submit}><h3>Daily pregnancy check-in</h3><fieldset disabled={busy}>
    <NumberField name="painLevel" label="Pain level (0–10)" max={10} />
    <NumberField name="fatigue" label="Fatigue (0–10)" max={10} />
    <label>Discomfort location<input name="discomfortLocation" placeholder="e.g. lower back, or none" maxLength={120} required /></label>
    <label>Notes (optional)<textarea name="notes" maxLength={2000} rows={3} /></label>
    <button type="submit">Save check-in</button></fieldset><p role="status" aria-live="polite">{status}</p></form>;
}
function ExercisePlan() {
  const { items, status, error } = usePatientCollection('assignments');
  const current = latestAssignments(items);
  const [selectedId, setSelectedId] = useState(null);
  return <section className="card"><h3>Exercises approved for you</h3>
    <p>Follow the individual plan from your physiotherapist. Contact your care team if an exercise needs adjusting.</p>
    <p role="status">{status}</p>{error && <p role="alert">{error}</p>}
    {!current.length && !error && <p>No exercises assigned yet. Your physiotherapist can add one from their dashboard.</p>}
    {current.map(item => <article key={item.id}><h4>{exerciseById(item.exerciseId)?.name ?? item.exerciseId}</h4>
      <p>Target: {item.targetReps} reps · {item.targetDurationSeconds} seconds</p>
      {item.instructions && <p className="notes">Instructions: {item.instructions}</p>}
      <small>Assigned {displayTime(item.createdAt)}</small><div><button type="button" onClick={() => setSelectedId(item.id)}>Log this exercise</button></div>
    </article>)}
    {selectedId && <SessionForm key={selectedId} assignment={current.find(item => item.id === selectedId)} onClose={() => setSelectedId(null)} />}
    <h4>Exercise library</h4><p>These are options for provider review, not automatic recommendations.</p>
    <ul>{EXERCISES.map(exercise => <li key={exercise.id}>{exercise.name}</li>)}</ul>
  </section>;
}
function SessionForm({ assignment, onClose }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  if (!assignment) return null;
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (busy) return;
    setBusy(true); setStatus('Saving…');
    const optionalNumber = name => values.get(name) === '' ? null : Number(values.get(name));
    try {
      await addDoc(collection(db, 'sessions'), {
        patientId: PATIENT_ID, exerciseId: assignment.exerciseId, assignmentId: assignment.id,
        trackingMode: 'manual', repsCompleted: Number(values.get('repsCompleted')),
        durationSeconds: Number(values.get('durationSeconds')),
        painLevel: Number(values.get('painLevel')), difficulty: String(values.get('difficulty')),
        notes: String(values.get('notes') || '').trim(),
        heartRateBefore: optionalNumber('heartRateBefore'), heartRateAfter: optionalNumber('heartRateAfter'),
        createdAt: serverTimestamp(),
      });
      form.reset(); setStatus('Exercise session saved.');
    } catch (failure) { setStatus(firebaseError(failure)); }
    finally { setBusy(false); }
  }
  return <form className="subcard" onSubmit={submit}><h4>Log {exerciseById(assignment.exerciseId)?.name}</h4>
    <p>Manual entry for this Firebase prototype. Camera tracking and sensor readings can connect here later.</p>
    <fieldset disabled={busy}>
      <NumberField name="repsCompleted" label="Repetitions completed" max={10000} />
      <NumberField name="durationSeconds" label="Duration (seconds)" min={1} max={86400} />
      <NumberField name="painLevel" label="Pain rating (0–10)" max={10} />
      <label>Difficulty<select name="difficulty" required><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></label>
      <NumberField name="heartRateBefore" label="Heart rate before (bpm)" min={1} max={300} optional />
      <NumberField name="heartRateAfter" label="Heart rate after (bpm)" min={1} max={300} optional />
      <label>Notes or adjustment request (optional)<textarea name="notes" maxLength={2000} rows={3} /></label>
      <button type="submit">Save exercise session</button> <button className="secondary" type="button" onClick={onClose}>Close</button>
    </fieldset><p role="status" aria-live="polite">{status}</p>
  </form>;
}
export default function PatientDashboard() {
  return <><h2>Patient dashboard</h2><PatientDetails /><div className="columns"><div><ExercisePlan /><Messages sender="patient" /></div><CheckinForm /></div></>;
}
