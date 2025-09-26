'use client'

import CardModal from '@/components/customer/CardModal'
import { useSidebarStore } from '@/store/useSidebarStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const Navigation = () => {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarStore()
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)

  const handleCloseModal = () => {
    setIsCardModalOpen(false)
  }

  return (
    <div className="fixed bottom-0 left-1/2 z-50 h-[4.5rem] w-[412px] -translate-x-1/2 transform bg-white">
      {/* 상단 노란색 선 */}
      <div className="h-[3px] w-full bg-[#ffc800]"></div>

      {/* 하단 탭 컨테이너 */}
      <div className="relative flex h-full items-center justify-between px-4 py-2">
        {/* 홈 아이콘 */}
        <Link href="/customer/home" className="flex flex-col items-center">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12H15V22"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* 개인 아이콘 */}
        <Link href="/customer/myWallet" className="flex flex-col items-center">
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* 카드 버튼 (중앙, 활성화됨) - 노란 선에 걸쳐있고 더 큰 크기 */}
        <button
          onClick={() => setIsCardModalOpen(!isCardModalOpen)}
          className="absolute top-0 left-1/2 z-[60] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffc800] transition-colors hover:bg-[#ffb800]"
        >
          <svg
            width={40}
            height={40}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="1"
              y="4"
              width="22"
              height="16"
              rx="2"
              ry="2"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="1"
              y1="10"
              x2="23"
              y2="10"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 그룹 아이콘 */}
        <Link
          href="/customer/groupWallet"
          className="flex flex-col items-center"
        >
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="9"
              cy="7"
              r="4"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.6977C21.7033 16.0413 20.9999 15.5754 20.2 15.3669"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
              stroke="#FFC800"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* My 텍스트 */}
        <Link href="/customer/myPage" className="flex flex-col items-center">
          <div className="font-jalnan text-lg text-[#ffc800]">My</div>
        </Link>
      </div>

      {/* 카드 모달 */}
      <CardModal isOpen={isCardModalOpen} onClose={handleCloseModal} />
    </div>
  )
}

export default Navigation
