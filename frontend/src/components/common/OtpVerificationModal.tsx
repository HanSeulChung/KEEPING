'use client'

import { useOtpAuth } from '@/hooks/useOtpAuth'
import { useEffect, useState } from 'react'

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: string
  name: string
  birth: string
  genderDigit: string
  userRole?: 'CUSTOMER' | 'OWNER'
  purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
  onSuccess: (token?: string) => void
}

const OtpVerificationModal = ({
  isOpen,
  onClose,
  phoneNumber,
  name,
  birth,
  genderDigit,
  userRole = 'CUSTOMER',
  purpose,
  onSuccess,
}: OtpVerificationModalProps) => {
  const {
    loading,
    error,
    requestId,
    expiresAt,
    requestOtpCode,
    verifyOtpCode,
    clearError,
    resetOtp,
  } = useOtpAuth()

  const [otpCode, setOtpCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [isOtpSent, setIsOtpSent] = useState(false)

  // 모달이 열릴 때 OTP 자동 요청
  useEffect(() => {
    if (isOpen && !isOtpSent) {
      handleRequestOtp()
    }
  }, [isOpen])

  // 타이머 설정
  useEffect(() => {
    if (expiresAt && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, expiresAt])

  // 만료 시간 계산
  useEffect(() => {
    if (expiresAt) {
      const expires = new Date(expiresAt).getTime()
      const now = new Date().getTime()
      const diff = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeLeft(diff)
    }
  }, [expiresAt])

  const handleRequestOtp = async () => {
    console.log('OTP 요청 시작:', {
      name,
      phoneNumber,
      birth,
      genderDigit,
      userRole,
      purpose,
    })
    const success = await requestOtpCode(
      name,
      phoneNumber,
      birth,
      genderDigit,
      userRole,
      purpose
    )
    console.log('OTP 요청 결과:', success)
    if (success) {
      setIsOtpSent(true)
      clearError()
    }
  }

  const handleVerifyOtp = async () => {
    console.log('handleVerifyOtp 호출됨, otpCode:', otpCode)
    if (!otpCode || otpCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    console.log('OTP 검증 시작...')
    const result = await verifyOtpCode(otpCode)
    console.log('OTP 검증 결과:', result)

    if (result?.verified) {
      console.log('OTP 인증 성공:', result)
      onSuccess(result.token)
      onClose()
      resetOtp()
    } else {
      console.log('OTP 인증 실패 또는 결과 없음')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleClose = () => {
    resetOtp()
    setIsOtpSent(false)
    setOtpCode('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-['Tenada'] text-2xl font-extrabold text-black">
            KEEPING PASS 인증
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 전화번호 표시 */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="mb-1 font-['nanumsquare'] text-sm text-gray-600">
            인증번호를 발송한 번호
          </p>
          <p className="font-['nanumsquare'] text-lg font-bold text-black">
            {phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="font-['nanumsquare'] text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* OTP 입력 */}
        <div className="mb-6">
          <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
            인증번호 입력
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={otpCode}
              onChange={e =>
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="6자리 인증번호"
              className="flex-1 rounded-lg border border-gray-300 p-3 text-center font-['nanumsquare'] text-lg font-bold tracking-widest"
              maxLength={6}
            />
            {timeLeft > 0 && (
              <div className="font-['nanumsquare'] text-sm font-bold text-red-500">
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={handleRequestOtp}
            disabled={loading || timeLeft > 0}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 font-['nanumsquare'] font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '전송 중...' : '인증번호 재전송'}
          </button>
          <button
            onClick={handleVerifyOtp}
            disabled={loading || !otpCode || otpCode.length !== 6}
            className="flex-1 rounded-lg bg-black px-4 py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '인증 중...' : '인증하기'}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <p className="font-['nanumsquare'] text-sm text-blue-700">
            • 인증번호는 3분 후 만료됩니다.
            <br />
            • 인증번호가 오지 않으면 스팸함을 확인해주세요.
            <br />• 여러 번 시도해도 인증번호가 오지 않으면 재전송을 눌러주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationModal
