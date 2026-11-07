// Demo data for Selina. Pregnancy day 0 = May 23, 2026, so "today" (Nov 7) is exactly week 24.
const DAY_MS = 86400000
const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

export const START = new Date(2026, 4, 23)
export const TODAY = new Date(2026, 10, 7)
export const DUE = new Date(2027, 1, 27)
export const WEEKLY_GOAL = 100

export const dayIndex = (d: Date) => Math.round((utc(d) - utc(START)) / DAY_MS)
export const weekOf = (d: Date) => Math.floor(dayIndex(d) / 7)
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const TODAY_IDX = dayIndex(TODAY)
export const CURRENT_WEEK = weekOf(TODAY)

export type Rec = { date: string; idx: number; pain: number | null; fat: 1 | 2 | 3 | null; mins: number; reps: number; rom: number; sess: string[] }

function mulberry32(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const NAMES = ['Seated arm raises', 'Bodyweight squats', 'Bird dog', 'Wall push-ups']

export const RECS: Rec[] = (() => {
  const r = mulberry32(11)
  const out: Rec[] = []
  for (let i = 0; i < TODAY_IDX; i++) {
    const w = i / 7
    const checked = r() < (w < 2 ? 0.7 : 0.9)
    const trains = i >= 63 && r() < Math.min(0.85, 0.35 + (w - 9) * 0.03)
    const mins = trains ? 10 + Math.round(r() * 20) + (w > 16 ? 5 : 0) : 0
    const base = w < 12 ? 2.8 : w < 20 ? 3.2 : 4.2
    const pain = checked ? Math.max(1, Math.min(8, Math.round(base + r() * 3 - 1.5 - (mins ? 0.4 : 0)))) : null
    const f = r()
    const fat = checked ? ((w < 13 ? (f < 0.3 ? 3 : f < 0.8 ? 2 : 1) : w < 22 ? (f < 0.1 ? 3 : f < 0.45 ? 2 : 1) : f < 0.2 ? 3 : f < 0.6 ? 2 : 1) as 1 | 2 | 3) : null
    const nS = mins ? 1 + Math.floor(r() * 3) : 0
    const sess = Array.from({ length: nS }, (_, k) => NAMES[(i + k) % 4])
    out.push({ date: iso(addDays(START, i)), idx: i, pain, fat, mins, reps: Math.round(mins * 1.1), rom: mins ? Math.min(84, Math.round(55 + (w - 9) * 1.6 + r() * 4)) : 0, sess })
  }
  return out
})()

export const EVENTS: Record<string, string> = {
  '2026-07-18': 'First prenatal visit',
  '2026-08-15': 'First-trimester screening',
  '2026-09-05': 'Prenatal visit',
  '2026-10-03': 'Anatomy ultrasound',
  '2026-11-02': 'Exercise plan assigned by Dr. Grey',
  '2026-11-20': 'Glucose screening',
  '2026-12-05': 'Third trimester begins',
  '2027-01-02': 'Prenatal visit (week 32)',
  '2027-02-27': 'Estimated due date',
}

export type WeekStat = { w: number; label: string; pain: number | null; mins: number; rom: number | null; checkins: number; days: number }
export const WEEKS: WeekStat[] = Array.from({ length: CURRENT_WEEK }, (_, w) => {
  const rs = RECS.filter((x) => Math.floor(x.idx / 7) === w)
  const ps = rs.filter((x) => x.pain != null)
  const roms = rs.filter((x) => x.rom > 0)
  return {
    w,
    label: `W${w + 1}`,
    pain: ps.length ? ps.reduce((a, x) => a + (x.pain ?? 0), 0) / ps.length : null,
    mins: rs.reduce((a, x) => a + x.mins, 0),
    rom: roms.length ? roms.reduce((a, x) => a + x.rom, 0) / roms.length : null,
    checkins: ps.length,
    days: rs.filter((x) => x.mins > 0).length,
  }
})

export const streak = () => {
  let n = 0
  for (let i = RECS.length - 1; i >= 0 && RECS[i].mins > 0; i--) n++
  return n
}

export type Tip = { kind: 'tip' | 'myth'; title: string; body: string }
export const TIPS: Tip[] = [
  { kind: 'tip', title: 'Walk 30 minutes most days', body: 'Regular walking can lower the risk of gestational diabetes and helps you sleep. Ask Dr. Grey what suits you.' },
  { kind: 'myth', title: 'Myth: you can’t run while pregnant', body: 'If Dr. Grey agrees, many people keep running at a comfortable pace. Use the talk test.' },
  { kind: 'myth', title: 'Myth: exercise can harm your baby', body: 'For most healthy pregnancies, moderate exercise is safe. Avoid contact sports and fall risks.' },
  { kind: 'myth', title: 'Myth: you’re eating for two', body: 'You need only about 300 to 450 extra calories a day in the later trimesters.' },
  { kind: 'tip', title: 'Drink water through the day', body: 'Aim for 8 to 12 cups of fluids daily to help with cramps and fatigue.' },
  { kind: 'myth', title: 'Myth: rest is best for back pain', body: 'Gentle movement often eases back pain better than bed rest.' },
  { kind: 'myth', title: 'Myth: never raise your arms overhead', body: 'Reaching overhead does not wrap the cord around your baby’s neck.' },
  { kind: 'tip', title: 'Sleep on your side', body: 'A pillow between your knees can ease hip and lower-back pressure.' },
  { kind: 'tip', title: 'Move every hour', body: 'A couple of minutes of walking each hour supports circulation and reduces swelling.' },
]

export type FruitType = 'seed' | 'berry' | 'lime' | 'avocado' | 'banana' | 'cantaloupe' | 'eggplant' | 'coconut' | 'honeydew' | 'pumpkin'
export type FruitInfo = { wk: number; name: string; type: FruitType; cm: string; g: string; move: string; eat: string; care: string }
export const FRUITS: FruitInfo[] = [
  { wk: 4, name: 'poppy seed', type: 'seed', cm: '0.1 cm', g: 'under 1 g', move: 'Short walks are a gentle way to start building a habit.', eat: 'Start folic acid if you haven’t, and add leafy greens.', care: 'Book your first prenatal visit with Dr. Grey.' },
  { wk: 8, name: 'raspberry', type: 'berry', cm: '1.6 cm', g: '1 g', move: 'If you feel tired, short 10-minute walks still count.', eat: 'Small, frequent snacks can ease nausea. Try ginger or crackers.', care: 'Ask what activity is right for you before starting a plan.' },
  { wk: 12, name: 'lime', type: 'lime', cm: '5.4 cm', g: '14 g', move: 'Try gentle stretching and seated arm raises.', eat: 'Add protein at each meal, such as eggs, beans or yogurt.', care: 'First-trimester screening is usually offered around now.' },
  { wk: 16, name: 'avocado', type: 'avocado', cm: '11.6 cm', g: '100 g', move: 'Squats with a chair build leg strength for the weeks ahead.', eat: 'Healthy fats like avocado and nuts support baby’s brain growth.', care: 'You may start feeling flutters. Mention them at your visit.' },
  { wk: 20, name: 'banana', type: 'banana', cm: '25.6 cm', g: '300 g', move: 'Bird dog helps your lower back and core stay steady.', eat: 'Calcium from dairy or fortified alternatives supports bone growth.', care: 'The anatomy ultrasound is usually between weeks 18 and 22.' },
  { wk: 24, name: 'cantaloupe', type: 'cantaloupe', cm: '30 cm', g: '600 g', move: 'Keep your 20 to 30 minute walks. Add wall push-ups for upper-body strength.', eat: 'Iron-rich foods like lentils and greens, paired with vitamin C.', care: 'Glucose screening is usually offered between weeks 24 and 28.' },
  { wk: 28, name: 'eggplant', type: 'eggplant', cm: '37 cm', g: '1 kg', move: 'Slow down if you feel breathless. Pelvic tilts can ease back pressure.', eat: 'Add fibre and fluids to help with constipation.', care: 'Third trimester begins. Ask about a kick-count routine.' },
  { wk: 32, name: 'coconut', type: 'coconut', cm: '42 cm', g: '1.7 kg', move: 'Short, frequent walks and gentle stretching work best now.', eat: 'Choose smaller meals if heartburn is bothering you.', care: 'Visits become more frequent. Write down questions in advance.' },
  { wk: 36, name: 'honeydew melon', type: 'honeydew', cm: '47 cm', g: '2.6 kg', move: 'Practise deep breathing and pelvic floor relaxation.', eat: 'Keep snacks handy: dates, yogurt and nuts are good options.', care: 'Pack your hospital bag and review your birth plan.' },
  { wk: 40, name: 'pumpkin', type: 'pumpkin', cm: '51 cm', g: '3.4 kg', move: 'Easy walking and rest. Listen to your body.', eat: 'Stay hydrated and eat light, regular meals.', care: 'Know your care team’s contact plan for labour signs.' },
]
export const fruitFor = (week: number) => [...FRUITS].reverse().find((f) => f.wk <= week) ?? FRUITS[0]
