'use client'

import apiClient from '@/api/axios'
import { MenuResponseDto } from '@/api/menuApi'
import { useMenuManagement } from '@/hooks/useMenuManagement'
import { useStoreStore } from '@/store/useStoreStore'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChargeBonusManagement from './ChargeBonusManagement'
import ImageUploadModal from './ImageUploadModal'

type DiscountTier = {
  id: string
  discount: string
  points: string
  isActive: boolean
}

type Category = {
  categoryId: number
  categoryName: string
  storeId: number
  parentId?: number
  displayOrder?: number
  createdAt?: string
}

type MenuData = {
  name: string
  description: string
  price: number
  categoryId?: number
  category?: string
  categoryName?: string
  imgFile?: File | null
}

const StoreManage = () => {
  const searchParams = useSearchParams()
  const storeId = searchParams.get('storeId')
  const accountName = searchParams.get('accountName') ? decodeURIComponent(searchParams.get('accountName') as string) : null

  const { selectedStore } = useStoreStore()
  const [activeTab, setActiveTab] = useState<'menu' | 'charge'>('menu')
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [showMenuAddModal, setShowMenuAddModal] = useState(false)
  const [showMenuEditModal, setShowMenuEditModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<any>(null)
  const { menus, loading, error, fetchMenus, addMenu, removeMenu, clearError } =
    useMenuManagement()

  // 찜 개수 상태
  const [favoriteCount, setFavoriteCount] = useState<number>(0)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // 찜 개수 조회 함수
  const fetchFavoriteCount = async (storeId: number) => {
    try {
      setFavoriteLoading(true)
      const response = await apiClient.get(
        `/favorites/owner/stores/${storeId}/count`
      )

      if (response.data.success) {
        setFavoriteCount(response.data.data.favoriteCount || 0)
      }
    } catch (error: any) {
      console.error('찜 개수 조회 실패:', error)
      setFavoriteCount(0)
    } finally {
      setFavoriteLoading(false)
    }
  }

  // 컴포넌트 마운트 시 메뉴 목록, 찜 개수 조회
  useEffect(() => {
    if (storeId) {
      fetchMenus(parseInt(storeId))
      fetchFavoriteCount(parseInt(storeId))
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
    const menuToEdit = menus.find(menu => menu.menuId === id)
    if (menuToEdit) {
      setEditingMenu(menuToEdit)
      setShowMenuEditModal(true)
    }
  }

  const handleDeleteMenu = async (id: number, menuName: string) => {
    if (!storeId) {
      alert('매장 정보가 없습니다.')
      return
    }

    if (confirm(`'${menuName}' 메뉴를 삭제하시겠습니까?`)) {
      const success = await removeMenu(parseInt(storeId), id)
      if (success) {
        alert('메뉴가 삭제되었습니다.')
      } else {
        alert('메뉴 삭제에 실패했습니다.')
      }
    }
  }

  // 이미지 업로드 처리
  const handleImageUpload = async () => {
    if (!selectedImage || !storeId) {
      alert('이미지를 선택해주세요.')
      return
    }

    setIsImageUploading(true)
    try {
      console.log('이미지 업로드:', selectedImage)
      alert('이미지 업로드가 완료되었습니다.')
      setShowImageModal(false)
      setSelectedImage(null)
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsImageUploading(false)
    }
  }

  if (!storeId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-500">매장 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-4">
          <h1 className="font-['Tenada'] text-3xl font-extrabold text-black sm:text-4xl">
            {accountName || selectedStore?.storeName || '매장'} 관리
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

        {/* 가게 이미지 */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-48 w-full max-w-md items-center justify-center overflow-hidden border border-black bg-gray-100">
            <img
              src={selectedStore?.imgUrl || '/owner.png'}
              alt={selectedStore?.storeName || '가게 이미지'}
              className="h-full w-full object-cover"
              onError={e => {
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

        {/* 매장 정보 */}
        <div className="mb-6 flex justify-center">
          {/* 매장 기본 정보 */}
          <div className="border border-black bg-white p-4">
            <h3 className="mb-3 font-['nanumsquare'] text-lg font-bold text-black">
              매장 정보
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-['nanumsquare'] text-sm text-gray-600">
                  매장명
                </span>
                <span className="font-['nanumsquare'] text-sm font-medium">
                  {selectedStore?.storeName || '정보 없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['nanumsquare'] text-sm text-gray-600">
                  카테고리
                </span>
                <span className="font-['nanumsquare'] text-sm font-medium">
                  {selectedStore?.category || '정보 없음'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['nanumsquare'] text-sm text-gray-600">
                  등록 메뉴
                </span>
                <span className="font-['nanumsquare'] text-sm font-medium">
                  {menus.length}개
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['nanumsquare'] text-sm text-gray-600">
                  찜 개수
                </span>
                <span className="font-['nanumsquare'] text-sm font-medium text-red-500">
                  {favoriteLoading
                    ? '로딩...'
                    : `${favoriteCount.toLocaleString()}개`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['nanumsquare'] text-sm text-gray-600">
                  운영 상태
                </span>
                <span className="font-['nanumsquare'] text-sm font-medium text-green-600">
                  운영중
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 아이콘들 */}
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
                <div key={item.menuId} className="border border-black p-4">
                  <div className="flex items-center gap-4">
                    {/* 이미지 */}
                    {item.imgUrl ? (
                      <img 
                        src={item.imgUrl} 
                        alt={item.menuName}
                        className="h-20 w-20 object-cover rounded border border-gray-300 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded border border-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-400 text-xs">이미지 없음</span>
                      </div>
                    )}
                    
                    {/* 메뉴명과 카테고리 */}
                    <div className="flex-1">
                      <h3 className="font-['nanumsquare'] text-lg text-black mb-1">
                        {item.menuName}
                      </h3>
                      <span className="rounded bg-gray-100 px-2 py-1 font-['nanumsquare'] text-sm text-gray-500">
                        {item.categoryName}
                      </span>
                    </div>
                    
                    {/* 버튼들 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMenu(item.menuId)}
                        className="rounded bg-gray-100 px-3 py-1 font-['Inter'] text-xs text-black transition-colors hover:bg-gray-200"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(item.menuId, item.menuName)}
                        className="rounded bg-red-50 px-3 py-1 font-['Inter'] text-xs text-red-500 transition-colors hover:bg-red-100"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 충전금액 탭 내용 */}
        {activeTab === 'charge' && <ChargeBonusManagement storeId={storeId} />}
      </div>

      {/* 메뉴 추가 모달 */}
      {showMenuAddModal && (
        <MenuAddModal
          onClose={() => setShowMenuAddModal(false)}
          storeId={storeId}
          addMenu={addMenu}
          fetchMenus={() => fetchMenus(parseInt(storeId!))}
        />
      )}

      {/* 메뉴 수정 모달 */}
      {showMenuEditModal && editingMenu && (
        <MenuEditModal
          onClose={() => {
            setShowMenuEditModal(false)
            setEditingMenu(null)
          }}
          storeId={storeId}
          menu={editingMenu}
          onUpdate={() => {
            if (storeId) {
              fetchMenus(parseInt(storeId))
            }
          }}
        />
      )}

      {/* 이미지 업로드 모달 */}
      <ImageUploadModal
        showModal={showImageModal}
        selectedImage={selectedImage}
        isUploading={isImageUploading}
        onImageSelect={setSelectedImage}
        onUpload={handleImageUpload}
        onClose={() => setShowImageModal(false)}
      />
    </div>
  )
}

// 메뉴 추가 모달 Props 타입
type MenuAddModalProps = {
  onClose: () => void
  storeId: string | null
  addMenu: (storeId: number, menuData: any) => Promise<boolean>
  fetchMenus: () => void
}

const MenuAddModal = ({
  onClose,
  storeId,
  addMenu,
  fetchMenus,
}: MenuAddModalProps) => {
  const [addMethod, setAddMethod] = useState<
    'ocr' | 'manual' | 'category' | null
  >(null)
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [ocrResults, setOcrResults] = useState<MenuData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [manualMenu, setManualMenu] = useState<MenuData>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
    imgFile: null,
  })

  // 카테고리 목록 로드
  useEffect(() => {
    if (storeId) {
      fetchCategories()
    }
  }, [storeId])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(
        `/stores/${storeId}/menus/categories`
      )
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
      const response = await apiClient.post(
        `/owners/stores/${storeId}/menus/categories`,
        {
          categoryName: newCategoryName,
          parentId: null,
        }
      )

      if (response.data.success) {
        const newCategory: Category = {
          categoryId: response.data.data.categoryId,
          categoryName: response.data.data.categoryName,
          storeId: response.data.data.storeId,
        }
        setCategories([...categories, newCategory])
        setNewCategoryName('')
        alert('카테고리가 생성되었습니다.')
      } else {
        throw new Error(response.data.message || '카테고리 생성 실패')
      }
    } catch (error: any) {
      console.error('카테고리 생성 실패:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '알 수 없는 오류가 발생했습니다.'
      alert(`카테고리 생성에 실패했습니다: ${errorMessage}`)
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    const categoryToDelete = categories.find(
      cat => cat.categoryId === categoryId
    )
    const confirmMessage = categoryToDelete
      ? `'${categoryToDelete.categoryName}' 카테고리를 삭제하시겠습니까?\n\n주의: 이 카테고리에 속한 메뉴들도 함께 영향을 받을 수 있습니다.`
      : '정말로 이 카테고리를 삭제하시겠습니까?'

    if (confirm(confirmMessage)) {
      try {
        const response = await apiClient.delete(
          `/owners/stores/${storeId}/menus/categories/${categoryId}`
        )

        if (response.data.success) {
          alert('카테고리가 삭제되었습니다.')
          fetchCategories()
          fetchMenus()
        } else {
          alert('카테고리 삭제에 실패했습니다.')
        }
      } catch (error: any) {
        console.error('카테고리 삭제 실패:', error)
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          '알 수 없는 오류가 발생했습니다.'
        alert(`카테고리 삭제에 실패했습니다: ${errorMessage}`)
      }
    }
  }

  const handleOcrUpload = async (file: File) => {
    setOcrImage(file)
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr/menu', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const ocrMenus: MenuData[] = result.data.items.map((item: any) => ({
            name: item.nameKr,
            description: item.description || '',
            price: item.price,
            categoryId: 0,
            categoryName: '',
          }))
          setOcrResults(ocrMenus)
        } else {
          throw new Error(result.message || 'OCR 처리 실패')
        }
      } else {
        throw new Error('OCR API 호출 실패')
      }
    } catch (error) {
      console.error('OCR 처리 실패:', error)
      alert('OCR 처리에 실패했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOcrResultChange = (
    index: number,
    field: keyof MenuData,
    value: string | number | File | undefined
  ) => {
    const updated = [...ocrResults]
    updated[index] = { ...updated[index], [field]: value }
    setOcrResults(updated)
  }

  const handleManualSubmit = async () => {
    if (
      !manualMenu.name ||
      !manualMenu.name.trim() ||
      !manualMenu.categoryId
    ) {
      alert('메뉴명과 카테고리는 필수입니다.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('menuName', manualMenu.name.trim())
      formData.append('categoryId', manualMenu.categoryId.toString())
      if (manualMenu.imgFile) {
        formData.append('imgFile', manualMenu.imgFile)
      }
      if (manualMenu.price)
        formData.append('price', manualMenu.price.toString())
      if (manualMenu.description)
        formData.append('description', manualMenu.description)

      const response = await apiClient.post(
        `/owners/stores/${storeId}/menus`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (response.data.success) {
        alert('메뉴가 추가되었습니다.')
        fetchMenus()
        onClose()
      } else {
        alert('메뉴 추가에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  const handleOcrSubmit = async (menu: MenuData, index: number) => {
    if (!menu.categoryId || !menu.imgFile) {
      alert('카테고리와 이미지는 필수입니다.')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', menu.name.trim())
      formData.append('categoryId', menu.categoryId.toString())
      formData.append('imgFile', menu.imgFile)
      if (menu.price) formData.append('price', menu.price.toString())
      if (menu.description) formData.append('description', menu.description)

      const response = await apiClient.post(
        `/owners/stores/${storeId}/menus`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (response.data.success) {
        alert('메뉴가 추가되었습니다.')
        // 해당 메뉴를 OCR 결과에서 제거
        const updated = ocrResults.filter((_, i) => i !== index)
        setOcrResults(updated)
        fetchMenus()

        // 모든 메뉴가 등록되면 모달 닫기
        if (updated.length === 0) {
          onClose()
        }
      } else {
        alert('메뉴 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
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
              <div className="mb-4 rounded border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-center font-['nanumsquare'] text-yellow-800">
                  메뉴를 추가하려면 먼저 카테고리를 생성해야 합니다.
                </p>
              </div>
            )}

            <p className="text-center font-['nanumsquare'] text-gray-600">
              {categories.length === 0
                ? '카테고리를 먼저 생성하거나 메뉴를 추가하세요'
                : '메뉴를 추가하는 방법을 선택하세요'}
            </p>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setAddMethod('category')}
                className="flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors hover:bg-gray-50"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">
                  카테고리 관리
                </span>
                <span className="text-center font-['nanumsquare'] text-xs text-gray-500">
                  메뉴 카테고리를
                  <br />
                  생성하고 관리
                </span>
              </button>
              <button
                onClick={() =>
                  categories.length > 0
                    ? setAddMethod('ocr')
                    : alert('카테고리를 먼저 생성하세요.')
                }
                className={`flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors ${categories.length > 0 ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'}`}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">
                  OCR 스캔
                </span>
                <span className="text-center font-['nanumsquare'] text-xs text-gray-500">
                  메뉴판 사진을 촬영하여
                  <br />
                  자동으로 메뉴 정보 추출
                </span>
              </button>
              <button
                onClick={() =>
                  categories.length > 0
                    ? setAddMethod('manual')
                    : alert('카테고리를 먼저 생성하세요.')
                }
                className={`flex flex-col items-center gap-3 rounded-lg border border-black p-6 transition-colors ${categories.length > 0 ? 'hover:bg-gray-50' : 'cursor-not-allowed opacity-50'}`}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 4V20M20 12H4"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-['nanumsquare'] text-sm font-bold">
                  수동 등록
                </span>
                <span className="text-center font-['nanumsquare'] text-xs text-gray-500">
                  메뉴 정보를 직접 입력하여
                  <br />
                  하나씩 등록
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 카테고리 관리 */}
        {addMethod === 'category' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">
                카테고리 관리
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="새 카테고리 이름"
                  className="flex-1 rounded border border-gray-300 px-3 py-2"
                  onKeyPress={e => e.key === 'Enter' && handleCreateCategory()}
                />
                <button
                  onClick={handleCreateCategory}
                  className="rounded bg-black px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white hover:bg-gray-800"
                >
                  추가
                </button>
              </div>
              <div className="space-y-2">
                <h5 className="font-['nanumsquare'] text-sm font-bold text-gray-700">
                  현재 카테고리 ({categories.length}개)
                </h5>
                {categories.length === 0 ? (
                  <p className="py-4 text-center font-['nanumsquare'] text-sm text-gray-500">
                    등록된 카테고리가 없습니다
                  </p>
                ) : (
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {categories.map(category => (
                      <div
                        key={category.categoryId}
                        className="flex items-center justify-between rounded border border-gray-200 p-2"
                      >
                        <span className="font-['nanumsquare'] text-sm">
                          {category.categoryName}
                        </span>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.categoryId)
                          }
                          className="rounded px-2 py-1 font-['nanumsquare'] text-xs text-red-500 transition-colors hover:bg-red-50"
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

        {/* OCR 스캔 */}
        {addMethod === 'ocr' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">
                OCR 스캔
              </h4>
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
                        // 파일 크기 검증 (1MB = 1048576 bytes)
                        const maxFileSize = 1048576 // 1MB
                        if (file.size > maxFileSize) {
                          alert('이미지 파일 크기는 1MB 이하여야 합니다.\n현재 파일 크기: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB')
                          // 파일 입력 초기화
                          e.target.value = ''
                          return
                        }
                        handleOcrUpload(file)
                      }
                    }}
                  />
                </label>
              </div>
            )}

            {isProcessing && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-black"></div>
                <p className="font-['nanumsquare'] text-gray-600">
                  메뉴 정보를 인식하는 중...
                </p>
              </div>
            )}

            {ocrResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-md font-['nanumsquare'] font-bold">
                    인식된 메뉴 ({ocrResults.length}개)
                  </h5>
                  <p className="font-['nanumsquare'] text-xs text-gray-500">
                    각 메뉴를 개별로 등록하세요
                  </p>
                </div>
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {ocrResults.map((menu, index) => (
                    <div
                      key={index}
                      className="rounded border border-gray-200 p-3"
                    >
                      <div className="mb-3 grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block font-['nanumsquare'] text-xs text-gray-600">
                            메뉴명
                          </label>
                          <input
                            type="text"
                            value={menu.name}
                            onChange={e =>
                              handleOcrResultChange(
                                index,
                                'name',
                                e.target.value
                              )
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-['nanumsquare'] text-xs text-gray-600">
                            가격
                          </label>
                          <input
                            type="number"
                            value={menu.price}
                            onChange={e =>
                              handleOcrResultChange(
                                index,
                                'price',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block font-['nanumsquare'] text-xs text-gray-600">
                            카테고리 *
                          </label>
                          <select
                            value={menu.categoryId || ''}
                            onChange={e =>
                              handleOcrResultChange(
                                index,
                                'categoryId',
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          >
                            <option value="">카테고리 선택</option>
                            {categories.map(cat => (
                              <option
                                key={cat.categoryId}
                                value={cat.categoryId}
                              >
                                {cat.categoryName}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block font-['nanumsquare'] text-xs text-gray-600">
                            설명
                          </label>
                          <input
                            type="text"
                            value={menu.description}
                            onChange={e =>
                              handleOcrResultChange(
                                index,
                                'description',
                                e.target.value
                              )
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block font-['nanumsquare'] text-xs text-gray-600">
                          이미지 *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                              // 파일 크기 검증 (1MB = 1048576 bytes)
                              const maxFileSize = 1048576 // 1MB
                              if (file.size > maxFileSize) {
                                alert('이미지 파일 크기는 1MB 이하여야 합니다.\n현재 파일 크기: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB')
                                // 파일 입력 초기화
                                e.target.value = ''
                                return
                              }
                            }
                            handleOcrResultChange(index, 'imgFile', file)
                          }}
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleOcrSubmit(menu, index)}
                          className="rounded bg-black px-3 py-1 font-['nanumsquare'] text-xs font-bold text-white transition-colors hover:bg-gray-800"
                        >
                          이 메뉴 등록
                        </button>
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* 수동 등록 */}
        {addMethod === 'manual' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMethod(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 뒤로
              </button>
              <h4 className="font-['nanumsquare'] text-lg font-bold">
                수동 등록
              </h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
                  메뉴명 *
                </label>
                <input
                  type="text"
                  value={manualMenu.name}
                  onChange={e =>
                    setManualMenu({ ...manualMenu, name: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="메뉴명을 입력하세요"
                />
              </div>
              <div>
                <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
                  가격
                </label>
                <input
                  type="number"
                  value={manualMenu.price || ''}
                  onChange={e =>
                    setManualMenu({
                      ...manualMenu,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  placeholder="가격을 입력하세요"
                />
              </div>
              <div>
                <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
                  카테고리 *
                </label>
                <select
                  value={manualMenu.categoryId || ''}
                  onChange={e =>
                    setManualMenu({
                      ...manualMenu,
                      categoryId: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option value="">카테고리를 선택하세요</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
                  설명
                </label>
                <textarea
                  value={manualMenu.description}
                  onChange={e =>
                    setManualMenu({
                      ...manualMenu,
                      description: e.target.value,
                    })
                  }
                  className="h-20 w-full resize-none rounded border border-gray-300 px-3 py-2"
                  placeholder="메뉴 설명을 입력하세요"
                />
              </div>
              <div>
                <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
                  이미지 *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // 파일 크기 검증 (1MB = 1048576 bytes)
                      const maxFileSize = 1048576 // 1MB
                      if (file.size > maxFileSize) {
                        alert('이미지 파일 크기는 1MB 이하여야 합니다.\n현재 파일 크기: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB')
                        // 파일 입력 초기화
                        e.target.value = ''
                        return
                      }
                    }
                    setManualMenu({ ...manualMenu, imgFile: file || null })
                  }}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
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

// 메뉴 수정 모달 Props 타입
type MenuEditModalProps = {
  onClose: () => void
  storeId: string | null
  menu: MenuResponseDto
  onUpdate: () => void
}

const MenuEditModal = ({
  onClose,
  storeId,
  menu,
  onUpdate,
}: MenuEditModalProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [editedMenu, setEditedMenu] = useState({
    menuName: menu.menuName || '',
    categoryId: menu.categoryId || 0,
    price: 0, // 백엔드에서 price 필드가 없으므로 기본값 사용
    description: menu.description || '',
    imgFile: null as File | null,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (storeId) {
      fetchCategories()
    }
  }, [storeId])

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get(
        `/stores/${storeId}/menus/categories`
      )
      if (response.data.success) {
        setCategories(response.data.data || [])
        const currentCategory = response.data.data.find(
          (cat: Category) => cat.categoryName === menu.categoryName
        )
        if (currentCategory) {
          setEditedMenu(prev => ({
            ...prev,
            categoryId: currentCategory.categoryId,
          }))
        }
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editedMenu.menuName.trim() || !editedMenu.categoryId) {
      alert('메뉴명과 카테고리는 필수입니다.')
      return
    }

    setIsUpdating(true)
    try {
      const formData = new FormData()
      formData.append('menuName', editedMenu.menuName.trim())
      formData.append('categoryId', editedMenu.categoryId.toString())
      if (editedMenu.price)
        formData.append('price', editedMenu.price.toString())
      if (editedMenu.description)
        formData.append('description', editedMenu.description)
      if (editedMenu.imgFile) formData.append('imgFile', editedMenu.imgFile)
      if (storeId) formData.append('storeId', storeId)

      const response = await apiClient.patch(
        `/owners/stores/${storeId}/menus/${menu.menuId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      if (response.data.success) {
        alert('메뉴가 수정되었습니다.')
        onUpdate()
        onClose()
      } else {
        throw new Error(response.data.message || '메뉴 수정 실패')
      }
    } catch (error: any) {
      console.error('메뉴 수정 실패:', error)
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        '메뉴 수정에 실패했습니다.'
      alert(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-['Tenada'] text-lg font-extrabold text-black">
            메뉴 수정
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
              메뉴명 *
            </label>
            <input
              type="text"
              value={editedMenu.menuName}
              onChange={e =>
                setEditedMenu({ ...editedMenu, menuName: e.target.value })
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="메뉴명을 입력하세요"
            />
          </div>
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
              가격
            </label>
            <input
              type="number"
              value={editedMenu.price || ''}
              onChange={e =>
                setEditedMenu({
                  ...editedMenu,
                  price: parseInt(e.target.value) || 0,
                })
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
              placeholder="가격을 입력하세요"
            />
          </div>
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
              카테고리 *
            </label>
            <select
              value={editedMenu.categoryId || ''}
              onChange={e =>
                setEditedMenu({
                  ...editedMenu,
                  categoryId: parseInt(e.target.value),
                })
              }
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
              설명
            </label>
            <textarea
              value={editedMenu.description}
              onChange={e =>
                setEditedMenu({ ...editedMenu, description: e.target.value })
              }
              className="h-20 w-full resize-none rounded border border-gray-300 px-3 py-2"
              placeholder="메뉴 설명을 입력하세요"
            />
          </div>
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-gray-700">
              이미지
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) {
                  // 파일 크기 검증 (1MB = 1048576 bytes)
                  const maxFileSize = 1048576 // 1MB
                  if (file.size > maxFileSize) {
                    alert('이미지 파일 크기는 1MB 이하여야 합니다.\n현재 파일 크기: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB')
                    // 파일 입력 초기화
                    e.target.value = ''
                    return
                  }
                }
                setEditedMenu({ ...editedMenu, imgFile: file || null })
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-6">
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 font-['nanumsquare'] text-sm font-bold transition-colors hover:bg-gray-300"
            disabled={isUpdating}
          >
            취소
          </button>
          <button
            onClick={handleUpdate}
            className="rounded bg-black px-4 py-2 font-['nanumsquare'] text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? '수정 중...' : '수정하기'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreManage
