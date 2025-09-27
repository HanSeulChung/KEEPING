import type { AddressData } from '@/types/address'

/**
 * 주소 유틸리티 함수들
 */

/**
 * 주소 데이터를 하나의 문자열로 합치기
 */
export function formatAddress(
  address: AddressData,
  options: {
    includeZipCode?: boolean
    includeExtraAddress?: boolean
    separator?: string
  } = {}
): string {
  const {
    includeZipCode = true,
    includeExtraAddress = false,
    separator = ' ',
  } = options

  const parts: string[] = []

  if (includeZipCode && address.zipCode) {
    parts.push(`(${address.zipCode})`)
  }

  if (address.address) {
    parts.push(address.address)
  }

  if (address.detailAddress) {
    parts.push(address.detailAddress)
  }

  if (includeExtraAddress && address.extraAddress) {
    parts.push(`(${address.extraAddress})`)
  }

  return parts.join(separator)
}

/**
 * 문자열에서 주소 데이터 파싱 (간단한 경우만)
 */
export function parseAddressString(
  addressString: string
): Partial<AddressData> {
  const zipCodeMatch = addressString.match(/\((\d{5})\)/)
  const zipCode = zipCodeMatch ? zipCodeMatch[1] : ''

  // 우편번호 제거 후 나머지 주소
  const withoutZipCode = addressString.replace(/\(\d{5}\)\s*/, '').trim()

  return {
    zipCode,
    address: withoutZipCode,
    detailAddress: '',
  }
}

/**
 * 주소 데이터 유효성 검사
 */
export function validateAddress(address: AddressData): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!address.zipCode || !/^\d{5}$/.test(address.zipCode)) {
    errors.push('올바른 우편번호(5자리 숫자)를 입력해주세요.')
  }

  if (!address.address || address.address.trim().length < 3) {
    errors.push('기본주소를 3자 이상 입력해주세요.')
  }

  if (address.detailAddress && address.detailAddress.length > 100) {
    errors.push('상세주소는 100자 이내로 입력해주세요.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 주소 데이터 정규화 (공백 제거, 특수문자 정리 등)
 */
export function normalizeAddress(address: AddressData): AddressData {
  return {
    zipCode: address.zipCode.replace(/\D/g, ''), // 숫자만 남기기
    address: address.address.trim().replace(/\s+/g, ' '), // 연속 공백 정리
    detailAddress: address.detailAddress.trim().replace(/\s+/g, ' '),
    jibunAddress: address.jibunAddress?.trim().replace(/\s+/g, ' '),
    extraAddress: address.extraAddress?.trim(),
  }
}

/**
 * 두 주소가 같은지 비교
 */
export function compareAddresses(
  addr1: AddressData,
  addr2: AddressData
): boolean {
  const normalized1 = normalizeAddress(addr1)
  const normalized2 = normalizeAddress(addr2)

  return (
    normalized1.zipCode === normalized2.zipCode &&
    normalized1.address === normalized2.address &&
    normalized1.detailAddress === normalized2.detailAddress
  )
}

/**
 * 주소에서 지역 정보 추출
 */
export function extractRegionFromAddress(address: string): {
  sido?: string // 시도 (서울특별시, 경기도 등)
  sigungu?: string // 시군구 (강남구, 수원시 등)
  dong?: string // 동/읍/면
} {
  // 간단한 정규식으로 지역 정보 추출
  const sidoMatch = address.match(
    /(서울특별시|부산광역시|대구광역시|인천광역시|광주광역시|대전광역시|울산광역시|세종특별자치시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)/
  )
  const sigunguMatch = address.match(/([가-힣]+구|[가-힣]+시|[가-힣]+군)/)
  const dongMatch = address.match(/([가-힣]+동|[가-힣]+읍|[가-힣]+면)/)

  return {
    sido: sidoMatch ? sidoMatch[1] : undefined,
    sigungu: sigunguMatch ? sigunguMatch[1] : undefined,
    dong: dongMatch ? dongMatch[1] : undefined,
  }
}

/**
 * 배송 가능 지역 체크 (예시)
 */
export function checkDeliveryAvailable(
  address: AddressData,
  availableRegions: string[] = ['서울특별시', '경기도', '인천광역시']
): boolean {
  const region = extractRegionFromAddress(address.address)
  return availableRegions.some(
    available =>
      region.sido?.includes(available) || address.address.includes(available)
  )
}

/**
 * 주소를 기반으로 거리 계산 (간단한 추정, 실제로는 지도 API 필요)
 */
export function estimateDistance(
  addr1: AddressData,
  addr2: AddressData
): number {
  // 실제 구현에서는 Google Maps API나 카카오맵 API 등을 사용해야 함
  // 여기서는 지역이 같으면 가까운 것으로 간주하는 간단한 로직
  const region1 = extractRegionFromAddress(addr1.address)
  const region2 = extractRegionFromAddress(addr2.address)

  if (region1.sido === region2.sido && region1.sigungu === region2.sigungu) {
    return Math.random() * 5 // 0-5km (임시)
  } else if (region1.sido === region2.sido) {
    return 10 + Math.random() * 20 // 10-30km (임시)
  } else {
    return 50 + Math.random() * 100 // 50-150km (임시)
  }
}
