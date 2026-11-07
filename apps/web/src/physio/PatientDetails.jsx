import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, PATIENT_ID, firebaseError } from './firebase.js';

export default function PatientDetails() {
  const [patient, setPatient] = useState(null);
  const [message, setMessage] = useState('Loading patient…');
  useEffect(() => onSnapshot(doc(db, 'patients', PATIENT_ID), snapshot => {
    setPatient(snapshot.exists() ? snapshot.data() : null);
    setMessage(snapshot.exists() ? '' : 'Patient unavailable.');
  }, error => setMessage(firebaseError(error))), []);
  return <section className="card"><h3>Patient</h3>
    {message && <p role="status">{message}</p>}
    {patient && <p className="provider-patient-name"><strong>{patient.name}</strong><span>{patient.pregnancyWeek == null ? 'Pregnancy week not set' : `Pregnancy week ${patient.pregnancyWeek}`}</span></p>}
  </section>;
}
