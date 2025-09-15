'use client'

import { useMemo } from 'react'

type Stat = { label: string; value: string }
type Highlight =
  | { day: number; variant: 'event' } // 노랑
  | { day: number; variant: 'today' } // 파랑

interface CalendarProps {
  year: number
  month: number
  stats: [Stat, Stat, Stat] // 선결제 금액, 개인 고객, 그룹 고객
  highlights?: Highlight[]
}

/** Monday-start calendar util */
function buildMonthMatrix(year: number, month: number) {
  // month: 1-12
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const daysInMonth = last.getDate()

  // JS: 0=Sun..6=Sat → Monday-start index(0=Mon..6=Sun)
  const jsFirst = first.getDay() // 0~6
  const monFirst = (jsFirst + 6) % 7 // 0~6

  const cells: (number | null)[] = [
    ...Array(monFirst).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function Calendar({
  year,
  month,
  stats,
  highlights = [],
}: CalendarProps) {
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month])
  const hlMap = useMemo(() => {
    const map = new Map<number, Highlight['variant']>()
    for (const h of highlights) map.set(h.day, h.variant)
    return map
  }, [highlights])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <section className="rounded-xl border border-gray-300 bg-white">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {stats.map((s, i) => (
            <div key={i} className="p-4 text-center">
              <div className="text-sm font-bold">{s.label}</div>
              <div className="mt-2 text-gray-700">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <h1 className="font-display mt-8 text-center text-3xl font-extrabold tracking-wide">
        CALENDER
      </h1>

      {/* 캘린더 */}
      <section className="mt-6 rounded-xl border border-gray-300 bg-white p-6">
        {/* 요일 헤더 (Mon start) */}
        <div className="grid grid-cols-7 border-b border-gray-300">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d, index) => (
            <div
              key={index}
              className="flex h-10 items-center justify-center border-l border-gray-300 text-sm font-semibold first:border-l-0"
            >
              {d}
            </div>
          ))}
        </div>

        {/* 주 단위 그리드 */}
        <div className="grid grid-rows-5">
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid grid-cols-7 border-b border-gray-300 last:border-b-0"
            >
              {week.map((day, di) => {
                const variant = day ? hlMap.get(day) : undefined
                const base =
                  'relative flex h-20 items-center justify-center border-l border-gray-300 first:border-l-0'
                const color =
                  variant === 'today'
                    ? 'bg-blue-500 text-white'
                    : variant === 'event'
                      ? 'bg-yellow-300/90'
                      : 'bg-white'
                return (
                  <div key={di} className={`${base} ${color}`}>
                    {day && <span className="text-lg">{day}</span>}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
