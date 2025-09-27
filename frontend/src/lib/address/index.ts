// 주소 관련 라이브러리 통합 export

// 타입 정의
import type {
  AddressData,
  AddressValidation
} from '@/types/address'

export type {
  AddressData,
  AddressFormProps,
  AddressSearchOptions,
  AddressValidation,
  DaumPostcodeData
} from '@/types/address'

// 훅
export {
  useAddressSearch,
  useEmbeddedAddressSearch
} from '@/hooks/useAddressSearch'

// 컴포넌트
export {
  AddressDisplay,
  default as AddressInput
} from '@/components/common/AddressInput'

// 유틸리티 함수들
export {
  checkDeliveryAvailable,
  compareAddresses,
  estimateDistance,
  extractRegionFromAddress,
  formatAddress,
  normalizeAddress,
  parseAddressString,
  validateAddress
} from '@/lib/addressUtils'

// 기본 주소 데이터 생성자
export const createEmptyAddress = (): AddressData => ({
  zipCode: '',
  address: '',
  detailAddress: '',
})

// 기본 유효성 검사 규칙
export const defaultAddressValidation: AddressValidation = {
  zipCode: {
    required: true,
    pattern: /^\d{5}$/,
    message: '올바른 우편번호(5자리)를 입력해주세요.',
  },
  address: {
    required: true,
    minLength: 3,
    message: '기본주소를 3자 이상 입력해주세요.',
  },
  detailAddress: {
    required: false,
    maxLength: 100,
    message: '상세주소는 100자 이내로 입력해주세요.',
  },
}
