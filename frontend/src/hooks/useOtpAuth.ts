'use client'

import { buildURL, endpoints } from '@/api/config'
import { useCallback, useState } from 'react'

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
    ): Promise<boolean> => {
      setLoading(true)
      setError(null)
      try {
        // birth를 YYYY-MM-DD 형식으로 변환
        let formattedBirth = birth || ''

        if (birth) {
          if (birth.length === 6) {
            // 6자리 YYMMDD -> YYYY-MM-DD (90년대는 19XX, 00년대는 20XX)
            const year = parseInt(birth.slice(0, 2))
            const fullYear =
              year >= 90 ? `19${birth.slice(0, 2)}` : `20${birth.slice(0, 2)}`
            formattedBirth = `${fullYear}-${birth.slice(2, 4)}-${birth.slice(4, 6)}`
          } else if (!birth.includes('-') && birth.length === 8) {
            // YYYYMMDD -> YYYY-MM-DD
            formattedBirth = `${birth.slice(0, 4)}-${birth.slice(4, 6)}-${birth.slice(6, 8)}`
          }
          // 이미 YYYY-MM-DD 형식이면 그대로 사용
        }

        console.log('OTP 요청 데이터:', {
          name,
          phoneNumber,
          originalBirth: birth,
          formattedBirth,
          genderDigit,
          userRole,
        })

        // 쿠키에서 regSessionId 가져오기
        const regSessionId = document.cookie
          .split(';')
          .find(row => row.trim().startsWith('regSessionId='))
          ?.split('=')[1]
        console.log('쿠키에서 가져온 regSessionId:', regSessionId)

        if (!regSessionId) {
          throw new Error(
            'regSessionId가 없습니다. 소셜로그인을 먼저 해주세요.'
          )
        }

        // 회원가입 단계: Authorization 헤더 없이 전송
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        const res = await fetch(buildURL(endpoints.auth.otpRequest), {
          method: 'POST',
          headers,
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

        return true
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err && 'message' in err
            ? String((err as any).message)
            : 'OTP 요청 중 오류가 발생했습니다.'
        setError(message)
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
        // 쿠키에서 regSessionId 가져오기
        const regSessionId = document.cookie
          .split(';')
          .find(row => row.trim().startsWith('regSessionId='))
          ?.split('=')[1]
        console.log('OTP 검증에 사용할 regSessionId:', regSessionId)

        if (!regSessionId) {
          throw new Error(
            'regSessionId가 없습니다. 소셜로그인을 먼저 해주세요.'
          )
        }

        // 회원가입 단계: Authorization 헤더 없이 전송
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        const res = await fetch(buildURL(endpoints.auth.otpVerify), {
          method: 'POST',
          headers,
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

        // OTP 검증 성공 시 백엔드에 OTP 인증 완료 상태 알림
        if (data?.success) {
          console.log('OTP 검증 성공! 백엔드에 OTP 인증 완료 상태 전달')
        }

        // 서버가 success 플래그를 내려준다고 가정
        return { verified: true }
      } catch (err: unknown) {
        const message =
          typeof err === 'object' && err && 'message' in err
            ? String((err as any).message)
            : 'OTP 검증 중 오류가 발생했습니다.'
        setError(message)
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
