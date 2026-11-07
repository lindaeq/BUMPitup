import { useEffect, useRef, type ReactNode } from 'react'
import { useApp, type Tab } from '../store'
import Icon, { type IconName } from './Icon'
import { translateUi } from '../lib/translateUi'

const TABS: { k: Tab; label: string; icon: IconName }[] = [
  { k: 'home', label: 'Home', icon: 'home' },
  { k: 'plan', label: 'Exercise', icon: 'ex' },
  { k: 'calendar', label: 'Calendar', icon: 'calendar' },
  { k: 'care', label: 'Care team', icon: 'chat' },
  { k: 'you', label: 'You', icon: 'user' },
]

export default function PhoneFrame({ children }: { children: ReactNode }) {
  const { s, go } = useApp()
  const scroller = useRef<HTMLDivElement>(null)
  const phone = useRef<HTMLDivElement>(null)
  const showTabs = ['home', 'plan', 'calendar', 'baby', 'care', 'you'].includes(s.view)

  useEffect(() => {
    scroller.current?.scrollTo(0, 0)
  }, [s.view, s.arg])

  useEffect(() => phone.current ? translateUi(phone.current, s.language) : undefined, [s.language])

  return (
    <div ref={phone} className="phone" role="application" aria-label="BumpBridge patient app">
      <div className="sb">
        <span>9:41</span>
        <span className="bat" />
      </div>
      <div id="scr" ref={scroller}>
        {children}
      </div>
      {showTabs && (
        <nav className="tabs" aria-label="Main">
          {TABS.map((t) => (
            <button key={t.k} type="button" className={`tab ${s.tab === t.k ? 'on' : ''}`} onClick={() => go(t.k, null, t.k)}>
              <Icon n={t.icon} />
              {t.label}
              {t.k === 'care' && s.unread > 0 && <span className="badge">{s.unread}</span>}
            </button>
          ))}
        </nav>
      )}
      {s.toast && <div className="toast">{s.toast}</div>}
    </div>
  )
}
