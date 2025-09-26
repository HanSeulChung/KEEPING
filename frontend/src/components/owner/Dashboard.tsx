'use client'

import apiClient from '@/api/axios'
import { notificationApi } from '@/api/notificationApi'
import { useAuthStore } from '@/store/useAuthStore'
import type { Store } from '@/store/useStoreStore'
import { useStoreStore } from '@/store/useStoreStore'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import StoreRegisterModal from './StoreRegisterModal'

// 통계 API 타입 정의
interface StatisticsRequestDto {
  date?: string
  startDate?: string
  endDate?: string
}

interface StoreOverallStatisticsResponseDto {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  totalCustomers: number
}

interface DailyStatisticsResponseDto {
  date: string
  sales: number
  orders: number
  customers: number
}

interface PeriodStatisticsResponseDto {
  startDate: string
  endDate: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  dailyStatistics: DailyStatisticsResponseDto[]
}

export default function OwnerHome() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { stores, selectedStore, setSelectedStore, fetchStores, loading } =
    useStoreStore()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isStoreRegisterModalOpen, setIsStoreRegisterModalOpen] =
    useState(false)

  // 통계 데이터 상태
  const [overallStats, setOverallStats] =
    useState<StoreOverallStatisticsResponseDto | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // 통계 API 함수들
  const fetchOverallStatistics = async (storeId: number) => {
    try {
      setStatsLoading(true)
      console.log('전체 통계 조회 시작:', storeId)
      console.log('통계 API 호출 시작...')

      const requestData: StatisticsRequestDto = {}
      const response = await apiClient.post(
        `/stores/${storeId}/statistics/overall`,
        requestData
      )

      console.log('전체 통계 응답:', response.data)
      if (response.data.success) {
        setOverallStats(response.data.data)
      }
    } catch (error: any) {
      console.error('전체 통계 조회 실패:', error)
      console.error('에러 상태:', error.response?.status)
      console.error('에러 응답:', error.response?.data)

      // 임시 더미 데이터 설정 (백엔드 오류 시)
      setOverallStats({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalCustomers: 0,
      })
    } finally {
      setStatsLoading(false)
    }
  }

  // 읽지 않은 알림 개수 가져오기
  const fetchUnreadCount = async () => {
    console.log('현재 사용자 정보:', user)

    if (!user?.ownerId && !user?.userId && !user?.id) {
      console.warn('사용자 ID를 찾을 수 없습니다:', user)
      return
    }

    try {
      // OWNER 역할인 경우 ownerId 사용, 그 외는 userId 또는 id 사용
      let ownerId: number
      if (user.role === 'OWNER' && user.ownerId) {
        ownerId = Number(user.ownerId)
      } else if (user.userId) {
        ownerId = Number(user.userId)
      } else {
        ownerId = Number(user.id)
      }

      console.log('알림 조회할 ownerId:', ownerId)

      if (isNaN(ownerId) || ownerId <= 0) {
        console.error('유효하지 않은 ownerId:', ownerId)
        return
      }

      const count = await notificationApi.getUnreadCount(ownerId)
      setUnreadCount(count)
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
      setUnreadCount(0)
    }
  }

  // 컴포넌트 마운트 시 가게 목록 가져오기
  useEffect(() => {
    // 가게 목록이 없고, 로딩 중이 아닐 때만 fetch
    if (stores.length === 0 && !loading) {
      console.log('가게 목록을 가져오는 중...')
      fetchStores()
    }
  }, [stores.length, fetchStores, loading])

  // 사용자 정보가 있을 때 알림 개수 가져오기
  useEffect(() => {
    if (user && (user.ownerId || user.id)) {
      fetchUnreadCount()
    }
  }, [user])

  // 선택된 가게가 변경될 때 통계 데이터 가져오기
  useEffect(() => {
    if (selectedStore?.storeId) {
      fetchOverallStatistics(selectedStore.storeId)
    }
  }, [selectedStore])

  // 가게 선택 시 전역 상태 업데이트
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-lg">가게 목록을 불러오는 중...</div>
        </div>
      </main>
    )
  }

  // 가게가 없는 경우 (로딩이 완료되고 가게가 정말 없는 경우만)
  if (!loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <main className="mx-auto w-full max-w-[626px] px-4 py-8">
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="mb-4 text-lg text-gray-600">
              등록된 가게가 없습니다
            </div>
            <button
              onClick={() => setIsStoreRegisterModalOpen(true)}
              className="rounded-lg bg-black px-6 py-3 text-white transition-colors hover:bg-gray-800"
            >
              첫 번째 가게 등록하기
            </button>
          </div>
        </main>

        {/* 매장 등록 모달 */}
        <StoreRegisterModal
          isOpen={isStoreRegisterModalOpen}
          onClose={() => setIsStoreRegisterModalOpen(false)}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-[626px] px-4 py-8">
        <div className="top-8 mb-6 flex justify-center sm:mb-8">
          <div className="flex h-[97px] w-[347px] items-start justify-center gap-1 pl-px">
            {stores.map((s, index) => (
              <button
                key={s.storeId}
                onClick={() => handleStoreSelect(s)}
                className={[
                  'flex h-24 w-24 flex-shrink-0 cursor-pointer flex-col items-center justify-center rounded-full border border-black text-center transition-colors',
                  selectedStore?.storeId === s.storeId
                    ? 'bg-black text-white'
                    : 'bg-keeping-beige text-black hover:bg-gray-100',
                ].join(' ')}
              >
                <div className="px-2 text-[17px] leading-6 font-extrabold whitespace-pre-line">
                  {s.storeName}
                </div>
              </button>
            ))}

            {/* 매장 추가 버튼 */}
            <button
              onClick={() => setIsStoreRegisterModalOpen(true)}
              className="bg-keeping-beige flex h-24 w-24 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-black transition-colors hover:bg-gray-100"
            >
              <svg
                width={21}
                height={20}
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.6647 9.99805H16.3314"
                  stroke="black"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.498 4.16504V15.8317"
                  stroke="black"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex w-full flex-col items-center justify-between">
          <div className="h-[551px] self-stretch">
            {/* 페이지 타이틀 */}
            <div className="font-display mb-6 flex h-[50px] w-[207px] flex-shrink-0 flex-col justify-center text-4xl leading-7 font-extrabold text-black">
              {selectedStore?.storeName?.replace('\\n', ' ') ||
                '매장을 선택해주세요'}
            </div>

            {/* 선택된 매장이 있으면 카드 그리드 표시 */}
            {selectedStore ? (
              /* 두 열 레이아웃 */
              <div className="grid w-full max-w-[620px] grid-cols-2 gap-6">
                {/* 1열: 매출 캘린더 + QR 인식하기 (세로 스택) */}
                <div className="flex h-full flex-col gap-6">
                  {/* 매출 캘린더 */}
                  <Link
                    href={`/owner/calendar?storeId=${selectedStore?.storeId}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase()}`}
                    className="bg-keeping-beige flex flex-1 cursor-pointer flex-col items-start border border-black p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-4 flex h-[68px] w-[127px] flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                      매출
                      <br />
                      캘린더 &gt;
                    </div>
                    <div className="flex flex-1 flex-col justify-center text-[17px] leading-7 text-black">
                      {statsLoading ? (
                        '통계 로딩 중...'
                      ) : (
                        <>
                          <div className="mb-4">
                            <div className="mb-1 text-sm text-gray-600">
                              전체 선결제 금액
                            </div>
                            <div className="text-xl font-bold">
                              {(overallStats?.totalSales || 0).toLocaleString()}
                              원
                            </div>
                            {/* 진행률 바 */}
                            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, ((overallStats?.totalSales || 0) / 10000000) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Link>

                  {/* QR 인식하기 */}
                  <Link
                    href={`/owner/scan?storeId=${selectedStore?.storeId}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase()}`}
                    className="flex flex-1 cursor-pointer flex-col items-start border border-black bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="mb-4 flex h-[68px] w-[162px] flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                      QR 인식하기
                    </div>
                  </Link>
                </div>

                {/* 2열: 나머지 3개 (세로 스택) */}
                <div className="flex h-full flex-col gap-6">
                  {/* 매장 관리 */}
                  <Link
                    href={`/owner/manage?storeId=${selectedStore?.storeId}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase()}`}
                    className="relative flex flex-1 cursor-pointer flex-col items-start border border-black bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-[68px] w-[127px] flex-shrink-0 flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                      매장 관리
                    </div>
                    <div className="flex flex-1 flex-col justify-center text-[17px] leading-7 text-black">
                      {statsLoading ? (
                        '통계 로딩 중...'
                      ) : (
                        <>
                          <div className="mb-2">
                            <div className="text-sm text-gray-600">
                              총 주문수
                            </div>
                            <div className="text-lg font-bold">
                              {(
                                overallStats?.totalOrders || 0
                              ).toLocaleString()}
                              건
                            </div>
                          </div>

                          <div className="mb-2">
                            <div className="text-sm text-gray-600">
                              평균 주문금액
                            </div>
                            <div className="text-lg font-bold">
                              {(
                                overallStats?.averageOrderValue || 0
                              ).toLocaleString()}
                              원
                            </div>
                          </div>

                          <div>
                            <div className="text-sm text-gray-600">
                              총 고객수
                            </div>
                            <div className="text-lg font-bold">
                              {(
                                overallStats?.totalCustomers || 0
                              ).toLocaleString()}
                              명
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </Link>

                  {/* 알림 */}
                  <Link
                    href={`/owner/notification?storeId=${selectedStore?.storeId}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase()}`}
                    className="relative flex flex-1 cursor-pointer flex-col items-start border border-black bg-white p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex w-full items-start justify-between">
                      <div className="flex h-[68px] w-[127px] flex-shrink-0 flex-col items-start justify-start text-2xl leading-7 font-extrabold text-black">
                        알림
                      </div>
                      <svg
                        width={18}
                        height={19}
                        viewBox="0 0 18 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.55664 16.8867C7.70293 17.1401 7.91332 17.3504 8.16668 17.4967C8.42003 17.643 8.70743 17.72 8.99997 17.72C9.29252 17.72 9.57991 17.643 9.83327 17.4967C10.0866 17.3504 10.297 17.1401 10.4433 16.8867"
                          stroke="black"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M1.71821 12.1587C1.60935 12.278 1.53751 12.4264 1.51143 12.5858C1.48534 12.7452 1.50615 12.9088 1.5713 13.0565C1.63646 13.2043 1.74316 13.33 1.87843 13.4183C2.01369 13.5065 2.1717 13.5536 2.33321 13.5537H15.6665C15.828 13.5538 15.9861 13.5069 16.1214 13.4188C16.2568 13.3307 16.3636 13.2052 16.429 13.0575C16.4943 12.9098 16.5153 12.7463 16.4894 12.5869C16.4635 12.4275 16.3919 12.279 16.2832 12.1595C15.1749 11.017 13.9999 9.80288 13.9999 6.05371C13.9999 4.72763 13.4731 3.45586 12.5354 2.51818C11.5977 1.5805 10.326 1.05371 8.99988 1.05371C7.6738 1.05371 6.40203 1.5805 5.46435 2.51818C4.52666 3.45586 3.99988 4.72763 3.99988 6.05371C3.99988 9.80288 2.82405 11.017 1.71821 12.1587Z"
                          stroke="black"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 flex flex-1 flex-col justify-center text-[17px] leading-7 text-black">
                      읽지 않은 알림
                      <br />
                      {unreadCount}건
                    </div>
                  </Link>
                </div>
              </div>
            ) : (
              /* 매장이 선택되지 않았을 때 표시할 메시지 */
              <div className="flex h-64 w-full items-center justify-center">
                <div className="text-center">
                  <div className="text-lg text-gray-600">
                    매장을 선택해주세요
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 매장 등록 모달 */}
      <StoreRegisterModal
        isOpen={isStoreRegisterModalOpen}
        onClose={() => setIsStoreRegisterModalOpen(false)}
      />
    </div>
  )
}
