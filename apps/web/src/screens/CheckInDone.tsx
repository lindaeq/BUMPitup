import { useApp } from '../store'
import Icon from '../components/Icon'

export default function CheckInDone() {
  const { s, go, showToast } = useApp()

  if (s.res === 'urgent') {
    return (
      <>
        <div className="ok-ring" style={{ background: '#fde4e4', color: '#b42318', fontSize: 34, fontWeight: 700 }}>!</div>
        <h1 style={{ textAlign: 'center' }}>Please contact your care team</h1>
        <p className="sub" style={{ textAlign: 'center' }}>Based on what you reported, you should speak to a healthcare professional before exercising. Your check-in has been shared.</p>
        <div className="alert red">Call your care team now. For bleeding, fluid leaking, severe pain, or reduced baby movement, call emergency services if you cannot reach them.</div>
        <button type="button" className="btn" style={{ background: '#b42318' }} onClick={() => showToast('Calling care team (demo)')}>Call care team</button>
        <button type="button" className="btn ghost" onClick={() => go('home', null, 'home')}>Back to home</button>
      </>
    )
  }
  return (
    <>
      <div className="ok-ring"><Icon n="check" /></div>
      <h1 style={{ textAlign: 'center' }}>Check-in sent</h1>
      <p className="sub" style={{ textAlign: 'center' }}>Dr. Nair will see it on her dashboard. Your exercise plan stays as assigned by your care team.</p>
      <button type="button" className="btn" onClick={() => go('plan', null, 'plan')}>View exercise plan</button>
      <button type="button" className="btn ghost" onClick={() => go('home', null, 'home')}>Back to home</button>
    </>
  )
}
