# 멱등키 기반 중복 요청 방지 시스템

## 개요

이 시스템은 프론트엔드에서 중요한 요청(결제, QR 처리 등)의 중복 실행을 방지하기 위해 구현되었습니다.

### 주요 특징

1. **요청 내용 기반 해시 멱등키**: 동일한 요청에 대해 항상 같은 키 생성
2. **진행 중인 요청 차단**: 같은 요청이 진행 중일 때 추가 요청 차단
3. **페이지 재진입 상태 복원**: 브라우저 새로고침/뒤로가기 시 이전 상태 유지
4. **선택적 재시도**: 성공한 요청은 차단, 실패한 요청은 재시도 허용

## 아키텍처

```
Components
    ↓
useIdempotentRequest Hook
    ↓
idempotentClient API Wrapper
    ↓
utils/idempotency Core Logic
    ↓
localStorage + Memory Cache
```

## 핵심 구성 요소

### 1. 멱등키 생성 (`utils/idempotency.ts`)

```typescript
const idempotencyKey = generateIdempotencyKey({
  userId: 123,
  storeId: 456,
  action: 'payment',
  data: { amount: 10000 },
  expiryMinutes: 30
})
```

- **SHA-256 해시** 기반으로 안전하고 예측 가능한 키 생성
- **시간 기반 그룹핑**으로 적절한 만료 처리
- **데이터 정규화**로 일관된 키 생성 보장

### 2. 요청 상태 관리 (`hooks/useIdempotentRequest.ts`)

```typescript
const payment = useIdempotentButton(paymentFunction, {
  userId: user.id,
  storeId: 123,
  action: 'payment',
  skipIfPending: true,
  retryOnError: true
})
```

**상태 종류:**
- `idle`: 초기 상태
- `pending`: 요청 진행 중
- `success`: 요청 성공 (재실행 방지)
- `error`: 요청 실패 (재시도 가능)

### 3. API 래퍼 (`api/idempotentClient.ts`)

```typescript
import { paymentApi } from '@/api/idempotentClient'

const result = await paymentApi.createPrepayment({
  userId: 123,
  storeId: 456,
  amount: 10000,
  description: '선결제'
})
```

## 사용 방법

### 1. 간단한 버튼 컴포넌트

```typescript
import { useIdempotentButton } from '@/hooks/useIdempotentRequest'

const MyComponent = () => {
  const payment = useIdempotentButton(
    async () => {
      return await paymentApi.createPrepayment({
        userId: user.id,
        storeId: 123,
        amount: 10000
      })
    },
    {
      userId: user.id,
      storeId: 123,
      action: 'payment',
      successMessage: '결제 완료!',
      errorMessage: '결제 실패'
    }
  )

  return (
    <button
      onClick={payment.handleClick}
      disabled={payment.disabled}
    >
      {payment.getButtonText('결제하기', '처리 중...')}
    </button>
  )
}
```

### 2. 고급 사용법

```typescript
const MyAdvancedComponent = () => {
  const request = useIdempotentRequest(
    async (data) => {
      return await someApiCall(data)
    },
    {
      userId: user.id,
      action: 'advanced_action',
      onSuccess: (result) => {
        // 성공 처리
      },
      onError: (error) => {
        // 에러 처리
      }
    }
  )

  return (
    <div>
      <div>상태: {request.status}</div>
      <div>로딩: {request.isLoading ? 'Yes' : 'No'}</div>
      <div>재시도 가능: {request.canRetry ? 'Yes' : 'No'}</div>

      <button onClick={() => request.execute({ param: 'value' })}>
        실행
      </button>
      <button onClick={request.reset}>
        초기화
      </button>
    </div>
  )
}
```

## 적용 대상

### 필수 적용 (High Priority)
- **결제 관련**: 선결제, 결제 승인, 결제 취소
- **QR 처리**: QR 스캔, QR 결제
- **포인트**: 포인트 충전, 포인트 사용
- **주문**: 주문 생성, 주문 취소

