'use client'

import UserRegisterForm from '@/components/owner/UserRegisterForm'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

function Step1Content() {
  const router = useRouter()
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* 헤더 */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 font-['Tenada'] text-xl leading-7 font-extrabold text-black sm:text-2xl lg:text-4xl">
            사업자 본인 인증
          </h1>
          <p className="mb-4 text-xs text-gray-600 sm:text-sm lg:text-base">
            KEEPING과 함께 매장을 관리해보세요
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="mb-4 border border-black bg-white p-4 sm:mb-6 sm:p-6">
          <div className="mb-4 text-center sm:mb-6">
            <div className="text-1 mx-auto mb-3 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black sm:mb-4 sm:px-4 sm:text-[11px]">
              사업자 등록 혜택
            </div>
          </div>
          <ul className="space-y-3 text-center text-sm text-black sm:space-y-4 sm:text-base">
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                매출 캘린더로 일별 매출 현황 확인
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                QR 코드로 간편한 주문 및 결제 관리
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                메뉴 및 할인 정책 자유롭게 설정
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                실시간 알림으로 주문 현황 파악
              </span>
            </li>
          </ul>
        </div>

        {/* 등록 폼 */}
        <div className="flex w-full justify-center">
          <UserRegisterForm
            onNext={() => router.push('/owner/register/step2')}
          />
        </div>

        {/* 하단 안내 */}
        <div className="mt-4 text-center sm:mt-6">
          <p className="px-4 text-xs text-gray-500 sm:text-sm">
            등록 과정에서 문제가 있으시면 고객센터로 문의해주세요
          </p>
        </div>
      </div>
    </main>
  )
}

export default function Step1Page() {
  return (
    <Suspense fallback={<div />}>
      <Step1Content />
    </Suspense>
  )
}
