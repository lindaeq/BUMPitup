import { useApp } from '../store'
import { DUE } from '../data'
import { LANGUAGES, saveLanguage } from '../lib/language'

// Static demo profile until profile fields are stored in Firestore.
// The due date reuses the app's demo due date so it matches the pregnancy week on Home.
const PROFILE = { name: 'Maya Patel', age: 31, weightKg: 68, dueDate: DUE }

export default function You() {
  const { s, set, showToast } = useApp()
  const name = s.patientName !== 'Patient' ? s.patientName : PROFILE.name

  const changeLanguage = (code: string) => {
    set({ language: code })
    saveLanguage(code)
    showToast(`Language set to ${LANGUAGES.find(l => l.code === code)?.label ?? code}`)
  }

  const rows: [string, string][] = [
    ['Name', name],
    ['Age', `${PROFILE.age}`],
    ['Weight', `${PROFILE.weightKg} kg (${Math.round(PROFILE.weightKg * 2.20462)} lb)`],
    ['Due date', PROFILE.dueDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })],
  ]

  return (
    <>
      <h1 style={{ marginTop: 12 }}>You</h1>
      <p className="sub">Your preferences and profile.</p>

      <h2>Language</h2>
      <div className="card">
        <label htmlFor="language" style={{ fontSize: 14, fontWeight: 600 }}>Preferred language</label>
        <select id="language" className="field" value={s.language} onChange={event => changeLanguage(event.target.value)}>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <p className="sub" style={{ fontSize: 12, marginTop: 8 }}>Your choice is saved. Translated screens are coming soon.</p>
      </div>

      <h2>Profile</h2>
      <div className="card" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {rows.map(([label, value]) => (
          <div key={label} className="item">
            <small style={{ minWidth: 80 }}>{label}</small>
            <b style={{ marginLeft: 'auto', textAlign: 'right' }}>{value}</b>
          </div>
        ))}
      </div>
      <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>Sample details for the demo. Editing is not available yet.</p>
    </>
  )
}
