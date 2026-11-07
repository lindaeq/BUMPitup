import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store'
import Icon from '../components/Icon'

const QUICK = ['Pain is better today', 'I need to reschedule', 'Question about my plan']

export default function Care() {
  const { s, set } = useApp()
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [s.msgs.length])

  const send = (raw: string) => {
    const t = raw.trim()
    if (!t) return
    set((st) => ({ msgs: [...st.msgs, { w: 'me', t, tm: 'Now' }] }))
    setText('')
    window.setTimeout(() => {
      set((st) => ({
        msgs: [...st.msgs, { w: 'them', t: 'Thanks Selina, your message has been received. I’ll reply during clinic hours.', tm: 'Now' }],
        unread: st.view === 'care' ? 0 : st.unread + 1,
      }))
    }, 1400)
  }

  return (
    <>
      <div className="row" style={{ marginTop: 6 }}>
        <div className="ico" style={{ borderRadius: '50%' }}>MG</div>
        <div>
          <b>Dr. Meredith Grey</b>
          <p className="sub">Obstetrics · Care team</p>
        </div>
      </div>
      <div>
        {s.msgs.map((m, i) => (
          <div key={i} className={`msg ${m.w}`}>{m.t}<small>{m.tm}</small></div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {QUICK.map((q) => <button key={q} type="button" className="chip" onClick={() => send(q)}>{q}</button>)}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <textarea rows={1} placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} />
        <button type="button" className="ico" style={{ background: 'var(--rose)', color: '#fff', width: 48, height: 48 }} aria-label="Send" onClick={() => send(text)}>
          <Icon n="chev" />
        </button>
      </div>
      <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>For urgent symptoms, call your care team or emergency services. Messages are reviewed during clinic hours.</p>
      <div ref={end} />
    </>
  )
}
