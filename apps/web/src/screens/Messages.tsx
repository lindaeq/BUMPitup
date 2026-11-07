import { Tabs } from '../components/ui'

function Bubble({ children, me = false }: { children: string; me?: boolean }) {
  return (
    <div
      className={`max-w-[260px] border border-cocoa/15 px-4 py-3 text-lg leading-tight shadow-soft ${
        me
          ? 'self-end rounded-[18px_18px_4px_18px] bg-hot text-cream'
          : 'self-start rounded-[18px_18px_18px_4px] bg-pink text-cocoa'
      }`}
    >
      {children}
    </div>
  )
}

export default function Messages() {
  return (
    <>
      <header className="flex flex-none items-center justify-between px-5 pt-8">
        <h1 className="display text-[46px]">
          care
          <br />
          team
        </h1>
        <div className="flex" aria-hidden="true">
          <div className="size-14 rounded-full border border-cocoa/15 bg-pink" />
          <div className="-ml-4 size-14 rounded-full border border-cocoa/15 bg-hot" />
        </div>
      </header>
      <div className="mx-[22px] mt-[22px] flex flex-col gap-4">
        <Bubble>Thanks for the update. Let’s keep the arm raises gentle this week.</Bubble>
        <div className="w-[250px] self-start rounded-2xl bg-caramel px-5 py-3.5 text-cream">
          <div className="text-sm font-bold">plan updated</div>
          <div className="display mt-1 text-[22px] leading-[1.05]">seated arm raises: 8 reps, 2 sets</div>
        </div>
        <Bubble me>The lower back felt better today.</Bubble>
        <Bubble>Good to hear. Keep logging your check-ins.</Bubble>
      </div>
      <div className="mx-4 mb-2.5 mt-auto flex flex-none gap-2">
        <div className="flex-1 rounded-2xl border border-cocoa/20 bg-cream px-5 py-[15px] text-lg">
          Write a message
        </div>
        <button
          type="button"
          aria-label="Send"
          className="size-[58px] rounded-2xl border border-cocoa/15 bg-hot text-2xl font-extrabold text-cream"
        >
          ↑
        </button>
      </div>
      <Tabs active="Care team" autoMargin={false} />
    </>
  )
}
