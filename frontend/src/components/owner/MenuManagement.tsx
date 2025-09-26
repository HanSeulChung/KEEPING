'use client'

import apiClient from '@/api/axios'
import { deleteAllMenus, deleteMenu } from '@/api/menuApi'
import { useMenuManagement } from '@/hooks/useMenuManagement'
import { useEffect, useState } from 'react'

interface MenuManagementProps {
  storeId: string
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
}

export default function MenuManagement({ storeId }: MenuManagementProps) {
  const [showMenuAddModal, setShowMenuAddModal] = useState(false)
  const [addMethod, setAddMethod] = useState<
    'ocr' | 'manual' | 'category' | null
  >(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [ocrImage, setOcrImage] = useState<File | null>(null)
  const [ocrResults, setOcrResults] = useState<MenuData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualMenu, setManualMenu] = useState<MenuData>({
    name: '',
    description: '',
    price: 0,
    categoryId: 0,
  })

  const { menus, loading, error, fetchMenus, addMenu, removeMenu, clearError } =
    useMenuManagement()

  // 컴포넌트 마운트 시 메뉴 목록 조회
  useEffect(() => {
    if (storeId) {
      fetchMenus(parseInt(storeId))
      fetchCategories()
    }
  }, [storeId, fetchMenus])

  // 개별 메뉴 삭제
  const handleDeleteMenu = async (menuId: number, menuName: string) => {
    const confirmMessage = `'${menuName}' 메뉴를 삭제하시겠습니까?`

    if (confirm(confirmMessage)) {
      try {
        const response = await deleteMenu(parseInt(storeId), menuId)

        if (response.success) {
          alert('메뉴가 삭제되었습니다.')
          fetchMenus(parseInt(storeId)) // 메뉴 목록 새로고침
        } else {
          alert(`메뉴 삭제 실패: ${response.message}`)
        }
      } catch (error: any) {
        console.error('메뉴 삭제 실패:', error)
        alert('메뉴 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  // 전체 메뉴 삭제
  const handleDeleteAllMenus = async () => {
    if (menus.length === 0) {
      alert('삭제할 메뉴가 없습니다.')
      return
    }

    const confirmMessage = `정말로 모든 메뉴(${menus.length}개)를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`

    if (confirm(confirmMessage)) {
      try {
        const response = await deleteAllMenus(parseInt(storeId))

        if (response.success) {
          alert('모든 메뉴가 삭제되었습니다.')
          fetchMenus(parseInt(storeId)) // 메뉴 목록 새로고침
        } else {
          alert(`전체 메뉴 삭제 실패: ${response.message}`)
        }
      } catch (error: any) {
        console.error('전체 메뉴 삭제 실패:', error)
        alert('전체 메뉴 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  // 카테고리 삭제
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
          fetchMenus(parseInt(storeId)) // 메뉴 목록도 새로고침
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

  // 카테고리 목록 로드
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

  // 카테고리 생성
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

  // OCR 업로드 처리
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

  // OCR 결과 변경
  const handleOcrResultChange = (
    index: number,
    field: keyof MenuData,
    value: string | number
  ) => {
    const updated = [...ocrResults]
    updated[index] = { ...updated[index], [field]: value }
    setOcrResults(updated)
  }

  // 수동 메뉴 추가
  const handleManualSubmit = async () => {
    if (!manualMenu.name || !manualMenu.name.trim() || !manualMenu.categoryId) {
      alert('메뉴명과 카테고리는 필수입니다.')
      return
    }

    try {
      const selectedCategory = categories.find(
        cat => cat.categoryId === manualMenu.categoryId
      )
      if (!selectedCategory) {
        alert('선택된 카테고리를 찾을 수 없습니다.')
        return
      }

      const success = await addMenu(parseInt(storeId), {
        menuName: manualMenu.name.trim(),
        categoryId: manualMenu.categoryId,
        price: manualMenu.price || 0,
        description: manualMenu.description || '',
        storeId: parseInt(storeId),
      })

      if (success) {
        alert('메뉴가 추가되었습니다.')
        setShowMenuAddModal(false)
        setAddMethod(null)
        setManualMenu({ name: '', description: '', price: 0, categoryId: 0 })
      } else {
        alert('메뉴 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  // OCR 결과 저장
  const handleOcrSubmit = async () => {
    const invalidMenus = ocrResults.filter(menu => !menu.categoryId)
    if (invalidMenus.length > 0) {
      alert('모든 메뉴에 카테고리를 선택해주세요.')
      return
    }

    try {
      let successCount = 0
      let failCount = 0

      for (const menu of ocrResults) {
        try {
          if (!menu.name || !menu.name.trim()) {
            failCount++
            continue
          }

          const formData = new FormData()
          formData.append('name', menu.name.trim())
          formData.append('categoryId', (menu.categoryId || 0).toString())
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
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          failCount++
        }
      }

      if (successCount > 0) {
        alert(
          `${successCount}개의 메뉴가 추가되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`
        )
        setShowMenuAddModal(false)
        setAddMethod(null)
        setOcrResults([])
        setOcrImage(null)
        fetchMenus(parseInt(storeId))
      } else {
        alert('모든 메뉴 추가에 실패했습니다.')
      }
    } catch (error) {
      console.error('메뉴 추가 실패:', error)
      alert('메뉴 추가에 실패했습니다.')
    }
  }

  const handleRemoveMenu = async (id: number) => {
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

  const handleEditMenu = (id: number) => {
    // 메뉴 수정 기능은 추후 구현
    alert('메뉴 수정 기능은 준비 중입니다.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="font-['nanumsquare'] text-lg">메뉴 로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-4 text-red-500">{error}</div>
        <button
          onClick={clearError}
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 메뉴 관리 버튼들 */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {menus.length > 0 && (
            <button
              onClick={handleDeleteAllMenus}
              className="rounded-lg border border-red-500 px-6 py-3 font-['nanumsquare'] font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              전체 메뉴 삭제
            </button>
          )}
        </div>
        <button
          onClick={() => setShowMenuAddModal(true)}
          className="rounded-lg bg-black px-6 py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800"
        >
          메뉴 추가
        </button>
      </div>

      {/* 메뉴 목록 */}
      <div className="space-y-4">
        {menus.map(item => (
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
                    {(item.price || 0).toLocaleString()}원
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
                    onClick={() => handleRemoveMenu(item.id)}
                    className="rounded bg-red-50 px-3 py-1 font-['Inter'] text-xs text-red-500 transition-colors hover:bg-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 메뉴가 없을 때 */}
      {menus.length === 0 && (
        <div className="py-12 text-center">
          <p className="mb-4 text-gray-500">등록된 메뉴가 없습니다.</p>
          <button
            onClick={() => setShowMenuAddModal(true)}
            className="rounded-lg bg-black px-6 py-3 font-['nanumsquare'] font-bold text-white"
          >
            첫 번째 메뉴 추가하기
          </button>
        </div>
      )}

      {/* 메뉴 추가 모달 */}
      {showMenuAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-['Tenada'] text-lg font-extrabold text-black">
                메뉴 추가
              </h3>
              <button
                onClick={() => {
                  setShowMenuAddModal(false)
                  setAddMethod(null)
                }}
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
                      onKeyPress={e =>
                        e.key === 'Enter' && handleCreateCategory()
                      }
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
                        정보를 확인하고 수정하세요
                      </p>
                    </div>

                    <div className="max-h-64 space-y-3 overflow-y-auto">
                      {ocrResults.map((menu, index) => (
                        <div
                          key={index}
                          className="rounded border border-gray-200 p-3"
                        >
                          <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setShowMenuAddModal(false)
                      setAddMethod(null)
                    }}
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
      )}
    </div>
  )
}
