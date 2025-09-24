'use client'

import { useMenuManagement } from '@/hooks/useMenuManagement'
import { useStoreStore } from '@/store/useStoreStore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import apiClient from '@/api/axios'

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

  const { selectedStore } = useStoreStore()
  const [activeTab, setActiveTab] = useState<'menu' | 'charge'>('menu')
  const [showImageModal, setShowImageModal] = useState(false)
  const [showMenuAddModal, setShowMenuAddModal] = useState(false)
  const { menus, loading, error, fetchMenus, removeMenu, clearError } =
    useMenuManagement()

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
    { id: '5', discount: '5% 할인', points: '250,000 포인트', isActive: false },
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
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-4">
          <h1 className="font-['Tenada'] text-3xl font-extrabold text-black sm:text-4xl">
            {accountName || '매장'} 관리
          </h1>
          <div className="h-8 w-8">
            <svg
              width={31}
              height={31}
              viewBox="0 0 31 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.0625 28L11.5625 24C11.2917 23.8958 11.0365 23.7708 10.7969 23.625C10.5573 23.4792 10.3229 23.3229 10.0938 23.1562L6.375 24.7188L2.9375 18.7812L6.15625 16.3438C6.13542 16.1979 6.125 16.0573 6.125 15.9219V15.0781C6.125 14.9427 6.13542 14.8021 6.15625 14.6562L2.9375 12.2188L6.375 6.28125L10.0938 7.84375C10.3229 7.67708 10.5625 7.52083 10.8125 7.375C11.0625 7.22917 11.3125 7.10417 11.5625 7L12.0625 3H18.9375L19.4375 7C19.7083 7.10417 19.9635 7.22917 20.2031 7.375C20.4427 7.52083 20.6771 7.67708 20.9062 7.84375L24.625 6.28125L28.0625 12.2188L24.8438 14.6562C24.8646 14.8021 24.875 14.9427 24.875 15.0781V15.9219C24.875 16.0573 24.8542 16.1979 24.8125 16.3438L28.0312 18.7812L24.5938 24.7188L20.9062 23.1562C20.6771 23.3229 20.4375 23.4792 20.1875 23.625C19.9375 23.7708 19.6875 23.8958 19.4375 24L18.9375 28H12.0625ZM15.5625 19.875C16.7708 19.875 17.8021 19.4479 18.6562 18.5938C19.5104 17.7396 19.9375 16.7083 19.9375 15.5C19.9375 14.2917 19.5104 13.2604 18.6562 12.4062C17.8021 11.5521 16.7708 11.125 15.5625 11.125C14.3333 11.125 13.2969 11.5521 12.4531 12.4062C11.6094 13.2604 11.1875 14.2917 11.1875 15.5C11.1875 16.7083 11.6094 17.7396 12.4531 18.5938C13.2969 19.4479 14.3333 19.875 15.5625 19.875Z"
                fill="#1D1B20"
              />
            </svg>
          </div>
        </div>

        {/* 가게 이미지 (하나만) */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-48 w-full max-w-md items-center justify-center overflow-hidden border border-black bg-gray-100">
            <img
              src={selectedStore?.imgUrl || '/default-store-image.jpg'}
              alt={selectedStore?.storeName || '가게 이미지'}
              className="h-full w-full object-cover"
              onError={e => {
                // 이미지 로드 실패 시 기본 배경으로 대체
                e.currentTarget.style.display = 'none'
                e.currentTarget.parentElement!.innerHTML = `
                  <div class="flex h-full w-full items-center justify-center">
                    <span class="font-['nanumsquare'] text-gray-500 text-center">
                      ${selectedStore?.storeName || '가게'}<br/>이미지
                    </span>
                  </div>
                `
              }}
            />
          </div>
        </div>

        {/* 가게 이미지 변경하기 버튼 */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowImageModal(true)}
            className="border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold transition-colors hover:bg-gray-50"
          >
            가게 이미지 변경하기
          </button>
        </div>

        {/* 하단 아이콘들 */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('charge')}
            className={`flex items-center gap-2 ${
              activeTab === 'charge' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9.5"
                cy="9.25586"
                r="7.5"
                fill={activeTab === 'charge' ? '#FFDB69' : 'white'}
                stroke="black"
              />
              <path
                d="M12.5 2.25586C12.5 2.25586 8.3247 3.16111 6.17521 4.8372C3.93077 6.58733 2.01267 10.6457 2.01267 10.6457"
                stroke="black"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-['nanumsquare'] text-xs font-extrabold text-black">
              충전 금액
            </span>
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 ${
              activeTab === 'menu' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9.19653"
                cy="9.25586"
                r="7.5"
                fill={activeTab === 'menu' ? '#FFDB69' : 'white'}
                stroke="black"
              />
              <path
                d="M12.1965 2.25586C12.1965 2.25586 8.02123 3.16111 5.87174 4.8372C3.6273 6.58733 1.70921 10.6457 1.70921 10.6457"
                stroke="black"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-['nanumsquare'] text-xs font-extrabold text-black">
              메뉴
            </span>
          </button>
          {activeTab === 'menu' && (
            <button
              onClick={() => setShowMenuAddModal(true)}
              className="border border-black bg-white px-4 py-2 font-['nanumsquare'] text-sm transition-colors hover:bg-gray-50"
            >
              +
            </button>
          )}
        </div>

        {/* 충전금액 탭별 액션 버튼 */}
        {activeTab === 'charge' && (
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => {
                // TODO: 충전금액 설정 변경 기능 구현
                console.log('충전금액 설정 변경')
                alert('충전금액 설정 변경 기능은 준비 중입니다.')
              }}
              className="border border-black bg-white px-4 py-2 font-['nanumsquare'] text-sm transition-colors hover:bg-gray-50"
            >
              변경하기
            </button>
          </div>
        )}

        {/* 메뉴 탭 내용 */}
        {activeTab === 'menu' && (
          <div className="mb-6 space-y-4">
            {loading ? (
              <div className="py-8 text-center">
                <div className="font-['nanumsquare'] text-lg">
                  메뉴를 불러오는 중...
                </div>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <div className="mb-4 font-['nanumsquare'] text-red-500">
                  {error}
                </div>
                <button
                  onClick={() => {
                    clearError()
                    if (storeId) fetchMenus(parseInt(storeId))
                  }}
                  className="rounded bg-gray-800 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                >
                  다시 시도
                </button>
              </div>
            ) : menus.length === 0 ? (
              <div className="py-8 text-center">
                <div className="font-['nanumsquare'] text-gray-500">
                  등록된 메뉴가 없습니다
                </div>
              </div>
            ) : (
              menus.map(item => (
                <div key={item.id} className="border border-black p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 font-['nanumsquare'] text-lg text-black">
                        {item.name}
                      </h3>
                      <p className="mb-4 font-['nanumsquare'] text-sm text-gray-600">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="font-['nanumsquare'] text-lg font-bold text-black">
                          {item.price.toLocaleString()}원
                        </span>
                        <span className="rounded bg-gray-100 px-2 py-1 font-['nanumsquare'] text-sm text-gray-500">
                          {item.category}
                        </span>
                        <button
                          onClick={() => handleEditMenu(item.id)}
                          className="rounded bg-gray-100 px-3 py-1 font-['Inter'] text-xs text-black transition-colors hover:bg-gray-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id)}
                          className="rounded bg-red-50 px-3 py-1 font-['Inter'] text-xs text-red-500 transition-colors hover:bg-red-100"
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
          <div className="mb-6 space-y-4">
            {discountTiers.map(tier => (
              <div
                key={tier.id}
                className={`border border-black p-4 ${
                  tier.isActive ? 'bg-yellow-50' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-['nanumsquare'] text-sm font-bold text-red-500">
                      {tier.discount}
                    </span>
                    <span className="font-['nanumsquare'] text-sm font-bold text-black">
                      {tier.points}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 수정하기 버튼 */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-black py-3 text-center text-white">
            <span className="font-['nanumsquare'] text-sm font-extrabold">
              수정하기
            </span>
          </div>
        </div>

        {/* 메뉴 추가 모달 */}
        {showMenuAddModal && <MenuAddModal onClose={() => setShowMenuAddModal(false)} storeId={storeId} />}

        {/* 이미지 변경 모달 */}
        {showImageModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-['Tenada'] text-lg font-extrabold text-black">
                  가게 이미지 변경
                </h3>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <div className="flex h-48 w-full items-center justify-center border border-dashed border-gray-300 bg-gray-50">
                  <label className="cursor-pointer rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black transition-colors hover:bg-gray-100">
                    이미지 선택
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // TODO: 이미지 업로드 처리
                          console.log('선택된 파일:', file)
                          alert('이미지 업로드 기능은 준비 중입니다.')
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImageModal(false)}
                  className="rounded bg-gray-200 px-4 py-2 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-300"
                >
                  취소
                </button>
                <button className="rounded bg-black px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-gray-800">
                  변경하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 메뉴 추가 모달 컴포넌트
type MenuAddModalProps = {
  onClose: () => void
  storeId: string | null
}

type Category = {
  id: number
  name: string
  storeId: number
}

type MenuData = {
  name: string
  description: string
  price: number
  categoryId: number
  categoryName?: string
}

const MenuAddModal = ({ onClose, storeId }: MenuAddModalProps) => {
  const [addMethod, setAddMethod] = useState<'ocr' | 'manual' | 'category' | null>(null)
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [ocrResults, setOcrResults] = useState<MenuData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [manualMenu, setManualMenu] = useState<MenuData>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0
  })

  // 카테고리 목록 로드
  useEffect(() => {
    if (storeId) {
      fetchCategories()
    }
  }, [storeId])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(`/owners/stores/${storeId}/menus/categories`)
      if (response.data.success) {
        setCategories(response.data.data || [])
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('카테고리 이름을 입력하세요.')
      return
    }

    try {
      const response = await apiClient.post(`/owners/stores/${storeId}/menus/categories`, {
        categoryName: newCategoryName,
        parentId: null  // 최상위 카테고리로 생성 (백엔드는 null 사용)
      })

      console.log('응답 상태:', response.status)
      console.log('응답 데이터:', response.data)

      if (response.data.success) {
        const newCategory: Category = {
          id: response.data.data.categoryId,
          name: response.data.data.categoryName,
          storeId: response.data.data.storeId
        }
        setCategories([...categories, newCategory])
        setNewCategoryName('')
        alert('카테고리가 생성되었습니다.')
      } else {
        throw new Error(response.data.message || '카테고리 생성 실패')
      }
    } catch (error) {
      console.error('카테고리 생성 실패:', error)
      alert(`카테고리 생성에 실패했습니다: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleOcrUpload = async (file: File) => {
    setOcrImage(file)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // OCR API 호출
      const response = await fetch('/api/ocr/menu', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()

        if (result.success) {
          const ocrMenus: MenuData[] = result.data.items.map((item: any) => ({
            name: item.nameKr,
            description: item.description || '',
            price: item.price,
            categoryId: 0, // 기본값, 사용자가 선택해야 함
            categoryName: ''
          }))
          setOcrResults(ocrMenus)
        } else {
          throw new Error(result.message || 'OCR 처리 실패')
        }
      } else {
        throw new Error('OCR API 호출 실패')
      }

      setIsProcessing(false)
    } catch (error) {
      console.error('OCR 처리 실패:', error)
      setIsProcessing(false)
      alert('OCR 처리에 실패했습니다.')
    }
  }

  const handleOcrResultChange = (index: number, field: keyof MenuData, value: string | number) => {
    const updated = [...ocrResults]
    updated[index] = { ...updated[index], [field]: value }
    setOcrResults(updated)
  }

  const handleManualSubmit = async () => {
    if (!manualMenu.name || !manualMenu.price || !manualMenu.categoryId) {
      alert('메뉴명, 가격, 카테고리는 필수입니다.')
      return
    }

    try {
      // 메뉴 추가 API 호출
      const response = await fetch(`/api/stores/${storeId}/menus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualMenu.name,
          description: manualMenu.description,
          price: manualMenu.price,
          categoryId: manualMenu.categoryId
        })
      })

      if (response.ok) {
        alert('메뉴가 추가되었습니다.')
        onClose()
      } else {
        throw new Error('메뉴 추가 실패')
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  const handleOcrSubmit = async () => {
    // 카테고리 선택 검증
    const invalidMenus = ocrResults.filter(menu => !menu.categoryId)
    if (invalidMenus.length > 0) {
      alert('모든 메뉴에 카테고리를 선택해주세요.')
      return
    }

    try {
      // 메뉴 일괄 추가 API 호출
      const response = await fetch(`/api/stores/${storeId}/menus/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menus: ocrResults.map(menu => ({
            name: menu.name,
            description: menu.description,
            price: menu.price,
            categoryId: menu.categoryId
          }))
        })
      })

      if (response.ok) {
        alert(`${ocrResults.length}개의 메뉴가 추가되었습니다.`)
        onClose()
      } else {
        throw new Error('메뉴 일괄 추가 실패')
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-['Tenada'] text-lg font-extrabold text-black">
            메뉴 추가
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {!addMethod && (
          <div className="space-y-4">
            {categories.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
                <p className="font-['nanumsquare'] text-center text-yellow-800">
                  메뉴를 추가하려면 먼저 카테고리를 생성해야 합니다.
                </p>
              </div>
            )}

            <p className="font-['nanumsquare'] text-center text-gray-600">
              {categories.length === 0 ? '카테고리를 먼저 생성하거나 메뉴를 추가하세요' : '메뉴를 추가하는 방법을 선택하세요'}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setAddMethod('category')}
                className="flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors hover:bg-gray-50"
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H20" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">카테고리 관리</span>
                <span className="font-['nanumsquare'] text-xs text-gray-500 text-center">
                  메뉴 카테고리를<br/>생성하고 관리
                </span>
              </button>
              <button
                onClick={() => categories.length > 0 ? setAddMethod('ocr') : alert('카테고리를 먼저 생성하세요.')}
                className={`flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors ${categories.length > 0 ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">OCR 스캔</span>
                <span className="font-['nanumsquare'] text-xs text-gray-500 text-center">
                  메뉴판 사진을 촬영하여<br/>자동으로 메뉴 정보 추출
                </span>
              </button>
              <button
                onClick={() => categories.length > 0 ? setAddMethod('manual') : alert('카테고리를 먼저 생성하세요.')}
                className={`flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors ${categories.length > 0 ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V20M20 12H4" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">수동 등록</span>
                <span className="font-['nanumsquare'] text-xs text-gray-500 text-center">
                  메뉴 정보를 직접 입력하여<br/>하나씩 등록
                </span>
              </button>
            </div>
          </div>
        )}

        {addMethod === 'category' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">카테고리 관리</h4>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="새 카테고리 이름"
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                />
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-black text-white rounded font-['nanumsquare'] text-sm font-bold hover:bg-gray-800"
                >
                  추가
                </button>
              </div>

              <div className="space-y-2">
                <h5 className="font-['nanumsquare'] text-sm font-bold text-gray-700">현재 카테고리 ({categories.length}개)</h5>
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-sm font-['nanumsquare'] py-4 text-center">
                    등록된 카테고리가 없습니다
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <span className="font-['nanumsquare'] text-sm">{category.name}</span>
                        <button
                          onClick={() => {
                            // TODO: 카테고리 삭제 API
                            if (confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
                              setCategories(categories.filter(c => c.id !== category.id))
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {addMethod === 'ocr' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">OCR 스캔</h4>
            </div>

            {!ocrImage && (
              <div className="flex h-48 w-full items-center justify-center border border-dashed border-gray-300 bg-gray-50">
                <label className="cursor-pointer rounded-lg border border-black bg-white px-4 py-2 font-['nanumsquare'] text-xs font-bold text-black transition-colors hover:bg-gray-100">
                  메뉴판 사진 선택
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleOcrUpload(file)
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {ocrImage && isProcessing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="font-['nanumsquare'] text-gray-600">메뉴 정보를 인식하는 중...</p>
              </div>
            )}

            {ocrResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-['nanumsquare'] text-md font-bold">인식된 메뉴 ({ocrResults.length}개)</h5>
                  <p className="font-['nanumsquare'] text-xs text-gray-500">정보를 확인하고 수정하세요</p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {ocrResults.map((menu, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-['nanumsquare'] text-xs text-gray-600 mb-1">메뉴명</label>
                          <input
                            type="text"
                            value={menu.name}
                            onChange={e => handleOcrResultChange(index, 'name', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-['nanumsquare'] text-xs text-gray-600 mb-1">가격</label>
                          <input
                            type="number"
                            value={menu.price}
                            onChange={e => handleOcrResultChange(index, 'price', parseInt(e.target.value) || 0)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-['nanumsquare'] text-xs text-gray-600 mb-1">카테고리 *</label>
                          <select
                            value={menu.categoryId || ''}
                            onChange={e => handleOcrResultChange(index, 'categoryId', parseInt(e.target.value))}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          >
                            <option value="">카테고리 선택</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-['nanumsquare'] text-xs text-gray-600 mb-1">설명</label>
                          <input
                            type="text"
                            value={menu.description}
                            onChange={e => handleOcrResultChange(index, 'description', e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setOcrImage(null)
                      setOcrResults([])
                    }}
                    className="rounded bg-gray-200 px-4 py-2 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-300"
                  >
                    다시 스캔
                  </button>
                  <button
                    onClick={handleOcrSubmit}
                    className="rounded bg-black px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-gray-800"
                  >
                    메뉴 추가
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {addMethod === 'manual' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">수동 등록</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-['nanumsquare'] text-sm font-bold text-gray-700 mb-2">
                  메뉴명 *
                </label>
                <input
                  type="text"
                  value={manualMenu.name}
                  onChange={e => setManualMenu({...manualMenu, name: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="메뉴명을 입력하세요"
                />
              </div>

              <div>
                <label className="block font-['nanumsquare'] text-sm font-bold text-gray-700 mb-2">
                  가격 *
                </label>
                <input
                  type="number"
                  value={manualMenu.price || ''}
                  onChange={e => setManualMenu({...manualMenu, price: parseInt(e.target.value) || 0})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="가격을 입력하세요"
                />
              </div>

              <div>
                <label className="block font-['nanumsquare'] text-sm font-bold text-gray-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={manualMenu.categoryId || ''}
                  onChange={e => setManualMenu({...manualMenu, categoryId: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['nanumsquare'] text-sm font-bold text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={manualMenu.description}
                  onChange={e => setManualMenu({...manualMenu, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2 h-20 resize-none"
                  placeholder="메뉴 설명을 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="rounded bg-gray-200 px-4 py-2 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleManualSubmit}
                className="rounded bg-black px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-gray-800"
              >
                메뉴 추가
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreManage
