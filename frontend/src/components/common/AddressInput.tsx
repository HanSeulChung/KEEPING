'use client'

import { useAddressSearch } from '@/hooks/useAddressSearch'
import type {
  AddressData,
  AddressFormProps,
  AddressValidation,
} from '@/types/address'
import { useEffect, useState } from 'react'

// 기본 유효성 검사 규칙
const defaultValidation: AddressValidation = {
  zipCode: {
    required: true,
    pattern: /^\d{5}$/,
    message: '올바른 우편번호를 입력해주세요.',
  },
  address: {
    required: true,
    minLength: 5,
    message: '기본주소를 입력해주세요.',
  },
  detailAddress: {
    required: false,
    maxLength: 100,
    message: '상세주소는 100자 이내로 입력해주세요.',
  },
}

export default function AddressInput({
  value,
  onChange,
  validation = {},
  disabled = false,
  placeholder = {},
  className = {},
  onValidationChange,
}: AddressFormProps) {
  const [errors, setErrors] = useState<string[]>([])
  const [touched, setTouched] = useState({
    zipCode: false,
    address: false,
    detailAddress: false,
  })

  // 유효성 검사 규칙 병합
  const mergedValidation = {
    zipCode: { ...defaultValidation.zipCode, ...validation.zipCode },
    address: { ...defaultValidation.address, ...validation.address },
    detailAddress: {
      ...defaultValidation.detailAddress,
      ...validation.detailAddress,
    },
  }

  // 주소 검색 훅
  const {
    searchAddress,
    isLoading,
    error: searchError,
  } = useAddressSearch((addressData: AddressData) => {
    onChange({
      ...value,
      zipCode: addressData.zipCode,
      address: addressData.address,
      // 상세주소는 기존 값 유지
    })
    setTouched(prev => ({ ...prev, zipCode: true, address: true }))
  })

  // 유효성 검사 함수
  const validateField = (
    fieldName: keyof AddressData,
    fieldValue: string
  ): string | null => {
    const rules = mergedValidation[fieldName as keyof AddressValidation]
    if (!rules) return null

    if (rules.required && !fieldValue.trim()) {
      return rules.message
    }

    if ('pattern' in rules && rules.pattern && fieldValue && !rules.pattern.test(fieldValue)) {
      return rules.message
    }

    if ('minLength' in rules && rules.minLength && fieldValue && fieldValue.length < rules.minLength) {
      return rules.message
    }

    if ('maxLength' in rules && rules.maxLength && fieldValue && fieldValue.length > rules.maxLength) {
      return rules.message
    }

    return null
  }

  // 전체 유효성 검사
  const validateAll = (): string[] => {
    const newErrors: string[] = []

    const zipCodeError = validateField('zipCode', value.zipCode)
    const addressError = validateField('address', value.address)
    const detailAddressError = validateField(
      'detailAddress',
      value.detailAddress
    )

    if (zipCodeError) newErrors.push(zipCodeError)
    if (addressError) newErrors.push(addressError)
    if (detailAddressError) newErrors.push(detailAddressError)

    return newErrors
  }

  // 값 변경 시 유효성 검사
  useEffect(() => {
    const newErrors = validateAll()
    setErrors(newErrors)
    onValidationChange?.(newErrors.length === 0, newErrors)
  }, [value, onValidationChange])

  // 입력 핸들러
  const handleInputChange = (field: keyof AddressData, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue,
    })

    if (!touched[field as keyof typeof touched]) {
      setTouched(prev => ({ ...prev, [field]: true }))
    }
  }

  // 주소 검색 핸들러
  const handleSearchAddress = async () => {
    if (disabled || isLoading) return

    try {
      await searchAddress()
    } catch (error) {
      console.error('주소 검색 실패:', error)
    }
  }

  // 에러 표시 여부 확인
  const shouldShowError = (field: keyof typeof touched) =>
    touched[field] &&
    errors.some(error =>
      error.includes(
        mergedValidation[field as keyof AddressValidation]?.message || ''
      )
    )

  return (
    <div className={`space-y-3 ${className.container || ''}`}>
      {/* 우편번호 + 검색 버튼 */}
      <div className={`flex space-x-2 ${className.zipCodeContainer || ''}`}>
        <input
          type="text"
          value={value.zipCode}
          onChange={e =>
            handleInputChange('zipCode', e.target.value.replace(/[^\d]/g, ''))
          }
          placeholder={placeholder.zipCode || '우편번호'}
          disabled={disabled}
          maxLength={5}
          className={`flex-1 rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${shouldShowError('zipCode') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className.zipCodeInput || ''} `}
        />
        <button
          type="button"
          onClick={handleSearchAddress}
          disabled={disabled || isLoading}
          className={`rounded-r-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400 ${className.searchButton || ''} `}
        >
          {isLoading ? '검색중...' : '검색'}
        </button>
      </div>

      {/* 기본 주소 */}
      <input
        type="text"
        value={value.address}
        onChange={e => handleInputChange('address', e.target.value)}
        placeholder={placeholder.address || '기본주소'}
        disabled={disabled}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${shouldShowError('address') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className.addressInput || ''} `}
      />

      {/* 상세 주소 */}
      <input
        type="text"
        value={value.detailAddress}
        onChange={e => handleInputChange('detailAddress', e.target.value)}
        placeholder={placeholder.detailAddress || '상세주소 (선택)'}
        disabled={disabled}
        maxLength={mergedValidation.detailAddress.maxLength}
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${shouldShowError('detailAddress') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className.detailAddressInput || ''} `}
      />

      {/* 에러 메시지 */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-500">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* 검색 에러 메시지 */}
      {searchError && <p className="text-sm text-red-500">{searchError}</p>}

      {/* 참고 정보 */}
      {value.extraAddress && (
        <p className="text-xs text-gray-500">참고: {value.extraAddress}</p>
      )}
    </div>
  )
}

// 간단한 주소 표시 컴포넌트
export function AddressDisplay({
  address,
  showZipCode = true,
  className = '',
}: {
  address: AddressData
  showZipCode?: boolean
  className?: string
}) {
  const fullAddress = [
    showZipCode && address.zipCode && `(${address.zipCode})`,
    address.address,
    address.detailAddress,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className} title={fullAddress}>
      {fullAddress || '주소 없음'}
    </span>
  )
}
