'use client'

import { authApi } from '@/api/authApi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CustomerPinSetup = () => {
  const router = useRouter()
  const [pinNumber, setPinNumber] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      // 세션에서 regSessionId 가져오기
      const sessionInfo = await authApi.getSessionInfo()
      const regSessionId = sessionInfo.data

      if (!regSessionId) {
        alert('세션 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
        router.push('/customer/login')
        return
      }

      // 회원가입 완료 API 호출
      const signupData = {
        regSessionId: regSessionId,
        paymentPin: pinNumber,
      }

      console.log('회원가입 요청 데이터:', signupData)

      const result = await authApi.completeCustomerSignup(signupData)
      console.log('회원가입 완료:', result)

      // 회원가입 성공 시 토큰 저장
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      alert('회원가입이 완료되었습니다!')

      // 홈페이지로 이동
      router.push('/customer/home')
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
    </div>
  )
}

export default CustomerPinSetup
