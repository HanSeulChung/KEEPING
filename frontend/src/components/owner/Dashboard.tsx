'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

type Store = {
  id: string
  name: string
}

interface OwnerHomeProps {
  // 현재 선택 매장
  currentStore?: Store
  // 내 매장 목록
  stores?: Store[]
  // 읽지 않은 알림 개수
  unreadCount?: number
}

export default function OwnerHome({
  currentStore,
  stores: initialStores,
  unreadCount: initialUnreadCount,
}: OwnerHomeProps) {
  const router = useRouter()
  const { isLoggedIn, user } = useAuthStore()
  const [selected, setSelected] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>(initialStores || [])
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount || 0)
  const [loading, setLoading] = useState(true)

  // 인증 상태 확인
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/owner/login')
      return
    }
  }, [isLoggedIn, router])

  // API 호출 함수들
  const fetchOwnerStores = async () => {
    try {
      const response = await fetch('/api/owners/stores?ownerId=2')
      if (response.ok) {
        const data = await response.json()
        const storeList = data.map((store: any) => ({
          id: store.id,
          name: store.name
        }))
        setStores(storeList)
        
        // 첫 번째 매장을 기본 선택으로 설정
        if (storeList.length > 0 && !selected) {
          setSelected(storeList[0])
        }
      }
    } catch (error) {
      console.error('매장 목록 조회 실패:', error)
    }
  }

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/unread-count?ownerId=2')
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('알림 개수 조회 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (!isLoggedIn) return
    
    const loadData = async () => {
      await Promise.all([
        fetchOwnerStores(),
        fetchUnreadNotifications()
      ])
      setLoading(false)
    }
    loadData()
  }, [isLoggedIn])

  // currentStore가 있으면 그것을 선택
  useEffect(() => {
    if (currentStore && !selected) {
      setSelected(currentStore)
    }
  }, [currentStore, selected])

  // 로그인하지 않은 경우 로딩 화면 표시 (리다이렉트 중)
  if (!isLoggedIn) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">로그인 페이지로 이동 중...</div>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* 상단: 매장 선택 pill + 추가 */}
      <section className="flex items-center gap-3">
        <div className="flex gap-3 overflow-x-auto pb-1">
          {stores.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={[
                'h-12 min-w-12 rounded-full border px-4 text-sm font-medium',
                selected?.id === s.id
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
              ].join(' ')}
              aria-pressed={selected?.id === s.id}
            >
              {s.name}
            </button>
          ))}

          {/* 매장 추가(+) */}
          <Link
            href="/owner/stores/new"
            className="flex h-12 min-w-12 items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50"
            aria-label="매장 추가"
          >
            <span className="text-2xl leading-none">＋</span>
          </Link>
        </div>
      </section>

      {/* 페이지 타이틀 */}
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
        {selected?.name || '매장을 선택해주세요'}
      </h1>

      {/* 카드 그리드 */}
      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 매출 캘린더 */}
        <Link
          href="/owner/calendar"
          className="group rounded-xl border border-gray-300 bg-white p-5 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-bold">
              매출
              <br />
              캘린더 &gt;
            </h2>
          </div>
          <div className="mt-5 space-y-1 text-sm text-gray-600">
            <p>전체 선결제 금액</p>
            <p>이번 달 선결제 금액</p>
          </div>
        </Link>

        {/* 매장 관리 */}
        <Link
          href="/owner/manage"
          className="group rounded-xl border border-gray-300 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="text-lg font-bold">매장 관리</h2>
        </Link>

        {/* 설정 */}
        <Link
          href="/owner/settings"
          className="group rounded-xl border border-gray-300 bg-gray-50 p-5 hover:shadow-sm"
        >
          <h2 className="text-lg font-bold">설정</h2>
        </Link>

        {/* QR 인식하기 */}
        <Link
          href="/owner/scan"
          className="group rounded-xl border border-gray-300 bg-white p-5 hover:shadow-sm"
        >
          <h2 className="text-lg font-bold">QR 인식하기</h2>
          <p className="mt-3 text-sm text-gray-600">
            손님의 QR을 인식합니다.
            <br />
            (카메라로 QR 코드 스캔)
          </p>
        </Link>

        {/* 알림 */}
        <Link
          href="/owner/notifications"
          className="group rounded-xl border border-gray-300 bg-white p-5 hover:shadow-sm md:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">알림</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border px-2">
                {unreadCount}
              </span>
              <span className="text-gray-600">읽지 않은 알림</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">3건</p>
        </Link>
      </section>
    </main>
  )
}
