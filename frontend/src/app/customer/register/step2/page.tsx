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
        paymentPin: pinNumber
      }

      console.log('회원가입 요청 데이터:', signupData)

      const signupResponse = await fetch('/api/auth/signup/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(signupData)
      })

      if (!signupResponse.ok) {
        throw new Error('회원가입에 실패했습니다.')
      }

      const result = await signupResponse.json()
      console.log('회원가입 완료:', result)

      // 회원가입 성공 시 토큰 저장
      if (result.accessToken) {
        localStorage.setItem('accessToken', result.accessToken)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      // PIN 번호도 localStorage에 저장 (결제 시 사용)
      localStorage.setItem('customerPaymentPin', pinNumber)

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-md">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-['Tenada'] text-2xl leading-7 font-extrabold text-black sm:text-4xl">
            결제 핀 번호 설정
          </h1>
          <p className="mb-2 text-sm text-gray-600 sm:text-base">
            안전한 결제를 위한 6자리 PIN을 설정해주세요
          </p>
          <div className="font-['Tenada'] text-lg font-extrabold text-black sm:text-2xl">
            2/2
          </div>
        </div>

        {/* 안내 카드 */}
        <div className="mb-6 border border-black bg-white p-4 sm:p-6">
          <div className="mb-4 text-center">
            <div className="text-1 mx-auto mb-3 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black">
              PIN 번호 안내
            </div>
          </div>
          <ul className="space-y-2 text-center text-sm text-black">
            <li className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="font-medium">6자리 숫자로 설정해주세요</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="font-medium">결제 시 PIN 번호가 필요합니다</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="font-medium">다른 사람과 공유하지 마세요</span>
            </li>
          </ul>
        </div>

        {/* PIN 입력 폼 */}
        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
              PIN 번호
            </label>
            <input
              type="password"
              value={pinNumber}
              onChange={e => handleInputChange('pinNumber', e.target.value)}
              placeholder="6자리 숫자 입력"
              className={`w-full rounded-lg border p-3 text-center font-['nanumsquare'] text-2xl tracking-widest focus:outline-none ${
                errors.pinNumber
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-black'
              }`}
              maxLength={6}
            />
            {errors.pinNumber && (
              <p className="mt-1 text-xs text-red-500">
                6자리 숫자를 입력해주세요
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
              PIN 번호 확인
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={e => handleInputChange('confirmPin', e.target.value)}
              placeholder="PIN 번호 재입력"
              className={`w-full rounded-lg border p-3 text-center font-['nanumsquare'] text-2xl tracking-widest focus:outline-none ${
                errors.confirmPin || errors.mismatch
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-black'
              }`}
              maxLength={6}
            />
            {errors.confirmPin && (
              <p className="mt-1 text-xs text-red-500">
                6자리 숫자를 입력해주세요
              </p>
            )}
            {errors.mismatch && (
              <p className="mt-1 text-xs text-red-500">
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
            className="w-full rounded-lg bg-black py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? '회원가입 중...' : 'PIN 번호 설정 완료'}
          </button>

          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full rounded-lg bg-gray-200 py-3 font-['nanumsquare'] font-bold text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"

          >
            이전 단계로
          </button>
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            PIN 번호를 잊으셨다면 고객센터로 문의해주세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default CustomerPinSetup

