import { StoreRequestDto } from '@/api/storeApi';
import { useStoreManagement } from '@/hooks/useStoreManagement';
import React, { useCallback, useEffect, useState } from 'react';

interface StoreRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const StoreRegisterModal = ({ isOpen, onClose, onSuccess }: StoreRegisterModalProps) => {
  const { loading, error, createNewStore, clearError } = useStoreManagement()
  const [formData, setFormData] = useState<StoreRequestDto>({
    storeName: '',
    description: '',
    address: '',
    phoneNumber: '',
    category: '',
    taxIdNumber: '109-81-72945',
    bankAccount: '',
    imgFile: new File([''], 'placeholder.txt', { type: 'text/plain' }) // 임시 파일
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [addressData, setAddressData] = useState({
    zipCode: '',
    address: '',
    detailAddress: ''
  })

  // 클라이언트 사이드에서만 실행되도록 설정
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleReset = useCallback(() => {
    setFormData({
      storeName: '',
      description: '',
      address: '',
      phoneNumber: '',
      category: '',
      taxIdNumber: '109-81-72945',
      bankAccount: '',
      imgFile: new File([''], 'placeholder.txt', { type: 'text/plain' })
    })
    setSelectedImage(null)
    setAddressData({
      zipCode: '',
      address: '',
      detailAddress: ''
    })
  }, [])

  // 모달이 열릴 때 폼 초기화 (클라이언트에서만 실행)
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      handleReset()
    }
  }, [isOpen, handleReset])

  if (!isOpen) return null

  const handleInputChange = (field: keyof StoreRequestDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 주소 검색 함수
  const handleAddressSearch = () => {
    if (typeof window !== 'undefined' && (window as any).daum) {
      new (window as any).daum.Postcode({
        oncomplete: function(data: any) {
          // 우편번호와 주소 정보를 해당 필드에 넣는다.
          setAddressData(prev => ({
            ...prev,
            zipCode: data.zonecode,
            address: data.address
          }))
          
          // formData의 address도 업데이트
          setFormData(prev => ({
            ...prev,
            address: `${data.address} ${prev.address.split(' ').slice(1).join(' ')}`.trim()
          }))
        }
      }).open()
    }
  }

  // 상세주소 변경 핸들러
  const handleDetailAddressChange = (value: string) => {
    setAddressData(prev => ({
      ...prev,
      detailAddress: value
    }))
    
    // 전체 주소를 formData에 업데이트
    const fullAddress = addressData.address ? `${addressData.address} ${value}`.trim() : value
    setFormData(prev => ({
      ...prev,
      address: fullAddress
    }))
  }

  // 이미지 삭제 핸들러
  const handleImageRemove = () => {
    setSelectedImage(null)
    setFormData(prev => ({
      ...prev,
      imgFile: new File([''], 'placeholder.txt', { type: 'text/plain' })
    }))
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedImage(file)
      setFormData(prev => ({
        ...prev,
        imgFile: file
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedImage) {
      alert('이미지를 먼저 선택해주세요.')
      return
    }
    
    if (!formData.storeName || !formData.description || !formData.address || !formData.phoneNumber || !formData.category || !formData.bankAccount) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const result = await createNewStore(formData)
    if (result) {
      alert('가게가 성공적으로 등록되었습니다!')
      onClose()
      onSuccess?.()
      handleReset()
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
          <div className="w-full h-48 border border-gray-300 rounded-lg bg-gray-50 relative overflow-hidden group">
            {selectedImage ? (
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="미리보기"
                  className="max-w-full max-h-full object-contain rounded border border-gray-200"
                />
                {/* 마우스 호버 시 삭제 버튼 */}
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  ×
                </button>
                {/* 마우스 호버 시 교체 버튼 */}
                <label className="absolute bottom-2 right-2 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-blue-600 cursor-pointer">
                  교체
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <label className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  이미지 업로드
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          {selectedImage && (
            <div className="mt-2 text-sm text-gray-600">
              선택된 이미지: 1개 (마우스를 올리면 삭제/교체 가능)
            </div>
          )}
        </div>

        {/* 매장 이름 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              매장 이름
            </span>
          </div>
            <input 
              type="text" 
              className="w-full p-2 h-10 rounded-md border border-gray-300 text-black font-['Inter']"
              placeholder="매장 이름을 입력하세요"
              value={formData.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
            />
        </div>

        {/* 매장 번호 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              매장 번호
            </span>
          </div>
            <input 
              type="tel" 
              className="w-full p-2 h-10 rounded-md border border-gray-300 text-black font-['Inter']"
              placeholder="매장 전화번호를 입력하세요 (예: 02-1234-5678)"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            />
        </div>

        {/* 계좌번호 */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="px-4 py-2 border border-black bg-white text-black text-xs font-['nanumsquare'] font-bold rounded-lg">
              계좌번호
            </span>
          </div>
            <input 
              type="text" 
              className="w-full p-2 h-10 rounded-md border border-gray-300 text-black font-['Inter']"
              placeholder="계좌번호를 입력하세요 (예: 123-456-789012)"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
            />
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
              value={addressData.zipCode}
              readOnly
            />
            <button 
              type="button"
              onClick={handleAddressSearch}
              className="px-3 py-2 h-10 rounded-r-md bg-gray-800 text-white text-xs font-['Inter'] hover:bg-gray-700 transition-colors"
            >
              검색
            </button>
          </div>
          
          {/* 기본 주소 */}

          {/* 상세 주소 */}
          <input 
            type="text" 
            className="w-full p-2 h-10 rounded-md border border-gray-300 text-black font-['Inter']"
            placeholder="기본 주소"
            value={addressData.detailAddress}
            onChange={(e) => handleDetailAddressChange(e.target.value)}
          />
        </div>

        {/* 등록하기 버튼 */}
        <div className="flex justify-center">
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !selectedImage}
              className={`px-6 py-2 rounded text-xs font-['nanumsquare'] font-bold transition-colors ${
                loading || !selectedImage
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {loading ? '등록 중...' : !selectedImage ? '이미지를 선택해주세요' : '등록하기'}
            </button>
        </div>
      </div>
    </div>
  )
}

export default StoreRegisterModal
