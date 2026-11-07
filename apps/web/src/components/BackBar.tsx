import { useApp, type View } from '../store'
import Icon from './Icon'

export default function BackBar({ to, label, tab }: { to: View; label: string; tab?: 'home' | 'plan' }) {
  const { go } = useApp()
  return (
    <div className="top">
      <button type="button" className="back" onClick={() => go(to, null, tab)}>
        <Icon n="back" />
        {label}
      </button>
    </div>
  )
}
