'use client'

import { BaseComponentProps } from '@/types'
import { useState } from 'react'

// 메뉴 타입 정의
export interface Menu {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  category: string
  isAvailable: boolean
}

interface MangeMenuModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  menu?: Menu
  onSave: (menu: Omit<Menu, 'id'>) => void
  onDelete?: (menuId: string) => void
  mode: 'create' | 'edit'
  categories?: Array<{ id: string; name: string; order: number }>
}

export default function MangeMenuModal({
  isOpen,
  onClose,
  menu,
  onSave,
  onDelete,
  mode,
  categories = [],
  className = '',
}: MangeMenuModalProps) {
  const [formData, setFormData] = useState({
    name: menu?.name || '',
    price: menu?.price || 0,
    description: menu?.description || '',
    imageUrl: menu?.imageUrl || '',
    category: menu?.category || '',
    isAvailable: menu?.isAvailable ?? true,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = '메뉴명은 필수입니다.'
    if (formData.price <= 0) newErrors.price = '가격은 0보다 커야 합니다.'
    if (!formData.category.trim()) newErrors.category = '카테고리는 필수입니다.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSave(formData)
    onClose()
  }

  const handleDelete = () => {
    if (menu?.id && onDelete && confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      onDelete(menu.id)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div
        className={`w-full max-w-md rounded-lg bg-white p-6 shadow-lg ${className}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {mode === 'create' ? '메뉴 추가' : '메뉴 수정'}
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
          {/* 메뉴명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              메뉴명 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={`mt-1 w-full rounded border px-3 py-2 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="메뉴명을 입력하세요"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 가격 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              가격 *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={e => handleInputChange('price', Number(e.target.value))}
              className={`mt-1 w-full rounded border px-3 py-2 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
              min="0"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              카테고리 *
            </label>
            <select
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              className={`mt-1 w-full rounded border px-3 py-2 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={e => handleInputChange('description', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="메뉴 설명을 입력하세요"
              rows={3}
            />
          </div>

          {/* 이미지 URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              이미지 URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => handleInputChange('imageUrl', e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* 판매 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={e => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isAvailable" className="ml-2 text-sm text-gray-700">
              판매 중
            </label>
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
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                삭제
              </button>
            )}
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
