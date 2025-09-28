'use client'

import apiClient from '@/api/axios'
import { storeApi } from '@/api/storeApi'
import { useStoreStore } from '@/store/useStoreStore'
import { useEffect, useMemo, useRef, useState } from 'react'

// 통계 API 타입 정의
interface StatisticsRequestDto {
  date?: string
  startDate?: string
  endDate?: string
}

interface StoreOverallStatisticsResponseDto {
  storeId: number
  storeName: string
  totalPaymentAmount: number // 전체 누적 실제 결제금액
  totalChargePoints: number // 전체 누적 총 충전 포인트 금액
  totalPointsUsed: number // 전체 누적 포인트 사용량
  totalTransactionCount: number // 전체 거래 건수
  totalChargeCount: number // 전체 충전 건수
  totalUseCount: number // 전체 사용 건수
}

interface SalesData {
  date: string
  amount: number
  orders: number
}

interface DailyStatisticsResponseDto {
  storeId: number
  storeName: string
  date: string
  dailyPaymentAmount: number
  dailyTotalChargePoints: number
  dailyPointsUsed: number
  dailyTransactionCount: number
  dailyChargeCount: number
  dailyUseCount: number
}

interface MonthlyStats {
  storeId: number
  storeName: string
  year: number
  month: number
  monthlyPaymentAmount: number // 해당 월 실제 결제금액
  monthlyTotalChargePoints: number // 해당 월 총 충전 포인트 금액
  monthlyPointsUsed: number // 해당 월 포인트 사용량
  monthlyTransactionCount: number // 해당 월 거래 건수
  monthlyChargeCount: number // 해당 월 충전 건수
  monthlyUseCount: number // 해당 월 사용 건수
  averageDailyPayment: number // 일평균 결제금액
  averageDailyPointsUsed: number // 일평균 포인트 사용량
}

