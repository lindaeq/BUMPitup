import { useState } from 'react'
import { useApp } from '../store'
import { DUE } from '../data'
import { LANGUAGES, loadTranslations, saveLanguage, saveTranslations, type Translations } from '../lib/language'

// Static demo profile until profile fields are stored in Firestore.
// The due date reuses the app's demo due date so it matches the pregnancy week on Home.
const PROFILE = { name: 'Maya Patel', age: 31, weightKg: 68, dueDate: DUE }

export default function You() {
  const { s, set, showToast } = useApp()
  const [pending, setPending] = useState('')
  const [languageError, setLanguageError] = useState('')
  const name = s.patientName !== 'Patient' ? s.patientName : PROFILE.name

  const changeLanguage = async (code: string) => {
    if (code === s.language || pending) return
    setLanguageError('')
    setPending(code)
    try {
      if (code !== 'en' && !loadTranslations(code)) {
        const response = await fetch('/api/translate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ language: code }),
        })
        const data: { translations?: Translations; error?: string } = await response.json().catch(() => ({}))
        if (!response.ok || !data.translations) throw new Error(data.error || 'Could not translate the app.')
        saveTranslations(code, data.translations)
      }
      set({ language: code })
      saveLanguage(code)
      showToast('Language updated')
    } catch (error) {
      setLanguageError(error instanceof Error ? error.message : 'Could not translate the app.')
    } finally { setPending('') }
  }

  const rows: [string, string][] = [
    ['Name', name],
    ['Age', `${PROFILE.age}`],
    ['Weight', `${PROFILE.weightKg} kg (${Math.round(PROFILE.weightKg * 2.20462)} lb)`],
    ['Due date', PROFILE.dueDate.toLocaleDateString(s.language, { year: 'numeric', month: 'long', day: 'numeric' })],
  ]

  return (
    <>
      <h1 style={{ marginTop: 12 }}>You</h1>
      <p className="sub">Your preferences and profile.</p>

      <h2>Language</h2>
      <div className="card">
        <label htmlFor="language" style={{ fontSize: 14, fontWeight: 600 }}>Preferred language</label>
        <select id="language" className="field" value={pending || s.language} disabled={Boolean(pending)} onChange={event => { void changeLanguage(event.target.value) }}>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        {pending && <p className="sub" style={{ fontSize: 12, marginTop: 8 }}>Translating…</p>}
        {languageError && <p className="alert red" role="alert">{languageError}</p>}
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
