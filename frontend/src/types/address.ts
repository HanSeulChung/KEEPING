// 주소 관련 타입 정의

export interface AddressData {
  zipCode: string // 우편번호
  address: string // 기본주소 (도로명주소)
  detailAddress: string // 상세주소
  jibunAddress?: string // 지번주소 (참고용)
  extraAddress?: string // 참고항목 (건물명 등)
}

export interface DaumPostcodeData {
  zonecode: string // 우편번호
  address: string // 주소
  addressEnglish: string // 영문주소
  addressType: 'R' | 'J' // 도로명주소(R), 지번주소(J)
  userSelectedType: 'R' | 'J' // 사용자가 선택한 주소 타입
  noSelected: 'Y' | 'N' // 검색 결과에서 선택되었는지 여부
  userLanguageType: 'K' | 'E' // 언어 타입
  roadAddress: string // 도로명주소
  roadAddressEnglish: string // 영문 도로명주소
  jibunAddress: string // 지번주소
  jibunAddressEnglish: string // 영문 지번주소
  autoRoadAddress: string // 자동완성 도로명주소
  autoRoadAddressEnglish: string // 영문 자동완성 도로명주소
  autoJibunAddress: string // 자동완성 지번주소
  autoJibunAddressEnglish: string // 영문 자동완성 지번주소
  buildingCode: string // 건물관리번호
  buildingName: string // 건물명
  apartment: 'Y' | 'N' // 공동주택 여부
  sido: string // 시도
  sidoEnglish: string // 영문 시도
  sigungu: string // 시군구
  sigunguEnglish: string // 영문 시군구
  sigunguCode: string // 시군구코드
  roadnameCode: string // 도로명코드
  roadname: string // 도로명
  roadnameEnglish: string // 영문 도로명
  bcode: string // 법정동/법정리코드
  bname: string // 법정동/법정리명
  bnameEnglish: string // 영문 법정동/법정리명
  bname1: string // 법정리의 읍/면 이름
  bname1English: string // 영문 법정리의 읍/면 이름
  bname2: string // 법정동/법정리명
  bname2English: string // 영문 법정동/법정리명
  hname: string // 통/반/리명
  query: string // 검색어
}

export interface AddressSearchOptions {
  width?: number // 팝업 가로크기
  height?: number // 팝업 세로크기
  left?: number // 팝업 x좌표
  top?: number // 팝업 y좌표
  popupTitle?: string // 팝업 제목
  autoClose?: boolean // 검색 완료 후 자동 닫기
  animation?: boolean // 애니메이션 사용 여부
  focusInput?: boolean // 검색창 자동 포커스
  focusContent?: boolean // 내용 영역 포커스
  useSuggest?: boolean // 검색어 제안 기능
}

export interface AddressValidation {
  zipCode: {
    required: boolean
    pattern?: RegExp
    message: string
  }
  address: {
    required: boolean
    minLength?: number
    message: string
  }
  detailAddress: {
    required: boolean
    maxLength?: number
    message: string
  }
}

export interface AddressFormProps {
  value: AddressData
  onChange: (address: AddressData) => void
  validation?: Partial<AddressValidation>
  disabled?: boolean
  placeholder?: {
    zipCode?: string
    address?: string
    detailAddress?: string
  }
  className?: {
    container?: string
    zipCodeContainer?: string
    zipCodeInput?: string
    searchButton?: string
    addressInput?: string
    detailAddressInput?: string
  }
  onValidationChange?: (isValid: boolean, errors: string[]) => void
}
