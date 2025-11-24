# 💳 KEEPING – 디지털 선결제 · 공동 지갑 플랫폼

> **KEEPING**은 선불권/선결제 고객을 보유한 매장을 위한  
> **디지털 선불 관리 + 공동 지갑(fintech)** 플랫폼입니다.  
> 점주는 장부 없이 고객 선불금과 이용 내역을 관리하고,  
> 손님은 모바일에서 충전 · 결제 · 잔액 조회를 한 번에 처리합니다.


---

## 🎯 프로젝트 개요

### 기획 배경

카페, 학원, PT샵처럼 **선불 결제**가 많은 매장에서는 여전히 종이 쿠폰이나 장부로 고객 선불금을 관리하는 경우가 많습니다.

- 고객별 **잔액과 이용 내역**을 정확히 파악하기 어렵고  
- 장부 분실 · 기입 실수로 인해 **분쟁**이 발생할 수 있으며  
- 여러 사람이 함께 쓰는 회비 · 모임 선불금은 관리가 더욱 복잡합니다.

**KEEPING**은 이러한 문제를 해결하기 위해,

- 점주에게는 **선불 고객 관리 + 매장 통계**를,
- 손님에게는 **선불 충전 + QR 결제 + 모임(공동 지갑)** 기능을 제공하는  
양방향 디지털 선결제 플랫폼을 목표로 합니다.

---

## ✨ 주요 기능

### 👤 손님(일반 사용자) 앱

- **회원가입 / 로그인**
  - 이메일/비밀번호 기반 회원가입 및 로그인
- **선불 포인트 충전**
  - 매장을 선택해 선불 포인트 충전
  - 충전 내역과 현재 잔액을 한눈에 확인
- **QR 결제**
  - 매장에서 제시한 QR 코드를 스캔해 선불 포인트로 결제
  - 개인 지갑 또는 모임 지갑을 선택해 사용
- **모임(공동 지갑) 관리**
  - 친구/지인과 함께 사용하는 모임 생성
  - 모임원 초대, 모임 포인트 **공유 / 회수** 기능
  - 모임별 사용 내역 조회
- **거래 내역 / 잔액 조회**
  - 충전 · 결제 · 회수 내역을 타임라인 형태로 확인
  - 매장별 / 모임별 필터링

### 🧾 점주(가맹점) 앱

- **가맹점 등록 및 프로필 관리**
  - 매장 정보 등록 및 수정
  - 선불 상품/권종 설정
- **고객 선불 관리**
  - 고객별 선불 잔액과 이용 내역 조회
  - 수기 조정(정정) 및 관리 메모
- **매장 통계 대시보드**
  - 일/월별 충전 · 사용 금액 통계
  - 매장 선불 이용 추이 분석
- **직원/계정 관리 (옵션)**
  - 필요 시 점주/직원 권한 분리

### 🔐 공통 기능

- JWT 기반 인증/인가
- 역할(Role)에 따른 권한 분리 (USER / OWNER 등)
- 공통 예외 처리 및 표준 에러 응답 포맷
- 요청/응답 로깅 및 모니터링(확장 고려)

---

## 🏗 시스템 아키텍처

KEEPING은 Web / Mobile 클라이언트와 REST API 기반 백엔드로 구성됩니다.

    KEEPING Platform
    ├── Frontend (Web / Mobile Web)
    │   └── React + TypeScript (예정/구현 상황에 맞게 수정)
    ├── Backend API Server
    │   └── Spring Boot (충전/결제/모임/매장 도메인)
    └── Database
        └── RDBMS (MySQL 등)

### 주요 도메인

- **User** : 회원, 점주, 권한/역할
- **Store** : 가맹점 정보, 선불 상품
- **Wallet** : 개인 지갑 / 모임 지갑, 잔액
- **Group** : 모임(공동 지갑), 멤버, 권한
- **Charge** : 선불 충전 내역
- **Payment** : 결제/사용 내역

---

## 🛠 기술 스택

### Backend

- Java 17+
- Spring Boot
- Spring Web, Spring Data JPA
- Spring Security, JWT
- Gradle
- MySQL

### Frontend

- TypeScript
- React (SPA)
- 빌드 도구: Vite 또는 CRA

### Infra / DevOps

- GitLab / GitHub
- (선택) Docker, Nginx
- (선택) CI/CD 파이프라인

---

## 💡 멱등성(Idempotency) 기반 결제/충전 설계

핀테크 성격의 서비스 특성상, **중복 결제/충전 방지**가 중요합니다.  
KEEPING의 결제/충전 API는 **멱등성(idempotency)** 을 고려해 설계했습니다.

### 클라이언트 측 규칙

- 결제/충전 요청마다 **멱등 키(Idempotency Key)** 를 생성
- 네트워크 오류나 타임아웃으로 **재시도**하더라도  
  같은 작업에 대해서는 **동일한 멱등 키를 재사용**
- 버튼 중복 클릭 방지, 진행 중 상태 표시 등 UI 수준에서의 보호

### 서버 측 처리 방식

- 멱등 키와 요청 본문, 처리 결과를 저장
- 동일한 멱등 키로 다시 요청이 들어오면  
  이미 처리 여부를 확인하고
  - 이미 성공 처리된 경우: **기존 결과를 그대로 반환**
  - 처리 중/실패한 경우: 정책에 따라 재처리 또는 에러 반환
- 이를 통해
  - 동일 결제의 **이중 청구 방지**
  - 네트워크 재시도 상황에서도 **일관된 결과 보장**

---

## 🚀 시작하기

### 1. 사전 요구사항

- Node.js 18+  
- Java 17+  
- MySQL 8.0+ (또는 사용 중인 DB 버전)  

### 2. Backend 실행

1. 저장소 클론

       git clone https://github.com/HanSeulChung/KEEPING.git
       cd KEEPING/backend

2. 로컬 환경 설정 파일 작성  
   `backend/src/main/resources` 아래에 로컬용 설정 파일을 작성합니다. (예: `application-local.yml`)  

   예시:

       spring:
         datasource:
           url: jdbc:mysql://localhost:3306/keeping?serverTimezone=Asia/Seoul
           username: root
           password: your_password
         jpa:
           hibernate:
             ddl-auto: update
           show-sql: true

   (실제 DB 정보 · 보안 정보는 `.gitignore` 처리된 별도 설정 파일이나 환경 변수로 관리합니다.)

3. 애플리케이션 실행

       ./gradlew bootRun

   기본 포트: `http://localhost:8080` (설정에 따라 변경)

### 3. Frontend 실행

1. 의존성 설치

       cd ../frontend
       npm install

2. 개발 서버 실행

       npm run dev

   기본 주소: `http://localhost:5173` (설정에 따라 변경)

---

## 📁 프로젝트 구조 (예시)

실제 디렉터리 구조에 맞게 수정해서 사용하면 됩니다.

    KEEPING/
    ├── backend/                      # Spring Boot 백엔드
    │   ├── src/
    │   │   ├── main/
    │   │   │   ├── java/...          # 도메인, 서비스, 컨트롤러
    │   │   │   └── resources/...     # 설정 파일, 마이그레이션 스크립트 등
    │   │   └── test/...              # 테스트 코드
    │   └── build.gradle
    ├── frontend/                     # 프론트엔드 (React 등)
    │   ├── src/...
    │   ├── package.json
    │   └── (설정 파일들)
    └── README.md

---

## 🌿 브랜치 전략

- `main`       : 배포용 브랜치
- `develop`    : 통합 개발 브랜치
- `backend`    : 백엔드 공통 개발 브랜치
- `frontend`   : 프론트엔드 공통 개발 브랜치
- `feature/*`  : 기능 단위 개발 브랜치
  - 예: `feature/group`, `feature/store`, `feature/menu`, `feature/charge`
- `fix/*`      : 버그 수정 브랜치
- `refactor/*` : 리팩토링 브랜치

기본 원칙

1. 기능은 `feature/*` 브랜치에서 개발
2. 기능 완료 후 `develop`으로 PR 생성 및 코드 리뷰
3. 테스트와 검증을 마친 뒤 `main`으로 머지 및 배포

---

## 👥 팀 소개

- **프로젝트명** : KEEPING – 디지털 선결제 · 공동 지갑 플랫폼  
- **프로젝트 유형** : SSAFY 13기 특화 프로젝트 A509  

### 역할 (예시)

- **Backend**
  - 선불/정산/모임/가맹점 도메인 설계 및 API 구현
  - 멱등성 기반 결제/충전 처리 로직 설계
  - DB 모델링 및 쿼리 최적화
- **Frontend**
  - 사용자/점주용 화면 설계 및 구현
  - QR 결제 플로우, 모임/지갑 UI·UX
  - 백엔드 API 연동 및 상태 관리
- **Infra**
  - 배포 환경 구성 (예: EC2, Nginx 등)
  - 빌드/배포 자동화 및 모니터링

