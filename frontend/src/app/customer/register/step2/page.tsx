'use client'

import { authApi } from '@/api/authApi'
import { apiConfig } from '@/api/config'
import { Modal } from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CustomerPinSetup = () => {
  const router = useRouter()

  const [pinNumber, setPinNumber] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errors, setErrors] = useState({
    pinNumber: false,
    confirmPin: false,
    mismatch: false,
  })

  const handleInputChange = (field: string, value: string) => {
    // 숫자만 입력 허용
    const numericValue = value.replace(/\D/g, '').slice(0, 6)

    if (field === 'pinNumber') {
      setPinNumber(numericValue)
    } else {
      setConfirmPin(numericValue)
    }

    // 입력 시 에러 상태 초기화
    setErrors(prev => ({
      ...prev,
      [field]: false,
      mismatch: false,
    }))
  }

  const validateForm = () => {
    const newErrors = {
      pinNumber: !pinNumber || pinNumber.length !== 6,
      confirmPin: !confirmPin || confirmPin.length !== 6,
      mismatch: pinNumber !== confirmPin && confirmPin.length === 6,
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // localStorage에서 regSessionId 가져오기
      const regSessionId = localStorage.getItem('regSessionId')

      if (!regSessionId) {
        alert('세션 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
        router.push('/customer/login')
        return
      }

      // 회원가입 완료 API 호출 (fetch 사용)
      const signupData = {
        regSessionId: regSessionId,
        paymentPin: pinNumber,
      }

      console.log('회원가입 요청 데이터:', signupData)

      const result = await authApi.completeCustomerSignup(signupData)

      console.log('회원가입 완료:', result)

      // 회원가입 성공 시 토큰 저장
      const accessToken = result?.accessToken
      const userObj = result?.user
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }
      if (userObj) {
        localStorage.setItem('user', JSON.stringify(userObj))
      }

      // 회원가입 후 사용자 정보 다시 조회하여 완전한 정보 가져오기
      try {
        const meResponse = await fetch(`${apiConfig.baseURL}/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        })

        if (meResponse.ok) {
          const meData = await meResponse.json()
          console.log('사용자 정보 재조회 완료:', meData)

          // 완전한 사용자 정보로 업데이트
          if (meData.data) {
            localStorage.setItem('user', JSON.stringify(meData.data))
          }
        }
      } catch (meError) {
        console.warn('사용자 정보 재조회 실패:', meError)
      }

      // 성공 모달 표시
      setShowSuccessModal(true)
    } catch (error) {
      console.error('회원가입 실패:', error)
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/customer/register/step1')
  }

  const handleLoginRedirect = () => {
    setShowSuccessModal(false)
    router.push('/customer/login')
  }

  return (
    <div className="mx-auto flex h-[917px] w-[412px] flex-col items-center justify-center bg-white p-6">
      {/* 제목 */}
      <div className="mb-8">
        <h1 className="font-jalnan text-center text-3xl leading-[140%] text-black">
          결제 핀 번호 설정
        </h1>
        <p className="font-nanum-square-round-eb mt-2 text-center text-lg leading-[140%] font-bold text-gray-500">
          안전한 결제를 위한 6자리 PIN을 설정해주세요
        </p>
      </div>

      {/* 입력 필드들 */}
      <div className="w-full max-w-[19.625rem] space-y-6">
        {/* PIN 번호 */}
        <div className="space-y-2">
          <label className="font-nanum-square-round-eb text-lg leading-[140%] font-bold text-gray-500">
            PIN 번호
          </label>
          <input
            type="password"
            value={pinNumber}
            onChange={e => handleInputChange('pinNumber', e.target.value)}
            placeholder="6자리 숫자 입력"
            className={`font-nanum-square-round-eb h-[2.8125rem] w-full flex-shrink-0 rounded-[1.25rem] border-[3px] bg-white px-4 text-center text-lg focus:outline-none ${
              errors.pinNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#d9d9d9] focus:border-[#fdda60]'
            }`}
            maxLength={6}
          />
          {errors.pinNumber && (
            <p className="font-nanum-square-round-eb text-sm text-red-500">
              6자리 숫자를 입력해주세요
            </p>
          )}
        </div>

        {/* PIN 번호 확인 */}
        <div className="space-y-2">
          <label className="font-nanum-square-round-eb text-lg leading-[140%] font-bold text-gray-500">
            PIN 번호 확인
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={e => handleInputChange('confirmPin', e.target.value)}
            placeholder="PIN 번호 재입력"
            className={`font-nanum-square-round-eb h-[2.8125rem] w-full flex-shrink-0 rounded-[1.25rem] border-[3px] bg-white px-4 text-center text-lg focus:outline-none ${
              errors.confirmPin || errors.mismatch
                ? 'border-red-500 focus:border-red-500'
                : 'border-[#d9d9d9] focus:border-[#fdda60]'
            }`}
            maxLength={6}
          />
          {errors.confirmPin && (
            <p className="font-nanum-square-round-eb text-sm text-red-500">
              6자리 숫자를 입력해주세요
            </p>
          )}
          {errors.mismatch && (
            <p className="font-nanum-square-round-eb text-sm text-red-500">
              PIN 번호가 일치하지 않습니다
            </p>
          )}
        </div>
      </div>

      {/* 버튼들 */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex h-[2.8125rem] w-[23.75rem] flex-shrink-0 items-center justify-center rounded-[0.625rem] bg-[#fdda60] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="font-jalnan text-[1.5625rem] leading-[140%] text-white">
            {isSubmitting ? '회원가입 중...' : 'PIN 번호 설정 완료'}
          </span>
        </button>
        <button
          onClick={handleBack}
          disabled={isSubmitting}
          className="flex h-[2.8125rem] w-[23.75rem] flex-shrink-0 items-center justify-center rounded-[0.625rem] bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="font-jalnan text-[1.5625rem] leading-[140%] text-gray-700">
            이전 단계로
          </span>
        </button>
      </div>

      {/* 회원가입 성공 모달 */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="회원가입 완료"
      >
        <div className="p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                width={32}
                height={32}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="font-jalnan mb-2 text-xl font-bold text-black">
              회원가입 완료!
            </h2>
            <p className="font-nanum-square-round-eb text-gray-600">
              회원가입이 성공적으로 완료되었습니다.
            </p>
          </div>

          <button
            onClick={handleLoginRedirect}
            className="font-jalnan w-full rounded-lg bg-[#ffc800] px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-[#e6b400]"
          >
            로그인하기
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default CustomerPinSetup
