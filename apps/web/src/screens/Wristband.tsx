import { BackButton, GoButton, Pill } from '../components/ui'

export default function Wristband() {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-[30px]">
        <BackButton light />
        <Pill className="bg-cocoa text-cream">Wristband on</Pill>
      </div>
      <h1 className="display mx-5 mt-3 text-[46px]">wall push-ups</h1>
      <div className="relative mt-2 size-[290px] flex-none self-center">
        <svg viewBox="0 0 300 300" className="size-[290px]" aria-hidden="true">
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="#ff9dbb"
            strokeWidth="22"
            strokeDasharray="620 880"
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />
          <circle
            cx="150"
            cy="150"
            r="108"
            fill="none"
            stroke="#e0245e"
            strokeWidth="22"
            strokeDasharray="450 680"
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />
          <circle cx="150" cy="150" r="76" fill="#fff4ef" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-cocoa">
          <div className="display text-[88px] leading-[.85]">8</div>
          <div className="text-lg font-bold">reps</div>
        </div>
      </div>
      <div className="px-6">
        <svg viewBox="0 0 342 80" className="h-20 w-full" role="img" aria-label="Wrist movement over time">
          <polyline
            fill="none"
            stroke="#fff4ef"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="0,40 24,10 48,70 72,8 96,72 120,12 144,68 168,10 192,70 216,12 240,68 264,10 288,66 312,14 342,40"
          />
        </svg>
      </div>
      <div className="mx-5 mt-2.5 flex gap-3">
        <div className="flex-1 rounded-[22px] border border-cocoa/15 bg-cream px-4 py-3 text-cocoa shadow-soft">
          <div className="text-[15px] font-bold">smoothness</div>
          <div className="display text-[36px] text-hot">92%</div>
        </div>
        <div className="flex-1 rounded-[22px] border border-cocoa/15 bg-tan px-4 py-3 text-cocoa shadow-soft">
          <div className="text-[15px] font-bold">heart rate</div>
          <div className="display text-[36px]">88 bpm</div>
        </div>
      </div>
      <div className="mx-5 mb-[22px] mt-auto">
        <GoButton className="bg-cream text-cocoa">finish exercise</GoButton>
      </div>
    </>
  )
}
