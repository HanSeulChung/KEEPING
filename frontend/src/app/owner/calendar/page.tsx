'use client'

import Calendar from '@/components/owner/Calendar'
import { useAuthStore } from '@/store/useAuthStore'
import { useStoreStore } from '@/store/useStoreStore'
import { useEffect } from 'react'

export default function Page() {
  const { user, isLoggedIn, initializeAuth, fetchCurrentUser } = useAuthStore()
  const { 
    stores, 
    selectedStore, 
    selectedStoreId, 
    loading, 
    fetchStores, 
    setSelectedStoreById 
  } = useStoreStore()

  // 인증 상태 초기화
  useEffect(() => {
    initializeAuth()
    if (!user && isLoggedIn) {
      fetchCurrentUser()
    }
  }, [])

  // 가게 목록 가져오기
  useEffect(() => {
    if (isLoggedIn && stores.length === 0) {
      fetchStores()
    }
  }, [isLoggedIn, stores.length, fetchStores])

  if (loading) {
    return (
      <div className="bg-keeping-beige flex min-h-screen items-center justify-center">
        <div className="font-['nanumsquare'] text-lg">
          가게 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="bg-keeping-beige flex min-h-screen items-center justify-center">
        <div className="font-['nanumsquare'] text-lg">
          등록된 가게가 없습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-keeping-beige min-h-screen">
      <Calendar
        storeId={selectedStoreId || ''}
        stores={stores}
        onStoreChange={setSelectedStoreById}
      />
    </div>
  )
}
