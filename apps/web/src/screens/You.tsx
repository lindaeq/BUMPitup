import { useState, type FormEvent } from 'react'
import { useApp } from '../store'
import { DUE, iso } from '../data'
import { LANGUAGES, loadTranslations, saveLanguage, saveTranslations, type Translations } from '../lib/language'

const DEFAULT_PROFILE = { age: 31, weightKg: 68, dueDate: iso(DUE) }

export default function You() {
  const { s, set, showToast, saveProfile } = useApp()
  const [pending, setPending] = useState('')
  const [languageError, setLanguageError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [draft, setDraft] = useState({ name: '', age: '31', weightKg: '68', dueDate: DEFAULT_PROFILE.dueDate })
  const age = s.age ?? DEFAULT_PROFILE.age
  const weightKg = s.weightKg ?? DEFAULT_PROFILE.weightKg
  const dueDate = s.dueDate ?? DEFAULT_PROFILE.dueDate

  const editProfile = () => {
    setDraft({ name: s.patientName === 'Patient' ? '' : s.patientName, age: String(age), weightKg: String(weightKg), dueDate })
    setProfileError('')
    setEditing(true)
  }
  const submitProfile = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setProfileError('')
    try {
      await saveProfile({ name: draft.name, age: Number(draft.age), weightKg: Number(draft.weightKg), dueDate: draft.dueDate })
      setEditing(false)
      showToast('Profile saved')
    } catch (error) { setProfileError(error instanceof Error ? error.message : 'Could not save profile.') }
    finally { setSaving(false) }
  }

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
    ['Name', s.patientName],
    ['Age', `${age}`],
    ['Weight', `${weightKg} kg (${Math.round(weightKg * 2.20462)} lb)`],
    ['Due date', new Date(`${dueDate}T12:00:00`).toLocaleDateString(s.language, { year: 'numeric', month: 'long', day: 'numeric' })],
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

      <div className="row sp"><h2>Profile</h2>{!editing && <button type="button" className="chip" style={{ margin: 0 }} onClick={editProfile}>Edit</button>}</div>
      {editing ? <form className="card profile-form" onSubmit={event => { void submitProfile(event) }}>
        <label>Name<input className="field" maxLength={120} required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
        <label>Age<input className="field" type="number" min="1" max="120" required value={draft.age} onChange={event => setDraft({ ...draft, age: event.target.value })} /></label>
        <label>Weight (kg)<input className="field" type="number" min="20" max="300" step="0.1" required value={draft.weightKg} onChange={event => setDraft({ ...draft, weightKg: event.target.value })} /></label>
        <label>Due date<input className="field" type="date" required value={draft.dueDate} onChange={event => setDraft({ ...draft, dueDate: event.target.value })} /></label>
        {profileError && <div className="alert red" role="alert">{profileError}</div>}
        <button type="submit" className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
        <button type="button" className="btn ghost" disabled={saving} onClick={() => setEditing(false)}>Cancel</button>
      </form> : <div className="card" style={{ paddingTop: 2, paddingBottom: 2 }}>
        {rows.map(([label, value]) => (
          <div key={label} className="item">
            <small style={{ minWidth: 80 }}>{label}</small>
            <b style={{ marginLeft: 'auto', textAlign: 'right' }}>{value}</b>
          </div>
        ))}
      </div>}
    </>
  )
}
