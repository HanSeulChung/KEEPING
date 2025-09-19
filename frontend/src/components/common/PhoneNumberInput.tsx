'use client'

import React, { useState } from 'react'

interface PhoneNumberInputProps {
  onPhoneSubmit: (phoneNumber: string) => void
  loading?: boolean
  title?: string
  description?: string
}

const PhoneNumberInput = ({ 
  onPhoneSubmit, 
  loading = false, 
  title = "KEEPING PASS 인증",
  description = "휴대폰 번호를 입력해주세요"
}: PhoneNumberInputProps) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '')
    
    // 11자리 제한
    const limitedNumbers = numbers.slice(0, 11)
    
    // 하이픈 추가
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
    setError('')
  }

  const validatePhoneNumber = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    
    if (!numbers) {
      return '휴대폰 번호를 입력해주세요.'
    }
    
    if (numbers.length !== 11) {
      return '올바른 휴대폰 번호를 입력해주세요. (11자리)'
    }
    
    if (!numbers.startsWith('010')) {
      return '010으로 시작하는 휴대폰 번호를 입력해주세요.'
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validatePhoneNumber(phoneNumber)
    if (validationError) {
      setError(validationError)
      return
    }
    
    const cleanPhoneNumber = phoneNumber.replace(/\D/g, '')
    onPhoneSubmit(cleanPhoneNumber)
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-['Tenada'] font-extrabold text-black mb-2">
          {title}
        </h1>
        <p className="text-gray-600 font-['nanumsquare']">
          {description}
        </p>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 전화번호 입력 */}
        <div>
          <label className="block text-sm font-['nanumsquare'] font-bold text-black mb-2">
            휴대폰 번호
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg font-['nanumsquare'] focus:border-black focus:outline-none transition-colors"
            maxLength={13}
          />
          {error && (
            <p className="mt-2 text-sm text-red-500 font-['nanumsquare']">{error}</p>
          )}
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading || !phoneNumber}
          className="w-full py-4 bg-black text-white rounded-lg font-['nanumsquare'] font-bold text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '전송 중...' : '인증번호 받기'}
        </button>
      </form>

      {/* 안내 메시지 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 font-['nanumsquare']">
          • 입력하신 휴대폰 번호로 인증번호가 발송됩니다.<br/>
          • 인증번호는 3분 후 만료됩니다.<br/>
          • 개인정보는 인증 목적으로만 사용됩니다.
        </p>
      </div>
    </div>
  )
}

export default PhoneNumberInput
