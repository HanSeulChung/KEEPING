'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const BusinessRegistration = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    businessNumber: '',
    openingDate: '',
    representativeName: ''
  })
  const [errors, setErrors] = useState({
    businessNumber: false,
    openingDate: false,
    representativeName: false
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 입력 시 에러 상태 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      businessNumber: !formData.businessNumber.trim(),
      openingDate: !formData.openingDate.trim(),
      representativeName: !formData.representativeName.trim()
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const validateBusinessNumber = (businessNumber: string) => {
    // 사업자 등록번호 형식 검증 (10자리 숫자)
    const cleaned = businessNumber.replace(/[^0-9]/g, '')
    return cleaned.length === 10
  }

  const validateOpeningDate = (date: string) => {
    // YYYYMMDD 형식 검증
    const cleaned = date.replace(/[^0-9]/g, '')
    if (cleaned.length !== 8) return false
    
    const year = parseInt(cleaned.substring(0, 4))
    const month = parseInt(cleaned.substring(4, 6))
    const day = parseInt(cleaned.substring(6, 8))
    
    // 기본적인 날짜 유효성 검사
    if (year < 1900 || year > new Date().getFullYear()) return false
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false
    
    return true
  }

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    // 사업자 등록번호 형식 검증
    if (!validateBusinessNumber(formData.businessNumber)) {
      alert('사업자 등록번호는 10자리 숫자여야 합니다.')
      setErrors(prev => ({ ...prev, businessNumber: true }))
      return
    }

    // 개업일자 형식 검증
    if (!validateOpeningDate(formData.openingDate)) {
      alert('개업일자는 YYYYMMDD 형식으로 입력해주세요.')
      setErrors(prev => ({ ...prev, openingDate: true }))
      return
    }

    // 사업자 정보를 localStorage에 저장
    const businessInfo = {
      businessNumber: formData.businessNumber.replace(/[^0-9]/g, ''), // 숫자만 저장
      openingDate: formData.openingDate.replace(/[^0-9]/g, ''),
      representativeName: formData.representativeName.trim()
    }
    
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo))
    
    console.log('사업자 인증 데이터 저장:', businessInfo)
    router.push('/owner/register/step3')
  }

  const formatBusinessNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '')
    
    // 10자리까지만 허용
    if (numbers.length <= 10) {
      // XXX-XX-XXXXX 형식으로 포맷팅
      if (numbers.length <= 3) {
        return numbers
      } else if (numbers.length <= 5) {
        return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
      } else {
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5)}`
      }
    }
    return value
  }

  const formatOpeningDate = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^0-9]/g, '')
    
    // 8자리까지만 허용
    if (numbers.length <= 8) {
      // YYYY.MM.DD 형식으로 포맷팅
      if (numbers.length <= 4) {
        return numbers
      } else if (numbers.length <= 6) {
        return `${numbers.slice(0, 4)}.${numbers.slice(4)}`
      } else {
        return `${numbers.slice(0, 4)}.${numbers.slice(4, 6)}.${numbers.slice(6)}`
      }
    }
    return value
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">사업자 인증</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자 등록번호 *
            </label>
            <input
              type="text"
              value={formatBusinessNumber(formData.businessNumber)}
              onChange={(e) => handleInputChange('businessNumber', e.target.value)}
              placeholder="000-00-00000"
              maxLength={12} // XXX-XX-XXXXX 형식 고려
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.businessNumber
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.businessNumber && (
              <p className="mt-1 text-sm text-red-500">올바른 사업자 등록번호를 입력해주세요</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              개업일자 *
            </label>
            <input
              type="text"
              value={formatOpeningDate(formData.openingDate)}
              onChange={(e) => handleInputChange('openingDate', e.target.value)}
              placeholder="YYYY.MM.DD"
              maxLength={10} // YYYY.MM.DD 형식 고려
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.openingDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.openingDate && (
              <p className="mt-1 text-sm text-red-500">올바른 개업일자를 입력해주세요</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표자 성명 *
            </label>
            <input
              type="text"
              value={formData.representativeName}
              onChange={(e) => handleInputChange('representativeName', e.target.value)}
              placeholder="대표자 성명"
              className={`w-full p-3 border rounded-lg focus:outline-none ${
                errors.representativeName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.representativeName && (
              <p className="mt-1 text-sm text-red-500">대표자 성명을 입력해주세요</p>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          다음 단계
        </button>
      </div>
    </div>
  )
}

export default BusinessRegistration