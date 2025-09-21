'use client'

import OtpVerificationModal from '@/components/common/OtpVerificationModal'
import PhoneNumberInput from '@/components/common/PhoneNumberInput'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface KeepingPassAuthProps {
  purpose: 'REGISTER' | 'LOGIN' | 'PASSWORD_RESET'
  onSuccess?: (token?: string) => void
  redirectTo?: string
  name?: string
  birth?: string
  genderDigit?: string
  userRole?: 'CUSTOMER' | 'OWNER'
}

const KeepingPassAuth = ({
  purpose,
  onSuccess,
  redirectTo,
  name = '',
  birth = '',
  genderDigit = '',
  userRole = 'CUSTOMER',
}: KeepingPassAuthProps) => {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePhoneSubmit = (phone: string) => {
    setPhoneNumber(phone)
    setShowOtpModal(true)
    setLoading(false)
  }

  const handleOtpSuccess = (token?: string) => {
    if (onSuccess) {
      onSuccess(token)
    } else if (redirectTo) {
      router.push(redirectTo)
    } else {
      // 기본 리다이렉트
      switch (purpose) {
        case 'REGISTER':
          router.push('/owner/register')
          break
        case 'LOGIN':
          router.push('/owner/dashboard')
          break
        case 'PASSWORD_RESET':
          router.push('/owner/login')
          break
        default:
          router.push('/')
      }
    }
  }

  const getTitle = () => {
    switch (purpose) {
      case 'REGISTER':
        return '회원가입 인증'
      case 'LOGIN':
        return '로그인 인증'
      case 'PASSWORD_RESET':
        return '비밀번호 재설정 인증'
      default:
        return 'KEEPING PASS 인증'
    }
  }

  const getDescription = () => {
    switch (purpose) {
      case 'REGISTER':
        return '회원가입을 위해 휴대폰 번호를 입력해주세요'
      case 'LOGIN':
        return '로그인을 위해 휴대폰 번호를 입력해주세요'
      case 'PASSWORD_RESET':
        return '비밀번호 재설정을 위해 휴대폰 번호를 입력해주세요'
      default:
        return '휴대폰 번호를 입력해주세요'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <PhoneNumberInput
          onPhoneSubmit={handlePhoneSubmit}
          loading={loading}
          title={getTitle()}
          description={getDescription()}
        />
      </div>

      {/* OTP 인증 모달 */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        phoneNumber={phoneNumber}
        name={name}
        birth={birth}
        genderDigit={genderDigit}
        userRole={userRole}
        onSuccess={handleOtpSuccess}
      />
    </div>
  )
}

export default KeepingPassAuth
