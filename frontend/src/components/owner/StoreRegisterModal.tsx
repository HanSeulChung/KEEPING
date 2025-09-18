import React, { useState } from 'react';
import { useStoreManagement } from '@/hooks/useStoreManagement';
import { StoreRequestDto } from '@/api/storeApi';

interface StoreRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const StoreRegisterModal = ({ isOpen, onClose, onSuccess }: StoreRegisterModalProps) => {
  const { loading, error, createNewStore, clearError } = useStoreManagement()
  const [formData, setFormData] = useState<StoreRequestDto>({
    name: '',
    description: '',
    address: '',
    phone: '',
    category: '',
    images: []
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])

  if (!isOpen) return null

  const handleInputChange = (field: keyof StoreRequestDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedImages(fileArray)
      setFormData(prev => ({
        ...prev,
        images: fileArray
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.address || !formData.phone || !formData.category) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const result = await createNewStore(formData)
    if (result) {
      alert('가게가 성공적으로 등록되었습니다!')
      onClose()
      onSuccess?.()
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        address: '',
        phone: '',
        category: '',
        images: []
      })
      setSelectedImages([])
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-['Tenada'] font-extrabold text-black">매장 등록</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 이미지 업로드 */}
        <div className="mb-6">
          <div className="w-full h-48 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
            <label className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              이미지 업로드
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
          {selectedImages.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              선택된 이미지: {selectedImages.length}개
            </div>
          )}
        </div>

        {/* 가게 소개 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              가게 소개
            </span>
          </div>
          <textarea 
            className="w-full h-20 p-2 border border-gray-300 rounded-md text-black font-['Inter']"
            placeholder="가게 소개 입력"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        {/* 업종 선택 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-gray-500 font-['Inter'] text-xs">업종</span>
          </div>
          <select 
            className="w-full p-2 h-10 rounded-md border border-gray-300 text-black font-['Inter']"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
          >
            <option value="">업종 선택</option>
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="카페">카페</option>
            <option value="디저트">디저트</option>
            <option value="기타">기타</option>
          </select>
        </div>

        {/* 주소 */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              주소
            </span>
          </div>
          
          {/* 우편번호 */}
          <div className="flex mb-2">
            <input 
              type="text" 
              className="flex-1 p-2 h-10 rounded-l-md border border-gray-300 bg-white text-gray-400 font-['Inter']"
              placeholder="우편번호"
            />
            <button className="px-3 py-2 h-10 rounded-r-md bg-gray-800 text-white text-xs font-['Inter']">
              검색
            </button>
          </div>
          
          {/* 기본 주소 */}
          <input 
            type="text" 
            className="w-full p-2 h-10 rounded-md border border-gray-300 bg-white text-gray-400 font-['Inter']"
            placeholder="기본 주소"
          />
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
          <button className="px-6 py-2 rounded bg-gray-800 text-white text-xs font-['nanumsquare'] font-bold">
            등록하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default StoreRegisterModal
