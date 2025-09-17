'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { endpoints } from '@/api/config'
import StoreRegisterModal from './StoreRegisterModal'
import StoreInfoEditModal from './StoreInfoEditModal'

interface Store {
  id: string
  name: string
  ownerId: string
  address: string
  phone: string
  description: string
}

const OwnerMainScreen = () => {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 사장님의 가게 리스트 가져오기
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const ownerId = user?.id || '2'
        const endpoint = endpoints.stores.ownerStores.replace('{ownerId}', ownerId)
        const response = await fetch(`/api${endpoint}`)

        if (response.ok) {
          const storeList = await response.json()
          setStores(storeList)

          // 첫 번째 가게를 기본 선택
          if (storeList.length > 0) {
            setSelectedStore(storeList[0])
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg font-['nanumsquare']">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 매장명 */}
        <h1 className="text-4xl font-['Tenada'] font-extrabold text-black text-center mb-8">
          {selectedStore?.name || '매장을 선택해주세요'}
        </h1>

        {/* 가게 선택 pills */}
        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className={`w-24 h-24 rounded-full border border-black flex items-center justify-center transition-colors ${selectedStore?.id === store.id
                  ? 'bg-black text-white'
                  : 'bg-[#faf8f6] text-black hover:bg-gray-100'
                }`}
            >
              <span className="text-sm font-['Tenada'] font-extrabold text-center px-2">
                {store.name}
              </span>
            </button>
          ))}

          {/* 가게 추가 버튼 */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-24 h-24 rounded-full border border-black bg-[#faf8f6] flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <svg width={21} height={20} viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.6647 9.99805H16.3314" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.498 4.16504V15.8317" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* 매출 캘린더 */}
          <button
            onClick={() => router.push('/owner/calendar')}
            className="border border-black bg-[#faf8f6] p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-['nanumsquare'] font-extrabold text-black mb-4">
              매출 캘린더 &gt;
            </h2>
            <div className="text-sm font-['nanumsquare'] text-black">
              <p>전체 선결제 금액</p>
              <p>이번 달 선결제 금액</p>
            </div>
          </button>

          {/* QR 인식하기 */}
          <button
            onClick={() => router.push('/owner/scan')}
            className="border border-black bg-white p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-['nanumsquare'] font-extrabold text-black mb-4">
              QR 인식하기
            </h2>
            <div className="text-sm font-['nanumsquare'] text-black">
              <p>손님의 QR을 인식합니다.</p>
            </div>
          </button>

          {/* 매장 관리 */}
          <button
            onClick={() => router.push('/owner/manage')}
            className="border border-black bg-white p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-['nanumsquare'] font-extrabold text-black">
              매장 관리
            </h2>
          </button>

          {/* 설정 */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="border border-black bg-[#faf8f6] p-6 text-left hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-2xl font-['nanumsquare'] font-extrabold text-black">
              설정
            </h2>
          </button>

          {/* 알림 */}
          <button
            onClick={() => router.push('/owner/notification')}
            className="border border-black bg-white p-6 md:col-span-2 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-['nanumsquare'] font-extrabold text-black">
                알림
              </h2>
              <div className="flex items-center gap-2">
                <svg width={18} height={19} viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.55664 16.8867C7.70293 17.1401 7.91332 17.3504 8.16668 17.4967C8.42003 17.643 8.70743 17.72 8.99997 17.72C9.29252 17.72 9.57991 17.643 9.83327 17.4967C10.0866 17.3504 10.297 17.1401 10.4433 16.8867" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1.71821 12.1587C1.60935 12.278 1.53751 12.4264 1.51143 12.5858C1.48534 12.7452 1.50615 12.9088 1.5713 13.0565C1.63646 13.2043 1.74316 13.33 1.87843 13.4183C2.01369 13.5065 2.1717 13.5536 2.33321 13.5537H15.6665C15.828 13.5538 15.9861 13.5069 16.1214 13.4188C16.2568 13.3307 16.3636 13.2052 16.429 13.0575C16.4943 12.9098 16.5153 12.7463 16.4894 12.5869C16.4635 12.4275 16.3919 12.279 16.2832 12.1595C15.1749 11.017 13.9999 9.80288 13.9999 6.05371C13.9999 4.72763 13.4731 3.45586 12.5354 2.51818C11.5977 1.5805 10.326 1.05371 8.99988 1.05371C7.6738 1.05371 6.40203 1.5805 5.46435 2.51818C4.52666 3.45586 3.99988 4.72763 3.99988 6.05371C3.99988 9.80288 2.82405 11.017 1.71821 12.1587Z" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-['nanumsquare'] text-black">
            </div>
          </button>
        </div>
      </div>

      {/* 매장 등록 모달 */}
      <StoreRegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 매장 정보 수정 모달 */}
      <StoreInfoEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  )
}

export default OwnerMainScreen