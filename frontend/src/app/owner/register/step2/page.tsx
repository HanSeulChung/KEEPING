'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      businessNumber: !formData.businessNumber || !/^\d{10}$/.test(formData.businessNumber),
      openingDate: !formData.openingDate || !/^\d{8}$/.test(formData.openingDate),
      representativeName: !formData.representativeName.trim()
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('사업자 인증 데이터:', formData)
      router.push('/owner/register/step3')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto">

        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-black text-center font-['Tenada'] text-2xl sm:text-4xl font-extrabold leading-7 mb-2">사업자 인증</h1>
          <div className="text-black text-center font-['Tenada'] text-xl sm:text-4xl font-extrabold leading-7">1/2</div>
        </div>
      
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-full space-y-6">
          <div className="flex flex-col items-start gap-2">
            <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-3 h-[1.375rem] rounded-lg border border-black bg-white text-1 font-['nanumsquare'] text-black text-center text-[10px] font-bold leading-5 whitespace-nowrap">
              사업자 등록 번호
            </div>
            <input
              type="text"
              value={formData.businessNumber}
              onChange={(e) => handleInputChange('businessNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="사업자 등록번호 ('-' 없이)"
              className={`w-full p-2 h-[2.5625rem] rounded-md border bg-white font-['Inter'] leading-6 ${
                errors.businessNumber 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-gray-500'
              } focus:outline-none`}
            />
            {errors.businessNumber && (
              <p className="text-red-500 text-xs">10자리 숫자로 입력해주세요</p>
            )}
          </div>
          
          <div className="flex flex-col items-start gap-2">
            <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-3 h-[1.375rem] rounded-lg border border-black bg-white text-2 font-['nanumsquare'] text-black text-center text-[10px] font-bold leading-5 whitespace-nowrap">
              개업 일자
            </div>
            <input
              type="text"
              value={formData.openingDate}
              onChange={(e) => handleInputChange('openingDate', e.target.value.replace(/\D/g, ''))}
              placeholder="YYYYMMDD 형식"
              maxLength={8}
              className={`w-full p-2 h-[2.5625rem] rounded-md border bg-white font-['Inter'] leading-6 ${
                errors.openingDate 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-gray-500'
              } focus:outline-none`}
            />
            {errors.openingDate && (
              <p className="text-red-500 text-xs">YYYYMMDD 형식으로 입력해주세요</p>
            )}
          </div>
          
          <div className="flex flex-col items-start gap-2">
            <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-3 h-[1.375rem] rounded-lg border border-black bg-white text-3 font-['nanumsquare'] text-black text-center text-[10px] font-bold leading-5 whitespace-nowrap">
              대표자 성명
            </div>
            <input
              type="text"
              value={formData.representativeName}
              onChange={(e) => handleInputChange('representativeName', e.target.value)}
              placeholder="외국인일 경우 영문"
              className={`w-full p-2 h-[2.5625rem] rounded-md border bg-white font-['Inter'] leading-6 ${
                errors.representativeName 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:border-gray-500'
              } focus:outline-none`}
            />
            {errors.representativeName && (
              <p className="text-red-500 text-xs">대표자 성명을 입력해주세요</p>
            )}
          </div>
        </div>
        
        <button 
          onClick={handleSubmit}
          className="flex justify-center items-center w-full py-2 px-3 rounded bg-gray-800 text-white text-center font-['Inter'] text-[.8125rem] leading-6 hover:bg-gray-900 transition-colors"
        >
          인증하기
        </button>
      </div>
    </div>
  </div>
  )
}

export default BusinessRegistration
