'use client'

import { useCallback, useState } from 'react'

type Purpose = 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
type Role = 'CUSTOMER' | 'OWNER'

type VerifyResult = { verified: boolean }

export function useOtpAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])
  const resetOtp = useCallback(() => {
    setLoading(false)
    setError(null)
    setRequestId(null)
    setExpiresAt(null)
  }, [])

  const requestOtpCode = useCallback(
    async (
      name: string,
      phoneNumber: string,
      birth: string,
      genderDigit: string,
      userRole: Role
    ) => {
      setLoading(true)
      setError(null)
      try {
        // birth를 YYYY-MM-DD 형식으로 변환 (6자리 YYMMDD -> YYYY-MM-DD)
        const formattedBirth =
          birth && birth.length === 6
            ? `20${birth.slice(0, 2)}-${birth.slice(2, 4)}-${birth.slice(4, 6)}`
            : birth || ''

        console.log('OTP 요청 데이터:', {
          name,
          phoneNumber,
          originalBirth: birth,
          formattedBirth,
          genderDigit,
          userRole
        })

        // localStorage에서 regSessionId 가져오기
        const regSessionId = localStorage.getItem('regSessionId')
        console.log('localStorage에서 가져온 regSessionId:', regSessionId)

        if (!regSessionId) {
          throw new Error('regSessionId가 없습니다. 소셜로그인을 먼저 해주세요.')
        }

        const res = await fetch('/api/otp/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 쿠키 동반
          body: JSON.stringify({
            name,
            phoneNumber,
            birth: formattedBirth,
            genderDigit,
            userRole,
            regSessionId,
          }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || `OTP 요청 실패 (HTTP ${res.status})`)
        }

        // 서버가 만약 requestId/만료시각을 내려주면 저장
        setRequestId(data?.data?.requestId ?? null)
        setExpiresAt(data?.data?.expiresAt ?? null)
        
        // OTP 요청 응답에서 regSessionId 확인
        if (data?.data?.regSessionId) {
          console.log('OTP 요청 응답의 regSessionId:', data.data.regSessionId)
          // localStorage에 저장
          localStorage.setItem('regSessionId', data.data.regSessionId)
        }
        
        return true
      } catch (e: any) {
        setError(e?.message ?? 'OTP 요청 중 오류가 발생했습니다.')
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const verifyOtpCode = useCallback(
    async (code: string): Promise<VerifyResult | null> => {
      setLoading(true)
      setError(null)
      try {
        // localStorage에서 regSessionId 가져오기
        const regSessionId = localStorage.getItem('regSessionId')
        console.log('OTP 검증에 사용할 regSessionId:', regSessionId)

        if (!regSessionId) {
          throw new Error('regSessionId가 없습니다. 소셜로그인을 먼저 해주세요.')
        }

        const res = await fetch('/api/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 쿠키 동반
          body: JSON.stringify({
            regSessionId,
            code,
          }),
        })

        const data = await res.json().catch(() => ({}))
        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || `OTP 검증 실패 (HTTP ${res.status})`)
        }

        // OTP 검증 응답에서 regSessionId 확인
        if (data?.data?.regSessionId) {
          console.log('OTP 검증 응답의 regSessionId:', data.data.regSessionId)
          // localStorage에 저장
          localStorage.setItem('regSessionId', data.data.regSessionId)
        }

        // OTP 검증 성공 시 백엔드에 OTP 인증 완료 상태 알림
        if (data?.success) {
          console.log('OTP 검증 성공! 백엔드에 OTP 인증 완료 상태 전달')
        }

        // 서버가 success 플래그를 내려준다고 가정
        return { verified: true }
      } catch (e: any) {
        setError(e?.message ?? 'OTP 검증 중 오류가 발생했습니다.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [requestId]
  )

  return {
    loading,
    error,
    requestId,
    expiresAt,
    clearError,
    resetOtp,
    requestOtpCode,
    verifyOtpCode,
  }
}