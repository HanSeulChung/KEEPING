'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useMenuManagement } from '@/hooks/useMenuManagement'
import { MenuResponseDto } from '@/api/menuApi'

type DiscountTier = {
  id: string
  discount: string
  points: string
  isActive: boolean
}

const StoreManage = () => {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName')
  
  const [activeTab, setActiveTab] = useState<'menu' | 'charge'>('menu')
  const { 
    menus, 
    loading, 
    error, 
    fetchMenus, 
    removeMenu, 
    clearError 
  } = useMenuManagement()
  
  // 컴포넌트 마운트 시 메뉴 목록 조회
  useEffect(() => {
    if (storeId) {
      fetchMenus(parseInt(storeId))
    }
  }, [storeId, fetchMenus])

  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([
    { id: '1', discount: '5% 할인', points: '50,000 포인트', isActive: true },
    { id: '2', discount: '5% 할인', points: '100,000 포인트', isActive: false },
    { id: '3', discount: '5% 할인', points: '150,000 포인트', isActive: false },
    { id: '4', discount: '5% 할인', points: '200,000 포인트', isActive: false },
    { id: '5', discount: '5% 할인', points: '250,000 포인트', isActive: false }
  ])

  const handleEditMenu = (id: number) => {
    console.log('메뉴 수정:', id)
    // TODO: 메뉴 수정 모달 구현
  }

  const handleDeleteMenu = async (id: number) => {
    if (!storeId) {
      alert('매장 정보가 없습니다.')
      return
    }
    
    if (confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      const success = await removeMenu(parseInt(storeId), id)
      if (success) {
        alert('메뉴가 삭제되었습니다.')
      } else {
        alert('메뉴 삭제에 실패했습니다.')
      }
    }
  }

  const handleChangeDiscount = (id: string) => {
    console.log('할인 설정 변경:', id)
  }

  return (
    <div className="min-h-screen bg-white">
      
      {/* 페이지 제목 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-['Tenada'] font-extrabold text-black">
            {accountName || '매장'} 관리
          </h1>
          <div className="w-8 h-8">
            <svg width={31} height={31} viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.0625 28L11.5625 24C11.2917 23.8958 11.0365 23.7708 10.7969 23.625C10.5573 23.4792 10.3229 23.3229 10.0938 23.1562L6.375 24.7188L2.9375 18.7812L6.15625 16.3438C6.13542 16.1979 6.125 16.0573 6.125 15.9219V15.0781C6.125 14.9427 6.13542 14.8021 6.15625 14.6562L2.9375 12.2188L6.375 6.28125L10.0938 7.84375C10.3229 7.67708 10.5625 7.52083 10.8125 7.375C11.0625 7.22917 11.3125 7.10417 11.5625 7L12.0625 3H18.9375L19.4375 7C19.7083 7.10417 19.9635 7.22917 20.2031 7.375C20.4427 7.52083 20.6771 7.67708 20.9062 7.84375L24.625 6.28125L28.0625 12.2188L24.8438 14.6562C24.8646 14.8021 24.875 14.9427 24.875 15.0781V15.9219C24.875 16.0573 24.8542 16.1979 24.8125 16.3438L28.0312 18.7812L24.5938 24.7188L20.9062 23.1562C20.6771 23.3229 20.4375 23.4792 20.1875 23.625C19.9375 23.7708 19.6875 23.8958 19.4375 24L18.9375 28H12.0625ZM15.5625 19.875C16.7708 19.875 17.8021 19.4479 18.6562 18.5938C19.5104 17.7396 19.9375 16.7083 19.9375 15.5C19.9375 14.2917 19.5104 13.2604 18.6562 12.4062C17.8021 11.5521 16.7708 11.125 15.5625 11.125C14.3333 11.125 13.2969 11.5521 12.4531 12.4062C11.6094 13.2604 11.1875 14.2917 11.1875 15.5C11.1875 16.7083 11.6094 17.7396 12.4531 18.5938C13.2969 19.4479 14.3333 19.875 15.5625 19.875Z" fill="#1D1B20" />
            </svg>
          </div>
        </div>

        {/* 이미지 갤러리 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="w-full h-48 border border-black bg-gray-100 flex items-center justify-center"
            >
              <span className="text-gray-500 font-['nanumsquare']">이미지 {index}</span>
            </div>
          ))}
        </div>

        {/* 수정하기 버튼 */}
        <div className="w-full bg-black text-white py-3 text-center mb-6">
          <span className="text-sm font-['nanumsquare'] font-extrabold">
            수정하기
          </span>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 border border-black text-sm font-['nanumsquare'] transition-colors ${
              activeTab === 'menu' 
                ? 'bg-gray-200 text-black' 
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            식사
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 border border-black text-sm font-['nanumsquare'] transition-colors ${
              activeTab === 'menu' 
                ? 'bg-gray-200 text-black' 
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            식사
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 border border-black text-sm font-['nanumsquare'] transition-colors ${
              activeTab === 'menu' 
                ? 'bg-gray-200 text-black' 
                : 'bg-white text-black hover:bg-gray-50'
            }`}
          >
            도미코스
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className="px-4 py-2 border border-black bg-white text-sm font-['nanumsquare'] hover:bg-gray-50 transition-colors"
          >
            +
          </button>
        </div>

        {/* 메뉴 탭 내용 */}
        {activeTab === 'menu' && (
          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg font-['nanumsquare']">메뉴를 불러오는 중...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 font-['nanumsquare'] mb-4">{error}</div>
                <button
                  onClick={() => {
                    clearError()
                    if (storeId) fetchMenus(parseInt(storeId))
                  }}
                  className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  다시 시도
                </button>
              </div>
            ) : menus.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 font-['nanumsquare']">등록된 메뉴가 없습니다</div>
              </div>
            ) : (
              menus.map((item) => (
                <div key={item.id} className="border border-black p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-['nanumsquare'] text-black mb-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 font-['nanumsquare'] text-sm mb-4">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-['nanumsquare'] font-bold text-black">
                          {item.price.toLocaleString()}원
                        </span>
                        <span className="text-sm font-['nanumsquare'] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item.category}
                        </span>
                        <button
                          onClick={() => handleEditMenu(item.id)}
                          className="px-3 py-1 text-xs font-['Inter'] bg-gray-100 text-black rounded hover:bg-gray-200 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id)}
                          className="px-3 py-1 text-xs font-['Inter'] bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 충전금액 탭 내용 */}
        {activeTab === 'charge' && (
          <div className="space-y-4 mb-6">
            {discountTiers.map((tier) => (
              <div
                key={tier.id}
                className={`border border-black p-4 ${
                  tier.isActive ? 'bg-yellow-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-['nanumsquare'] font-bold text-red-500">
                      {tier.discount}
                    </span>
                    <span className="text-sm font-['nanumsquare'] font-bold text-black">
                      {tier.points}
                    </span>
                  </div>
                  {tier.isActive && (
                    <button
                      onClick={() => handleChangeDiscount(tier.id)}
                      className="px-4 py-2 border border-black bg-white text-xs font-['nanumsquare'] font-bold hover:bg-gray-50 transition-colors"
                    >
                      변경하기
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 하단 아이콘들 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab('charge')}
            className={`flex items-center gap-2 ${
              activeTab === 'charge' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9.5" cy="9.25586" r="7.5" fill="white" stroke="black" />
              <path d="M12.5 2.25586C12.5 2.25586 8.3247 3.16111 6.17521 4.8372C3.93077 6.58733 2.01267 10.6457 2.01267 10.6457" stroke="black" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-['nanumsquare'] font-extrabold text-black">
              충전 금액
            </span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 ${
              activeTab === 'menu' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9.19653" cy="9.25586" r="7.5" fill="#FFDB69" stroke="black" />
              <path d="M12.1965 2.25586C12.1965 2.25586 8.02123 3.16111 5.87174 4.8372C3.6273 6.58733 1.70921 10.6457 1.70921 10.6457" stroke="black" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-['nanumsquare'] font-extrabold text-black">
              메뉴
            </span>
          </button>
        </div>

        {/* 사진 변경하기 버튼 */}
        <div className="flex justify-center">
          <button className="px-4 py-2 border border-black bg-white text-xs font-['nanumsquare'] font-bold hover:bg-gray-50 transition-colors">
            사진 변경하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreManage
