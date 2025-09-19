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
      formData.append('image', file)
      // 실제 스토어 ID를 사용해야 함 - 스토어 등록 후 받은 ID 사용
      const storeId =
        localStorage.getItem('currentStoreId') || 'pending-store-registration'
      formData.append('storeId', storeId)
      formData.append('imageIndex', '0')

      // 이미지 업로드 API 호출
      const response = await fetch('/api/stores/temp-store-id/images', {
        method: 'POST',
        body: formData,
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

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        // regSessionId 가져오기 (OTP 인증 시 저장된 것)
        console.log('localStorage 전체 내용:', localStorage)
        console.log(
          'regSessionId 키 존재 여부:',
          localStorage.getItem('regSessionId') !== null
        )
        const regSessionId = localStorage.getItem('regSessionId')
        console.log('가져온 regSessionId:', regSessionId)

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

        // 임시 regSessionId 삭제
        localStorage.removeItem('regSessionId')

        alert('회원가입이 완료되었습니다!')
        router.push('/owner/dashboard')
      } catch (error) {
        console.error('회원가입 실패:', error)
        alert('회원가입에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="mb-2 text-center font-['Tenada'] text-2xl leading-7 font-extrabold text-black sm:text-4xl">
            매장 등록
          </h1>
          <div className="text-center font-['Tenada'] text-xl leading-7 font-extrabold text-black sm:text-4xl">
            2/2
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          {/* 이미지 업로드 */}
          <div className="w-full">
            <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg border border-[#000000]/[.11] bg-gray-100">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="업로드된 매장 이미지"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="mb-2 font-['nanumsquare'] text-sm">
                    매장 이미지를 업로드해주세요
                  </div>
                  <div className="text-xs">JPG, PNG, GIF (최대 5MB)</div>
                </div>
              )}

              <div className="absolute right-4 bottom-4">
                <label className="text-1 flex h-[1.375rem] cursor-pointer flex-col items-center justify-center gap-2.5 self-stretch rounded-lg border border-black bg-white px-4 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[11px] leading-5 font-bold text-black transition-colors hover:bg-gray-50">
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
              <div className="text-2 flex h-[1.375rem] flex-col items-center justify-center gap-2.5 self-stretch rounded-lg border border-black bg-white px-4 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[11px] leading-5 font-bold text-black">
                가게 소개
              </div>
              <textarea
                value={formData.storeDescription}
                onChange={e =>
                  handleInputChange('storeDescription', e.target.value)
                }
                placeholder="가게 소개 입력"
                rows={3}
                className={`h-20 w-full resize-none rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.storeDescription
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                } focus:outline-none`}
              />
              {errors.storeDescription && (
                <p className="text-xs text-red-500">가게 소개를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* 업종 선택 */}
          <div className="w-full">
            <div className="flex flex-col items-start gap-2">
              <div className="text-2 flex h-[1.375rem] flex-col items-center justify-center gap-2.5 self-stretch rounded-lg border border-black bg-white px-4 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[11px] leading-5 font-bold text-black">
                업종
              </div>
              <select
                value={formData.businessType}
                onChange={e =>
                  handleInputChange('businessType', e.target.value)
                }
                className={`h-[2.4375rem] w-full rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.businessType
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
                <p className="text-xs text-red-500">업종을 선택해주세요</p>
              )}
            </div>
          </div>

          {/* 주소 */}
          <div className="w-full">
            <div className="flex flex-col items-start gap-2">
              <div className="text-6 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-4 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[11px] leading-5 font-bold text-black">
                주 소
              </div>
              <div className="flex h-[2.5625rem] w-full">
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e =>
                    handleInputChange(
                      'postalCode',
                      e.target.value.replace(/\D/g, '')
                    )
                  }
                  placeholder="우편번호"
                  maxLength={5}
                  className={`h-[2.5625rem] flex-1 rounded-tl-md rounded-bl-md border bg-white p-2 font-['Inter'] leading-6 ${
                    errors.postalCode
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-gray-500'
                  } focus:outline-none`}
                />
                <button
                  type="button"
                  className="flex h-[2.5625rem] w-16 items-center justify-center rounded-tr-md rounded-br-md bg-gray-800 px-3 text-center font-['Inter'] text-[.8125rem] leading-6 text-white transition-colors hover:bg-gray-900"
                >
                  검색
                </button>
              </div>
              {errors.postalCode && (
                <p className="text-xs text-red-500">우편번호를 입력해주세요</p>
              )}
              <input
                type="text"
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                placeholder="기본 주소"
                className={`h-[2.5625rem] w-full rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.address
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                } focus:outline-none`}
              />
              {errors.address && (
                <p className="text-xs text-red-500">주소를 입력해주세요</p>
              )}
            </div>
          </div>

          {/* 등록하기 버튼 */}
          <div className="flex w-full items-center justify-center">
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center rounded bg-gray-800 px-3 py-2 text-center font-['nanumsquare'] text-[.8125rem] leading-6 font-bold text-white transition-colors hover:bg-gray-900"
            >
              등록하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StoreRegistration
