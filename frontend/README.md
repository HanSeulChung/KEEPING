# A509 공통 프로젝트

Next.js 15와 TypeScript를 기반으로 한 모던 웹 애플리케이션입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Build Tool**: Turbopack
- **Linting**: ESLint

## 📋 사전 요구사항

pnpm이 설치되어 있지 않다면 먼저 설치해주세요:

```bash
npm install -g pnpm
# 또는
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 🏃‍♂️ 시작하기

1. **의존성 설치**

   ```bash
   pnpm install
   ```

2. **개발 서버 실행**

   ```bash
   pnpm dev
   ```

3. **브라우저에서 확인**

   [http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지
│   ├── globals.css        # 전역 스타일
│   └── favicon.ico        # 파비콘
├── components/             # React 컴포넌트
│   └── common/            # 공통 컴포넌트
├── providers/              # Context Provider
├── lib/                   # 유틸리티 함수
│   └── utils.ts          # 공통 유틸리티
├── hooks/                 # 커스텀 React 훅
├── types/                 # TypeScript 타입 정의
│   └── index.ts          # 공통 타입
└── constants/             # 상수 정의
    └── index.ts          # 애플리케이션 상수
```

## 🛠️ 개발 가이드

### 컴포넌트 작성 규칙

- **타입 정의**: TypeScript를 사용하여 모든 컴포넌트의 props 타입을 정의합니다
- **스타일링**: Tailwind CSS를 사용하며, `cn()` 함수로 클래스를 병합합니다
- **네이밍**: 컴포넌트는 PascalCase, 파일명도 PascalCase를 사용합니다

### 폴더별 역할

- **`app/`**: Next.js App Router 기반 페이지 및 레이아웃
- **`components/`**: 재사용 가능한 React 컴포넌트
- **`providers/`**: Context API 기반 상태 관리 Provider
- **`lib/`**: 순수 함수, 유틸리티, 헬퍼 함수
- **`hooks/`**: 커스텀 React 훅
- **`types/`**: TypeScript 타입 및 인터페이스 정의
- **`constants/`**: 애플리케이션 전역 상수

### Import 경로

TypeScript 경로 별칭을 사용합니다:

```typescript
import { Button } from '@/components/common'
import { cn } from '@/lib/utils'
import { APP_CONFIG } from '@/constants'
```

## 📝 사용 가능한 스크립트

```bash
pnpm dev          # 개발 서버 실행 (Turbopack 사용)
pnpm build        # 프로덕션 빌드
pnpm start        # 프로덕션 서버 실행
pnpm lint         # ESLint 실행
```

## 📚 추가 학습 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [TypeScript 가이드](https://www.typescriptlang.org/docs/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
