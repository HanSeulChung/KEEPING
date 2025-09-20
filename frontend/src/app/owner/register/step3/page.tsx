'use client'

import { authApi } from '@/api/authApi'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const StoreRegistration = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    businessType: '',
    address: '',
    phoneNumber: '',
    bankAccount: '',
    merchantId: '',
  })
  const [errors, setErrors] = useState({
    storeName: false,
    storeDescription: false,
    businessType: false,
    address: false,
    phoneNumber: false,
    bankAccount: false,
    merchantId: false,
  })
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 입력 시 에러 상태 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      storeName: !formData.storeName.trim(),
      storeDescription: !formData.storeDescription.trim(),
      businessType: !formData.businessType.trim(),
      address: !formData.address.trim(),
      phoneNumber: !formData.phoneNumber.trim(),
      bankAccount: !formData.bankAccount.trim(),
      merchantId: !formData.merchantId.trim(),

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
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // 세션에서 regSessionId 가져오기
      const sessionInfo = await authApi.getSessionInfo()
      const regSessionId = sessionInfo.data

      console.log('회원가입에 사용할 regSessionId (세션에서):', regSessionId)

      if (!regSessionId) {
        console.error('regSessionId를 찾을 수 없습니다!')
        alert('인증 정보를 찾을 수 없습니다. 다시 인증해주세요.')
        router.push('/owner/register/step1')
        return
      }

      console.log('회원가입 API 호출:', { regSessionId })

      // 1. 회원가입 완료 API 호출
      const signupData = {
        regSessionId: regSessionId
      }

      const signupResult = await authApi.completeOwnerSignup(signupData)
      console.log('회원가입 성공:', signupResult)

      // 회원가입 성공 시 토큰 저장
      if (signupResult.accessToken) {
        localStorage.setItem('accessToken', signupResult.accessToken)
      }
      if (signupResult.user) {
        localStorage.setItem('user', JSON.stringify(signupResult.user))
      }

      // 2. 매장 등록 API 호출 (multipart/form-data)
      const storeFormData = new FormData()
      storeFormData.append('storeName', formData.storeName)
      storeFormData.append('storeDescription', formData.storeDescription)
      storeFormData.append('businessType', formData.businessType)
      storeFormData.append('address', formData.address)
      storeFormData.append('phoneNumber', formData.phoneNumber)
      storeFormData.append('bankAccount', formData.bankAccount)
      storeFormData.append('merchantId', formData.merchantId)

      // 이미지가 있으면 추가
      if (uploadedImage) {
        // uploadedImage가 URL인 경우, fetch로 blob으로 변환
        const response = await fetch(uploadedImage)
        const blob = await response.blob()
        storeFormData.append('storeImage', blob, 'store-image.jpg')
      }

      console.log('매장 등록 API 호출:', {
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        businessType: formData.businessType,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        bankAccount: formData.bankAccount,
        merchantId: formData.merchantId,
        hasImage: !!uploadedImage
      })

      const storeResponse = await fetch('/owners/store', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${signupResult.accessToken}`,
        },
        body: storeFormData,
      })

      if (!storeResponse.ok) {
        const errorText = await storeResponse.text()
        console.error('매장 등록 API 에러:', storeResponse.status, errorText)
        throw new Error(`매장 등록 실패: ${errorText}`)
      }

      const storeResult = await storeResponse.json()
      console.log('매장 등록 성공:', storeResult)

      alert('회원가입 및 매장 등록이 완료되었습니다!')
      router.push('/owner/dashboard')
    } catch (error) {
      console.error('회원가입/매장 등록 오류:', error)
      alert('회원가입 또는 매장 등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)

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
        {/* 매장명 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            매장명 *
          </label>
          <input
            type="text"
            value={formData.storeName}
            onChange={e => handleInputChange('storeName', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.storeName
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="매장명을 입력해주세요"
          />
          {errors.storeName && (
            <p className="mt-1 text-sm text-red-500">매장명을 입력해주세요</p>
          )}
        </div>

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
            <option value="한식">한식</option>
            <option value="중식">중식</option>
            <option value="일식">일식</option>
            <option value="양식">양식</option>
            <option value="분식">분식</option>
            <option value="아시안">아시안</option>
            <option value="패스트푸드">패스트푸드</option>
            <option value="카페">카페</option>
            <option value="식료품">식료품</option>
            <option value="반찬/밀키트">반찬/밀키트</option>
            <option value="헤어">헤어</option>
            <option value="뷰티">뷰티</option>
            <option value="꽃">꽃</option>
            <option value="엔터테인먼트">엔터테인먼트</option>
            <option value="스포츠">스포츠</option>
            <option value="자동차">자동차</option>
            <option value="반려동물">반려동물</option>
            <option value="주류">주류</option>
            <option value="클래스">클래스</option>
            <option value="잡화">잡화</option>
          </select>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-500">업종을 선택해주세요</p>
          )}
        </div>

        {/* 매장 주소 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            매장 주소 *
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
            placeholder="매장 주소를 입력해주세요"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">매장 주소를 입력해주세요</p>
          )}
        </div>

        {/* 매장 전화번호 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            매장 전화번호 *
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={e => handleInputChange('phoneNumber', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.phoneNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="매장 전화번호를 입력해주세요"
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-500">매장 전화번호를 입력해주세요</p>
          )}
        </div>

        {/* 정산 계좌 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            정산 계좌 *
          </label>
          <input
            type="text"
            value={formData.bankAccount}
            onChange={e => handleInputChange('bankAccount', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.bankAccount
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="정산 계좌를 입력해주세요"
          />
          {errors.bankAccount && (
            <p className="mt-1 text-sm text-red-500">정산 계좌를 입력해주세요</p>
          )}
        </div>

        {/* 가맹점ID */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            가맹점ID *
          </label>
          <input
            type="text"
            value={formData.merchantId}
            onChange={e => handleInputChange('merchantId', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.merchantId
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            placeholder="가맹점ID를 입력해주세요"
          />
          {errors.merchantId && (
            <p className="mt-1 text-sm text-red-500">가맹점ID를 입력해주세요</p>
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
          disabled={isSubmitting}
          className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '처리 중...' : '회원가입 완료'}
        </button>
      </div>
    </div>
  )
}

export default StoreRegistration

