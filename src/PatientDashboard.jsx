import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export default function PatientDashboard() {
  async function submitSession() {
    try {
      await addDoc(collection(db, "sessions"), {
        patientId: "demo-patient-01",
        exercise: "Seated Arm Raises",
        reps: 10,
        painLevel: 3,
        durationSeconds: 45,
        createdAt: new Date().toISOString(),
      });

      alert("Session submitted!");
    } catch (error) {
      console.error(error);
      alert("Failed to save session");
    }
  }

  return (
    <div>
      <h2>Patient Dashboard</h2>
      <p>Exercise: Seated Arm Raises</p>
      <p>Repetitions: 10</p>
      <button onClick={submitSession}>
        Submit Exercise Session
      </button>
    </div>
  );
}



