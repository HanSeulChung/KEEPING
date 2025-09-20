'use client'

import { buildURL } from '@/api/config'
import OtpVerificationModal from '@/components/common/OtpVerificationModal'
import { AuthForm } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface CustomerAuthFormProps {
  onNext?: () => void
}

export default function CustomerAuthForm({ onNext }: CustomerAuthFormProps) {
  const router = useRouter()
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)
  const [sessionRegSessionId, setSessionRegSessionId] = useState<string | null>(null)
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    residentNumber: '',
    phoneNumber: '',
    birthDate: '',
    genderCode: '',
  })

  useEffect(() => {
    // 세션에서 regSessionId 가져오기
    const fetchSessionInfo = async () => {
      try {
        const response = await fetch(buildURL('/auth/session-info'), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        })
        const data = await response.json()
        if (data.success && data.data) {
          setSessionRegSessionId(data.data as string)
          console.log('세션에서 가져온 regSessionId:', data.data)
        } else {
          console.log('세션 정보를 가져올 수 없습니다.')
        }
      } catch (error) {
        console.error('세션 정보 조회 실패:', error)
      }
    }

    fetchSessionInfo()
  }, [])

  const handlePassAuth = () => {
    // 전화번호가 입력되어 있는지 확인
    if (!authForm.phoneNumber) {
      alert('전화번호를 먼저 입력해주세요.')
      return
    }
    if (!sessionRegSessionId) {
      alert('세션 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    // OTP 인증 모달 열기
    setIsOtpModalOpen(true)
  }

  const handleOtpSuccess = () => {
    setIsOtpModalOpen(false)
    setIsAuthCompleted(true)

    // 세션에서 가져온 UUID만 저장(모달에서 받은 토큰 무시)
    if (sessionRegSessionId) {
      localStorage.setItem('regSessionId', sessionRegSessionId)
      console.log('세션 regSessionId 저장:', sessionRegSessionId)
    }
    console.log('인증 완료 → 다음 단계 버튼 활성화')
  }

  const handleFormChange = (field: keyof AuthForm, value: string) => {
    setAuthForm((prev: AuthForm) => ({
      ...prev,
      [field]: value,
    }))
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
      const newBirthDate = input.slice(0, 6)
      const newGenderCode = input.slice(6, 7) // 7번째 자리만 (1자리)

      setAuthForm((prev: AuthForm) => ({
        ...prev,
        birthDate: newBirthDate,
        genderCode: newGenderCode, // 1자리만
      }))

      let displayValue = ''
      if (input.length <= 6) {
        displayValue = input
      } else {
        displayValue = `${newBirthDate}-${newGenderCode}${'●'.repeat(6)}`
      }

      setAuthForm((prev: AuthForm) => ({
        ...prev,
        residentNumber: displayValue,
      }))
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

      {/* 인증 버튼 */}
      {!isAuthCompleted ? (
        <button
          type="button"
          onClick={handlePassAuth}
          disabled={
            !authForm.name || !authForm.residentNumber || !authForm.phoneNumber
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

      {/* OTP 인증 모달 */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phoneNumber={authForm.phoneNumber.replace(/\D/g, '')}
        name={authForm.name}
        birth={authForm.birthDate && authForm.birthDate.length === 6 
          ? `20${authForm.birthDate.slice(0, 2)}-${authForm.birthDate.slice(2, 4)}-${authForm.birthDate.slice(4, 6)}`
          : authForm.birthDate}
        genderDigit={authForm.genderCode}
        userRole="CUSTOMER"
        onSuccess={handleOtpSuccess}
      />
    </div>
  )
}
