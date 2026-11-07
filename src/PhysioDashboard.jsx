import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export default function PhysioDashboard() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "sessions"),
      where("patientId", "==", "demo-patient-01")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSessions(data);
      },
      (error) => console.error(error)
    );

    return unsubscribe;
  }, []);

  return (
    <div>
      <h2>Physiotherapist Dashboard</h2>

      <h3>Patient Exercise Sessions</h3>

      {sessions.length === 0 && <p>No sessions yet.</p>}

      {sessions.map((session) => (
        <div key={session.id}>
          <h4>{session.exercise}</h4>
          <p>Reps: {session.reps}</p>
          <p>Pain: {session.painLevel}/10</p>
          <p>Duration: {session.durationSeconds}s</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

