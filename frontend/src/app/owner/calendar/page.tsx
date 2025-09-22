'use client'

import { endpoints } from '@/api/config'
import Calendar from '@/components/owner/Calendar'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useState } from 'react'

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
        // 실제 사용자 ID 사용
        const ownerId = user?.id
        if (!ownerId) {
          console.error('사용자 ID가 없습니다')
          setLoading(false)
          return
        }
        const endpoint = endpoints.stores.ownerStores.replace(
          '{ownerId}',
          ownerId
        )
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
        storeId={selectedStoreId}
        stores={stores}
        onStoreChange={setSelectedStoreId}
      />
    </div>
  )
}
