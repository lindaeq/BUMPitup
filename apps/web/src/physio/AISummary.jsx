import { useState } from 'react';
import { exerciseById } from './exercises.js';
import { usePatientCollection } from './usePatientCollection.js';

export default function AISummary() {
  const { items: sessions } = usePatientCollection('sessions');
  const { items: checkins } = usePatientCollection('checkins');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="provider-summary-heading"><h3>AI Patient Insights</h3>
      <button type="button" disabled={loading || (!sessions.length && !checkins.length)} onClick={generateSummary}>{loading ? 'Analyzing…' : summary ? 'Refresh AI' : 'Generate summary'}</button>
    </div>
    {error && <p role="alert">{error}</p>}
    <p role="status">{loading ? 'Analyzing recent check-ins and exercise sessions…' : summary || 'Generate a short summary of the latest activity.'}</p>
    <small>AI-generated draft from the five most recent logs. Review against the original entries before using it.</small>
  </section>;
}
