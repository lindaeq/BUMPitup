import PatientDashboard from './PatientDashboard.jsx';
import PhysioDashboard from './PhysioDashboard.jsx';
import { configError } from './firebase.js';

export default function App() {
  const isPhysio = new URLSearchParams(window.location.search).get('view') === 'physio';
  return <main>
    <header><h1>BumpBridge</h1><p>Pregnancy check-ins & exercise tracking</p></header>
    <nav aria-label="Dashboards"><a href="?view=patient" aria-current={!isPhysio ? 'page' : undefined}>Patient</a><a href="?view=physio" aria-current={isPhysio ? 'page' : undefined}>Physiotherapist</a></nav>
    <p className="notice">Hackathon demo · fictional data only · no authentication or private access</p>
    {configError ? <p role="alert">{configError}</p> : isPhysio ? <PhysioDashboard /> : <PatientDashboard />}
  </main>;
}
