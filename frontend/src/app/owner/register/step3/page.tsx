'use client'

import { authApi } from '@/api/authApi'
import { apiConfig, endpoints } from '@/api/config'
import { useRegistration } from '@/contexts/RegistrationContext'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const StoreRegistration = () => {
  const router = useRouter()
  const { registrationData } = useRegistration()
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    category: '',
    address: '',
    phoneNumber: '',
    bankAccount: '',
  })
  const [errors, setErrors] = useState({
    storeName: false,
    description: false,
    category: false,
    address: false,
    phoneNumber: false,
    bankAccount: false,
    image: false,
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 사업자 등록번호 형식 변환 함수 (XXX-XX-XXXXX)
  const formatBusinessNumber = (businessNumber: string): string => {
    // 숫자만 추출
    const numbers = businessNumber.replace(/\D/g, '')
    
    // 10자리인 경우 XXX-XX-XXXXX 형식으로 변환
    if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`
    }
    
    // 이미 형식이 맞는 경우 그대로 반환
    return businessNumber
  }

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
      description: !formData.description.trim(),
      category: !formData.category.trim(),
      address: !formData.address.trim(),
      phoneNumber: !formData.phoneNumber.trim(),
      bankAccount: !formData.bankAccount.trim(),
      image: !uploadedFile,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadedFile(file)
    
    // 이미지 업로드 시 에러 상태 초기화
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: false }))
    }
    
    // 미리보기 URL 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
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

      // ownerId 추출
      const ownerId = signupResult.user?.ownerId
      if (!ownerId) {
        console.error('ownerId를 찾을 수 없습니다! signupResult:', signupResult)
        alert('회원가입 정보를 찾을 수 없습니다. 다시 시도해주세요.')
        return
      }

      console.log('추출된 ownerId:', ownerId)

      // 토큰 재발급 요청
      console.log('토큰 재발급 요청 시작')
      const refreshResult = await authApi.refreshToken()
      console.log('토큰 재발급 성공:', refreshResult)
      
      if (!refreshResult.accessToken) {
        console.error('토큰 재발급 실패!')
        alert('토큰 갱신에 실패했습니다. 다시 시도해주세요.')
        return
      }

      // 새로운 토큰 저장
      localStorage.setItem('accessToken', refreshResult.accessToken)
      console.log('💾 새로운 토큰 저장 완료')

      // 2. 사업자 정보 가져오기 (context에서)
      const businessInfo = registrationData.businessInfo
      
      // 3. 매장 등록 API 호출 (multipart/form-data)
      const storeFormData = new FormData()
      
      console.log('🔍 매장 등록 FormData 구성 시작')
      console.log('📋 ownerId:', ownerId, '타입:', typeof ownerId)
      
      // ownerId 추가
      storeFormData.append('ownerId', ownerId.toString())
      console.log('✅ ownerId 추가됨:', ownerId.toString())
      
      // 사업자 번호를 taxIdNumber로 추가 (XXX-XX-XXXXX 형식으로 변환)
      if (businessInfo?.businessNumber) {
        const formattedBusinessNumber = formatBusinessNumber(businessInfo.businessNumber)
        storeFormData.append('taxIdNumber', formattedBusinessNumber)
        console.log('✅ taxIdNumber 추가됨:', formattedBusinessNumber)
      } else {
        alert('사업자 정보를 찾을 수 없습니다. 다시 진행해주세요.')
        router.push('/owner/register/step2')
        return
      }
      
      // StoreRequestDto에 맞게 필드 추가
      storeFormData.append('storeName', formData.storeName)
      storeFormData.append('address', formData.address)
      storeFormData.append('phoneNumber', formData.phoneNumber)
      storeFormData.append('bankAccount', formData.bankAccount)
      storeFormData.append('category', formData.category)
      storeFormData.append('description', formData.description)
      
      console.log('✅ 기본 필드들 추가됨:', {
        storeName: formData.storeName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        bankAccount: formData.bankAccount,
        category: formData.category,
        description: formData.description
      })

      // 이미지 파일 추가
      if (uploadedFile) {
        storeFormData.append('imgFile', uploadedFile)
        console.log('✅ 이미지 파일 추가됨:', uploadedFile.name, '크기:', uploadedFile.size)
      } else {
        console.log('⚠️ 이미지 파일 없음')
      }
      
      // FormData 내용 확인
      console.log('📦 FormData 내용 확인:')
      for (let [key, value] of storeFormData.entries()) {
        console.log(`  ${key}:`, value)
      }

      console.log('매장 등록 API 호출:', {
        ownerId: ownerId,
        taxIdNumber: formatBusinessNumber(businessInfo?.businessNumber || ''),
        storeName: formData.storeName,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        bankAccount: formData.bankAccount,
        category: formData.category,
        description: formData.description,
        hasImage: !!uploadedFile
      })

      const apiUrl = `${apiConfig.baseURL}${endpoints.stores.register}`
      console.log('🚀 API 요청 시작')
      console.log('📍 요청 URL:', apiUrl)
      console.log('🔑 Authorization 헤더:', `Bearer ${refreshResult.accessToken}`)
      console.log('📋 요청 메서드: POST')
      console.log('📦 요청 바디 타입: FormData')
      
      const storeResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${refreshResult.accessToken}`,
        },
        body: storeFormData,
      })
      
      console.log('📡 API 응답 받음')
      console.log('📊 응답 상태:', storeResponse.status, storeResponse.statusText)
      console.log('📋 응답 헤더:', Object.fromEntries(storeResponse.headers.entries()))

      if (!storeResponse.ok) {
        const errorText = await storeResponse.text()
        console.error('매장 등록 API 에러:', storeResponse.status, errorText)
        throw new Error(`매장 등록 실패: ${storeResponse.status}`)
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
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.description
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none`}
            rows={4}
            placeholder="가게에 대한 간단한 설명을 입력해주세요"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">가게 설명을 입력해주세요</p>
          )}
        </div>

        {/* 업종 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            업종 *
          </label>
          <select
            value={formData.category}
            onChange={e => handleInputChange('category', e.target.value)}
            className={`w-full rounded-lg border p-3 ${
              errors.category
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
          {errors.category && (
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


        {/* 이미지 업로드 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            가게 이미지 *
          </label>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={`w-full rounded-lg border p-3 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-white file:hover:bg-blue-600 ${
                errors.image
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              } focus:outline-none`}
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-500">가게 이미지를 업로드해주세요</p>
            )}
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="미리보기"
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
          className="rounded-lg bg-gray-500 px-6 py-3 text-white hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
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