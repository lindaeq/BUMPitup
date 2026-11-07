import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'

type ChatMessage = { who: 'me' | 'them'; text: string }
const QUICK = ['What are some gentle ways to ease back tightness?', 'Can you explain my exercise plan?', 'When should I contact my care team?']

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ who: 'them', text: 'Hi! I’m the BumpBridge AI assistant. I can answer general pregnancy and wellness questions. This chat does not send messages to your care team.' }])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }) }, [messages.length, sending])

  const send = async (raw: string) => {
    const message = raw.trim()
    if (!message || sending) return
    setMessages(previous => [...previous, { who: 'me', text: message }])
    setText('')
    setSending(true)
    try {
      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 28000)
      let response: Response
      try {
        response = await fetch('/api/chat', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }), signal: controller.signal,
        })
      } finally { window.clearTimeout(timeout) }
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data.error === 'string' ? data.error : 'The assistant could not reply.')
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The assistant returned an empty response.')
      setMessages(previous => [...previous, { who: 'them', text: data.reply.trim() }])
    } catch (error) {
      const message = error instanceof Error && error.name === 'AbortError' ? 'The request took too long. Please try again.' : error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      setMessages(previous => [...previous, { who: 'them', text: message }])
    } finally { setSending(false) }
  }

  return <>
    <div className="row" style={{ marginTop: 6 }}>
      <div className="ico" style={{ borderRadius: '50%' }}>BB</div>
      <div><b>BumpBridge Assistant</b><p className="sub">Pregnancy education · AI assistant</p></div>
    </div>
    <div>
      {messages.map((item, index) => <div key={index} className={`msg ${item.who}`}>{item.text}<small>Now</small></div>)}
      {sending && <div className="msg them">Thinking…<small>Now</small></div>}
    </div>
    <div style={{ marginTop: 16 }}>
      {QUICK.map(question => <button key={question} type="button" className="chip" disabled={sending} onClick={() => void send(question)}>{question}</button>)}
    </div>
    <div className="row" style={{ marginTop: 6 }}>
      <textarea rows={1} maxLength={4000} placeholder="Ask a general pregnancy or wellness question" value={text} disabled={sending} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(text) } }} />
      <button type="button" className="ico" style={{ background: 'var(--rose)', color: '#fff', width: 48, height: 48 }} aria-label="Send to AI assistant" disabled={sending || !text.trim()} onClick={() => void send(text)}><Icon n="chev" /></button>
    </div>
    <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>This AI assistant offers general education, not medical advice. It does not message your care team. For personal medical questions, contact your clinician. For urgent symptoms, contact maternity triage or emergency services.</p>
    <div ref={end} />
  </>
}
