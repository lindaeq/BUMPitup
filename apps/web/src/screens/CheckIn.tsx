import { useApp } from '../store'
import BackBar from '../components/BackBar'

const LOCS = ['Lower back', 'Pelvis', 'Hips', 'Legs', 'Other']
const SYMS = ['Swelling in feet', 'Nausea', 'Trouble sleeping', 'Headache', 'Bleeding', 'Fluid leaking', 'Less baby movement']
const URGENT = ['Bleeding', 'Fluid leaking', 'Less baby movement']

export default function CheckIn() {
  const { s, set } = useApp()
  const c = s.ci
  const setCI = (p: Partial<typeof c>) => set((st) => ({ ci: { ...st.ci, ...p } }))

  const submit = () => {
    const urgent = c.pain >= 8 || c.sym.some((x) => URGENT.includes(x))
    set({ checked: true, res: urgent ? 'urgent' : 'ok', view: 'cidone' })
  }

  return (
    <>
      <BackBar to="home" label="Home" />
      <h1>How is your body today?</h1>
      <p className="sub">Your answers go to Dr. Grey’s dashboard.</p>

      <div className="card">
        <div className="row sp">
          <b>Pain level</b>
          <span className="pill">{c.pain <= 3 ? 'Mild' : c.pain <= 6 ? 'Moderate' : 'Severe'}</span>
        </div>
        <div className="big" style={{ marginTop: 8 }}>
          {c.pain}
          <span style={{ fontSize: 18, color: 'var(--mute)' }}> / 10</span>
        </div>
        <input type="range" min={0} max={10} value={c.pain} aria-label="Pain level" onChange={(e) => setCI({ pain: Number(e.target.value) })} />
        <div className="row sp sub"><span>None</span><span>Worst</span></div>
      </div>

      <h2>Where is the discomfort?</h2>
      {LOCS.map((l) => (
        <button key={l} type="button" className={`chip ${c.loc === l ? 'on' : ''}`} onClick={() => setCI({ loc: l })}>{l}</button>
      ))}

      <h2>Fatigue</h2>
      <div className="seg">
        {['Low', 'Moderate', 'High'].map((f) => (
          <button key={f} type="button" className={c.fat === f ? 'on' : ''} onClick={() => setCI({ fat: f })}>{f}</button>
        ))}
      </div>

      <h2>Other symptoms <span className="sub" style={{ fontWeight: 400 }}>(optional)</span></h2>
      {SYMS.map((l) => (
        <button
          key={l}
          type="button"
          className={`chip ${c.sym.includes(l) ? 'on' : ''}`}
          onClick={() => setCI({ sym: c.sym.includes(l) ? c.sym.filter((x) => x !== l) : [...c.sym, l] })}
        >
          {l}
        </button>
      ))}

      <h2>Notes</h2>
      <textarea rows={3} placeholder="Anything else your care team should know?" value={c.notes} onChange={(e) => setCI({ notes: e.target.value })} />

      <div className="alert red"><b>Seek help now</b> if you have bleeding, severe pain, fluid leaking, or notice less baby movement. Call your care team or emergency services.</div>
      <button type="button" className="btn" onClick={submit}>Send to care team</button>
    </>
  )
}
