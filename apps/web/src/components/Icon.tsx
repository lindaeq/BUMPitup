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
  calendar: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  baby: 'M12 21a8 8 0 100-16 8 8 0 000 16zM9 11h.01M15 11h.01M9 15c1 1 5 1 6 0',
  play: 'M8 5v14l11-7z',
  pause: 'M8 5v14M16 5v14',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z',
  bell: 'M6 17V11a6 6 0 0112 0v6l2 2H4zM10 21h4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
}
export type IconName = keyof typeof P

export default function Icon({ n, className }: { n: IconName; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n]} />
    </svg>
  )
}
