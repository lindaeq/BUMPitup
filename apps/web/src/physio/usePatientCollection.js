import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';

const time = value => value?.toMillis?.() ?? (typeof value === 'string' ? Date.parse(value) || 0 : 0);
export function usePatientCollection(name) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('Connecting…');
  const [error, setError] = useState('');
  useEffect(() => onSnapshot(query(collection(db, name), where('patientId', '==', PATIENT_ID)),
    { includeMetadataChanges: true }, snapshot => {
      setItems(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })).sort((a, b) => time(b.createdAt) - time(a.createdAt)));
      setStatus(snapshot.metadata.fromCache ? 'Showing cached data; waiting for Firestore.' : 'Live · connected to Firestore');
      setError('');
    }, failure => { setError(firebaseError(failure)); setStatus('Disconnected'); }), [name]);
  return { items, status, error };
}
export function displayTime(value) {
  const ms = time(value);
  return ms ? new Date(ms).toLocaleString() : 'Timestamp pending';
}
export function latestAssignments(items) {
  const seen = new Set();
  return items.filter(item => {
    if (seen.has(item.exerciseId)) return false;
    seen.add(item.exerciseId);
    return true;
  });
}
