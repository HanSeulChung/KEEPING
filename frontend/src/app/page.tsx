import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="text-center">
        {/* 로고 */}
        <div className="mb-8">
          <Image
            src="/common/logo_common.svg"
            alt="KEEPING"
            width={200}
            height={60}
            className="mx-auto"
          />
        </div>

        {/* 설명 텍스트 */}
        <p className="font-nanum-square-round-eb mb-12 text-lg text-gray-600">
          가게에 미리 충전하고 편리하게 결제하세요. <br />
          모임 회비도 함께 관리할 수 있습니다.
        </p>

        {/* 선택 카드들 */}
        <div className="flex flex-row items-center justify-center space-x-6">
          {/* 고객 카드 */}
          <Link href="/customer/login" className="group">
            <div className="relative h-[240px] w-[180px] rounded-2xl border-4 border-[#FFC800] bg-white shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl">
              <div className="flex h-full flex-col items-center justify-center p-4">
                <Image
                  src="/common/customer.svg"
                  alt="고객"
                  width={140}
                  height={140}
                  className="mb-[15px]"
                />
                <span className="font-jalnan text-2xl font-bold text-[#FFC800]">
                  고객
                </span>
              </div>
            </div>
          </Link>

          {/* 사장 카드 */}
          <Link href="/owner/login" className="group">
            <div className="relative h-[240px] w-[180px] rounded-2xl border-4 border-[#6ED2FF] bg-white shadow-lg transition-all duration-300 group-hover:scale-105 hover:shadow-xl">
              <div className="flex h-full flex-col items-center justify-center p-4">
                <Image
                  src="/common/owner.svg"
                  alt="사장"
                  width={140}
                  height={140}
                  className="mb-[15px]"
                />
                <span className="font-jalnan text-2xl font-bold text-[#6ED2FF]">
                  사장
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
