'use client'

import { buildURL } from '@/api/config'
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
    })

    // regSessionId 사전 확보 (세션 쿠키 기반)
    try {
      const existing =
        typeof window !== 'undefined'
          ? localStorage.getItem('regSessionId')
          : null
      if (!existing) {
        const res = await fetch(buildURL('/auth/session-info'), {
          method: 'GET',
          credentials: 'include',
        })
        if (res.ok) {
          const json = await res.json().catch(() => ({}))
          const id = json?.data
          if (id) {
            try {
              localStorage.setItem('regSessionId', String(id))
            } catch {}
          }
        }
      }
    } catch {}

    const success = await requestOtpCode(
      name,
      phoneNumber,
      birth,
      genderDigit,
      userRole
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
      onSuccess()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="h-[20.6875rem] w-[412px]">
        <div className="h-[20.6875rem] w-[412px] flex-shrink-0 rounded-[30px] bg-[#fbf9f5]">
          {/* 제목과 닫기 버튼 */}
          <div className="flex items-center justify-between px-6 pt-6">
            <div className="font-jalnan text-2xl leading-[140%] text-[#ffc800]">
              문자 인증
            </div>
            <button
              onClick={handleClose}
              className="text-[#ffc800] hover:text-[#ffc800]/80"
            >
              <svg
                width={36}
                height={36}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.5 13.5L13.5 22.5M13.5 13.5L22.5 22.5M33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18Z"
                  stroke="#FFC800"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* 상단 바 */}
          <div className="mt-4 flex justify-center">
            <div className="h-[0.1875rem] w-96 bg-[#ffc800]" />
          </div>

          {/* 안내 메시지 */}
          <div className="flex justify-center px-6 py-6">
            <div className="font-nanum-square-round-eb text-center text-lg leading-[140%] font-bold text-gray-500">
              입력하신 번호로 인증번호가 전송되었습니다.
              <br />
              인증번호를 입력해 인증을 완료해주세요 !
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-4 flex justify-center px-6">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="font-nanum-square-round-eb text-sm text-red-600">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* OTP 입력 필드 */}
          <div className="mb-4 flex justify-center px-6">
            <div className="flex h-12 w-[22rem] flex-shrink-0 items-center justify-end rounded-[0.625rem] border-[3px] border-[#d9d9d9] pl-[18rem]">
              <input
                type="text"
                value={otpCode}
                onChange={e =>
                  setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="6자리 인증번호"
                className="font-nanum-square-round-eb h-full flex-1 px-4 text-center text-lg focus:outline-none"
                maxLength={6}
              />
              <div className="flex h-12 w-20 flex-shrink-0 items-center justify-center rounded-tr-[0.625rem] rounded-br-[0.625rem] bg-[#fdda60] px-3 pt-2 pb-[0.4375rem]">
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || !otpCode || otpCode.length !== 6}
                  className="font-jalnan flex h-[1.5625rem] w-12 flex-shrink-0 items-center justify-center text-xl leading-[140%] text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? '인증 중...' : '입력'}
                </button>
              </div>
            </div>
          </div>

          {/* 타이머 */}
          {timeLeft > 0 && (
            <div className="mb-4 flex justify-center px-6">
              <span className="font-nanum-square-round-eb text-base font-bold text-red-500">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {/* 재전송 버튼 */}
          <div className="flex justify-center px-6">
            <button
              onClick={handleRequestOtp}
              disabled={loading || timeLeft > 0}
              className="font-nanum-square-round-eb text-base text-[#ffc800] hover:text-[#ffc800]/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '전송 중...' : '인증번호 재전송'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OtpVerificationModal
