'use client'

import {
  verifyBusinessRegistration,
  type BusinessVerificationRequest,
} from '@/api/businessVerify'
import {
  useRegistration,
  type BusinessInfo,
} from '@/contexts/RegistrationContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const BusinessRegistration = () => {
  const router = useRouter()
  const { setBusinessInfo } = useRegistration()
  const [formData, setFormData] = useState({
    businessNumber: '',
    openingDate: '',
    representativeName: '',
  })
  const [errors, setErrors] = useState({
    businessNumber: false,
    openingDate: false,
    representativeName: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

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
      representativeName: !formData.representativeName.trim(),
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

  const handleVerifyBusiness = async () => {
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

    setIsLoading(true)
    setVerificationResult(null)

    const businessData: BusinessVerificationRequest = {
      b_no: formData.businessNumber.replace(/[^0-9]/g, ''),
      start_dt: formData.openingDate.replace(/[^0-9]/g, ''),
      p_nm: formData.representativeName.trim(),
    }

    try {
      // 진위확인 시도
      const result = await verifyBusinessRegistration(businessData)

      if (result.status_code === 'OK' && result.valid_cnt === 1) {
        const businessInfo = result.data[0]

        if (businessInfo.valid === '01') {
          // 검증 성공
          const statusMessages: { [key: string]: string } = {
            '01': '계속사업자 (정상영업)',
            '02': '휴업자',
            '03': '폐업자',
          }

          const statusMessage =
            statusMessages[businessInfo.status.b_stt_cd] ||
            businessInfo.status.b_stt

          setVerificationResult({
            success: true,
            message: `사업자 인증이 완료되었습니다. 상태: ${statusMessage}`,
            data: businessInfo,
          })

          // 사업자 정보를 Context에 저장 (검증 성공)
          const verifiedBusinessInfo: BusinessInfo = {
            businessNumber: businessData.b_no,
            openingDate: businessData.start_dt,
            representativeName: businessData.p_nm,
            verified: true,
            verificationData: businessInfo,
          }

          setBusinessInfo(verifiedBusinessInfo)
        } else {
          // 검증 실패 - 값만 저장하고 넘어가기
          const verifiedBusinessInfo: BusinessInfo = {
            businessNumber: businessData.b_no,
            openingDate: businessData.start_dt,
            representativeName: businessData.p_nm,
            verified: false,
            verificationData: null,
          }

          setBusinessInfo(verifiedBusinessInfo)
          
          setVerificationResult({
            success: true,
            message: '사업자 정보가 저장되었습니다. (확인 필요)',
          })
        }
      } else {
        // API 응답 오류 - 값만 저장하고 넘어가기
        const verifiedBusinessInfo: BusinessInfo = {
          businessNumber: businessData.b_no,
          openingDate: businessData.start_dt,
          representativeName: businessData.p_nm,
          verified: false,
          verificationData: null,
        }

        setBusinessInfo(verifiedBusinessInfo)
        
        setVerificationResult({
          success: true,
          message: '사업자 정보가 저장되었습니다. (진위확인 실패)',
        })
      }
    } catch (error) {
      console.error('사업자 검증 오류:', error)
      
      // API 호출 실패 - 값만 저장하고 넘어가기
      const verifiedBusinessInfo: BusinessInfo = {
        businessNumber: businessData.b_no,
        openingDate: businessData.start_dt,
        representativeName: businessData.p_nm,
        verified: false,
        verificationData: null,
      }

      setBusinessInfo(verifiedBusinessInfo)
      
      setVerificationResult({
        success: true,
        message: '사업자 정보가 저장되었습니다. (진위확인 실패)',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextStep = () => {
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold">사업자 인증</h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              사업자 등록번호 *
            </label>
            <input
              type="text"
              value={formatBusinessNumber(formData.businessNumber)}
              onChange={e =>
                handleInputChange('businessNumber', e.target.value)
              }
              placeholder="000-00-00000"
              maxLength={12} // XXX-XX-XXXXX 형식 고려
              className={`w-full rounded-lg border p-3 focus:outline-none ${
                errors.businessNumber
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.businessNumber && (
              <p className="mt-1 text-sm text-red-500">
                올바른 사업자 등록번호를 입력해주세요
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              개업일자 *
            </label>
            <input
              type="text"
              value={formatOpeningDate(formData.openingDate)}
              onChange={e => handleInputChange('openingDate', e.target.value)}
              placeholder="YYYY.MM.DD"
              maxLength={10} // YYYY.MM.DD 형식 고려
              className={`w-full rounded-lg border p-3 focus:outline-none ${
                errors.openingDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.openingDate && (
              <p className="mt-1 text-sm text-red-500">
                올바른 개업일자를 입력해주세요
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              대표자 성명 *
            </label>
            <input
              type="text"
              value={formData.representativeName}
              onChange={e =>
                handleInputChange('representativeName', e.target.value)
              }
              placeholder="대표자 성명"
              className={`w-full rounded-lg border p-3 focus:outline-none ${
                errors.representativeName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.representativeName && (
              <p className="mt-1 text-sm text-red-500">
                대표자 성명을 입력해주세요
              </p>
            )}
          </div>
        </div>

        {/* 검증 결과 표시 */}
        {verificationResult && (
          <div
            className={`mt-4 rounded-lg p-4 ${
              verificationResult.success
                ? 'border border-green-200 bg-green-50'
                : 'border border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center">
              <span
                className={`text-sm font-medium ${
                  verificationResult.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {verificationResult.success ? '✅' : '❌'}{' '}
                {verificationResult.message}
              </span>
            </div>

            {verificationResult.success && verificationResult.data && (
              <div className="mt-2 text-xs text-green-700">
                <p>과세유형: {verificationResult.data.status.tax_type}</p>
              </div>
            )}
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="mt-6 space-y-3">
          {!verificationResult?.success ? (
            <button
              onClick={handleVerifyBusiness}
              disabled={isLoading}
              className={`w-full rounded-lg py-3 transition-colors ${
                isLoading
                  ? 'cursor-not-allowed bg-gray-400 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? '검증 중...' : '사업자 정보 검증'}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="w-full rounded-lg bg-green-600 py-3 text-white transition-colors hover:bg-green-700"
            >
              다음 단계로 진행
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessRegistration
