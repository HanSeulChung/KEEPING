'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UserRegisterFormProps {
  onNext?: () => void
}

export default function UserRegisterForm({ onNext }: UserRegisterFormProps) {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: '',
    residentNumber: '',
    phoneNumber: '',
    birthDate: '',
    genderCode: '',
  })

  const handlePassAuth = () => {
    // KEEPING PASS 앱으로 이동 (실제로는 딥링크 사용)
    // 여기서는 시뮬레이션으로 모달 표시
    setIsModalOpen(true)
  }

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false)
    setIsModalOpen(false)
    setIsAuthCompleted(true)
  }

  const handleFormChange = (field: keyof AuthForm, value: string) => {
    setAuthForm(prev => ({
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

      setAuthForm(prev => ({
        ...prev,
        residentNumber: displayValue,
      }))
    }
  }

  const handleNextStep = () => {
    onNext?.()
  }

  const handleAuthButtonClick = () => {
    setIsAuthModalOpen(true)
  }

  return (
    <div>
      {!isAuthCompleted ? (
        <button
          type="button"
          onClick={handlePassAuth}
          className="mt-4 rounded bg-gray-800 px-4 py-2 text-white"
        >
          KEEPING PASS로 본인 인증하기
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="font-medium text-blue-800">인증이 완료되었습니다!</p>
          </div>
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            다음 단계로
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative h-[600px] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
            {/* KEEPING PASS 로고 */}
            <div className="absolute top-8 left-6 font-['Tenada'] text-2xl font-extrabold text-black">
              KEEPING PASS
            </div>

            {/* 닫기 버튼 */}
            <button
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 transition-colors hover:bg-gray-100"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="text-sm font-bold text-gray-800">×</span>
            </button>

            {/* 서브타이틀 */}
            <div className="absolute top-16 left-6 text-sm font-normal text-black">
              간편 본인확인 정보 등록
            </div>

            {/* 본문 영역 - 인증 폼 */}
            <div className="absolute top-24 right-6 bottom-20 left-6 overflow-y-auto bg-white">
              <div className="space-y-4 p-4">
                <div>
                  <div className="mb-2 rounded-lg bg-gray-100 px-3 py-2">
                    <label className="text-sm font-medium text-gray-700">
                      이름
                    </label>
                  </div>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="이름을 입력해 주세요."
                  />
                </div>

                <div>
                  <div className="mb-2 rounded-lg bg-gray-100 px-3 py-2">
                    <label className="text-sm font-medium text-gray-700">
                      주민등록번호
                    </label>
                  </div>
                  <input
                    type="text"
                    value={authForm.residentNumber}
                    onChange={handleResidentNumberChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="생년월일 6자리 -_●●●●●●●"
                    maxLength={14}
                  />
                </div>

                <div>
                  <div className="mb-2 rounded-lg bg-gray-100 px-3 py-2">
                    <label className="text-sm font-medium text-gray-700">
                      전화번호
                    </label>
                  </div>
                  <input
                    type="tel"
                    value={authForm.phoneNumber}
                    onChange={e =>
                      handleFormChange(
                        'phoneNumber',
                        formatPhoneNumber(e.target.value)
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                </div>
              </div>
            </div>

            {/* 인증하기 버튼 */}
            <div className="absolute right-6 bottom-16 left-6">
              <button
                className="w-full rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800"
                onClick={handleAuthButtonClick}
              >
                인증하기
              </button>
            </div>

            {/* KEEPING 브랜드명 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform font-['Tenada'] text-sm font-extrabold text-black">
              KEEPING
            </div>
          </div>
        </div>
      )}

      {/* 두 번째 모달 - 실제 인증 화면 */}
      {isAuthModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
          <div className="relative h-[600px] w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
            {/* KEEPING PASS 로고 */}
            <div className="absolute top-8 left-6 font-['Tenada'] text-2xl font-extrabold text-black">
              KEEPING PASS
            </div>

            {/* 닫기 버튼 */}
            <button
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 transition-colors hover:bg-gray-100"
              onClick={() => setIsAuthModalOpen(false)}
            >
              <span className="text-sm font-bold text-gray-800">×</span>
            </button>

            {/* 서브타이틀 */}
            <div className="absolute top-16 left-6 text-sm font-normal text-black">
              간편 본인확인 정보 등록
            </div>

            {/* 상단 구분선 */}
            <div className="absolute top-20 right-6 left-6 border-t border-gray-300"></div>

            {/* 본문 영역 - 인증 완료 메시지 */}
            <div className="absolute top-24 right-6 bottom-20 left-6 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-8 w-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  인증이 완료되었습니다!
                </h3>
                <p className="text-sm text-gray-600">
                  본인확인이 성공적으로 완료되었습니다.
                </p>
              </div>
            </div>

            {/* 인증하기 버튼 */}
            <div className="absolute right-6 bottom-16 left-6">
              <button
                className="w-full rounded-lg bg-black py-3 font-medium text-white transition-colors hover:bg-gray-800"
                onClick={handleAuthSuccess}
              >
                인증하기
              </button>
            </div>

            {/* KEEPING 브랜드명 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform font-['Tenada'] text-sm font-extrabold text-black">
              KEEPING
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
