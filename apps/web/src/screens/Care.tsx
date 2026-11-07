import { useEffect, useRef, useState } from 'react'
import { useApp } from '../store'
import Icon from '../components/Icon'

const QUICK = ['What are some gentle ways to ease back tightness?', 'Can you explain my exercise plan?', 'When should I contact my care team?']

export default function Care() {
  const { s, set } = useApp()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [s.msgs.length, sending])

  const send = async (raw: string) => {
    const message = raw.trim()
    if (!message || sending) return

    set((st) => ({ msgs: [...st.msgs, { w: 'me', t: message, tm: 'Now' }] }))
    setText('')
    setSending(true)

    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 28_000)
      let response: Response
      try {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
          signal: controller.signal,
        })
      } finally {
        window.clearTimeout(timeout)
      }

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(typeof data.error === 'string' ? data.error : 'The assistant could not reply. Please try again.')
      }
      if (typeof data.reply !== 'string' || !data.reply.trim()) {
        throw new Error('The assistant returned an empty response. Please try again.')
      }

      set((st) => ({
        msgs: [...st.msgs, { w: 'them', t: data.reply.trim(), tm: 'Now' }],
        unread: st.view === 'care' ? 0 : st.unread + 1,
      }))
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'The request took too long. Please try again.'
        : error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      set((st) => ({
        msgs: [...st.msgs, { w: 'them', t: message, tm: 'Now' }],
        unread: st.view === 'care' ? 0 : st.unread + 1,
      }))
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="row" style={{ marginTop: 6 }}>
        <div className="ico" style={{ borderRadius: '50%' }}>BB</div>
        <div>
          <b>BumpBridge Assistant</b>
          <p className="sub">Pregnancy education · AI assistant</p>
        </div>
      </div>
      <div>
        {s.msgs.map((m, i) => (
          <div key={i} className={`msg ${m.w}`}>{m.t}<small>{m.tm}</small></div>
        ))}
        {sending && <div className="msg them">Thinking…<small>Now</small></div>}
      </div>
      <div style={{ marginTop: 16 }}>
        {QUICK.map((q) => (
          <button key={q} type="button" className="chip" disabled={sending} onClick={() => void send(q)}>{q}</button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 6 }}>
        <textarea
          rows={1}
          placeholder="Ask a general pregnancy or wellness question"
          value={text}
          disabled={sending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              void send(text)
            }
          }}
        />
        <button
          type="button"
          className="ico"
          style={{ background: 'var(--rose)', color: '#fff', width: 48, height: 48, opacity: sending ? 0.6 : 1 }}
          aria-label="Send"
          disabled={sending || !text.trim()}
          onClick={() => void send(text)}
        >
          <Icon n="chev" />
        </button>
      </div>
      <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>
        This AI assistant is for general education, not medical advice, and does not message your care team. For personal medical questions, contact your clinician. For urgent symptoms, contact maternity triage or emergency services.
      </p>
      <div ref={end} />
    </>
  )
}