### 권장 적용 (Medium Priority)
- **매장 관리**: 매장 등록, 매장 정보 수정
- **사용자 액션**: 중요한 설정 변경
- **파일 업로드**: 이미지/문서 업로드

### 적용 불필요 (Low Priority)
- **읽기 전용 요청**: GET 요청들
- **실시간 데이터**: 채팅, 알림 등
- **빈번한 요청**: 검색, 자동완성 등

## 설정 가이드

### 만료 시간 설정

```typescript
// 용도별 권장 만료 시간
{
  // 결제: 1시간 (중요하고 시간이 오래 걸릴 수 있음)
  expiryMinutes: 60,

  // QR 처리: 10분 (빠른 처리 예상)
  expiryMinutes: 10,

  // 일반 액션: 30분 (기본값)
  expiryMinutes: 30
}
```

### 백엔드 연동

```typescript
// 백엔드에 멱등키 헤더 전송
const response = await idempotentRequest({
  url: '/api/payment',
  data: paymentData,
  useIdempotencyHeader: true // 백엔드에 'Idempotency-Key' 헤더 전송
})
```

백엔드에서는 해당 헤더를 받아서 동일한 요청 중복 처리를 방지해야 합니다.

## 디버깅 가이드

### 1. 개발 도구

```typescript
// 개발 환경에서만 디버깅 정보 표시
{process.env.NODE_ENV === 'development' && (
  <div className="debug-info">
    <div>멱등키: {request.idempotencyKey}</div>
    <div>상태: {request.status}</div>
    <div>마지막 실행: {request.lastExecutedAt}</div>
  </div>
)}
```

### 2. 로컬 스토리지 확인

브라우저 개발자 도구에서 Application > Local Storage를 확인하면 저장된 요청 상태를 볼 수 있습니다.

키 형식: `request_state_idem_{action}_{hash}`

### 3. 상태 초기화

```typescript
// 강제로 특정 요청 상태 제거
requestStateManager.removeRequestState(idempotencyKey)

// 모든 만료된 상태 정리
requestStateManager.cleanupExpiredStates()
```

## 주의사항

### 1. 메모리 누수 방지

- 컴포넌트 언마운트 시 자동으로 진행 중인 요청 정리
- 정기적인 만료된 상태 정리 (`cleanupExpiredStates`)

### 2. 보안 고려사항

- 멱등키에 민감한 정보 포함하지 않기
- localStorage 사용으로 XSS 공격 주의
- 해시 충돌 가능성은 매우 낮지만 고려

### 3. 성능 최적화

- 과도한 localStorage 사용 주의
- 적절한 만료 시간 설정으로 저장소 크기 관리
- 필요한 곳에만 선택적 적용

## 예제 코드

실제 사용 예제는 `components/examples/IdempotentPaymentButton.tsx`를 참고하세요.

### 기본 결제 버튼

```typescript
<IdempotentPaymentButton
  storeId={123}
  amount={10000}
  description="선결제"
  onSuccess={(result) => console.log('결제 성공:', result)}
  onError={(error) => console.error('결제 실패:', error)}
/>
```

### QR 코드 처리

```typescript
<IdempotentQrProcessor
  storeId={123}
  qrData="qr_token_12345"
  scanType="payment"
  onSuccess={(result) => handleQrSuccess(result)}
/>
```

## 트러블슈팅

### Q: 페이지 새로고침 후 버튼이 비활성화되어 있어요
A: 정상적인 동작입니다. 이전에 성공한 요청이 있어서 중복 실행을 방지하고 있습니다. `reset()` 함수로 초기화하거나 만료 시간을 기다리세요.

### Q: 에러 후 재시도가 안 되요
A: `retryOnError: true` 옵션을 확인하고, `canRetry` 상태를 체크하세요.

### Q: 멱등키가 예상과 다르게 생성되요
A: 데이터 순서나 타입 차이가 원인일 수 있습니다. 데이터를 정규화하여 일관성을 보장하세요.

## 업데이트 로그

- v1.0.0: 초기 구현
- v1.1.0: QR 처리 지원 추가
- v1.2.0: 백엔드 헤더 연동 기능 추가