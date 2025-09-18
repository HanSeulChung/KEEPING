'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AuthForm } from '@/types'
import OtpVerificationModal from '@/components/common/OtpVerificationModal'

interface UserRegisterFormProps {
  onNext?: () => void
}

export default function UserRegisterForm({ onNext }: UserRegisterFormProps) {
  const router = useRouter()
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    residentNumber: '',
    phoneNumber: '',
    birthDate: '',
    genderCode: '',
  })

  const handlePassAuth = () => {
    // 전화번호가 입력되어 있는지 확인
    if (!authForm.phoneNumber) {
      alert('전화번호를 먼저 입력해주세요.')
      return
    }
    
    // OTP 인증 모달 열기
    setIsOtpModalOpen(true)
  }

  const handleOtpSuccess = (token?: string) => {
    setIsOtpModalOpen(false)
    setIsAuthCompleted(true)
    // 토큰이 있다면 저장 (실제로는 secure storage 사용)
    if (token) {
      localStorage.setItem('keepingPassToken', token)
    }
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
      const newGenderCode = input.slice(6, 7)

      setAuthForm((prev: AuthForm) => ({
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

      setAuthForm((prev: AuthForm) => ({
        ...prev,
        residentNumber: displayValue,
      }))
    }
  }

  const handleNextStep = () => {
    onNext?.()
  }

  return (
    <div className="space-y-6">
      {/* 개인정보 입력 폼 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">
            이름
          </label>
          <input
            type="text"
            value={authForm.name}
            onChange={e => handleFormChange('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-['nanumsquare'] focus:border-black focus:outline-none"
            placeholder="이름을 입력해주세요"
          />
        </div>

        <div>
          <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">
            주민등록번호
          </label>
          <input
            type="text"
            value={authForm.residentNumber}
            onChange={handleResidentNumberChange}
            className="w-full p-3 border border-gray-300 rounded-lg font-['nanumsquare'] focus:border-black focus:outline-none"
            placeholder="생년월일 6자리 - 성별코드 1자리"
            maxLength={14}
          />
        </div>

        <div>
          <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">
            전화번호
          </label>
          <input
            type="tel"
            value={authForm.phoneNumber}
            onChange={e =>
              handleFormChange(
                'phoneNumber',
                formatPhoneNumber(e.target.value)
              )
            }
            className="w-full p-3 border border-gray-300 rounded-lg font-['nanumsquare'] focus:border-black focus:outline-none"
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
          disabled={!authForm.name || !authForm.residentNumber || !authForm.phoneNumber}
          className="w-full py-3 bg-black text-white rounded-lg font-['nanumsquare'] font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          KEEPING PASS로 본인 인증하기
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-['nanumsquare'] font-bold text-green-800 text-center">
              ✅ 본인 인증이 완료되었습니다!
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-['nanumsquare'] font-bold hover:bg-blue-700 transition-colors"
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
        purpose="REGISTER"
        onSuccess={handleOtpSuccess}
      />
    </div>
  )
}
