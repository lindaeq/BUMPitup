import type { ReactNode } from 'react'

export function Tabs({
  active,
  dark = false,
  autoMargin = true,
}: {
  active: string
  dark?: boolean
  autoMargin?: boolean
}) {
  const items = ['Home', 'Exercise', 'Progress', 'Care team']
  return (
    <nav
      className={`mx-3.5 mb-3.5 flex flex-none gap-0.5 rounded-[20px] p-1.5 ${
        autoMargin ? 'mt-auto' : ''
      } ${dark ? 'bg-blush' : 'bg-cocoa'}`}
    >
      {items.map((n) => {
        const on = n === active
        const color = on
          ? dark
            ? 'bg-hot text-cream'
            : 'bg-pink text-cocoa'
          : dark
            ? 'text-cocoa'
            : 'text-cream'
        return (
          <button
            key={n}
            type="button"
            className={`h-[54px] flex-1 rounded-[14px] text-[15px] font-bold ${color}`}
          >
            {n}
          </button>
        )
      })}
    </nav>
  )
}

export function BackButton({ light = false }: { light?: boolean }) {
  return (
    <button
      type="button"
      className={`h-11 rounded-xl border-2 bg-transparent px-[18px] text-[17px] font-bold ${
        light ? 'border-cream text-cream' : 'border-cocoa text-cocoa'
      }`}
    >
      Back
    </button>
  )
}

export function Pill({
  children,
  className = 'bg-pink text-cocoa',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-[10px] border border-cocoa/15 px-4 py-2 text-base font-bold ${className}`}
    >
      {children}
    </span>
  )
}

export function Chip({ children, on = false }: { children: ReactNode; on?: boolean }) {
  return <Pill className={on ? 'bg-cocoa text-cream' : 'bg-cream text-cocoa'}>{children}</Pill>
}

export function GoButton({
  children,
  className = 'bg-hot text-cream',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      className={`h-16 w-full rounded-[14px] border border-cocoa/15 text-xl font-semibold lowercase ${className}`}
    >
      {children}
    </button>
  )
}

export function Tile({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-[18px] border border-cocoa/15 p-4 shadow-soft ${className}`}>
      {children}
    </div>
  )
}
