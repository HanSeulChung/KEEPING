'use client'

import UserRegisterForm from '@/components/owner/UserRegisterForm'
import { useRouter } from 'next/navigation'

export default function Step1Page() {
  const router = useRouter()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-black font-['Tenada'] text-xl sm:text-2xl lg:text-4xl font-extrabold leading-7 mb-2">
            사업자 본인 인증
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-4">
            KEEPING과 함께 매장을 관리해보세요
          </p>
        </div>

        {/* 안내 카드 */}
        <div className="bg-white border border-black p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="flex justify-center items-center gap-2.5 pt-[0.5625rem] pb-[0.5625rem] px-3 sm:px-4 h-[1.375rem] rounded-lg border border-black bg-white text-1 font-['nanumsquare'] text-black text-center text-[10px] sm:text-[11px] font-bold leading-5 whitespace-nowrap mx-auto mb-3 sm:mb-4">
              사업자 등록 혜택
            </div>
          </div>
          <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base text-black text-center">
            <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium text-center">매출 캘린더로 일별 매출 현황 확인</span>
            </li>
            <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium text-center">QR 코드로 간편한 주문 및 결제 관리</span>
            </li>
            <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium text-center">메뉴 및 할인 정책 자유롭게 설정</span>
            </li>
            <li className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
              <span className="font-medium text-center">실시간 알림으로 주문 현황 파악</span>
            </li>
          </ul>
        </div>

        {/* 등록 폼 */}
        <div className="w-full flex justify-center">
          <UserRegisterForm onNext={() => router.push('/owner/register/step2')} />
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-500 px-4">
            등록 과정에서 문제가 있으시면 고객센터로 문의해주세요
          </p>
        </div>
      </div>
    </main>
  )
}