function buildMonthMatrix(year: number, month: number) {
  const first = new Date(year, month - 1, 1)
  const last = new Date(year, month, 0)
  const daysInMonth = last.getDate()

  const jsFirst = first.getDay()
  const monFirst = (jsFirst + 6) % 7

  const cells: (number | null)[] = [
    ...Array(monFirst).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

interface CalendarProps {
  storeId?: string
  stores?: any[]
  onStoreChange?: (storeId: string) => void
}

const OwnerSalesCalendar = ({
  storeId,
  stores,
  onStoreChange,
}: CalendarProps = {}) => {
  const { selectedStore } = useStoreStore()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [dailyStatsData, setDailyStatsData] = useState<
    DailyStatisticsResponseDto[]
  >([]) // 실제 일별 통계 데이터
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null)
  const [overallStats, setOverallStats] =
    useState<StoreOverallStatisticsResponseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [showSummary, setShowSummary] = useState(false)
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false)
  const monthPickerRef = useRef<HTMLDivElement | null>(null)
  //

  // API 호출 함수들
  const fetchSalesData = async () => {
    if (!selectedStore?.id) return

    // selectedStore.id가 문자열인 경우 숫자로 변환, 이미 숫자인 경우 그대로 사용
    const storeId =
      typeof selectedStore.id === 'string'
        ? parseInt(selectedStore.id)
        : selectedStore.id

    try {
      console.log('매출 캘린더 조회 시작:', {
        storeId: selectedStore.id,
        year,
        month,
      })

      if (isNaN(storeId)) {
        console.error('유효하지 않은 storeId:', selectedStore.id)
        setSalesData([])
        return
      }

      const apiData = await storeApi.getSalesCalendar(storeId, year, month)
      console.log('매출 캘린더 조회 성공:', apiData)
      const list: any[] = Array.isArray(apiData)
        ? apiData
        : Array.isArray((apiData as any)?.data)
          ? (apiData as any).data
          : Array.isArray((apiData as any)?.content)
            ? (apiData as any).content
            : []

      const normalized: SalesData[] = list.map((d: any) => ({
        date: d.date,
        amount: d.amount ?? d.paymentAmount ?? d.totalAmount ?? 0,
        orders: d.orders ?? d.transactionCount ?? d.totalOrders ?? 0,
      }))
      setSalesData(normalized)
    } catch (error: any) {
      console.error('매출 캘린더 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)

      // 500 에러인 경우 더 자세한 로그
      if (error.response?.status === 500) {
        console.error('서버 내부 오류 - 매출 캘린더 API')
        console.error('요청 정보:', {
          storeId,
          year,
          month,
          url: `/stores/${storeId}/statistics/period`,
          requestBody: {
            startDate: `${year}-${month.toString().padStart(2, '0')}-01`,
            endDate: `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`,
          },
        })
      }

      // 에러 발생 시 빈 배열로 설정
      setSalesData([])
    }
  }

  // 월별 일별 통계 데이터 조회 (색상 구분용)
  const fetchMonthlyDailyStats = async (signal?: AbortSignal) => {
    if (!selectedStore?.id) return

    try {
      console.log('월별 일별 통계 조회 시작:', {
        storeId: selectedStore.id,
        year,
        month,
      })

      const monthlyData: DailyStatisticsResponseDto[] = []
      const daysInMonth = new Date(year, month, 0).getDate()

      // 해당 월의 모든 날짜에 대해 일별 통계 조회
      for (let day = 1; day <= daysInMonth; day++) {
        const targetDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        const requestData = { date: targetDate }

        try {
          const response = await apiClient.post(
            `/stores/${selectedStore.id}/statistics/daily`,
            requestData,
            { signal }
          )

          if (response.data.success && response.data.data) {
            monthlyData.push(response.data.data)
          }
        } catch (error) {
          // 개별 날짜 조회 실패는 무시하고 계속 진행
          console.log(`${targetDate} 통계 조회 실패:`, error)
        }
      }

      console.log('월별 일별 통계 조회 성공:', monthlyData)
      setDailyStatsData(monthlyData)
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return
      }
      console.error('월별 일별 통계 조회 실패:', error)
      setDailyStatsData([])
    }
  }

  const fetchMonthlyStats = async () => {
    if (!selectedStore?.id) return

    try {
      console.log('월별 통계 조회 시작:', {
        storeId: selectedStore.id,
        year,
        month,
      })

      // selectedStore.id가 문자열인 경우 숫자로 변환, 이미 숫자인 경우 그대로 사용
      const storeId =
        typeof selectedStore.id === 'string'
          ? parseInt(selectedStore.id)
          : selectedStore.id

      if (isNaN(storeId)) {
        console.error('유효하지 않은 storeId:', selectedStore.id)
        return
      }

      const data = await storeApi.getMonthlyStatistics(storeId, year, month)
      console.log('월별 통계 조회 성공:', data)
      setMonthlyStats(data || null)
    } catch (error: any) {
      console.error('월별 통계 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)
      // 에러 발생 시 null로 설정
      setMonthlyStats(null)
    }
  }

  const fetchOverallStatistics = async (signal?: AbortSignal) => {
    if (!selectedStore?.id) return

    try {
      console.log('전체 통계 조회 시작:', {
        storeId: selectedStore.id,
      })
      const requestData: StatisticsRequestDto = {}
      const response = await apiClient.post(
        `/stores/${selectedStore.id}/statistics/overall`,
        requestData,
        { signal }
      )

      console.log('전체 통계 조회 응답:', response.data)
      if (response.data.success) {
        setOverallStats(response.data.data)
      }
    } catch (error: any) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return
      }
      console.error('전체 통계 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)

      setOverallStats({
        storeId: 0,
        storeName: '',
        totalPaymentAmount: 0,
        totalChargePoints: 0,
        totalPointsUsed: 0,
        totalTransactionCount: 0,
        totalChargeCount: 0,
        totalUseCount: 0,
      })
    }
  }

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const controller = new AbortController()

      // 각 API를 개별적으로 호출하여 하나가 실패해도 다른 것들은 실행되도록 함
      try {
        await fetchSalesData()
      } catch (error) {
        console.error('매출 데이터 로드 실패:', error)
      }

      try {
        await fetchMonthlyDailyStats(controller.signal)
      } catch (error) {
        console.error('월별 일별 통계 로드 실패:', error)
      }

      try {
        await fetchMonthlyStats()
      } catch (error) {
        console.error('월별 통계 로드 실패:', error)
      }

      try {
        await fetchOverallStatistics(controller.signal)
      } catch (error) {
        console.error('전체 통계 로드 실패:', error)
      }

      setLoading(false)
    }

    if (selectedStore?.id) {
      loadData()
    }
    return () => {
      // 요청 중단
      // Note: controller might be undefined if loadData didn't run
    }
  }, [year, month, selectedStore?.id])

  // 캘린더 그리드 생성
  const weeks = useMemo(() => buildMonthMatrix(year, month), [year, month])

  // 매출 데이터 맵 생성 (기존 캘린더용)
  const salesMap = useMemo(() => {
    const map = new Map<number, SalesData>()
    salesData.forEach(data => {
      const date = new Date(data.date)
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        map.set(date.getDate(), data)
      }
    })
    return map
  }, [salesData, year, month])

  // 일별 통계 데이터 맵 생성 (색상 구분용)
  const dailyStatsMap = useMemo(() => {
    const map = new Map<number, DailyStatisticsResponseDto>()
    dailyStatsData.forEach(data => {
      const date = new Date(data.date)
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        map.set(date.getDate(), data)
      }
    })
    return map
  }, [dailyStatsData, year, month])

  // 실제 일별 통계 조회 함수 (툴팁용)
  const fetchDailyStatsForTooltip = async (
    storeId: string,
    targetDate: string
  ): Promise<DailyStatisticsResponseDto | null> => {
    try {
      const requestData = { date: targetDate }
      const response = await apiClient.post(
        `/stores/${storeId}/statistics/daily`,
        requestData
      )

      if (response.data.success) {
        return response.data.data
      }
      return null
    } catch (error) {
      console.error('툴팁용 일별 통계 조회 실패:', error)
      return null
    }
  }

  // 마우스 이벤트 핸들러
  const handleMouseEnter = (day: number, event: React.MouseEvent) => {
    setHoveredDay(day)
    const rect = event.currentTarget.getBoundingClientRect()
    setHoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  // 오늘 날짜
  const today = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day

  //

  const monthNames = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]

  // 달력 보조 계산 (디자인 요구: 이전/다음 달 날짜도 표시)
  const flatWeeks = useMemo(() => weeks.flat(), [weeks])
  const firstNonNullIndex = useMemo(
    () => flatWeeks.findIndex(d => d !== null),
    [flatWeeks]
  )
  const lastNonNullIndex = useMemo(
    () =>
      flatWeeks.length -
      1 -
      [...flatWeeks].reverse().findIndex(d => d !== null),
    [flatWeeks]
  )
  const leadingNulls = firstNonNullIndex === -1 ? 0 : firstNonNullIndex
  const prevMonthDays = useMemo(
    () => new Date(year, month - 1, 0).getDate(),
    [year, month]
  )

  // 월 선택 오버레이 토글
  const toggleMonthPicker = () => setIsMonthPickerOpen(prev => !prev)

  // 바깥 클릭 시 월 선택기 닫기
  useEffect(() => {
    if (!isMonthPickerOpen) return
    const handleOutside = (e: MouseEvent) => {
      if (!monthPickerRef.current) return
      const target = e.target as Node
      if (!monthPickerRef.current.contains(target)) {
        setIsMonthPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [isMonthPickerOpen])

  const handleSelectMonth = (m: number) => {
    setMonth(m)
    setIsMonthPickerOpen(false)
  }

  const handlePrevYear = () => setYear(y => y - 1)
  const handleNextYear = () => setYear(y => y + 1)

  if (loading) {
    return (
      <div className="bg-keeping-beige flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black"></div>
          <p className="font-['nanumsquare'] text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!selectedStore) {
    return (
      <div className="bg-keeping-beige flex min-h-screen items-center justify-center">
        <p className="font-['nanumsquare'] text-lg text-gray-600">
          매장을 선택해주세요
        </p>
      </div>
    )
  }

  return (
    <div className="bg-keeping-beige min-h-screen">
      {/* 제목 바 (헤더 아래) */}
      <div className="w-full bg-[#76d4ff]">
        <div className="mx-auto max-w-4xl px-4 py-2 sm:px-6 lg:px-8">
          <div className="font-['nanumsquare'] text-xl font-extrabold text-white">
            매출 캘린더
          </div>
        </div>
      </div>

      {/* 통계 상단 스위처 제거됨 (요청 반영) */}

      {/* 캘린더 그리드 */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* 월 표기 (배지 스타일) */}
          <div className="relative mb-4" ref={monthPickerRef}>
            <button
              type="button"
              onClick={toggleMonthPicker}
              aria-haspopup="dialog"
              aria-expanded={isMonthPickerOpen}
              className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#76d3ff] py-1 pr-[0.4375rem] pl-[1.9375rem]"
            >
              <span className="text-[.9375rem] leading-[140%] font-semibold text-[#76d2fe]">
                {monthNames[month - 1]}
              </span>
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15 18.75L8.75 12.5H21.25L15 18.75Z" fill="#77D3FF" />
              </svg>
            </button>

            {isMonthPickerOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                onClick={() => setIsMonthPickerOpen(false)}
              >
                <div
                  className="w-[320px] rounded-xl bg-white p-4 shadow-2xl"
                  role="dialog"
                  aria-modal="true"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePrevYear}
                      className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
                      aria-label="이전 연도"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 18L9 12L15 6"
                          stroke="#4B5563"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="font-['nanumsquare'] text-lg font-bold text-gray-800">
                      {year}년
                    </div>
                    <button
                      type="button"
                      onClick={handleNextYear}
                      className="flex h-8 w-8 items-center justify-center rounded hover:bg-gray-100"
                      aria-label="다음 연도"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 6L15 12L9 18"
                          stroke="#4B5563"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {monthNames.map((label, idx) => {
                      const m = idx + 1
                      const isActive = m === month
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleSelectMonth(m)}
                          className={
                            'flex h-10 items-center justify-center rounded border text-sm font-medium ' +
                            (isActive
                              ? 'border-[#76d3ff] bg-[#76d3ff] text-white'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')
                          }
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsMonthPickerOpen(false)}
                      className="rounded bg-gray-800 px-3 py-1 text-sm font-semibold text-white hover:bg-black"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 색상 범례 제거 (간결한 하단 카드만 사용) */}

          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 (Mo~Su, 디자인 색상 적용) */}
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(label => (
              <div
                key={label}
                className="flex h-11 w-[3.375rem] items-center justify-center font-['Lexend'] text-lg leading-[100%] font-medium text-[#4c97d6]"
              >
                {label}
              </div>
            ))}

            {/* 캘린더 날짜 (이전/다음 달 날짜 희미하게 표시) */}
            {flatWeeks.map((cell, index) => {
              const isCurrentMonth = cell !== null
              const dayNum: number = isCurrentMonth
                ? (cell as number)
                : index < leadingNulls
                  ? prevMonthDays - (leadingNulls - 1 - index)
                  : index - lastNonNullIndex

              const salesInfo = isCurrentMonth
                ? salesMap.get(dayNum)
                : undefined
              const dailyStatsInfo = isCurrentMonth
                ? dailyStatsMap.get(dayNum)
                : undefined

              // 충전 vs 사용 비교 기반 색상
              let bgClass = ''
              if (dailyStatsInfo) {
                const used = dailyStatsInfo.dailyPointsUsed || 0
                const charged = dailyStatsInfo.dailyTotalChargePoints || 0
                if (charged === 0 && used === 0) {
                  bgClass = ''
                } else if (charged > used) {
                  // 충전 > 사용 (흑자)
                  bgClass = 'bg-green-100'
                } else if (used > charged) {
                  // 사용 > 충전 (적자)
                  bgClass = 'bg-red-100'
                } else {
                  // 동일
                  bgClass = 'bg-yellow-100'
                }
              }

              const isTodayCell = isCurrentMonth && isToday(dayNum)
              const isPrevOrNext = !isCurrentMonth

              return (
                <div
                  key={index}
                  className="flex h-11 w-[3.375rem] items-center justify-center"
                  onMouseEnter={e =>
                    isCurrentMonth && handleMouseEnter(dayNum, e)
                  }
                  onMouseLeave={handleMouseLeave}
                >
                  {isPrevOrNext ? (
                    <div className="font-['Lexend'] text-lg leading-[100%] font-medium text-[#0c1c45]/70">
                      {dayNum}
                    </div>
                  ) : (
                    <div
                      className={
                        'flex h-11 w-[3.125rem] items-center justify-center rounded-xl text-center text-lg leading-[100%] font-medium shadow-none ring-0 outline-none ' +
                        (isTodayCell
                          ? ' border-2 border-[#4c97d6] bg-[#4c97d6] text-white'
                          : `${bgClass ? ` ${bgClass} border-0 text-[#1f1f1f]` : ' border-0 bg-white text-[#1f1f1f]'}`)
                      }
                    >
                      {dayNum}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 하단 요약 (접기/펼치기) */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="font-['nanumsquare'] text-sm text-gray-600">월간 요약</div>
            <button
              type="button"
              onClick={() => setShowSummary(s => !s)}
              className="inline-flex items-center gap-1 rounded border border-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
            >
              {showSummary ? '접기' : '요약 보기'}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={showSummary ? 'rotate-180 transition-transform' : 'transition-transform'}
              >
                <path d="M6 9L12 15L18 9" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {showSummary && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-[#f2fbff] p-3 text-center">
                <div className="text-xs text-[#569ee9]">월 결제금액</div>
                <div className="text-base font-bold text-[#4b5563]">
                  {(monthlyStats?.monthlyPaymentAmount || 0).toLocaleString()}원
                </div>
              </div>
              <div className="rounded-lg bg-[#f2fbff] p-3 text-center">
                <div className="text-xs text-[#569ee9]">월 사용금액</div>
                <div className="text-base font-bold text-[#4b5563]">
                  {(monthlyStats?.monthlyPointsUsed || 0).toLocaleString()}원
                </div>
              </div>
              <div className="rounded-lg bg-[#f2fbff] p-3 text-center">
                <div className="text-xs text-[#569ee9]">월 충전금액</div>
                <div className="text-base font-bold text-[#4b5563]">
                  {(monthlyStats?.monthlyTotalChargePoints || 0).toLocaleString()}원
                </div>
              </div>
              <div className="rounded-lg bg-[#f2fbff] p-3 text-center">
                <div className="text-xs text-[#569ee9]">월 거래건수</div>
                <div className="text-base font-bold text-[#4b5563]">
                  {(monthlyStats?.monthlyTransactionCount || 0).toLocaleString()}건
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 일별 통계 툴팁 */}
      {hoveredDay && (
        <div
          className="fixed z-50 rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            minWidth: '280px',
          }}
        >
          {(() => {
            const dailyStatsInfo = dailyStatsMap.get(hoveredDay)

            if (!dailyStatsInfo) {
              return (
                <div className="text-center font-['nanumsquare'] text-sm text-gray-500">
                  {year}년 {month}월 {hoveredDay}일<br />
                  <span className="text-gray-400">데이터가 없습니다</span>
                </div>
              )
            }

            return (
              <div>
                <div className="mb-3 text-center font-['nanumsquare'] text-sm font-bold text-gray-800">
                  {year}년 {month}월 {hoveredDay}일 현황
                </div>

                <div className="space-y-3">
                  {/* 주요 지표 3개 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded bg-blue-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        결제금액
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-blue-600">
                        {(
                          dailyStatsInfo.dailyPaymentAmount || 0
                        ).toLocaleString()}
                        원
                      </div>
                    </div>
                    <div className="rounded bg-green-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        사용금액
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-green-600">
                        {(dailyStatsInfo.dailyPointsUsed || 0).toLocaleString()}
                        원
                      </div>
                    </div>
                    <div className="rounded bg-purple-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        충전금액
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-purple-600">
                        {(
                          dailyStatsInfo.dailyTotalChargePoints || 0
                        ).toLocaleString()}
                        원
                      </div>
                    </div>
                  </div>

                  {/* 거래 현황 */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded bg-gray-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        거래건수
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-gray-700">
                        {(
                          dailyStatsInfo.dailyTransactionCount || 0
                        ).toLocaleString()}
                        건
                      </div>
                    </div>
                    <div className="rounded bg-orange-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        충전건수
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-orange-600">
                        {(
                          dailyStatsInfo.dailyChargeCount || 0
                        ).toLocaleString()}
                        건
                      </div>
                    </div>
                    <div className="rounded bg-red-50 p-2 text-center">
                      <div className="font-['nanumsquare'] text-xs text-gray-600">
                        사용건수
                      </div>
                      <div className="font-['nanumsquare'] text-sm font-bold text-red-600">
                        {(dailyStatsInfo.dailyUseCount || 0).toLocaleString()}건
                      </div>
                    </div>
                  </div>

                  {/* 요약 정보 */}
                  <div className="mt-2 rounded bg-gray-50 p-2 text-center">
                    <div className="font-['nanumsquare'] text-xs text-gray-600">
                      포인트 사용률:{' '}
                      {dailyStatsInfo.dailyTotalChargePoints > 0
                        ? (
                            (dailyStatsInfo.dailyPointsUsed /
                              dailyStatsInfo.dailyTotalChargePoints) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

export default OwnerSalesCalendar
