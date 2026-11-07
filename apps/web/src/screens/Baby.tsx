import { useState } from 'react'
import Fruit from '../components/Fruit'
import BackBar from '../components/BackBar'
import { useApp } from '../store'
import { CURRENT_WEEK, FRUITS, fruitFor } from '../data'

const tri = (w: number) => (w < 14 ? 'First trimester' : w < 28 ? 'Second trimester' : 'Third trimester')

export default function Baby() {
  const { s } = useApp()
  const currentWeek = s.pregnancyWeek ?? CURRENT_WEEK
  const [week, setWeek] = useState(currentWeek)
  const f = fruitFor(week)
  const vowel = /^[aeiou]/.test(f.name) ? 'an' : 'a'
  return (
    <>
      <BackBar to="home" label="Home" tab="home" />
      <h1 style={{ marginTop: 10 }}>Baby size</h1>
      <p className="sub">Drag the slider to see how your baby grows.</p>

      <div className="card" style={{ textAlign: 'center', padding: '12px 16px 14px' }}>
        <div className="row sp"><span className="pill">Week {week}</span><span className="pill">{tri(week)}</span></div>
        <div className="fcenter"><Fruit type={f.type} size={132} /></div>
        <b style={{ fontSize: 17, fontWeight: 800 }}>About the size of {vowel} {f.name}</b>
        <p className="sub" style={{ marginTop: 2 }}>{f.cm} long · {f.g}</p>
        <input type="range" min={4} max={40} value={week} aria-label="Pregnancy week" onChange={(e) => setWeek(Number(e.target.value))} style={{ marginTop: 10 }} />
        <div className="row sp sub" style={{ fontSize: 12 }}><span>Week 4</span>{week !== currentWeek ? <button type="button" style={{ color: 'var(--rose)', fontWeight: 600 }} onClick={() => setWeek(currentWeek)}>Back to this week</button> : <span>You are here</span>}<span>Week 40</span></div>
      </div>

      <h2>What to do at this stage</h2>
      <div className="card"><span className="pill">Move</span><p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.45 }}>{f.move}</p></div>
      <div className="card"><span className="pill ok">Eat</span><p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.45 }}>{f.eat}</p></div>
      <div className="card"><span className="pill warn">Care team</span><p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.45 }}>{f.care}</p></div>

      <h2>Growth journey</h2>
      <div className="fruitrow">
        {FRUITS.map((x) => (
          <button key={x.wk} type="button" className={`fbtn ${x.name === f.name ? 'on' : ''}`} onClick={() => setWeek(x.wk)}>
            <Fruit type={x.type} size={52} face={false} />
            Wk {x.wk}
          </button>
        ))}
      </div>
      <div className="alert">Sizes are averages and every baby is different. Always check new activity or diet changes with Dr. Grey.</div>
    </>
  )
}
