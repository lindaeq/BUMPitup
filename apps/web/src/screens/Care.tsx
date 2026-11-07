import { useEffect, useRef, useState } from 'react'
import { firebaseError } from '../lib/firebase'
import { useApp } from '../store'
import Icon from '../components/Icon'
import Assistant from './Assistant'

const QUICK = ['Pain is better today', 'I need to reschedule', 'Question about my plan']

export default function Care() {
  const { s, sendMessage } = useApp()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [askAi, setAskAi] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [s.msgs.length])

  const send = async (raw: string) => {
    const message = raw.trim()
    if (!message || busy) return
    setBusy(true); setError('')
    try { await sendMessage(message); setText('') }
    catch (failure) { setError(firebaseError(failure)) }
    finally { setBusy(false) }
  }

  return (
    <>
      <div className="row sp" style={{ marginTop: 6, alignItems: 'flex-start' }}>
        <div className="row">
          <div className="ico" style={{ borderRadius: '50%' }}>{askAi ? 'BB' : 'MG'}</div>
          <div>
            <b>{askAi ? 'Ask AI' : 'Your care team'}</b>
            <p className="sub">{askAi ? 'AI answers stay in this chat tab' : 'Physiotherapy · Care team'}</p>
          </div>
        </div>
        <button type="button" className="chat-switch" aria-pressed={askAi} onClick={() => setAskAi(value => !value)}>{askAi ? 'Care team' : 'Ask AI'}</button>
      </div>
      <div hidden={askAi}>
      <div>
        {s.msgs.map((m, i) => (
          <div key={i} className={`msg ${m.w}`}>{m.t}<small>{m.tm}</small></div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {QUICK.map((q) => <button key={q} type="button" className="chip" disabled={busy} onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <textarea rows={1} maxLength={2000} placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="button" className="ico" style={{ background: 'var(--rose)', color: '#fff', width: 48, height: 48 }} aria-label="Send" disabled={busy} onClick={() => send(text)}>
          <Icon n="chev" />
        </button>
      </div>
      {error && <div className="alert red" role="alert">{error}</div>}
      <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>For urgent symptoms, call your care team or emergency services. Messages are reviewed during clinic hours.</p>
      <div ref={end} />
      </div>
      <div hidden={!askAi}><Assistant /></div>
    </>
  )
}
