import { useEffect, useState } from 'react'
import Icon from './Icon'

type P = Record<string, [number, number]>
type Anim = { a: P; b: P; bones: [string, string][]; scene: React.ReactNode; cues: [string, string] }

const g = { stroke: '#c9b9b2', strokeWidth: 4, strokeLinecap: 'round' as const }
const ANIMS: Record<string, Anim> = {
  sq: {
    a: { head: [150, 45], neck: [150, 68], hip: [150, 150], knee: [152, 215], foot: [150, 278], hand: [168, 128] },
    b: { head: [168, 112], neck: [158, 136], hip: [118, 206], knee: [176, 214], foot: [150, 278], hand: [200, 150] },
    bones: [['neck', 'hip'], ['hip', 'knee'], ['knee', 'foot'], ['neck', 'hand']],
    scene: <path d="M40 282H260" {...g} />,
    cues: ['Lower slowly, hips back', 'Press through your heels'],
  },
  bd: {
    a: { head: [78, 112], neck: [95, 128], hip: [205, 130], hand: [95, 205], knee: [205, 205], mHand: [95, 205], mKnee: [205, 205], mFoot: [165, 205] },
    b: { head: [60, 100], neck: [95, 128], hip: [205, 130], hand: [95, 205], knee: [205, 205], mHand: [30, 120], mKnee: [250, 128], mFoot: [292, 128] },
    bones: [['neck', 'hip'], ['neck', 'hand'], ['hip', 'knee'], ['neck', 'mHand'], ['hip', 'mKnee'], ['mKnee', 'mFoot']],
    scene: <path d="M40 210H280" {...g} />,
    cues: ['Reach arm and opposite leg out', 'Return with control'],
  },
  wp: {
    a: { head: [182, 92], neck: [190, 115], hip: [150, 195], knee: [122, 238], foot: [95, 278], elbow: [219, 116], hand: [248, 117] },
    b: { head: [212, 106], neck: [220, 128], hip: [165, 198], knee: [130, 240], foot: [95, 278], elbow: [238, 166], hand: [248, 128] },
    bones: [['neck', 'hip'], ['hip', 'knee'], ['knee', 'foot'], ['neck', 'elbow'], ['elbow', 'hand']],
    scene: (
      <g>
        <path d="M40 282H220" {...g} />
        <rect x="250" y="40" width="10" height="244" rx="3" fill="#e8dcd6" />
      </g>
    ),
    cues: ['Bend elbows, chest toward wall', 'Push back slowly'],
  },
  ar: {
    a: { head: [150, 78], neck: [150, 104], hip: [150, 190], kL: [118, 200], kR: [182, 200], fL: [114, 268], fR: [186, 268], sL: [128, 110], sR: [172, 110], eL: [118, 150], eR: [182, 150], hL: [114, 188], hR: [186, 188] },
    b: { head: [150, 78], neck: [150, 104], hip: [150, 190], kL: [118, 200], kR: [182, 200], fL: [114, 268], fR: [186, 268], sL: [128, 110], sR: [172, 110], eL: [90, 112], eR: [210, 112], hL: [52, 112], hR: [248, 112] },
    bones: [['neck', 'hip'], ['hip', 'kL'], ['kL', 'fL'], ['hip', 'kR'], ['kR', 'fR'], ['sL', 'sR'], ['sL', 'eL'], ['eL', 'hL'], ['sR', 'eR'], ['eR', 'hR']],
    scene: (
      <g>
        <rect x="104" y="196" width="92" height="10" rx="4" fill="#e8dcd6" />
        <path d="M110 206V282M190 206V282" {...g} />
      </g>
    ),
    cues: ['Raise arms to shoulder height', 'Lower with control'],
  },
}

export default function StickFigure({ id }: { id: string }) {
  const [t, setT] = useState(0)
  const [play, setPlay] = useState(true)
  useEffect(() => {
    if (!play) return
    const i = window.setInterval(() => setT((x) => x + 0.05), 50)
    return () => window.clearInterval(i)
  }, [play])

  const an = ANIMS[id]
  if (!an) return null
  const c = (t / 3.2) * 2 * Math.PI
  const u = Math.min(1, Math.max(0, 0.5 - 0.62 * Math.cos(c)))
  const pt = (k: string): [number, number] => [an.a[k][0] + (an.b[k][0] - an.a[k][0]) * u, an.a[k][1] + (an.b[k][1] - an.a[k][1]) * u]
  const head = pt('head')
  const down = Math.sin(c) > 0
  return (
    <div className="cam" style={{ background: 'var(--blush)', height: 260, color: 'var(--ink)' }}>
      <span className="tag" style={{ background: '#fff', color: 'var(--rosed)' }}>{play ? an.cues[down ? 0 : 1] : 'Paused'}</span>
      <button type="button" className="ico" aria-label={play ? 'Pause animation' : 'Play animation'} style={{ position: 'absolute', top: 8, right: 8, width: 36, height: 36, background: '#fff' }} onClick={() => setPlay(!play)}>
        <Icon n={play ? 'pause' : 'play'} />
      </button>
      <svg viewBox="0 0 300 300" width="100%" height="100%" role="img" aria-label="Stick figure showing how to do the exercise">
        {an.scene}
        <g stroke="#3b1f1a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {an.bones.map(([p, q]) => {
            const A = pt(p), B = pt(q)
            return <line key={`${p}${q}`} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} />
          })}
          <circle cx={head[0]} cy={head[1]} r="17" fill="#fff" />
        </g>
        <g fill="#c81e55">
          {Object.keys(an.a).filter((k) => k !== 'head').map((k) => <circle key={k} cx={pt(k)[0]} cy={pt(k)[1]} r="4.5" />)}
        </g>
      </svg>
    </div>
  )
}
