'use client'

import OtpVerificationModal from '@/components/common/OtpVerificationModal'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CustomerStep1Page() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [residentNumber, setResidentNumber] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [genderCode, setGenderCode] = useState('')
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [isAuthCompleted, setIsAuthCompleted] = useState(false)

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

      setBirthDate(newBirthDate)
      setGenderCode(newGenderCode)

      let displayValue = ''
      if (input.length <= 6) {
        displayValue = input
      } else {
        displayValue = `${newBirthDate}-${newGenderCode}${'●'.repeat(6)}`
      }

      setResidentNumber(displayValue)
    }
  }

  const handlePassAuth = () => {
    if (!name) {
      alert('이름을 먼저 입력해주세요.')
      return
    }
    if (!phoneNumber) {
      alert('전화번호를 먼저 입력해주세요.')
      return
    }
    if (!residentNumber) {
      alert('주민등록번호를 먼저 입력해주세요.')
      return
    }
    setIsOtpModalOpen(true)
  }

  const handleOtpSuccess = (token?: string) => {
    console.log('OTP 인증 성공 콜백 호출됨')
    console.log('받은 token 값:', token)

    setIsOtpModalOpen(false)
    setIsAuthCompleted(true)

    // OTP에서 받은 token을 localStorage에 저장
    if (token) {
      localStorage.setItem('regSessionId', token)
      console.log('OTP에서 받은 token을 regSessionId로 저장:', token)
    }

    console.log('인증 완료 상태로 변경, 다음 단계 버튼 활성화')
  }

  const handleNextStep = () => {
    router.push('/customer/register/step2')
  }

  return (
    <div className="mx-auto flex h-[917px] w-[412px] flex-col items-center justify-center bg-white p-6">
      {/* 제목 */}
      <div className="mb-8">
        <h1 className="font-jalnan text-center text-3xl leading-[140%] text-black">
          사용자 인증
        </h1>
      </div>

      {/* 입력 필드들 */}
      <div className="w-full max-w-[19.625rem] space-y-6">
        {/* 이름 */}
        <div className="space-y-2">
          <label className="font-nanum-square-round-eb text-base leading-[140%] font-bold text-gray-500">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="이름을 입력해주세요"
            className="font-nanum-square-round-eb h-[2.8125rem] w-full flex-shrink-0 rounded-[1.25rem] border-[3px] border-[#d9d9d9] bg-white px-4 text-center text-base focus:border-[#fdda60] focus:outline-none"
          />
        </div>

        {/* 전화번호 */}
        <div className="space-y-2">
          <label className="font-nanum-square-round-eb text-base leading-[140%] font-bold text-gray-500">
            전화번호
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(formatPhoneNumber(e.target.value))}
            placeholder="010-1234-5678"
            maxLength={13}
            className="font-nanum-square-round-eb h-[2.8125rem] w-full flex-shrink-0 rounded-[1.25rem] border-[3px] border-[#d9d9d9] bg-white px-4 text-center text-base focus:border-[#fdda60] focus:outline-none"
          />
        </div>

        {/* 주민등록번호 */}
        <div className="space-y-2">
          <label className="font-nanum-square-round-eb text-base leading-[140%] font-bold text-gray-500">
            주민등록번호
          </label>
          <input
            type="text"
            value={residentNumber}
            onChange={handleResidentNumberChange}
            placeholder="생년월일 6자리 - 성별코드 1자리"
            maxLength={14}
            className="font-nanum-square-round-eb h-[2.8125rem] w-full flex-shrink-0 rounded-[1.25rem] border-[3px] border-[#d9d9d9] bg-white px-4 text-center text-base focus:border-[#fdda60] focus:outline-none"
          />
        </div>
      </div>

      {/* KEEPING PASS 인증 버튼/상태 */}
      <div className="mt-8">
        {!isAuthCompleted ? (
          <button
            type="button"
            onClick={handlePassAuth}
            disabled={!name || !phoneNumber || !residentNumber}
            className="flex h-[2.8125rem] w-[23.75rem] flex-shrink-0 items-center justify-center rounded-[0.625rem] bg-[#fdda60] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="font-jalnan text-[1.5625rem] leading-[140%] text-white">
              KEEPING PASS로 인증하기
            </span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-nanum-square-round-eb text-center font-bold text-green-800">
                ✅ 본인 인증이 완료되었습니다!
              </p>
            </div>
            <button
              type="button"
              onClick={handleNextStep}
              className="flex h-[2.8125rem] w-[23.75rem] flex-shrink-0 items-center justify-center rounded-[0.625rem] bg-[#fdda60]"
            >
              <span className="font-jalnan text-[1.5625rem] leading-[140%] text-white">
                다음 단계로
              </span>
            </button>
          </div>
        )}
      </div>

      {/* OTP 인증 모달 */}
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phoneNumber={phoneNumber.replace(/\D/g, '')}
        name={name}
        birth={
          birthDate && birthDate.length === 6
            ? `20${birthDate.slice(0, 2)}-${birthDate.slice(2, 4)}-${birthDate.slice(4, 6)}`
            : birthDate
        }
        genderDigit={genderCode}
        userRole="CUSTOMER"
        onSuccess={handleOtpSuccess}
      />
    </div>
  )
}
