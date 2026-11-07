import { useState } from 'react';
import { exerciseById } from './exercises.js';
import { usePatientCollection } from './usePatientCollection.js';

function summaryPoints(summary) {
  const lines = summary.split(/\n+/).map(line => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').replace(/\*\*/g, '').trim()).filter(Boolean);
  return (lines.length > 1 ? lines : summary.split(/(?<=[.!?])\s+(?=[A-Z])/)).slice(0, 3);
}

export default function AISummary() {
  const { items: sessions } = usePatientCollection('sessions');
  const { items: checkins } = usePatientCollection('checkins');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const points = summary ? summaryPoints(summary) : [];

  async function generateSummary() {
    if (loading || (!sessions.length && !checkins.length)) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/summary', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessions: sessions.slice(0, 5).map(item => ({
            exercise: exerciseById(item.exerciseId)?.name ?? item.exercise ?? item.exerciseId ?? 'Exercise',
            reps: item.repsCompleted ?? item.reps ?? null,
            durationSeconds: item.durationSeconds ?? null,
            painLevel: item.painLevel ?? null,
            difficulty: item.difficulty ?? '',
            movementRangeDegrees: item.movementRangeDegrees ?? null,
          })),
          checkins: checkins.slice(0, 5).map(item => ({
            painLevel: item.painLevel ?? null, fatigue: item.fatigue ?? null,
            discomfortLocation: item.discomfortLocation ?? '',
          })),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'The summary could not be generated.');
      if (typeof data.summary !== 'string' || !data.summary.trim()) throw new Error('The AI returned an empty summary.');
      setSummary(data.summary.trim());
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The summary could not be generated.'); }
    finally { setLoading(false); }
  }

  return <section className="card provider-ai-summary">
    <div className="provider-summary-heading"><h3>AI summary</h3>
      <button type="button" disabled={loading || (!sessions.length && !checkins.length)} onClick={generateSummary}>{loading ? 'Summarizing…' : summary ? 'Refresh' : 'Summarize'}</button>
    </div>
    {error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Summarizing…</p> : points.length ? <div role="status"><ul className="provider-summary-points">{points.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}</ul></div> : <p className="provider-summary-empty">Three quick points from recent check-ins and sessions.</p>}
    {summary && <small>Review the original logs before acting.</small>}
  </section>;
}
