'use client'

import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

const Step2Content = () => {
  const router = useRouter()
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 입력 시 에러 상태 초기화
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: false }))
    }
  }

  const validateForm = () => {
    const newErrors = {
      businessNumber:
        !formData.businessNumber || !/^\d{10}$/.test(formData.businessNumber),
      openingDate:
        !formData.openingDate || !/^\d{8}$/.test(formData.openingDate),
      representativeName: !formData.representativeName.trim(),
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center">
          <h1 className="mb-2 text-center font-['Tenada'] text-2xl leading-7 font-extrabold text-black sm:text-4xl">
            사업자 인증
          </h1>
          <div className="text-center font-['Tenada'] text-xl leading-7 font-extrabold text-black sm:text-4xl">
            1/2
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="w-full space-y-6">
            <div className="flex flex-col items-start gap-2">
              <div className="text-1 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black">
                사업자 등록 번호
              </div>
              <input
                type="text"
                value={formData.businessNumber}
                onChange={e =>
                  handleInputChange(
                    'businessNumber',
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="사업자 등록번호 ('-' 없이)"
                className={`h-[2.5625rem] w-full rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.businessNumber
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                } focus:outline-none`}
              />
              {errors.businessNumber && (
                <p className="text-xs text-red-500">
                  10자리 숫자로 입력해주세요
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <div className="text-2 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black">
                개업 일자
              </div>
              <input
                type="text"
                value={formData.openingDate}
                onChange={e =>
                  handleInputChange(
                    'openingDate',
                    e.target.value.replace(/\D/g, '')
                  )
                }
                placeholder="YYYYMMDD 형식"
                maxLength={8}
                className={`h-[2.5625rem] w-full rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.openingDate
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                } focus:outline-none`}
              />
              {errors.openingDate && (
                <p className="text-xs text-red-500">
                  YYYYMMDD 형식으로 입력해주세요
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <div className="text-3 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black">
                대표자 성명
              </div>
              <input
                type="text"
                value={formData.representativeName}
                onChange={e =>
                  handleInputChange('representativeName', e.target.value)
                }
                placeholder="외국인일 경우 영문"
                className={`h-[2.5625rem] w-full rounded-md border bg-white p-2 font-['Inter'] leading-6 ${
                  errors.representativeName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-gray-500'
                } focus:outline-none`}
              />
              {errors.representativeName && (
                <p className="text-xs text-red-500">
                  대표자 성명을 입력해주세요
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center rounded bg-gray-800 px-3 py-2 text-center font-['Inter'] text-[.8125rem] leading-6 text-white transition-colors hover:bg-gray-900"
          >
            인증하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BusinessRegistration() {
  return (
    <Suspense fallback={<div />}>
      <Step2Content />
    </Suspense>
  )
}
