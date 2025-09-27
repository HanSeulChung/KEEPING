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

        // localStorage에서 regSessionId 가져오기 (auth/session-info에서 저장된 값)
        const regSessionId = localStorage.getItem('regSessionId')
        console.log('localStorage에서 가져온 regSessionId:', regSessionId)

        if (!regSessionId) {
          throw new Error(
            'regSessionId가 없습니다. 소셜로그인을 먼저 해주세요.'
          )
        }

        const requestData = {
          name,
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          birth: formattedBirth,
          genderDigit,
          userRole,
          regSessionId,
        }

        console.log('OTP 요청 데이터:', {
          ...requestData,
          originalBirth: birth,
          originalPhoneNumber: phoneNumber,
        })

        // 회원가입 단계: Authorization 헤더 없이 전송
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // 백엔드 직접 호출 (8080 등 환경변수 기반)
        const res = await fetch(buildURL(endpoints.auth.otpRequest), {
          method: 'POST',
          headers,
          credentials: 'include', // 쿠키 동반
          body: JSON.stringify(requestData),
        })

        console.log('=== 서버 응답 ===')
        console.log('Status:', res.status)
        console.log('Status Text:', res.statusText)
        console.log('Content-Type:', res.headers.get('content-type'))

        // 응답 텍스트 먼저 확인
        const responseText = await res.text()
        console.log('Raw response text:', responseText)

        type OtpProxyResponse = {
          success?: boolean
          message?: string
          data?: {
            requestId?: string
            expiresAt?: string
            regSessionId?: string
          }
        }
        let data: OtpProxyResponse = {}
        try {
          data = responseText ? JSON.parse(responseText) : {}
        } catch (parseError) {
          console.error('JSON 파싱 에러:', parseError)
          console.error('파싱 실패한 응답:', responseText)
        }

        console.log('Parsed data:', data)

        if (!res.ok || data?.success === false) {
          const errorMessage =
            data?.message ||
            (data as any)?.backend?.raw ||
            `서버 오류 (HTTP ${res.status})`
          console.error('OTP 요청 실패:', {
            status: res.status,
            statusText: res.statusText,
            errorMessage: errorMessage,
            data: data,
          })
          throw new Error(errorMessage)
        }

        // 서버가 만약 requestId/만료시각/regSessionId를 내려주면 저장
        setRequestId(data?.data?.requestId ?? null)
        setExpiresAt(data?.data?.expiresAt ?? null)
        if (data?.data?.regSessionId) {
          try {
            localStorage.setItem('regSessionId', String(data.data.regSessionId))
            console.log('응답에서 regSessionId 저장:', data.data.regSessionId)
          } catch {}
        }

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
        // localStorage에서 regSessionId 가져오기 (auth/session-info에서 저장된 값)
        const regSessionId = localStorage.getItem('regSessionId')
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

        // 백엔드 직접 호출 (8080 등 환경변수 기반)
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
