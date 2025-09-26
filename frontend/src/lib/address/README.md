# 주소 라이브러리 (Address Library)

이 라이브러리는 프론트엔드에서 주소 관련 기능을 체계적으로 관리하기 위해 만들어졌습니다.

## 주요 기능

- **주소 검색**: 다음(Daum) 우편번호 API를 래핑한 편리한 검색 기능
- **재사용 가능한 컴포넌트**: 일관된 디자인의 주소 입력 폼
- **유효성 검사**: 커스터마이징 가능한 주소 데이터 검증
- **유틸리티 함수**: 주소 포맷팅, 정규화, 비교 등 다양한 보조 기능

## 사용법

### 1. 기본 사용

```tsx
import { AddressInput, useAddressSearch, type AddressData } from '@/lib/address'

function MyComponent() {
  const [address, setAddress] = useState<AddressData>({
    zipCode: '',
    address: '',
    detailAddress: '',
  })

  return (
    <AddressInput
      value={address}
      onChange={setAddress}
      placeholder={{
        zipCode: '우편번호',
        address: '기본 주소',
        detailAddress: '상세 주소',
      }}
    />
  )
}
```

### 2. 커스텀 스타일링

```tsx
<AddressInput
  value={address}
  onChange={setAddress}
  className={{
    container: 'my-custom-container',
    zipCodeInput: 'my-zipcode-input',
    searchButton: 'my-search-button',
    addressInput: 'my-address-input',
    detailAddressInput: 'my-detail-input',
  }}
/>
```

### 3. 유효성 검사

```tsx
<AddressInput
  value={address}
  onChange={setAddress}
  validation={{
    address: {
      required: true,
      minLength: 5,
      message: '기본주소를 5자 이상 입력해주세요.',
    },
    detailAddress: {
      required: true,
      message: '상세주소를 입력해주세요.',
    },
  }}
  onValidationChange={(isValid, errors) => {
    console.log('유효성 검사:', isValid, errors)
  }}
/>
```

### 4. 주소 검색 훅 직접 사용

```tsx
import { useAddressSearch } from '@/lib/address'

function CustomComponent() {
  const { searchAddress, isLoading, error } = useAddressSearch(addressData => {
    console.log('선택된 주소:', addressData)
  })

  const handleSearch = async () => {
    const result = await searchAddress({
      width: 600,
      height: 500,
    })
    if (result) {
      console.log('검색 결과:', result)
    }
  }

  return (
    <button onClick={handleSearch} disabled={isLoading}>
      {isLoading ? '검색중...' : '주소 검색'}
    </button>
  )
}
```

### 5. 유틸리티 함수 사용

```tsx
import {
  formatAddress,
  validateAddress,
  extractRegionFromAddress,
} from '@/lib/address'

const address = {
  zipCode: '12345',
  address: '서울특별시 강남구 테헤란로 123',
  detailAddress: '삼성빌딩 4층',
}

// 주소 포맷팅
const formatted = formatAddress(address, {
  includeZipCode: true,
}) // "(12345) 서울특별시 강남구 테헤란로 123 삼성빌딩 4층"

// 유효성 검사
const { isValid, errors } = validateAddress(address)

// 지역 정보 추출
const region = extractRegionFromAddress(address.address)
// { sido: '서울특별시', sigungu: '강남구', dong: undefined }
```

### 6. 주소 표시 컴포넌트

```tsx
import { AddressDisplay } from '@/lib/address'

;<AddressDisplay
  address={address}
  showZipCode={true}
  className="text-gray-600"
/>
```

### 7. 임베드 모드 (특정 요소에 주소검색 삽입)

```tsx
import { useEmbeddedAddressSearch } from '@/lib/address'

function EmbeddedSearchComponent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { embedSearch } = useEmbeddedAddressSearch(
    containerRef,
    addressData => {
      console.log('선택된 주소:', addressData)
    }
  )

  useEffect(() => {
    embedSearch()
  }, [embedSearch])

  return <div ref={containerRef} style={{ width: 400, height: 300 }} />
}
```

## 타입 정의

### AddressData

```typescript
interface AddressData {
  zipCode: string // 우편번호
  address: string // 기본주소 (도로명주소)
  detailAddress: string // 상세주소
  jibunAddress?: string // 지번주소 (참고용)
  extraAddress?: string // 참고항목 (건물명 등)
}
```

### AddressValidation

```typescript
interface AddressValidation {
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
```

## 의존성

- 다음(Daum) 우편번호 API가 로드되어 있어야 합니다.
- `layout.tsx`에서 다음 스크립트가 포함되어 있어야 합니다:

```html
<script
  src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
  async
></script>
```

## 기여

새로운 기능이나 개선사항이 있다면:

1. `src/types/address.ts`에 타입 정의 추가
2. `src/hooks/useAddressSearch.ts`에 훅 기능 개선
3. `src/components/common/AddressInput.tsx`에 컴포넌트 기능 개선
4. `src/lib/addressUtils.ts`에 유틸리티 함수 추가
5. `src/lib/address/index.ts`에 export 추가
