'use client'

import { useState, useEffect } from 'react'
import { Menu } from './MangeMenuModal'
import MangeMenuModal from './MangeMenuModal'
import { apiConfig, endpoints } from '../../api/config'

// 할인/포인트 설정 타입
interface DiscountPoint {
  id: string
  points: number
  discount: number
}

// 매장 정보 타입
interface StoreInfo {
  id: string
  name: string
  images: string[]
}

interface StoreManagePageProps {
  store?: StoreInfo
}

export default function StoreManagePage({ 
  store
}: StoreManagePageProps) {
  const [activeTab, setActiveTab] = useState<'charge' | 'menu'>('charge')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>()
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [menus, setMenus] = useState<Menu[]>([])
  const [discountPoints, setDiscountPoints] = useState<DiscountPoint[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categoryModalMode, setCategoryModalMode] = useState<'create' | 'edit'>('create')

  // API 호출 함수들
  const fetchStoreMenus = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/menus`)
      if (response.ok) {
        const data = await response.json()
        setMenus(data)
      }
    } catch (error) {
      console.error('메뉴 조회 실패:', error)
    }
  }

  const fetchStoreInfo = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}`)
      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('매장 정보 조회 실패:', error)
    }
  }

  const fetchDiscountPoints = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/discount-points`)
      if (response.ok) {
        const data = await response.json()
        setDiscountPoints(data)
      }
    } catch (error) {
      console.error('할인/포인트 설정 조회 실패:', error)
    }
  }

  const fetchCategories = async (storeId: string) => {
    try {
      const response = await fetch(`/api/stores/${storeId}/menus/categories`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('카테고리 조회 실패:', error)
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      if (store?.id) {
        await Promise.all([
          fetchStoreMenus(store.id),
          fetchDiscountPoints(store.id),
          fetchCategories(store.id)
        ])
      }
      setLoading(false)
    }
    loadData()
  }, [store?.id])

  const handleMenuEdit = (menu: Menu) => {
    setSelectedMenu(menu)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleMenuDelete = async (menuId: string) => {
    if (!store?.id) return

    try {
      const response = await fetch(`/api/stores/${store.id}/menus/${menuId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setMenus(prev => prev.filter(menu => menu.id !== menuId))
      }
    } catch (error) {
      console.error('메뉴 삭제 실패:', error)
    }
  }

  const handleMenuSave = async (menuData: Omit<Menu, 'id'>) => {
    if (!store?.id) return

    try {
      if (modalMode === 'create') {
        const response = await fetch(`/api/stores/${store.id}/menus`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(menuData),
        })
        if (response.ok) {
          const newMenu = await response.json()
          setMenus(prev => [...prev, newMenu])
        }
      } else if (selectedMenu) {
        const response = await fetch(`/api/stores/${store.id}/menus/${selectedMenu.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(menuData),
        })
        if (response.ok) {
          const updatedMenu = await response.json()
          setMenus(prev => prev.map(menu => 
            menu.id === selectedMenu.id ? updatedMenu : menu
          ))
        }
      }
    } catch (error) {
      console.error('메뉴 저장 실패:', error)
    }
  }

  const handleAddMenu = () => {
    setSelectedMenu(undefined)
    setModalMode('create')
    setIsModalOpen(true)
  }

  // 카테고리 관리 함수들
  const handleCategoryEdit = (category: any) => {
    setSelectedCategory(category)
    setCategoryModalMode('edit')
    setIsCategoryModalOpen(true)
  }

  const handleCategoryDelete = async (categoryId: string) => {
    if (!store?.id) return

    try {
      const response = await fetch(`/api/stores/${store.id}/menus/categories/${categoryId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCategories(prev => prev.filter(category => category.id !== categoryId))
        // 해당 카테고리의 메뉴들도 제거
        setMenus(prev => prev.filter(menu => menu.category !== categories.find(c => c.id === categoryId)?.name))
      }
    } catch (error) {
      console.error('카테고리 삭제 실패:', error)
    }
  }

  const handleCategorySave = async (categoryData: { name: string; order: number }) => {
    if (!store?.id) return

    try {
      if (categoryModalMode === 'create') {
        const response = await fetch(`/api/stores/${store.id}/menus/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })
        if (response.ok) {
          const newCategory = await response.json()
          setCategories(prev => [...prev, newCategory])
        }
      } else if (selectedCategory) {
        const response = await fetch(`/api/stores/${store.id}/menus/categories/${selectedCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })
        if (response.ok) {
          const updatedCategory = await response.json()
          setCategories(prev => prev.map(category => 
            category.id === selectedCategory.id ? updatedCategory : category
          ))
        }
      }
    } catch (error) {
      console.error('카테고리 저장 실패:', error)
    }
  }

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setCategoryModalMode('create')
    setIsCategoryModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">로딩 중...</div>
          </div>
        ) : (
          <>
            {/* 매장 제목 */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">{store?.name || '매장'} 매장 관리</h2>
            </div>

        {/* 사진 변경 버튼 */}
        <button className="mb-6 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          사진 변경하기
        </button>

        {/* 이미지 갤러리 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {store?.images?.map((image, index) => (
            <div key={index} className="aspect-[3/2] bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src={image} 
                alt={`매장 이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          )) || (
            <div className="col-span-3 text-center text-gray-500 py-8">
              이미지가 없습니다.
            </div>
          )}
        </div>

        {/* 탭 선택 */}
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tab"
              checked={activeTab === 'charge'}
              onChange={() => setActiveTab('charge')}
              className="w-4 h-4"
            />
            <span className="text-sm">충전 금액</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tab"
              checked={activeTab === 'menu'}
              onChange={() => setActiveTab('menu')}
              className="w-4 h-4"
            />
            <span className="text-sm">메뉴</span>
          </label>
        </div>

        {/* 충전 금액 탭 */}
        {activeTab === 'charge' && (
          <div className="space-y-3">
            {discountPoints.map((item, index) => (
              <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{item.discount}% 할인</span>
                  <span className="text-sm text-gray-600">{item.points.toLocaleString()} 포인트</span>
                </div>
                {index === 0 && (
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    변경하기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 메뉴 탭 */}
        {activeTab === 'menu' && (
          <div className="space-y-4">
            {/* 카테고리 필터 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-1">
                  <button className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm whitespace-nowrap">
                    {category.name}
                  </button>
                  <button
                    onClick={() => handleCategoryEdit(category)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    title="카테고리 수정"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleCategoryDelete(category.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="카테고리 삭제"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button 
                onClick={handleAddCategory}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm whitespace-nowrap flex items-center gap-1"
              >
                <span>+</span>
                <span>카테고리 추가</span>
              </button>
              <button 
                onClick={handleAddMenu}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm whitespace-nowrap flex items-center gap-1"
              >
                <span>+</span>
                <span>메뉴 추가</span>
              </button>
            </div>

            {/* 메뉴 리스트 */}
            <div className="space-y-3">
              {menus.map((menu) => (
                <div key={menu.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-lg">{menu.name}</h3>
                    <span className="text-lg font-bold">{menu.price.toLocaleString()}원</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{menu.description}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMenuEdit(menu)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleMenuDelete(menu.id)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {/* 하단 수정 버튼 */}
            <div className="mt-8">
              <button className="w-full py-3 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900">
                수정하기
              </button>
            </div>
          </>
        )}
      </main>

      {/* 메뉴 모달 */}
      <MangeMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        menu={selectedMenu}
        onSave={handleMenuSave}
        onDelete={handleMenuDelete}
        mode={modalMode}
        categories={categories}
      />

      {/* 카테고리 모달 */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={selectedCategory}
        onSave={handleCategorySave}
        mode={categoryModalMode}
      />
    </div>
  )
}

// 카테고리 모달 컴포넌트
interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: any
  onSave: (data: { name: string; order: number }) => void
  mode: 'create' | 'edit'
}

function CategoryModal({ isOpen, onClose, category, onSave, mode }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    order: category?.order || 1,
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.name.trim()) newErrors.name = '카테고리명은 필수입니다.'
    if (formData.order < 1) newErrors.order = '순서는 1 이상이어야 합니다.'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? '카테고리 추가' : '카테고리 수정'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 카테고리명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              카테고리명 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`mt-1 w-full rounded border px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="카테고리명을 입력하세요"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 순서 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              순서 *
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', Number(e.target.value))}
              className={`mt-1 w-full rounded border px-3 py-2 ${
                errors.order ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
              min="1"
            />
            {errors.order && (
              <p className="mt-1 text-sm text-red-500">{errors.order}</p>
            )}
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 rounded bg-gray-800 px-4 py-2 text-white hover:bg-gray-900"
            >
              {mode === 'create' ? '추가' : '수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
