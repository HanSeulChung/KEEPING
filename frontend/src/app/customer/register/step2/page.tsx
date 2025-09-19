'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const CustomerPinSetup = () => {
  const router = useRouter()
  const [pinNumber, setPinNumber] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
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

  const handleSubmit = () => {
    if (validateForm()) {
      // PIN 번호 저장 (실제로는 암호화해서 저장)
      localStorage.setItem('customerPaymentPin', pinNumber)
      console.log('결제 PIN 설정 완료:', pinNumber)

      // 완료 후 메인 페이지나 로그인 페이지로 이동
      router.push('/customer/login')
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
            className="w-full rounded-lg bg-black py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800"
          >
            PIN 번호 설정 완료
          </button>

          <button
            onClick={handleBack}
            className="w-full rounded-lg bg-gray-200 py-3 font-['nanumsquare'] font-bold text-gray-700 transition-colors hover:bg-gray-300"
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
