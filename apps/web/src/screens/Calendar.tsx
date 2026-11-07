import { useState } from 'react'
import { useApp, type State } from '../store'
import { BarChart, LineChart } from '../components/Charts'
import Icon from '../components/Icon'
import { CURRENT_WEEK, DUE, EVENTS, RECS, START, TODAY, WEEKLY_GOAL, WEEKS, addDays, dayIndex, iso, streak, weekOf, type Rec } from '../data'

const FAT = ['', 'Low', 'Moderate', 'High']
const level = (m: number) => (m === 0 ? 0 : m < 15 ? 1 : m < 25 ? 2 : 3)
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const mname = (d: Date, long = true) => d.toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: long ? 'numeric' : undefined })
const parse = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

function todayRec(s: State): Rec {
  const done = s.ex.filter((e) => e.done)
  const fatMap: Record<string, 1 | 2 | 3> = { Low: 1, Moderate: 2, High: 3 }
  return { date: iso(TODAY), idx: dayIndex(TODAY), pain: s.checked ? s.ci.pain : null, fat: s.checked ? (fatMap[s.ci.fat] ?? null) : null, mins: done.length * 9, reps: done.length * 10, rom: done.length ? 76 : 0, sess: done.map((e) => e.name) }
}

function HBar({ label, pct, right }: { label: string; pct: number; right: string }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div className="row sp" style={{ fontSize: 13 }}><span>{label}</span><span className="sub">{right}</span></div>
      <div className="bar" style={{ marginTop: 4 }}><i style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export default function Calendar() {
  const { s } = useApp()
  const [mode, setMode] = useState<'month' | 'year' | 'trends'>('month')
  const [mi, setMi] = useState(6)
  const [sel, setSel] = useState(iso(TODAY))
  const [range, setRange] = useState(12)
  const today = todayRec(s)
  const by = new Map<string, Rec>()
  RECS.forEach((r) => by.set(r.date, r))
  by.set(today.date, today)
  const todayK = iso(TODAY)

  const monthCells = (m: Date, mini: boolean) => {
    const lead = m.getDay()
    const dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate()
    const out = Array.from({ length: lead }, (_, i) => (mini ? <i key={`b${i}`} className="off" /> : <span key={`b${i}`} />))
    for (let d = 1; d <= dim; d++) {
      const date = new Date(m.getFullYear(), m.getMonth(), d)
      const k = iso(date)
      const r = by.get(k)
      const inPreg = dayIndex(date) >= 0 && date <= DUE
      const lv = r ? level(r.mins) : 0
      if (mini) out.push(<i key={k} className={`${inPreg ? `l${lv}` : 'off'}`} />)
      else
        out.push(
          <button key={k} type="button" className={`cell l${lv} ${inPreg ? '' : 'off'} ${k === todayK ? 'today' : ''} ${sel === k ? 'sel' : ''}`} onClick={() => setSel(k)} aria-label={k}>
            {d}
            {EVENTS[k] && <span className="ev" />}
            {r && r.pain != null && r.pain >= 7 && <span className="hp" />}
          </button>,
        )
    }
    return out
  }

  const seg = (
    <div className="seg" style={{ marginTop: 10 }}>
      {(['month', 'year', 'trends'] as const).map((m) => (
        <button key={m} type="button" className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>{m === 'month' ? 'Month' : m === 'year' ? 'Year' : 'Trends'}</button>
      ))}
    </div>
  )

  if (mode === 'month') {
    const m = new Date(2026, 4 + mi, 1)
    const sd = parse(sel)
    const r = by.get(sel)
    const ev = EVENTS[sel]
    const preg = dayIndex(sd) >= 0 && sd <= DUE
    return (
      <>
        <h1 style={{ marginTop: 10 }}>Calendar</h1>
      <div className="alert">The charts below use illustrative sample history. Your actual Firestore sessions appear under Recent sessions.</div>
        {seg}
        <div className="row sp" style={{ marginTop: 14 }}>
          <button type="button" className="ico" aria-label="Previous month" disabled={mi === 0} style={{ opacity: mi === 0 ? 0.35 : 1 }} onClick={() => setMi(mi - 1)}><Icon n="back" /></button>
          <b style={{ fontSize: 17 }}>{mname(m)}</b>
          <button type="button" className="ico" aria-label="Next month" disabled={mi === 9} style={{ opacity: mi === 9 ? 0.35 : 1 }} onClick={() => setMi(mi + 1)}><Icon n="chev" /></button>
        </div>
        <div className="cal">
          {DOW.map((d, i) => <div key={i} className="wd">{d}</div>)}
          {monthCells(m, false)}
        </div>
        <div className="legend">
          <span>Active minutes</span><i style={{ background: '#f6efeb' }} />0<i style={{ background: '#f9c9d8' }} />&lt;15<i style={{ background: '#ef7fa1' }} />&lt;25<i style={{ background: 'var(--rose)' }} />25+
        </div>
        <div className="legend" style={{ marginTop: 4 }}><i style={{ background: 'var(--ink)', width: 6, height: 6, borderRadius: 3 }} />Appointment<i style={{ background: '#b42318', width: 6, height: 6, borderRadius: 3, marginLeft: 8 }} />Pain 7 or higher</div>

        <div className="card">
          <div className="row sp">
            <b>{sd.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</b>
            {preg && <span className="pill">Week {weekOf(sd)}</span>}
          </div>
          {ev && <div className="alert" style={{ marginTop: 10, background: 'var(--blush)', color: 'var(--rosed)' }}><b>{ev}</b></div>}
          {r ? (
            <>
              <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                {r.pain != null ? <span className="pill">Pain {r.pain}/10</span> : <span className="pill warn">No check-in</span>}
                {r.fat && <span className="pill">Fatigue {FAT[r.fat].toLowerCase()}</span>}
              </div>
              <div className="stats">
                <div className="stat"><b>{r.mins}</b><small>Minutes</small></div>
                <div className="stat"><b>{r.reps}</b><small>Reps</small></div>
                <div className="stat"><b>{r.rom ? `${r.rom}°` : '–'}</b><small>Max range</small></div>
              </div>
              {r.sess.length > 0 ? r.sess.map((n) => <div key={n} className="item"><div className="ico"><Icon n="check" /></div><b>{n}</b></div>) : <p className="sub" style={{ marginTop: 10 }}>No exercise logged this day.</p>}
            </>
          ) : (
            <p className="sub" style={{ marginTop: 10 }}>{sd > TODAY && preg ? 'Upcoming. Your data will appear here once you check in.' : 'No data for this date.'}</p>
          )}
        </div>
      </>
    )
  }

  if (mode === 'year') {
    const f1 = Math.min(1, CURRENT_WEEK / 13), f2 = Math.max(0, Math.min(1, (CURRENT_WEEK - 13) / 14)), f3 = Math.max(0, Math.min(1, (CURRENT_WEEK - 27) / 13))
    const toGo = Math.round((DUE.getTime() - TODAY.getTime()) / 86400000)
    const events = Object.entries(EVENTS).sort()
    return (
      <>
        <h1 style={{ marginTop: 10 }}>Calendar</h1>
      <div className="alert">The charts below use illustrative sample history. Your actual Firestore sessions appear under Recent sessions.</div>
        {seg}
        <div className="card">
          <div className="row sp"><b>Week {CURRENT_WEEK} of 40</b><span className="pill">{toGo} days to go</span></div>
          <div className="bar" style={{ marginTop: 10 }}><i style={{ width: `${(CURRENT_WEEK / 40) * 100}%` }} /></div>
          <div className="tri">
            <i style={{ flex: 13 }}><u style={{ width: `${f1 * 100}%` }} /></i>
            <i style={{ flex: 14 }}><u style={{ width: `${f2 * 100}%` }} /></i>
            <i style={{ flex: 13 }}><u style={{ width: `${f3 * 100}%` }} /></i>
          </div>
          <div className="row sp sub" style={{ fontSize: 11, marginTop: 4 }}><span>Trimester 1</span><span>Trimester 2</span><span>Trimester 3</span></div>
          <p className="sub" style={{ marginTop: 10, fontSize: 12 }}>Started {mname(START, false)} {START.getDate()}, 2026 · Estimated due date {mname(DUE, false)} {DUE.getDate()}, 2027</p>
        </div>
        <div className="stats">
          <div className="stat"><b>{RECS.reduce((a, r) => a + r.mins, 0).toLocaleString()}</b><small>Active minutes</small></div>
          <div className="stat"><b>{RECS.filter((r) => r.mins > 0).length}</b><small>Active days</small></div>
          <div className="stat"><b>{avg(RECS.flatMap((r) => (r.pain == null ? [] : [r.pain]))).toFixed(1)}</b><small>Avg. pain</small></div>
        </div>
        <h2>Your pregnancy, month by month</h2>
        <p className="sub">Tap a month to open it. Darker squares mean more active minutes.</p>
        <div className="months">
          {Array.from({ length: 10 }, (_, i) => {
            const m = new Date(2026, 4 + i, 1)
            return (
              <button key={i} type="button" className="mon" onClick={() => { setMi(i); setMode('month') }}>
                <b>{mname(m, false)} {String(m.getFullYear()).slice(2)}</b>
                <div className="mini">{monthCells(m, true)}</div>
              </button>
            )
          })}
        </div>
        <h2>Appointments and milestones</h2>
        <div className="card" style={{ padding: '4px 16px' }}>
          {events.map(([k, t]) => {
            const d = parse(k)
            return (
              <button key={k} type="button" className="item" onClick={() => { setMi(d.getMonth() - 4 + (d.getFullYear() - 2026) * 12); setSel(k); setMode('month') }}>
                <div><b>{t}</b><small>{d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · Week {weekOf(d)}</small></div>
                <span className={`pill ${d <= TODAY ? 'ok' : ''}`} style={{ marginLeft: 'auto' }}>{d <= TODAY ? 'Done' : 'Upcoming'}</span>
              </button>
            )
          })}
        </div>
      </>
    )
  }

  // trends
  const ws = WEEKS.slice(-range)
  const days = [...RECS.filter((r) => r.idx >= (CURRENT_WEEK - range) * 7), today]
  const act = days.filter((r) => r.mins > 0)
  const rest = days.filter((r) => r.mins === 0 && r.pain != null)
  const painAct = avg(act.flatMap((r) => (r.pain == null ? [] : [r.pain])))
  const painRest = avg(rest.flatMap((r) => (r.pain == null ? [] : [r.pain])))
  const fat = [1, 2, 3].map((k) => days.filter((r) => r.fat === k).length)
  const fatTot = fat.reduce((a, b) => a + b, 0) || 1
  const counts: Record<string, number> = {}
  days.forEach((r) => r.sess.forEach((n) => { counts[n] = (counts[n] ?? 0) + 1 }))
  const maxC = Math.max(1, ...Object.values(counts))
  const best = ws.reduce((a, w) => (w.mins > a.mins ? w : a), ws[0])
  return (
    <>
      <h1 style={{ marginTop: 10 }}>Calendar</h1>
      <div className="alert">The charts below use illustrative sample history. Your actual Firestore sessions appear under Recent sessions.</div>
      {seg}
      <div className="row" style={{ marginTop: 14 }}>
        {[4, 12, 24].map((n) => <button key={n} type="button" className={`chip ${range === n ? 'on' : ''}`} style={{ margin: 0 }} onClick={() => setRange(n)}>{n === 24 ? 'All time' : `Last ${n} weeks`}</button>)}
      </div>
      <div className="stats">
        <div className="stat"><b>{days.reduce((a, r) => a + r.mins, 0)}</b><small>Active minutes</small></div>
        <div className="stat"><b>{act.length}</b><small>Active days</small></div>
        <div className="stat"><b>{Math.round((days.filter((r) => r.pain != null).length / days.length) * 100)}%</b><small>Check-ins</small></div>
        <div className="stat"><b>{streak()}</b><small>Day streak</small></div>
        <div className="stat"><b>{best.mins}</b><small>Best week (min)</small></div>
        <div className="stat"><b>{avg(days.flatMap((r) => (r.pain == null ? [] : [r.pain]))).toFixed(1)}</b><small>Avg. pain</small></div>
      </div>
      <div className="alert" style={{ background: 'var(--okbg)', color: '#1d5a3f' }}>
        On days you exercised, your average pain was <b>{painAct.toFixed(1)}</b>, compared with <b>{painRest.toFixed(1)}</b> on rest days. Share this pattern with Dr. Grey.
      </div>
      <div className="card"><b>Pain level by week</b><LineChart pts={ws.map((w) => ({ label: w.label, v: w.pain }))} max={10} unit="/10" /></div>
      <div className="card"><b>Active minutes per week</b><BarChart pts={ws.map((w) => ({ label: w.label, v: w.mins }))} max={160} goal={WEEKLY_GOAL} /></div>
      <div className="card"><b>Range of motion</b><p className="sub" style={{ fontSize: 12 }}>Average max angle per session</p><LineChart pts={ws.map((w) => ({ label: w.label, v: w.rom }))} min={50} max={90} unit="°" color="#2e7d5b" /></div>
      <div className="card">
        <b>Fatigue levels</b>
        {[1, 2, 3].map((k) => <HBar key={k} label={FAT[k]} pct={(fat[k - 1] / fatTot) * 100} right={`${fat[k - 1]} days`} />)}
      </div>
      <div className="card">
        <b>Exercise mix</b>
        {Object.entries(counts).map(([n, c]) => <HBar key={n} label={n} pct={(c / maxC) * 100} right={`${c} sessions`} />)}
      </div>
      <h2>Recent sessions</h2>
      <div className="card" style={{ padding: '4px 16px' }}>
        {s.hist.map((h, i) => (
          <div key={`${h.n}-${i}`} className="item">
            <div className="ico"><Icon n="check" /></div>
            <div><b>{h.n}</b><small>{h.d} · {h.r} reps · {h.rom == null ? 'range unavailable' : `${Math.round(h.rom)}° estimated range`}</small></div>
            <span className="pill" style={{ marginLeft: 'auto' }}>Pain {h.p}</span>
          </div>
        ))}
      </div>
      <p className="sub" style={{ fontSize: 12, marginTop: 10 }}>Demo data for Selina from {mname(addDays(START, 0), false)} 2026 to today.</p>
    </>
  )
}
