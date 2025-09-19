'use client'

import {
  OtpRequest,
  OtpVerifyRequest,
  OtpVerifyResponse,
  requestOtp,
  verifyOtp,
} from '@/api/otpApi'
import { useCallback, useState } from 'react'

interface UseOtpAuthReturn {
  loading: boolean
  error: string | null
  requestId: string | null
  expiresAt: string | null

  requestOtpCode: (
    name: string,
    phoneNumber: string,
    birth: string,
    genderDigit: string,
    userRole?: 'CUSTOMER' | 'OWNER',
    purpose?: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
  ) => Promise<boolean>
  verifyOtpCode: (otpCode: string) => Promise<OtpVerifyResponse | null>
  clearError: () => void
  resetOtp: () => void
}

export const useOtpAuth = (): UseOtpAuthReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  // OTP 요청
  const requestOtpCode = useCallback(
    async (
      name: string,
      phoneNumber: string,
      birth: string,
      genderDigit: string,
      userRole: 'CUSTOMER' | 'OWNER' = 'CUSTOMER',
      purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET' = 'REGISTER'
    ): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        // regSessionId 생성 (현재 시간 기반 UUID 또는 세션 ID)
        const regSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // birth를 YYYY-MM-DD 형식으로 변환 (6자리 YYMMDD -> YYYY-MM-DD)
        const formattedBirth =
          birth && birth.length === 6
            ? `19${birth.slice(0, 2)}-${birth.slice(2, 4)}-${birth.slice(4, 6)}`
            : birth || ''

        const otpRequest: OtpRequest = {
          regSessionId,
          userRole,
          name: name || '',
          phoneNumber: phoneNumber || '',
          birth: formattedBirth,
          genderDigit: genderDigit || '',
        }

        // 디버깅용 로그
        console.log('OTP 요청 데이터:', otpRequest)
        console.log(
          'genderDigit 길이:',
          genderDigit?.length || 0,
          '값:',
          genderDigit || 'undefined'
        )

        const response = await requestOtp(otpRequest)
        console.log('OTP 요청 응답:', response)

        if (response.success) {
          setRequestId(response.data.regSessionId) // regSessionId를 requestId로 사용
          // expiresAt은 백엔드에서 제공하지 않으므로 임시로 3분 후로 설정
          const expiresTime = new Date(Date.now() + 3 * 60 * 1000).toISOString()
          setExpiresAt(expiresTime)
          console.log(
            'OTP 요청 성공, requestId(regSessionId) 설정됨:',
            response.data.regSessionId
          )
          console.log('발급된 OTP 번호:', response.data.otpNumber)
          return true
        } else {
          console.error('OTP 요청 실패:', response.message)
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
    },
    []
  )

  // OTP 검증
  const verifyOtpCode = useCallback(
    async (otpCode: string): Promise<OtpVerifyResponse | null> => {
      if (!requestId) {
        setError('OTP 요청이 필요합니다.')
        return null
      }

      try {
        setLoading(true)
        setError(null)

        const verifyRequest: OtpVerifyRequest = {
          regSessionId: requestId, // requestId는 실제로는 regSessionId
          code: otpCode,
        }

        const response = await verifyOtp(verifyRequest)
        console.log('OTP 검증 API 응답:', response)

        if (response.success) {
          console.log('OTP 검증 성공, 응답 데이터:', response.data)
          // regSessionId를 token 필드에 포함해서 반환
          return {
            ...response.data,
            token: requestId, // regSessionId를 token으로 사용
          }
        } else {
          console.log('OTP 검증 실패:', response.message)
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
    },
    [requestId]
  )

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
    resetOtp,
  }
}
