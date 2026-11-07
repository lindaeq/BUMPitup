import { useEffect, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';
import { EXERCISES, exerciseById } from './exercises.js';
import { displayTime, latestAssignments, usePatientCollection } from './usePatientCollection.js';
import PatientDetails from './PatientDetails.jsx';
import Messages from './Messages.jsx';
import PatientGraphs from './PatientGraphs.jsx';
import AISummary from './AISummary.jsx';
import { plannedFor, upcomingPlan } from '../lib/schedule';

function CurrentSchedule() {
  const { items, status, error } = usePatientCollection('assignments');
  const current = latestAssignments(items);
  const assigned = current.map(item => ({ exerciseId: item.exerciseId }));
  const [draftDays, setDraftDays] = useState(null);
  const [scheduleError, setScheduleError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  const dates = upcomingPlan(EXERCISES);
  const fallbackDays = Array(7).fill('');
  dates.forEach(date => { fallbackDays[date.getDay()] = plannedFor(date, assigned)[0]?.exerciseId ?? ''; });
  const days = draftDays ?? fallbackDays;
  useEffect(() => onSnapshot(doc(db, 'schedules', PATIENT_ID), snapshot => {
    const saved = snapshot.data()?.days;
    setDraftDays(Array.isArray(saved) && saved.length === 7 ? saved : null);
    setScheduleError('');
  }, failure => setScheduleError(failure?.code === 'permission-denied'
    ? 'Publish the updated Firestore rules to edit this schedule.'
    : firebaseError(failure))), []);
  const chooseDay = (weekday, exerciseId) => {
    const next = [...days];
    next[weekday] = exerciseId;
    setDraftDays(next);
    setFeedback('');
  };
  const saveSchedule = async () => {
    if (busy) return;
    setBusy(true);
    setFeedback('Saving…');
    try {
      const batch = writeBatch(db);
      const missing = [...new Set(days.filter(Boolean))].filter(id => !current.some(item => item.exerciseId === id));
      for (const id of missing) {
        const exercise = exerciseById(id);
        batch.set(doc(collection(db, 'assignments')), {
          patientId: PATIENT_ID, exerciseId: id,
          targetReps: exercise.defaultReps, targetDurationSeconds: exercise.defaultDurationSeconds,
          instructions: '', createdAt: serverTimestamp(),
        });
      }
      batch.set(doc(db, 'schedules', PATIENT_ID), { patientId: PATIENT_ID, days, updatedAt: serverTimestamp() });
      await batch.commit();
      setFeedback('Schedule saved.');
    } catch (failure) { setFeedback(firebaseError(failure)); }
    finally { setBusy(false); }
  };
  return <section className="card provider-schedule">
    <div className="provider-schedule-heading"><div><h3>Weekly exercise schedule</h3><p>Choose an exercise for each day.</p></div><span>Repeats weekly</span></div>
    {status !== 'Live · connected to Firestore' && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}{scheduleError && <p role="alert">{scheduleError}</p>}
    <div className="provider-schedule-days">{dates.map(date => <div key={date.toDateString()} className="provider-schedule-day">
      <div className="provider-schedule-date"><span className="provider-day-marker">{date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span><div><strong>{date.toLocaleDateString('en-US', { weekday: 'long' })}</strong><small>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></div></div>
      <select aria-label={`Exercise for ${date.toLocaleDateString('en-US', { weekday: 'long' })}`} value={days[date.getDay()]} onChange={event => chooseDay(date.getDay(), event.target.value)} disabled={busy}>
        <option value="">Rest day</option>
        {EXERCISES.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.name}{current.some(item => item.exerciseId === exercise.id) ? '' : ' · add to plan'}</option>)}
      </select>
    </div>)}</div>
    <div className="provider-schedule-footer"><p>New exercises are added to the patient plan when saved.</p><button type="button" className="provider-save-schedule" disabled={busy || Boolean(scheduleError) || status !== 'Live · connected to Firestore'} onClick={saveSchedule}>Save schedule</button></div>
    {feedback && <p role="status" aria-live="polite">{feedback}</p>}
  </section>;
}

function AssignmentEditor() {
  const { items, status, error } = usePatientCollection('assignments');
  const current = latestAssignments(items);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selected, setSelected] = useState(EXERCISES[0].id);
  const [reps, setReps] = useState(String(EXERCISES[0].defaultReps));
  const [duration, setDuration] = useState(String(EXERCISES[0].defaultDurationSeconds));
  const [instructions, setInstructions] = useState('');
  function choose(id) {
    setSelected(id);
    const previous = current.find(item => item.exerciseId === id);
    setReps(String(previous?.targetReps ?? exerciseById(id)?.defaultReps ?? 10));
    setDuration(String(previous?.targetDurationSeconds ?? exerciseById(id)?.defaultDurationSeconds ?? 60));
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
        <p>{item.discomfortLocation}</p>{item.notes && item.notes.trim() !== 'None — fictional demo test' && <p className="notes">{item.notes}</p>}
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
    <CurrentSchedule />
    <PatientGraphs />
    <div className="columns"><div><AssignmentEditor /><Messages sender="provider" /></div><div><Feed kind="checkins" /><Feed kind="sessions" /></div></div>
  </main>;
}
