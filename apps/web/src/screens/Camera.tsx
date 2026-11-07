import { GoButton, Pill } from '../components/ui'

export default function Camera() {
  return (
    <>
      <div className="relative h-[440px] flex-none overflow-hidden rounded-b-[28px] bg-camera">
        <svg
          viewBox="0 0 390 470"
          className="absolute left-0 top-0 h-[470px] w-[390px]"
          role="img"
          aria-label="Camera view with arm tracking"
        >
          <g stroke="#fff4ef" strokeWidth="8" strokeLinecap="round" fill="none">
            <circle cx="195" cy="150" r="30" />
            <path d="M195 182 L195 330 M195 215 L120 190 M195 215 L270 290 M195 330 L150 440 M195 330 L240 440" />
          </g>
          <g fill="#ff9dbb" stroke="#3b1f1a" strokeWidth="3">
            <circle cx="195" cy="215" r="13" />
            <circle cx="120" cy="190" r="13" />
            <circle cx="270" cy="290" r="13" />
          </g>
          <path
            d="M195 215 L120 190"
            stroke="#e0245e"
            strokeWidth="3"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute left-5 top-[30px]">
          <Pill className="bg-tan text-cocoa">● Camera live</Pill>
        </div>
        <div className="display absolute right-5 top-[30px] rounded-2xl border border-cocoa/15 bg-pink px-3 py-2 text-[22px] text-cocoa">
          shoulder 82°
        </div>
        <p className="absolute bottom-[18px] left-5 text-sm">Video stays on your phone</p>
      </div>
      <div className="flex items-end justify-between px-6 pt-2">
        <div className="display text-[170px] leading-[.85] text-pink">7</div>
        <div className="pb-2.5 text-right">
          <div className="display text-[30px]">of 10</div>
          <div className="display mt-2 text-[40px] text-pink">00:32</div>
        </div>
      </div>
      <div className="display mx-5 mt-1.5 rounded-[20px] border border-cocoa/15 bg-cream p-3 text-center text-[22px] text-cocoa">
        raise slowly. breathe out.
      </div>
      <div className="mx-5 mb-[22px] mt-auto">
        <GoButton className="bg-caramel text-cream">finish exercise</GoButton>
      </div>
    </>
  )
}
