'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

const StoreRegistration = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storeDescription: '',
    businessType: '',
    postalCode: '',
    address: ''
  })
  const [errors, setErrors] = useState({
    storeDescription: false,
    businessType: false,
    postalCode: false,
    address: false
  })
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 입력 시 에러 상태 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      storeDescription: !formData.storeDescription.trim(),
      businessType: !formData.businessType.trim(),
      postalCode: !formData.postalCode || !/^\d{5}$/.test(formData.postalCode),
      address: !formData.address.trim()
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.')
      return
    }

    setIsUploading(true)

    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('image', file)
      formData.append('storeId', 'temp-store-id') // 임시 스토어 ID
      formData.append('imageIndex', '0')

      // 이미지 업로드 API 호출
      const response = await fetch('/api/stores/temp-store-id/images', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setUploadedImage(result.imageUrl)
        console.log('이미지 업로드 성공:', result.imageUrl)
      } else {
        throw new Error('이미지 업로드 실패')
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('매장 등록 데이터:', { ...formData, imageUrl: uploadedImage })
      // 등록 완료 후 대시보드로 이동
      router.push('/owner/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">

        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-black text-center font-['Tenada'] text-2xl sm:text-4xl font-extrabold leading-7 mb-2">매장 등록</h1>
          <div className="text-black text-center font-['Tenada'] text-xl sm:text-4xl font-extrabold leading-7">2/2</div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          {/* 이미지 업로드 */}
          <div className="w-full">
            <div className="flex justify-center items-center w-full h-48 rounded-lg border border-[#000000]/[.11] bg-gray-100 relative overflow-hidden">
              {uploadedImage ? (
                <img 
                  src={uploadedImage} 
                  alt="업로드된 매장 이미지" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-sm font-['nanumsquare'] mb-2">매장 이미지를 업로드해주세요</div>
                  <div className="text-xs">JPG, PNG, GIF (최대 5MB)</div>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4">
                <label className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-4 h-[1.375rem] rounded-lg border border-black bg-white text-1 font-['nanumsquare'] flex flex-col justify-center self-stretch text-black text-center text-[11px] font-bold leading-5 cursor-pointer hover:bg-gray-50 transition-colors">
                  {isUploading ? '업로드 중...' : '이미지 업로드'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 가게 소개 */}
          <div className="w-full">
            <div className="flex flex-col items-start gap-2">
              <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-4 h-[1.375rem] rounded-lg border border-black bg-white text-2 font-['nanumsquare'] flex flex-col justify-center self-stretch text-black text-center text-[11px] font-bold leading-5">
                가게 소개
              </div>
              <textarea
                value={formData.storeDescription}
                onChange={(e) => handleInputChange('storeDescription', e.target.value)}
                placeholder="가게 소개 입력"
                rows={3}
                className={`w-full p-2 h-20 rounded-md border bg-white font-['Inter'] leading-6 resize-none ${errors.storeDescription
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                  } focus:outline-none`}
              />
              {errors.storeDescription && (
                <p className="text-red-500 text-xs">가게 소개를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* 업종 선택 */}
          <div className="w-full">
            <div className="flex flex-col items-start gap-2">
              <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-4 h-[1.375rem] rounded-lg border border-black bg-white text-2 font-['nanumsquare'] flex flex-col justify-center self-stretch text-black text-center text-[11px] font-bold leading-5">
                업종
              </div>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className={`w-full p-2 h-[2.4375rem] rounded-md border bg-white font-['Inter'] leading-6 ${errors.businessType
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                  } focus:outline-none`}
              >
                <option value="">업종 선택</option>
                <option value="한식">한식</option>
                <option value="중식">중식</option>
                <option value="일식">일식</option>
                <option value="양식">양식</option>
                <option value="카페">카페</option>
                <option value="베이커리">베이커리</option>
                <option value="기타">기타</option>
              </select>
              {errors.businessType && (
                <p className="text-red-500 text-xs">업종을 선택해주세요</p>
              )}
            </div>
          </div>

          {/* 주소 */}
          <div className="w-full">
            <div className="flex flex-col items-start gap-2">
              <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-4 h-[1.375rem] rounded-lg border border-black bg-white text-6 font-['nanumsquare'] text-black text-center text-[11px] font-bold leading-5">
                주 소
              </div>
              <div className="flex w-full h-[2.5625rem]">
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  placeholder="우편번호"
                  maxLength={5}
                  className={`flex-1 p-2 h-[2.5625rem] rounded-tl-md rounded-bl-md border bg-white font-['Inter'] leading-6 ${errors.postalCode
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-gray-500'
                    } focus:outline-none`}
                />
                <button
                  type="button"
                  className="flex justify-center items-center px-3 w-16 h-[2.5625rem] rounded-tr-md rounded-br-md bg-gray-800 text-white text-center font-['Inter'] text-[.8125rem] leading-6 hover:bg-gray-900 transition-colors"
                >
                  검색
                </button>
              </div>
              {errors.postalCode && (
                <p className="text-red-500 text-xs">우편번호를 입력해주세요</p>
              )}
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="기본 주소"
                className={`w-full p-2 h-[2.5625rem] rounded-md border bg-white font-['Inter'] leading-6 ${errors.address
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                  } focus:outline-none`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs">주소를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* 등록하기 버튼 */}
          <div className="flex justify-center items-center w-full">
            <button
              onClick={handleSubmit}
              className="flex justify-center items-center py-2 px-3 rounded bg-gray-800 font-['nanumsquare'] text-white text-center text-[.8125rem] font-bold leading-6 hover:bg-gray-900 transition-colors"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreRegistration;