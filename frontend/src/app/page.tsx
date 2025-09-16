import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="font-display mb-4 text-4xl font-bold text-gray-900">
          KEEPING
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          가게에 미리 충전하고 편리하게 결제하세요. <br />
          모임 회비도 함께 관리할 수 있습니다.
        </p>

        <div className="flex flex-row items-center justify-center space-x-4">
          <Link href="/owner/login" className="text-white transition-colors">
            <Image
              src="icons/main_owner.svg"
              alt="사장님 로그인"
              width={180}
              height={180}
            />
          </Link>

          <Link href="/customer/login" className="text-white transition-colors">
            <Image
              src="icons/main_customer.svg"
              alt="고객 로그인"
              width={180}
              height={180}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
