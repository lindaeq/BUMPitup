import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';

export default function PatientDetails() {
  const [patient, setPatient] = useState(null);
  const [message, setMessage] = useState('Loading patient…');
  useEffect(() => onSnapshot(doc(db, 'patients', PATIENT_ID), snapshot => {
    setPatient(snapshot.exists() ? snapshot.data() : null);
    setMessage(snapshot.exists() ? '' : `Create patients/${PATIENT_ID} with name and pregnancyWeek in Firestore.`);
  }, error => setMessage(firebaseError(error))), []);
  return <section className="card"><h3>Fictional patient</h3>
    {message && <p role="status">{message}</p>}
    {patient && <p className="provider-patient-name"><strong>{patient.name}</strong><span>{patient.pregnancyWeek == null ? 'Pregnancy week not set' : `Pregnancy week ${patient.pregnancyWeek}`}</span></p>}
    <small>Patient ID: {PATIENT_ID}</small>
  </section>;
}
