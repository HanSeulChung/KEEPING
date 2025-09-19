'use client'

import React, { useState, useEffect } from 'react'
import { useOtpAuth } from '@/hooks/useOtpAuth'

interface OtpVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: string
  purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
  onSuccess: (token?: string) => void
}

const OtpVerificationModal = ({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  purpose, 
  onSuccess 
}: OtpVerificationModalProps) => {
  const { 
    loading, 
    error, 
    requestId, 
    expiresAt, 
    requestOtpCode, 
    verifyOtpCode, 
    clearError, 
    resetOtp 
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
    const success = await requestOtpCode(phoneNumber, purpose)
    if (success) {
      setIsOtpSent(true)
      clearError()
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    const result = await verifyOtpCode(phoneNumber, otpCode)
    if (result?.isValid) {
      onSuccess(result.token)
      onClose()
      resetOtp()
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Tenada'] font-extrabold text-black">
            KEEPING PASS 인증
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 전화번호 표시 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-['nanumsquare'] mb-1">인증번호를 발송한 번호</p>
          <p className="text-lg font-['nanumsquare'] font-bold text-black">
            {phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-['nanumsquare']">{error}</p>
          </div>
        )}

        {/* OTP 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">
            인증번호 입력
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6자리 인증번호"
              className="flex-1 p-3 border border-gray-300 rounded-lg text-center text-lg font-['nanumsquare'] font-bold tracking-widest"
              maxLength={6}
            />
            {timeLeft > 0 && (
              <div className="text-sm text-red-500 font-['nanumsquare'] font-bold">
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
            className="flex-1 py-3 px-4 border border-gray-300 bg-white text-gray-700 rounded-lg font-['nanumsquare'] font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '전송 중...' : '인증번호 재전송'}
          </button>
          <button
            onClick={handleVerifyOtp}
            disabled={loading || !otpCode || otpCode.length !== 6}
            className="flex-1 py-3 px-4 bg-black text-white rounded-lg font-['nanumsquare'] font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '인증 중...' : '인증하기'}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-['nanumsquare']">
            • 인증번호는 3분 후 만료됩니다.<br/>
            • 인증번호가 오지 않으면 스팸함을 확인해주세요.<br/>
            • 여러 번 시도해도 인증번호가 오지 않으면 재전송을 눌러주세요.
          </p>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationModal
