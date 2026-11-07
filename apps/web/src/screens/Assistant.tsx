import { useEffect, useRef, useState } from 'react'
import Icon from '../components/Icon'
import { useApp } from '../store'
import { loadTranslations } from '../lib/language'

type ChatMessage = { who: 'me' | 'them'; text: string }
const QUICK = [
  { label: 'Back tightness', prompt: 'What are gentle ways to ease back tightness during pregnancy?' },
  { label: 'Exercise plan', prompt: 'How should I think about a pregnancy exercise plan?' },
  { label: 'When to get help', prompt: 'When should I contact my maternity care team?' },
]

export default function Assistant() {
  const { s } = useApp()
  const translations = loadTranslations(s.language)
  const t = (phrase: string) => translations?.[phrase] || phrase
  const [messages, setMessages] = useState<ChatMessage[]>([{ who: 'them', text: 'Hi! Ask me a pregnancy or wellness question.' }])
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
          body: JSON.stringify({ message, language: s.language }), signal: controller.signal,
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
    <p className="sub" style={{ marginTop: 16 }}>Ask a question here. AI replies are separate from care team messages.</p>
    <div>
      {messages.map((item, index) => <div key={index} className={`msg ${item.who}`}>{index === 0 ? t(item.text) : item.text}<small>{t('Now')}</small></div>)}
      {sending && <div className="msg them">{t('Thinking…')}<small>{t('Now')}</small></div>}
    </div>
    <div style={{ marginTop: 16 }}>
      {QUICK.map(question => <button key={question.label} type="button" className="chip" disabled={sending} onClick={() => void send(question.prompt)}>{question.label}</button>)}
    </div>
    <div className="row" style={{ marginTop: 6 }}>
      <textarea rows={1} maxLength={4000} placeholder="Ask a general pregnancy or wellness question" value={text} disabled={sending} onChange={event => setText(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(text) } }} />
      <button type="button" className="ico" style={{ background: 'var(--rose)', color: '#fff', width: 48, height: 48 }} aria-label="Send to AI assistant" disabled={sending || !text.trim()} onClick={() => void send(text)}><Icon n="chev" /></button>
    </div>
    <div ref={end} />
  </>
}
