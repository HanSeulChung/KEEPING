'use client'

import { useEffect, useState } from 'react'
import Calendar from '@/components/owner/Calendar'
import { useAuthStore } from '@/store/useAuthStore'
import { endpoints } from '@/api/config'

interface Store {
  id: string
  name: string
  ownerId: string
  address: string
  phone: string
  description: string
}

export default function Page() {
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // 사장님의 가게 리스트 가져오기
  useEffect(() => {
    const fetchStores = async () => {
      try {
        // 현재는 mock 데이터에서 ownerId='2'로 설정되어 있음
        // 실제로는 user.id를 사용해야 함
        const ownerId = user?.id || '2'
        const endpoint = endpoints.stores.ownerStores.replace('{ownerId}', ownerId)
        const response = await fetch(`/api${endpoint}`)
        
        if (response.ok) {
          const storeList = await response.json()
          setStores(storeList)
          
          // 첫 번째 가게를 기본 선택
          if (storeList.length > 0) {
            setSelectedStoreId(storeList[0].id)
          }
        }
      } catch (error) {
        console.error('가게 리스트 조회 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-keeping-beige flex items-center justify-center">
        <div className="text-lg font-['nanumsquare']">가게 정보를 불러오는 중...</div>
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-keeping-beige flex items-center justify-center">
        <div className="text-lg font-['nanumsquare']">등록된 가게가 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-keeping-beige">
      <Calendar storeId={selectedStoreId} stores={stores} onStoreChange={setSelectedStoreId} />
    </div>
  )
}
