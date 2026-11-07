import PatientDashboard from "./PatientDashboard";
import PhysioDashboard from "./PhysioDashboard";

function App() {
  const isPhysio =
    new URLSearchParams(window.location.search)
      .get("view") === "physio";

  return (
    <div style={{ padding: 30 }}>
      <h1>BumpBridge</h1>

      {isPhysio ? (
        <PhysioDashboard />
      ) : (
        <PatientDashboard />
      )}
    </div>
  );
}

export default App;

