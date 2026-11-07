import type { FruitType } from '../data'

const SCALE: Record<FruitType, number> = { seed: 1, berry: 0.6, lime: 0.65, avocado: 0.8, banana: 0.95, cantaloupe: 0.88, eggplant: 0.95, coconut: 0.95, honeydew: 1, pumpkin: 1 }
const FACE: Record<FruitType, string> = { seed: '#3b1f1a', berry: '#fff', lime: '#3b1f1a', avocado: '#3b1f1a', banana: '#3b1f1a', cantaloupe: '#3b1f1a', eggplant: '#fff', coconut: '#fff', honeydew: '#3b1f1a', pumpkin: '#3b1f1a' }
const leaf = <path d="M0 -60 q-8 -22 -32 -20 q8 16 32 20z" fill="#2f9e44" />

function Body({ type }: { type: FruitType }) {
  switch (type) {
    case 'seed':
      return <circle r="6" fill="#3b1f1a" />
    case 'berry':
      return (
        <g>
          <circle r="60" fill="#d6336c" />
          {[[-28, -26], [0, -32], [28, -26], [-38, 2], [38, 2], [-20, 30], [20, 30], [0, 8]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="#f06595" opacity=".7" />)}
          {leaf}
        </g>
      )
    case 'lime':
      return (
        <g>
          <circle r="60" fill="#8ac926" />
          <circle r="48" fill="#b5e655" opacity=".6" />
          {leaf}
        </g>
      )
    case 'avocado':
      return (
        <g>
          <path d="M0 -75C30 -75 35 -35 55 -10C80 25 60 70 0 70C-60 70 -80 25 -55 -10C-35 -35 -30 -75 0 -75Z" fill="#3f6b2c" />
          <path transform="scale(.84)" d="M0 -75C30 -75 35 -35 55 -10C80 25 60 70 0 70C-60 70 -80 25 -55 -10C-35 -35 -30 -75 0 -75Z" fill="#c4dc72" />
          <circle cy="30" r="22" fill="#7b4a2a" />
        </g>
      )
    case 'banana':
      return (
        <g fill="none" strokeLinecap="round">
          <path d="M-62 -30Q-10 64 70 -22" stroke="#f6c90e" strokeWidth="40" />
          <path d="M-62 -30Q-10 64 70 -22" stroke="#ffe066" strokeWidth="10" opacity=".6" transform="translate(0 -10)" />
          <circle cx="-64" cy="-32" r="5" fill="#7b4a2a" />
          <circle cx="72" cy="-24" r="5" fill="#7b4a2a" />
        </g>
      )
    case 'cantaloupe':
      return (
        <g>
          <circle r="64" fill="#e7b97a" />
          <g fill="none" stroke="#b9833f" strokeWidth="3" opacity=".55">
            <path d="M0 -64Q-34 0 0 64M0 -64Q34 0 0 64M-64 0Q0 -24 64 0M-58 -28Q0 -8 58 -28M-58 28Q0 8 58 28" />
          </g>
        </g>
      )
    case 'eggplant':
      return (
        <g>
          <path d="M-40 -50C-62 -10 -50 55 0 72C45 60 62 0 30 -45C10 -60 -20 -60 -40 -50Z" fill="#6f3b8c" />
          <ellipse cx="-28" cy="-5" rx="8" ry="28" fill="#fff" opacity=".18" />
          <path d="M-40 -48L-22 -72L-8 -54L8 -74L26 -48Q-6 -38 -40 -48Z" fill="#2f9e44" />
        </g>
      )
    case 'coconut':
      return (
        <g>
          <circle r="62" fill="#7b4f2c" />
          <g fill="#4b2e17"><circle cx="-18" cy="-44" r="4" /><circle cx="0" cy="-48" r="4" /><circle cx="18" cy="-44" r="4" /></g>
        </g>
      )
    case 'honeydew':
      return (
        <g>
          <circle r="66" fill="#cfe8a6" />
          <path d="M0 -66Q-30 0 0 66M0 -66Q30 0 0 66M-66 0Q0 -20 66 0" fill="none" stroke="#a5c96d" strokeWidth="3" />
        </g>
      )
    case 'pumpkin':
      return (
        <g>
          <ellipse rx="72" ry="58" fill="#f08a24" />
          <path d="M-30 -54Q-48 0 -30 54M30 -54Q48 0 30 54M0 -58V58" fill="none" stroke="#d46a0c" strokeWidth="4" />
          <rect x="-5" y="-76" width="10" height="22" rx="4" fill="#5b7a2a" />
        </g>
      )
  }
}

export default function Fruit({ type, size = 200, face = true }: { type: FruitType; size?: number; face?: boolean }) {
  const c = FACE[type]
  const fy = type === 'banana' ? 8 : type === 'avocado' ? -22 : 0
  return (
    <svg viewBox="-110 -110 220 220" width={size} height={size} role="img" aria-label={`A cartoon ${type}`}>
      <g transform={`scale(${SCALE[type]})`}>
        <Body type={type} />
        {face && type !== 'seed' && (
          <g transform={`translate(0 ${fy})`} stroke={c} strokeWidth="4" strokeLinecap="round" fill="none">
            <circle cx="-16" cy="-4" r="2" fill={c} />
            <circle cx="16" cy="-4" r="2" fill={c} />
            <path d="M-10 10q10 9 20 0" />
          </g>
        )}
      </g>
    </svg>
  )
}
