import { useState } from 'react'

export type Pt = { label: string; v: number | null }
const W = 330, H = 150, L = 30, R = 8, T = 12, B = 24

function Frame({ ticks, y, labels, x, n }: { ticks: number[]; y: (v: number) => number; labels: string[]; x: (i: number) => number; n: number }) {
  const step = Math.max(1, Math.ceil(n / 6))
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="#eadfda" />
          <text x={L - 6} y={y(t) + 4} fontSize="10" fill="#7d6a64" textAnchor="end">{t}</text>
        </g>
      ))}
      {labels.map((l, i) => (i % step === 0 || i === n - 1 ? <text key={l} x={x(i)} y={H - 6} fontSize="10" fill="#7d6a64" textAnchor="middle">{l}</text> : null))}
    </>
  )
}

export function LineChart({ pts, min = 0, max, color = '#c81e55', unit = '' }: { pts: Pt[]; min?: number; max: number; color?: string; unit?: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const n = pts.length
  const x = (i: number) => L + (n < 2 ? 0 : (i * (W - L - R)) / (n - 1))
  const y = (v: number) => T + (1 - (v - min) / (max - min)) * (H - T - B)
  const line = pts.flatMap((p, i) => (p.v == null ? [] : [`${x(i).toFixed(1)},${y(p.v).toFixed(1)}`])).join(' ')
  const s = sel != null ? pts[sel] : pts[n - 1]
  return (
    <div>
      <div className="sub" style={{ fontSize: 12, marginBottom: 2 }}>{s?.v != null ? `${s.label}: ${s.v.toFixed(1)}${unit}` : 'Tap a point'}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Line chart">
        <Frame ticks={[min, (min + max) / 2, max]} y={y} labels={pts.map((p) => p.label)} x={x} n={n} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" points={line} />
        {pts.map((p, i) => (p.v == null ? null : <circle key={p.label} cx={x(i)} cy={y(p.v)} r={sel === i ? 5 : 3} fill={color} />))}
        {pts.map((p, i) => <rect key={`h${p.label}`} x={x(i) - 8} y={T} width="16" height={H - T - B} fill="transparent" onClick={() => setSel(i)} />)}
      </svg>
    </div>
  )
}

export function BarChart({ pts, max, goal, color = '#c81e55' }: { pts: Pt[]; max: number; goal?: number; color?: string }) {
  const [sel, setSel] = useState<number | null>(null)
  const n = pts.length
  const bw = Math.min(22, ((W - L - R) / n) * 0.7)
  const x = (i: number) => L + ((i + 0.5) * (W - L - R)) / n
  const y = (v: number) => T + (1 - v / max) * (H - T - B)
  const s = sel != null ? pts[sel] : pts[n - 1]
  return (
    <div>
      <div className="sub" style={{ fontSize: 12, marginBottom: 2 }}>{s?.v != null ? `${s.label}: ${Math.round(s.v)} min` : 'Tap a bar'}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Bar chart">
        <Frame ticks={[0, max / 2, max]} y={y} labels={pts.map((p) => p.label)} x={x} n={n} />
        {pts.map((p, i) => (p.v == null ? null : <rect key={p.label} x={x(i) - bw / 2} y={y(p.v)} width={bw} height={H - B - y(p.v)} rx="3" fill={color} opacity={sel == null || sel === i ? 1 : 0.4} onClick={() => setSel(i)} />))}
        {goal != null && (
          <g>
            <line x1={L} x2={W - R} y1={y(goal)} y2={y(goal)} stroke="#2e7d5b" strokeDasharray="5 4" strokeWidth="1.5" />
            <text x={W - R} y={y(goal) - 4} fontSize="10" fill="#2e7d5b" textAnchor="end">Goal {goal}</text>
          </g>
        )}
      </svg>
    </div>
  )
}
