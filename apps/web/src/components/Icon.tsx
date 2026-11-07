const P = {
  home: 'M3 11l9-8 9 8v10h-6v-6H9v6H3z',
  ex: 'M3 12h4l3-8 4 16 3-8h4',
  chart: 'M5 20v-7M12 20V5M19 20V9',
  chat: 'M4 5h16v11H9l-5 4z',
  back: 'M15 5l-7 7 7 7',
  chev: 'M9 5l7 7-7 7',
  check: 'M5 12l5 5 9-10',
  cam: 'M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
  band: 'M8 3h8l1 5H7zM8 21h8l1-5H7zM7 8h10v8H7z',
  bell: 'M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4',
}
export type IconName = keyof typeof P

export default function Icon({ n, className }: { n: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  )
}
