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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    console.log('사업자 인증 데이터:', formData)
    router.push('/owner/register/step3')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">사업자 인증</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사업자 등록번호
            </label>
            <input
              type="text"
              value={formData.businessNumber}
              onChange={(e) => handleInputChange('businessNumber', e.target.value)}
              placeholder="사업자 등록번호"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              개업일자
            </label>
            <input
              type="text"
              value={formData.openingDate}
              onChange={(e) => handleInputChange('openingDate', e.target.value)}
              placeholder="YYYYMMDD"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대표자 성명
            </label>
            <input
              type="text"
              value={formData.representativeName}
              onChange={(e) => handleInputChange('representativeName', e.target.value)}
              placeholder="대표자 성명"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
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