'use client'

import { buildURL } from '@/api/config'
import OtpVerificationModal from '@/components/common/OtpVerificationModal'
import { AuthForm } from '@/types'
import { useState, useEffect } from 'react'

interface UserRegisterFormProps {
  onNext?: () => void
}

export default function UserRegisterForm({ onNext }: UserRegisterFormProps) {
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)
  const [isSessionInfoLoaded, setIsSessionInfoLoaded] = useState(false)
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    residentNumber: '',
    phoneNumber: '',
    birthDate: '',
    genderCode: '',
  })

  useEffect(() => {
    // 이미 로드되었거나 로딩 중이면 중복 실행 방지
    if (isSessionInfoLoaded) return

    // auth/session-info에서 regSessionId 확인
    const checkRegSessionId = async () => {
      try {
        const response = await fetch(buildURL('/auth/session-info'), {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const result = await response.json()
          const regSessionId = result?.data

          if (regSessionId) {
            // localStorage에 저장
            localStorage.setItem('regSessionId', regSessionId)
            console.log('auth/session-info에서 가져온 regSessionId를 localStorage에 저장:', regSessionId)
          } else {
            console.log('auth/session-info에서 regSessionId를 찾을 수 없습니다.')
          }
        } else {
          console.log('auth/session-info 호출 실패:', response.status)
        }
      } catch (error) {
        console.error('auth/session-info 호출 실패:', error)
      } finally {
        setIsSessionInfoLoaded(true)
      }
    }

    checkRegSessionId()
  }, [isSessionInfoLoaded])

  const handlePassAuth = () => {
    // 전화번호가 입력되어 있는지 확인
    if (!authForm.phoneNumber) {
      alert('전화번호를 먼저 입력해주세요.')
      return
    }

    // localStorage에서 regSessionId 확인
    const regSessionId = localStorage.getItem('regSessionId')

    if (!regSessionId) {
      alert('세션 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // OTP 인증 모달 열기
    setIsOtpModalOpen(true)
  }

  const handleOtpSuccess = () => {
    console.log('OTP 인증 성공 콜백 호출됨')
    setIsOtpModalOpen(false)
    setIsAuthCompleted(true)
    console.log('인증 완료 상태로 변경, 다음 단계 버튼 활성화')
  }

  const handleFormChange = (field: keyof AuthForm, value: string) => {
    setAuthForm(prev => ({ ...prev, [field]: value }))
  }

  const formatPhoneNumber = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const handleResidentNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const input = e.target.value.replace(/\D/g, '')

    if (input.length <= 7) {
      const newBirthDate = input.slice(0, 6) // YYMMDD
      const newGenderCode = input.slice(6, 7) // 1자리

      setAuthForm(prev => ({
        ...prev,
        birthDate: newBirthDate,
        genderCode: newGenderCode,
      }))

      let displayValue = ''
      if (input.length <= 6) {
        displayValue = input
      } else {
        displayValue = `${newBirthDate}-${newGenderCode}${'●'.repeat(6)}`
      }

      setAuthForm(prev => ({ ...prev, residentNumber: displayValue }))
    }
  }

  const handleNextStep = () => {
    console.log('step2로 이동')
    onNext?.()
  }

  return (
    <div className="space-y-6">
      {/* 입력 폼 */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
            이름
          </label>
          <input
            type="text"
            value={authForm.name}
            onChange={e => handleFormChange('name', e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-3 font-['nanumsquare'] focus:border-black focus:outline-none"
            placeholder="이름을 입력해주세요"
          />
        </div>

        <div>
          <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
            주민등록번호
          </label>
          <input
            type="text"
            value={authForm.residentNumber}
            onChange={handleResidentNumberChange}
            className="w-full rounded-lg border border-gray-300 p-3 font-['nanumsquare'] focus:border-black focus:outline-none"
            placeholder="생년월일 6자리 - 성별코드 1자리"
            maxLength={14}
          />
        </div>

        <div>
          <label className="mb-2 block font-['nanumsquare'] text-sm font-bold text-black">
            전화번호
          </label>
          <input
            type="tel"
            value={authForm.phoneNumber}
            onChange={e =>
              handleFormChange('phoneNumber', formatPhoneNumber(e.target.value))
            }
            className="w-full rounded-lg border border-gray-300 p-3 font-['nanumsquare'] focus:border-black focus:outline-none"
            placeholder="010-1234-5678"
            maxLength={13}
          />
        </div>
      </div>

      {/* 인증 버튼/상태 */}
      {!isAuthCompleted ? (
        <button
          type="button"
          onClick={handlePassAuth}
          disabled={
            !authForm.name || !authForm.residentNumber || !authForm.phoneNumber || !authForm.genderCode
          }
          className="w-full rounded-lg bg-black py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          KEEPING PASS로 본인 인증하기
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-center font-['nanumsquare'] font-bold text-green-800">
              ✅ 본인 인증이 완료되었습니다!
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full rounded-lg bg-blue-600 py-3 font-['nanumsquare'] font-bold text-white transition-colors hover:bg-blue-700"
          >
            다음 단계로
          </button>
        </div>
      )}

      {/* OTP 모달 */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phoneNumber={authForm.phoneNumber.replace(/\D/g, '')}
        name={authForm.name}
        birth={authForm.birthDate}
        genderDigit={authForm.genderCode}
        userRole="OWNER"
        onSuccess={handleOtpSuccess}
      />
    </div>
  )
}
