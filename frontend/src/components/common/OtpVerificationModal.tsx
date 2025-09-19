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
  onSuccess: () => void
}

const OtpVerificationModal = ({
  isOpen,
  onClose,
  phoneNumber,
  name,
  birth,
  genderDigit,
  userRole = 'CUSTOMER',
  onSuccess,
}: OtpVerificationModalProps) => {
  const {
    loading,
    error,
    requestId,
    expiresAt,
    clearError,
    resetOtp,
    requestOtpCode,
    verifyOtpCode,
  } = useOtpAuth()

  const [otpCode, setOtpCode] = useState('')
  const [isRequested, setIsRequested] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 모달이 열릴 때마다 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setOtpCode('')
      setIsRequested(false)
      setCountdown(0)
      clearError()
    }
  }, [isOpen, clearError])

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleRequestOtp = async () => {
    const success = await requestOtpCode(
      name,
      phoneNumber,
      birth,
      genderDigit,
      userRole
    )
    
    if (success) {
      setIsRequested(true)
      setCountdown(180) // 3분
    }
  }

  const handleVerifyOtp = async () => {
    const result = await verifyOtpCode(otpCode)
    
    if (result?.verified) {
      onSuccess()
    }
  }

  const handleClose = () => {
    resetOtp()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">휴대폰 인증</h2>
          <p className="mt-2 text-sm text-gray-600">
            입력하신 번호로 인증번호가 발송됩니다.
          </p>
        </div>

        {!isRequested ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">인증번호 발송 대상:</span>
                <br />
                {phoneNumber}
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={handleRequestOtp}
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '인증번호 발송 중...' : '인증번호 발송'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">인증번호를 입력해주세요:</span>
                <br />
                {phoneNumber}
              </p>
            </div>

            <div>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="인증번호 6자리"
                maxLength={6}
                className="w-full rounded-lg border border-gray-300 p-3 text-center text-lg tracking-widest focus:border-blue-500 focus:outline-none"
              />
            </div>

            {countdown > 0 && (
              <p className="text-center text-sm text-gray-500">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')} 후 재발송 가능
              </p>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otpCode.length !== 6}
                className="flex-1 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? '인증 중...' : '인증하기'}
              </button>
              
              <button
                onClick={handleRequestOtp}
                disabled={loading || countdown > 0}
                className="flex-1 rounded-lg border border-gray-300 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                재발송
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationModal