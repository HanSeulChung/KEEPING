'use client'

import { notificationApi } from '@/api/notificationApi'
import { storeApi } from '@/api/storeApi'
import Header from '@/components/common/Header'
import { useAuthStore } from '@/store/useAuthStore'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Store = {
  id: string
  name: string
}

const OwnerMainScreen = () => {
  const { isLoggedIn, user } = useAuthStore()
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // API 호출 함수들
  const fetchOwnerStores = async () => {
    if (!user?.id) {
      console.log('사용자 정보가 없습니다.')
      return
    }

    try {
      const storeList = await storeApi.getOwnerStores(parseInt(String(user.id)))

      const formattedStores = storeList.map(store => ({
        id: store.id.toString(),
        name: store.name,
      }))

      setStores(formattedStores)

      // 첫 번째 매장을 기본 선택으로 설정
      if (formattedStores.length > 0 && !selectedStore) {
        setSelectedStore(formattedStores[0])
      }
    } catch (error) {
      console.error('매장 목록 조회 실패:', error)
    }
  }

  const fetchUnreadNotifications = async () => {
    if (!user?.id) {
      console.log('사용자 정보가 없습니다.')
      return
    }

    try {
      // API 함수 사용
      const count = await notificationApi.getUnreadCount(
        parseInt(String(user.id))
      )
      setUnreadCount(count)
    } catch (error) {
      console.error('알림 개수 조회 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) return

    const loadData = async () => {
      await Promise.all([fetchOwnerStores(), fetchUnreadNotifications()])
      setLoading(false)
    }
    loadData()
  }, [isLoggedIn])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex h-64 items-center justify-center">
          <div className="font-['nanumsquare'] text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* 메인 컨텐츠 */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 매장 선택 섹션 */}
        <div className="mb-8 flex flex-col items-center gap-6">
          <h1 className="text-center font-['Tenada'] text-2xl font-extrabold text-black sm:text-3xl lg:text-4xl">
            {selectedStore?.name || '매장을 선택해주세요'}
          </h1>

          {/* 매장 선택 pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {stores.map(store => (
              <button
                key={store.id}
                onClick={() => setSelectedStore(store)}
                className={`rounded-full border px-4 py-2 font-['Tenada'] text-sm font-extrabold transition-colors ${
                  selectedStore?.id === store.id
                    ? 'bg-keeping-beige border-black text-black'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {store.name}
              </button>
            ))}

            {/* 매장 추가 버튼 */}
            <Link
              href="/owner/register"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors hover:bg-gray-50"
            >
              <svg
                width={20}
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
            </Link>
          </div>
        </div>

        {/* 카드 그리드 */}
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 매출 캘린더 */}
          <Link
            href="/owner/calendar"
            className="group bg-keeping-beige border border-black p-6 transition-colors hover:bg-gray-50"
          >
            <h2 className="mb-4 font-['nanumsquare'] text-xl font-extrabold text-black sm:text-2xl">
              매출 캘린더 &gt;
            </h2>
            <div className="font-['nanumsquare'] text-sm leading-relaxed text-black sm:text-base">
              전체 선결제 금액
              <br />
              이번 달 선결제 금액
            </div>
          </Link>

          {/* QR 인식하기 */}
          <Link
            href="/owner/scan"
            className="group border border-black bg-white p-6 transition-colors hover:bg-gray-50"
          >
            <h2 className="mb-4 font-['nanumsquare'] text-xl font-extrabold text-black sm:text-2xl">
              QR 인식하기
            </h2>
            <div className="font-['nanumsquare'] text-sm leading-relaxed text-black sm:text-base">
              손님의 QR을 인식합니다.
              <br />
            </div>
          </Link>

          {/* 매장 관리 */}
          <Link
            href="/owner/manage"
            className="group border border-black bg-white p-6 transition-colors hover:bg-gray-50"
          >
            <h2 className="font-['nanumsquare'] text-xl font-extrabold text-black sm:text-2xl">
              매장 관리
            </h2>
          </Link>

          {/* 설정 */}
          <Link
            href="/owner/settings"
            className="group bg-keeping-beige border border-black p-6 transition-colors hover:bg-gray-50"
          >
            <h2 className="font-['nanumsquare'] text-xl font-extrabold text-black sm:text-2xl">
              설정
            </h2>
          </Link>

          {/* 알림 */}
          <Link
            href="/owner/notification"
            className="group border border-black bg-white p-6 transition-colors hover:bg-gray-50 sm:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-['nanumsquare'] text-xl font-extrabold text-black sm:text-2xl">
                알림
              </h2>
              <div className="flex items-center gap-2">
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
                <span className="font-['nanumsquare'] text-sm font-bold text-black">
                  {unreadCount}
                </span>
              </div>
            </div>
            <div className="font-['nanumsquare'] text-sm text-black sm:text-base">
              읽지 않은 알림
              <br />
              {unreadCount}건
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OwnerMainScreen
