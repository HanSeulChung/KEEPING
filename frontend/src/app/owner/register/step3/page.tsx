'use client'

import { buildURL, endpoints } from '@/api/config'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const StoreRegistration = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storeDescription: '',
    businessType: '',
    postalCode: '',
    address: '',
  })
  const [errors, setErrors] = useState({
    storeDescription: false,
    businessType: false,
    postalCode: false,
    address: false,
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
      address: !formData.address.trim(),
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      formData.append('file', file)

      // 이미지 업로드 API 호출
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('이미지 업로드 실패')
      }

      const result = await response.json()
      setUploadedImage(result.url)
      console.log('이미지 업로드 성공:', result.url)
    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // localStorage에서 regSessionId 가져오기
        const regSessionId = localStorage.getItem('regSessionId')

        console.log('회원가입에 사용할 regSessionId (localStorage에서):', regSessionId)

        if (!regSessionId) {
          console.error('regSessionId를 찾을 수 없습니다!')
          alert('인증 정보를 찾을 수 없습니다. 다시 인증해주세요.')
          router.push('/owner/register/step1')
          return
        }

        console.log('회원가입 API 호출:', { regSessionId })

        // 회원가입 API 호출
        const response = await fetch(buildURL(endpoints.auth.signupOwner), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            regSessionId: regSessionId,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('회원가입 API 에러:', response.status, errorText)
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorText}`
          )
        }

        const result = await response.json()
        console.log('회원가입 성공:', result)

        // 회원가입 성공 시 토큰 저장
        if (result.data?.accessToken) {
          localStorage.setItem('accessToken', result.data.accessToken)
        }
        if (result.data?.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken)
        }

        alert('회원가입이 완료되었습니다!')
        router.push('/owner/dashboard')
      } catch (error) {
        console.error('회원가입 오류:', error)
        alert('회원가입 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">가게 정보 등록</h1>
        <p className="mt-2 text-gray-600">
          가게에 대한 기본 정보를 입력해주세요
        </p>
      </div>

      <div className="space-y-6">
        {/* 가게 설명 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            가게 설명 *
          </label>
          <textarea
            value={formData.storeDescription}
            onChange={e => handleInputChange('storeDescription', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.storeDescription
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            rows={4}
            placeholder="가게에 대한 간단한 설명을 입력해주세요"
          />
          {errors.storeDescription && (
            <p className="mt-1 text-sm text-red-500">가게 설명을 입력해주세요</p>
          )}
        </div>

        {/* 업종 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            업종 *
          </label>
          <select
            value={formData.businessType}
            onChange={e => handleInputChange('businessType', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.businessType
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
          >
            <option value="">업종을 선택해주세요</option>
            <option value="RESTAURANT">음식점</option>
            <option value="CAFE">카페</option>
            <option value="BAKERY">베이커리</option>
            <option value="BAR">바</option>
            <option value="OTHER">기타</option>
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-500">업종을 선택해주세요</p>
          )}
        </div>

        {/* 우편번호 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            우편번호 *
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={e => handleInputChange('postalCode', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.postalCode
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="12345"
            maxLength={5}
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-500">
              올바른 우편번호를 입력해주세요 (5자리 숫자)
            </p>
          )}
        </div>

        {/* 주소 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            주소 *
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.address
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="상세 주소를 입력해주세요"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">주소를 입력해주세요</p>
          )}
        </div>

        {/* 이미지 업로드 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            가게 이미지
          </label>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="w-full rounded-lg border border-gray-300 p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-white file:hover:bg-blue-600"
            />
            {isUploading && (
              <p className="text-sm text-blue-600">이미지 업로드 중...</p>
            )}
            {uploadedImage && (
              <div className="mt-4">
                <img
                  src={uploadedImage}
                  alt="업로드된 이미지"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          회원가입 완료
        </button>
      </div>
    </div>
  )
}

export default StoreRegistration