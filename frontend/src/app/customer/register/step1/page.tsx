'use client'

import CustomerAuthForm from '@/components/customer/CustomerAuthForm'
import { useRouter } from 'next/navigation'

export default function CustomerStep1Page() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* 헤더 */}
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="mb-2 font-['Tenada'] text-xl leading-7 font-extrabold text-black sm:text-2xl lg:text-4xl">
            고객 본인 인증
          </h1>
          <p className="mb-4 text-xs text-gray-600 sm:text-sm lg:text-base">
            KEEPING과 함께 편리한 결제를 경험해보세요
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="mb-4 border border-black bg-white p-4 sm:mb-6 sm:p-6">
          <div className="mb-4 text-center sm:mb-6">
            <div className="text-1 mx-auto mb-3 flex h-[1.375rem] items-center justify-center gap-2.5 rounded-lg border border-black bg-white px-3 pt-[0.5625rem] pb-[0.5625rem] text-center font-['nanumsquare'] text-[10px] leading-5 font-bold whitespace-nowrap text-black sm:mb-4 sm:px-4 sm:text-[11px]">
              고객 등록 혜택
            </div>
          </div>
          <ul className="space-y-3 text-center text-sm text-black sm:space-y-4 sm:text-base">
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                QR 코드로 간편한 주문 및 결제
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                그룹 결제로 더 편리한 모임
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                개인 지갑으로 안전한 자금 관리
              </span>
            </li>
            <li className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
              <span className="text-center font-medium">
                실시간 주문 현황 확인
              </span>
            </li>
          </ul>
        </div>

        {/* 등록 폼 */}
        <div className="flex w-full justify-center">
          <CustomerAuthForm
            onNext={() => router.push('/customer/register/step2')}
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

