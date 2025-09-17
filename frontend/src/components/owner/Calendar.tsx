'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { endpoints } from '@/api/config'

type Stat = { label: string; value: string }
type Highlight =
  | { day: number; variant: 'event' } // 노랑
  | { day: number; variant: 'today' } // 파랑

interface Store {
  id: string
  name: string
  ownerId: string
  address: string
  phone: string
  description: string
}

interface CalendarProps {
  year?: number
  month?: number
  storeId?: string
  stores?: Store[]
  onStoreChange?: (storeId: string) => void
  stats?: [Stat, Stat, Stat] // 선결제 금액, 개인 고객, 그룹 고객
  highlights?: Highlight[]
}

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

const OwnerSalesCalendar = ({
  year: propYear,
  month: propMonth,
  storeId = '1',
  stores = [],
  onStoreChange,
  stats: propStats,
  highlights: propHighlights = [],
}: CalendarProps) => {
  const router = useRouter()
  const [year, setYear] = useState(propYear || new Date().getFullYear())
  const [month, setMonth] = useState(propMonth || new Date().getMonth() + 1)
  const [stats, setStats] = useState<[Stat, Stat, Stat]>(propStats || [
    { label: '선결제 금액', value: '10,000,000 원' },
    { label: '개인 고객', value: '16명' },
    { label: '그룹 고객', value: '10팀' }
  ])
  const [highlights, setHighlights] = useState<Highlight[]>(propHighlights)
  const [loading, setLoading] = useState(true)

  // API 호출 함수
  const fetchSalesData = async () => {
    try {
      const endpoint = endpoints.stores.salesCalendar.replace('{storeId}', storeId)
      const response = await fetch(`/api${endpoint}?year=${year}&month=${month}`)
      if (response.ok) {
        const data = await response.json()

        // 통계 데이터 업데이트
        setStats([
          { label: '선결제 금액', value: `${data.totalPrepaidAmount.toLocaleString()} 원` },
          { label: '개인 고객', value: `${data.personalCustomers}명` },
          { label: '그룹 고객', value: `${data.groupCustomers}팀` }
        ])

        // 일별 매출 데이터를 하이라이트로 변환
        const newHighlights: Highlight[] = data.dailySales.map((sale: any) => ({
          day: new Date(sale.date).getDate(),
          variant: 'event' as const
        }))

        // 오늘 날짜 추가
        const today = new Date()
        if (today.getFullYear() === year && today.getMonth() + 1 === month) {
          newHighlights.push({
            day: today.getDate(),
            variant: 'today'
          })
        }

        setHighlights(newHighlights)
      }
    } catch (error) {
      console.error('매출 데이터 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchSalesData()
  }, [year, month, storeId])

  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month])
  const hlMap = useMemo(() => {
    const map = new Map<number, Highlight['variant']>()
    for (const h of highlights) map.set(h.day, h.variant)
    return map
  }, [highlights])

  // 월/년도 네비게이션 함수들
  const goToPreviousMonth = () => {
    if (month === 1) {
      setMonth(12)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  // 현재 월/년도 표시
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-keeping-beige">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg font-['nanumsquare']">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-keeping-beige">

      {/* 캘린더 제목 */}
      <div className="w-full bg-white border border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 
            onClick={() => router.push('/owner/dashboard')}
            className="text-2xl sm:text-3xl lg:text-4xl text-black text-center font-['Tenada'] font-extrabold cursor-pointer hover:text-gray-600 transition-colors"
          >
            CALENDER
          </h1>
        </div>
      </div>

      {/* 월/년도 네비게이션 */}
      <div className="w-full bg-white border-t border-b border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={goToPreviousMonth}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg width={20} height={20} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="#1D1B20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-['Tenada'] font-extrabold text-black">
              {year}년 {monthNames[month - 1]}
            </h2>
            <button
              onClick={goToNextMonth}
              className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg width={20} height={20} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="#1D1B20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* 통계 섹션 */}
      <div className="w-full bg-white border-2 border-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-black bg-white">
            <div className="flex flex-col items-center justify-center p-6 border-r-0 sm:border-r-2 border-black bg-white">
              <div className="text-base sm:text-lg font-['nanumsquare'] font-extrabold text-black text-center mb-3">
                {stats[0].label}
              </div>
              <div className="text-lg sm:text-xl font-['nanumsquare'] font-bold text-black text-center">
                {stats[0].value}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 border-r-0 sm:border-r-2 border-black bg-white">
              <div className="text-base sm:text-lg font-['nanumsquare'] font-extrabold text-black text-center mb-3">
                {stats[1].label}
              </div>
              <div className="text-lg sm:text-xl font-['nanumsquare'] font-bold text-black text-center">
                {stats[1].value}
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-6 bg-white">
              <div className="text-base sm:text-lg font-['nanumsquare'] font-extrabold text-black text-center mb-3">
                {stats[2].label}
              </div>
              <div className="text-lg sm:text-xl font-['nanumsquare'] font-bold text-black text-center">
                {stats[2].value}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 캘린더 그리드 */}
      <div className="w-full bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-between items-start content-start w-full max-w-[700px] mx-auto">
            {/* 요일 헤더 */}
            <div className="flex flex-shrink-0 flex-wrap items-start content-start w-full h-[3.25rem] border-b border-b-[#000] bg-white">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <div
                  key={index}
                  className="flex flex-shrink-0 justify-center items-center p-2 w-[6.25rem] h-[3.25rem] border border-black bg-white text-black text-center font-['nanumsquare'] text-xl font-extrabold leading-8"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 캘린더 날짜 */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex items-center w-full">
                {week.map((day, di) => {
                  const variant = day ? hlMap.get(day) : undefined
                  const today = new Date()
                  const isToday = day && 
                    today.getFullYear() === year && 
                    today.getMonth() + 1 === month && 
                    today.getDate() === day
                  
                  const bgColor = 
                    isToday ? 'bg-[#4c97d6]' :
                    variant === 'event' ? 'bg-[#ffda69]' :
                    day ? 'bg-[#faf8f6]' : 'bg-white'
                  
                  return (
                    <div 
                      key={di} 
                      className={`flex items-start gap-2.5 p-2.5 p-2 w-[6.25rem] h-[6.25rem] border border-black ${bgColor} text-black text-center font-['nanumsquare'] text-xl font-extrabold leading-8`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  )
}

export default OwnerSalesCalendar
