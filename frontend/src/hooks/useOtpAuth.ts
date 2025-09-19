'use client'

import { useState, useCallback } from 'react'
import { 
  OtpRequest, 
  OtpVerifyRequest, 
  OtpRequestResponse, 
  OtpVerifyResponse,
  requestOtp, 
  verifyOtp 
} from '@/api/otpApi'

interface UseOtpAuthReturn {
  loading: boolean
  error: string | null
  requestId: string | null
  expiresAt: string | null
  requestOtpCode: (phoneNumber: string, purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET') => Promise<boolean>
  verifyOtpCode: (phoneNumber: string, otpCode: string) => Promise<OtpVerifyResponse | null>
  clearError: () => void
  resetOtp: () => void
}

export const useOtpAuth = (): UseOtpAuthReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  // OTP 요청
  const requestOtpCode = useCallback(async (
    phoneNumber: string, 
    purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const otpRequest: OtpRequest = {
        phoneNumber,
        purpose
      }
      
      const response = await requestOtp(otpRequest)
      
      if (response.success) {
        setRequestId(response.data.requestId)
        setExpiresAt(response.data.expiresAt)
        return true
      } else {
        setError(response.message || 'OTP 요청에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('OTP 요청 오류:', err)
      setError('OTP 요청 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // OTP 검증
  const verifyOtpCode = useCallback(async (
    phoneNumber: string, 
    otpCode: string
  ): Promise<OtpVerifyResponse | null> => {
    if (!requestId) {
      setError('OTP 요청이 필요합니다.')
      return null
    }

    try {
      setLoading(true)
      setError(null)
      
      const verifyRequest: OtpVerifyRequest = {
        requestId,
        phoneNumber,
        otpCode
      }
      
      const response = await verifyOtp(verifyRequest)
      
      if (response.success) {
        return response.data
      } else {
        setError(response.message || 'OTP 검증에 실패했습니다.')
        return null
      }
    } catch (err) {
      console.error('OTP 검증 오류:', err)
      setError('OTP 검증 중 오류가 발생했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }, [requestId])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // OTP 상태 초기화
  const resetOtp = useCallback(() => {
    setRequestId(null)
    setExpiresAt(null)
    setError(null)
  }, [])

  return {
    loading,
    error,
    requestId,
    expiresAt,
    requestOtpCode,
    verifyOtpCode,
    clearError,
    resetOtp
  }
}
