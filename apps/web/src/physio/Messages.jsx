import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, firebaseError, PATIENT_ID } from './firebase.js';
import { displayTime, usePatientCollection } from './usePatientCollection.js';

export default function Messages({ sender }) {
  const { items, status, error } = usePatientCollection('messages');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  async function send(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get('text') || '').trim();
    if (!text || busy) return;
    setBusy(true);
    setFeedback('Sending…');
    try {
      await addDoc(collection(db, 'messages'), { patientId: PATIENT_ID, sender, text, createdAt: serverTimestamp() });
      form.reset();
      setFeedback('Message sent.');
    } catch (failure) { setFeedback(firebaseError(failure)); }
    finally { setBusy(false); }
  }
  return <section className="card"><h3>Messages & feedback</h3>
    <p role="status">{status}</p>{error && <p role="alert">{error}</p>}
    <form onSubmit={send}><fieldset disabled={busy}><label>{sender === 'provider' ? 'Feedback or plan guidance' : 'Question or adjustment request'}
      <textarea name="text" rows={3} maxLength={2000} required /></label>
      <button type="submit">Send message</button></fieldset><p role="status" aria-live="polite">{feedback}</p></form>
    {!items.length && !error && <p>No messages yet.</p>}
    {items.map(item => <article key={item.id}><strong>{item.sender === 'provider' ? 'Physiotherapist' : 'Patient'}</strong> · <small>{displayTime(item.createdAt)}</small><p className="notes">{item.text}</p></article>)}
  </section>;
}
