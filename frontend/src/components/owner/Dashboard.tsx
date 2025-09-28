'use client'

import apiClient from '@/api/axios'
import { notificationApi } from '@/api/notificationApi'
import { useAuthStore } from '@/store/useAuthStore'
import type { Store } from '@/store/useStoreStore'
import { useStoreStore } from '@/store/useStoreStore'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function OwnerHome() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { stores, selectedStore, setSelectedStore, fetchStores, loading } =
    useStoreStore()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isStoreRegisterModalOpen, setIsStoreRegisterModalOpen] =
    useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // 통계 데이터 상태
  const [overallStats, setOverallStats] =
    useState<StoreOverallStatisticsResponseDto | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // 통계 API 함수들
  const fetchOverallStatistics = async (storeId: number) => {
    try {
      setStatsLoading(true)

      // 샘플 가게인 경우 샘플 데이터 반환
      if (storeId === -1) {
        console.log('샘플 가게 SSAFY 통계 데이터 설정')
        setOverallStats({
          totalSales: 1500000,
          totalOrders: 150,
          averageOrderValue: 10000,
          totalCustomers: 120,
        })
        setStatsLoading(false)
        return
      }

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
    if (!user?.ownerId && !user?.userId && !user?.id) {
      console.warn('사용자 ID를 찾을 수 없습니다')
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

      if (isNaN(ownerId) || ownerId <= 0) {
        console.error('유효하지 않은 ownerId')
        return
      }

      const count = await notificationApi.getUnreadCount(ownerId)
      setUnreadCount(count)
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 실패:', error)
      setUnreadCount(0)
    }
  }

  // 컴포넌트 마운트 시 가게 목록 가져오기 (한 번만 실행)
  useEffect(() => {
    // 가게 목록이 없고, 로딩 중이 아닐 때만 fetch
    if (stores.length === 0 && !loading) {
      console.log('가게 목록을 가져오는 중...')
      fetchStores()
    }
  }, []) // 빈 의존성 배열로 마운트 시에만 실행

  // 사용자 정보가 있을 때 알림 개수 가져오기 (한 번만 실행)
  useEffect(() => {
    if (user && (user.ownerId || user.id)) {
      fetchUnreadCount()
    }
  }, [user?.ownerId, user?.userId, user?.id])

  // 선택된 가게가 변경될 때 통계 데이터 가져오기
  useEffect(() => {
    if (selectedStore?.storeId) {
      fetchOverallStatistics(selectedStore.storeId)
    }
  }, [selectedStore])

  // 가게 선택 시 전역 상태 업데이트
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store)
    setIsDropdownOpen(false)
  }

  // 드롭다운 토글
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 가게가 없는 경우 샘플 가게 "SSAFY" 추가
  const displayStores =
    stores.length === 0 && !loading
      ? [
          {
            storeId: -1,
            storeName: 'SSAFY',
            address: '서울시 강남구 테헤란로 212',
            phoneNumber: '02-1234-5678',
            merchantId: -1,
            category: '교육',
            storeStatus: 'ACTIVE' as const,
            description: '샘플 매장입니다. 실제 매장을 등록해보세요!',
            createdAt: new Date().toISOString(),
            imgUrl: '',
            id: '-1',
            name: 'SSAFY',
            ownerId: '',
            phone: '02-1234-5678',
          },
        ]
      : stores

  return (
    <div className="relative mx-auto min-h-screen w-full overflow-hidden bg-white">
      {/* 배너 섹션 */}
      <div className="flex h-[185px] w-full items-center justify-between rounded-b-[10px] bg-[#f2fbff] px-4">
        <div className="flex flex-col">
          <div className="font-jalnan text-xl leading-[140%] text-[#569ee9]">
            단골 만들기의
          </div>
          <div className="font-jalnan text-xl leading-[140%] text-[#569ee9]">
            새로운 방법, 키핑
          </div>
        </div>
        <div className="relative h-[185px] w-[185px]">
          <Image
            src="/common/owner.svg"
            alt="키핑 캐릭터"
            width={185}
            height={185}
            className="object-contain"
          />
        </div>
      </div>

      {/* 드롭다운 섹션 */}
      <div className="flex items-center px-4 py-4">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="inline-flex items-center justify-end rounded-full border-[3px] border-[#76d3ff] bg-white py-1 pr-4 pl-[35px] hover:bg-gray-50"
          >
            <div className="font-jalnan text-[15px] leading-[140%] text-[#76d2fe]">
              {selectedStore?.storeName || '눈농이네'}
            </div>
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            >
              <path d="M15 18.75L8.75 12.5H21.25L15 18.75Z" fill="#77D3FF" />
            </svg>
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-10 mt-2 w-full min-w-[200px] rounded-lg border border-gray-200 bg-white shadow-lg">
              {/* 가게 추가 버튼 */}
              <button
                onClick={() => {
                  setIsStoreRegisterModalOpen(true)
                  setIsDropdownOpen(false)
                }}
                className="w-full border-b border-gray-100 px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="font-jalnan text-[15px] text-[#76d2fe]">
                  + 가게 추가
                </div>
              </button>

              {/* 가게 목록 */}
              {displayStores.map(store => (
                <button
                  key={store.storeId}
                  onClick={() => handleStoreSelect(store)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 ${
                    selectedStore?.storeId === store.storeId
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  <div className="font-jalnan text-[15px]">
                    {store.storeName}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 메인 카드 그리드 - 언발란스 레이아웃 */}
      <div className="mx-auto flex max-w-4xl gap-4 px-4 pb-8">
        {/* 왼쪽 열 */}
        <div className="flex flex-1 flex-col gap-4">
          {/* 매출 캘린더 (왼쪽 위) */}
          <Link
            href={`/owner/calendar?storeId=${selectedStore?.storeId || -1}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase() || 'ssafy'}`}
            className="relative flex h-[249px] w-full flex-col justify-start rounded-[20px] bg-white p-4 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="font-jalnan text-xl leading-[140%] text-black">
              매출 캘린더
            </div>
            <div className="absolute right-4 bottom-4 h-[120px] w-[120px]">
              <Image
                src="/dashboard/calendar.svg"
                alt="매출 캘린더"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </Link>

          {/* QR 인식 (왼쪽 아래) */}
          <Link
            href={`/owner/scan?storeId=${selectedStore?.storeId || -1}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase() || 'ssafy'}`}
            className="relative flex h-[233px] w-full flex-col justify-start rounded-[20px] bg-white p-4 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="font-jalnan text-xl leading-[140%] text-black">
              QR 인식
            </div>
            <div className="absolute right-4 bottom-4 h-[120px] w-[120px]">
              <Image
                src="/dashboard/QR.svg"
                alt="QR 인식"
                width={120}
                height={120}
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* 오른쪽 열 */}
        <div className="flex flex-1 flex-col gap-4">
          {/* 매장 관리 (오른쪽 위) */}
          <Link
            href={`/owner/manage?storeId=${selectedStore?.storeId || -1}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase() || 'ssafy'}`}
            className="relative flex h-[301px] w-full flex-col justify-start rounded-[20px] bg-white p-4 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="font-jalnan text-xl leading-[140%] text-black">
              매장 관리
            </div>
            <div className="absolute right-4 bottom-4 h-[80px] w-[80px]">
              <Image
                src="/dashboard/management.svg"
                alt="매장 관리"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          </Link>

          {/* 알림 (오른쪽 아래) */}
          <Link
            href={`/owner/notification?storeId=${selectedStore?.storeId || -1}&accountName=${selectedStore?.storeName?.replace(/\s+/g, '').toLowerCase() || 'ssafy'}`}
            className="relative flex h-[185px] w-full flex-col justify-start rounded-[20px] bg-white p-4 shadow-lg transition-shadow hover:shadow-xl"
          >
            <div className="font-jalnan text-xl leading-[140%] text-black">
              알림
            </div>
            <div className="absolute right-4 bottom-4 h-[80px] w-[80px]">
              <Image
                src="/dashboard/notification.svg"
                alt="알림"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            {unreadCount > 0 && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* 매장 등록 모달 */}
      <StoreRegisterModal
        isOpen={isStoreRegisterModalOpen}
        onClose={() => setIsStoreRegisterModalOpen(false)}
      />
    </div>
  )
}
