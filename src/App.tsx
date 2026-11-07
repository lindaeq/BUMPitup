import { useState } from "react";
import { ExerciseTracker, exerciseConfigs, exerciseIds, type CVResult, type ExerciseId, type Side } from "./tracking/vision";

/**
 * Demo harness standing in for the patient app. It only shows how the
 * component is wired up; session management, Firebase and symptom reporting
 * live in the real patient app.
 */
export function App() {
  const [exerciseId, setExerciseId] = useState<ExerciseId>("seated-arm-raise");
  const [side, setSide] = useState<Side>("left");
  const [active, setActive] = useState(false);
  const [sessionNumber, setSessionNumber] = useState(0);
  const [result, setResult] = useState<CVResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>BumpBridge CV tracker demo</h1>
      <p style={{ color: "#555", marginTop: 0 }}>
        Video is processed locally and never recorded or uploaded. Angles are 2D camera estimates, not clinical
        measurements, and do not indicate whether an exercise is safe or appropriate.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <label>
          Exercise{" "}
          <select value={exerciseId} onChange={(e) => setExerciseId(e.target.value as ExerciseId)}>
            {exerciseIds.map((id) => (
              <option key={id} value={id}>
                {exerciseConfigs[id].label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tracked arm/leg{" "}
          <select value={side} onChange={(e) => setSide(e.target.value as Side)}>
            <option value="left">Your left (left side toward camera)</option>
            <option value="right">Your right (right side toward camera)</option>
          </select>
        </label>
        <button onClick={() => setActive((a) => !a)}>{active ? "Stop camera" : "Start camera"}</button>
        <button onClick={() => setSessionNumber((n) => n + 1)}>New session (reset)</button>
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 480px" }}>
          <ExerciseTracker
            exerciseId={exerciseId}
            active={active}
            side={side}
            resetKey={sessionNumber}
            onUpdate={setResult}
            onError={(e) => setError(e.message)}
          />
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
          <p style={{ color: "#555" }}>{exerciseConfigs[exerciseId].cameraHint}</p>
        </div>

        <section style={{ flex: "1 1 320px" }}>
          <h2 style={{ marginTop: 0, fontSize: 18 }}>onUpdate payload (session {sessionNumber})</h2>
          <pre style={{ background: "#f4f4f5", padding: 12, borderRadius: 6, overflow: "auto", fontSize: 13 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      </div>
    </main>
  );
}
