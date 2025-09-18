# 백엔드 개발자용 간단 가이드

## 소셜 로그인 리다이렉트 주소

### 카카오 점주 로그인
```
GET /auth/kakao/owner
```
**처리 후 리다이렉트:**
- 최초 로그인: `http://localhost:3000/owner/register/step1?token=액세스토큰`
- 기존 사용자: `http://localhost:3000/owner/dashboard?token=액세스토큰`

### 카카오 고객 로그인  
```
GET /auth/kakao/customer
```
**처리 후 리다이렉트:**
- 최초 로그인: `http://localhost:3000/customer/register?token=액세스토큰`
- 기존 사용자: `http://localhost:3000/customer/dashboard?token=액세스토큰`

## 알림 설정 API (점주 ver)

```
GET /notifications/owner/{id}/settings        # 설정 조회
PUT /notifications/owner/{id}/settings        # 설정 변경
GET /notifications/owner/{id}/unread-count    # 읽지않은 개수
GET /notifications/owner/{id}                 # 알림 목록
``` 

## 알림 타입 (4가지)
- `PAYMENT` - 결제 알림
- `CHARGE` - 충전 알림  
- `STORE_PROMOTION` - 가게 찜 알림
- `PREPAYMENT_PURCHASE` - 선결제 구매 알림

