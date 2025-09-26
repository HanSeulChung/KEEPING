'use client'

import apiClient from '@/api/axios'
import { storeApi } from '@/api/storeApi'
import { useStoreStore } from '@/store/useStoreStore'
import { useEffect, useMemo, useState } from 'react'

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

const OwnerSalesCalendar = () => {
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
  const [activeStatsTab, setActiveStatsTab] = useState<'overall' | 'monthly'>(
    'overall'
  )

  // API 호출 함수들
  const fetchSalesData = async () => {
    if (!selectedStore?.id) return

    try {
      console.log('매출 캘린더 조회 시작:', {
        storeId: selectedStore.id,
        year,
        month,
      })
      const data = await storeApi.getSalesCalendar(
        parseInt(selectedStore.id),
        year,
        month
      )
      console.log('매출 캘린더 조회 성공:', data)
      setSalesData(data || [])
    } catch (error: any) {
      console.error('매출 캘린더 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)
      // 에러 발생 시 빈 배열로 설정
      setSalesData([])
    }
  }

  // 월별 일별 통계 데이터 조회 (색상 구분용)
  const fetchMonthlyDailyStats = async () => {
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
            requestData
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
      const data = await storeApi.getMonthlyStatistics(
        parseInt(selectedStore.id),
        year,
        month
      )
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

  const fetchOverallStatistics = async () => {
    if (!selectedStore?.id) return

    try {
      console.log('전체 통계 조회 시작:', {
        storeId: selectedStore.id,
      })
      const requestData: StatisticsRequestDto = {}
      const response = await apiClient.post(
        `/stores/${selectedStore.id}/statistics/overall`,
        requestData
      )

      console.log('전체 통계 조회 응답:', response.data)
      if (response.data.success) {
        setOverallStats(response.data.data)
      }
    } catch (error: any) {
      console.error('전체 통계 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)
      // 임시 더미 데이터 설정 (백엔드 오류 시)
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

      // 각 API를 개별적으로 호출하여 하나가 실패해도 다른 것들은 실행되도록 함
      try {
        await fetchSalesData()
      } catch (error) {
        console.error('매출 데이터 로드 실패:', error)
      }

      try {
        await fetchMonthlyDailyStats()
      } catch (error) {
        console.error('월별 일별 통계 로드 실패:', error)
      }

      try {
        await fetchMonthlyStats()
      } catch (error) {
        console.error('월별 통계 로드 실패:', error)
      }

      try {
        await fetchOverallStatistics()
      } catch (error) {
        console.error('전체 통계 로드 실패:', error)
      }

      setLoading(false)
    }

    if (selectedStore?.id) {
      loadData()
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

  // 월 변경 함수
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
      {/* 월/년도 네비게이션 */}
      <div className="w-full border-b border-black bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="font-['nanumsquare'] text-xl font-bold text-black">
              {year}년 {monthNames[month - 1]}
            </h2>

            <button
              onClick={goToNextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 18L15 12L9 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="w-full border-b border-black bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* 탭 메뉴 */}
          <div className="mb-6 flex justify-center">
            <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-1">
              <button
                onClick={() => setActiveStatsTab('overall')}
                className={`rounded-md px-4 py-2 font-['nanumsquare'] text-sm font-medium transition-colors ${
                  activeStatsTab === 'overall'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전체 통계
              </button>
              <button
                onClick={() => setActiveStatsTab('monthly')}
                className={`rounded-md px-4 py-2 font-['nanumsquare'] text-sm font-medium transition-colors ${
                  activeStatsTab === 'monthly'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {year}년 {monthNames[month - 1]}
              </button>
            </div>
          </div>

          {/* 통계 내용 */}
          {activeStatsTab === 'overall' && overallStats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-black">
                  {(overallStats.totalPaymentAmount || 0).toLocaleString()}원
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 결제금액
                </div>
              </div>
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-blue-600">
                  {(overallStats.totalChargePoints || 0).toLocaleString()}원
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 충전금액
                </div>
              </div>
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-green-600">
                  {(overallStats.totalPointsUsed || 0).toLocaleString()}원
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 사용금액
                </div>
              </div>
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-gray-700">
                  {(overallStats.totalTransactionCount || 0).toLocaleString()}건
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 거래건수
                </div>
              </div>
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-purple-600">
                  {(overallStats.totalChargeCount || 0).toLocaleString()}건
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 충전건수
                </div>
              </div>
              <div className="text-center">
                <div className="font-['nanumsquare'] text-lg font-bold text-orange-600">
                  {(overallStats.totalUseCount || 0).toLocaleString()}건
                </div>
                <div className="mt-1 font-['nanumsquare'] text-xs text-gray-600">
                  총 사용건수
                </div>
              </div>
            </div>
          )}

          {activeStatsTab === 'monthly' && monthlyStats && (
            <div className="space-y-6">
              {/* 주요 지표 */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="font-['nanumsquare'] text-xl font-bold text-black">
                    {(monthlyStats.monthlyPaymentAmount || 0).toLocaleString()}
                    원
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    월 결제금액
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-['nanumsquare'] text-xl font-bold text-blue-600">
                    {(
                      monthlyStats.monthlyTotalChargePoints || 0
                    ).toLocaleString()}
                    원
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    월 충전금액
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-['nanumsquare'] text-xl font-bold text-green-600">
                    {(monthlyStats.monthlyPointsUsed || 0).toLocaleString()}원
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    월 사용금액
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-['nanumsquare'] text-xl font-bold text-gray-700">
                    {(
                      monthlyStats.monthlyTransactionCount || 0
                    ).toLocaleString()}
                    건
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    월 거래건수
                  </div>
                </div>
              </div>

              {/* 일평균 지표 */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <div className="font-['nanumsquare'] text-lg font-bold text-indigo-600">
                    {(monthlyStats.averageDailyPayment || 0).toLocaleString()}원
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    일평균 결제금액
                  </div>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 text-center">
                  <div className="font-['nanumsquare'] text-lg font-bold text-teal-600">
                    {(
                      monthlyStats.averageDailyPointsUsed || 0
                    ).toLocaleString()}
                    원
                  </div>
                  <div className="mt-1 font-['nanumsquare'] text-sm text-gray-600">
                    일평균 포인트 사용
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 데이터가 없을 때 */}
          {activeStatsTab === 'overall' && !overallStats && (
            <div className="py-8 text-center font-['nanumsquare'] text-gray-500">
              전체 통계 데이터를 불러오는 중...
            </div>
          )}

          {activeStatsTab === 'monthly' && !monthlyStats && (
            <div className="py-8 text-center font-['nanumsquare'] text-gray-500">
              월별 통계 데이터를 불러오는 중...
            </div>
          )}
        </div>
      </div>

      {/* 캘린더 그리드 */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* 색상 범례 */}
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-['nanumsquare'] text-gray-600">
              포인트 사용량:
            </span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-green-400 bg-green-200"></div>
              <span className="font-['nanumsquare']">50만원+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-green-300 bg-green-100"></div>
              <span className="font-['nanumsquare']">20만원+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-yellow-300 bg-yellow-100"></div>
              <span className="font-['nanumsquare']">10만원+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-orange-300 bg-orange-100"></div>
              <span className="font-['nanumsquare']">5만원+</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-red-300 bg-red-100"></div>
              <span className="font-['nanumsquare']">5만원 미만</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border border-blue-500 bg-blue-500"></div>
              <span className="font-['nanumsquare']">오늘</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* 요일 헤더 */}
            {['월', '화', '수', '목', '금', '토', '일'].map(day => (
              <div
                key={day}
                className="flex h-12 items-center justify-center border-b border-gray-200 font-['nanumsquare'] text-sm font-bold text-gray-700"
              >
                {day}
              </div>
            ))}

            {/* 캘린더 날짜 */}
            {weeks.flat().map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-16" />
              }

              const salesInfo = salesMap.get(day)
              const dailyStatsInfo = dailyStatsMap.get(day)
              const hasRevenue = salesInfo && salesInfo.amount > 0
              const todayClass = isToday(day) ? 'bg-blue-500 text-white' : ''

              // 포인트 사용량 기준 색상 구분
              let revenueClass = ''
              if (dailyStatsInfo) {
                const pointsUsed = dailyStatsInfo.dailyPointsUsed || 0
                if (pointsUsed >= 500000) {
                  // 50만원 이상 사용: 진한 초록 (매우 활발)
                  revenueClass = 'bg-green-200 border-green-400'
                } else if (pointsUsed >= 200000) {
                  // 20만원 이상 사용: 연한 초록 (활발)
                  revenueClass = 'bg-green-100 border-green-300'
                } else if (pointsUsed >= 100000) {
                  // 10만원 이상 사용: 노란색 (보통)
                  revenueClass = 'bg-yellow-100 border-yellow-300'
                } else if (pointsUsed >= 50000) {
                  // 5만원 이상 사용: 연한 주황 (적음)
                  revenueClass = 'bg-orange-100 border-orange-300'
                } else if (pointsUsed > 0) {
                  // 5만원 미만 사용: 연한 빨강 (매우 적음)
                  revenueClass = 'bg-red-100 border-red-300'
                }
                // pointsUsed가 0이면 색상 없음 (기본 회색)
              }

              return (
                <div
                  key={index}
                  className={`h-16 cursor-pointer border p-1 transition-all hover:shadow-md ${
                    todayClass ||
                    revenueClass ||
                    'border-gray-200 hover:bg-gray-50'
                  }`}
                  onMouseEnter={e => handleMouseEnter(day, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex h-full flex-col">
                    <span
                      className={`font-['nanumsquare'] text-sm font-medium ${
                        isToday(day) ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {day}
                    </span>
                    {dailyStatsInfo &&
                      (dailyStatsInfo.dailyPointsUsed > 0 ||
                        dailyStatsInfo.dailyTotalChargePoints > 0) && (
                        <div className="mt-1 text-xs">
                          {dailyStatsInfo.dailyPointsUsed > 0 && (
                            <div
                              className={`font-['nanumsquare'] font-semibold ${
                                dailyStatsInfo.dailyPointsUsed >= 200000
                                  ? 'text-green-700'
                                  : dailyStatsInfo.dailyPointsUsed >= 100000
                                    ? 'text-yellow-700'
                                    : dailyStatsInfo.dailyPointsUsed >= 50000
                                      ? 'text-orange-700'
                                      : 'text-red-600'
                              }`}
                            >
                              사용{' '}
                              {dailyStatsInfo.dailyPointsUsed.toLocaleString()}
                              원
                            </div>
                          )}
                          {dailyStatsInfo.dailyTotalChargePoints > 0 && (
                            <div className="font-['nanumsquare'] text-xs text-blue-600">
                              충전{' '}
                              {dailyStatsInfo.dailyTotalChargePoints.toLocaleString()}
                              원
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
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
