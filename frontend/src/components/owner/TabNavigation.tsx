'use client'

interface TabNavigationProps {
  activeTab: 'menu' | 'charge'
  onTabChange: (tab: 'menu' | 'charge') => void
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full border-b border-black bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 py-6">
          {/* 충전 보너스 탭 */}
          <button
            onClick={() => onTabChange('charge')}
            className={`flex items-center gap-2 ${
              activeTab === 'charge' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.25 13.5C2.25 14.4946 3.00542 15.25 4 15.25H14C14.9946 15.25 15.75 14.4946 15.75 13.5V7.75H2.25V13.5Z"
                fill={activeTab === 'charge' ? '#000' : '#9CA3AF'}
              />
              <path
                d="M15.75 4.5V6.25H2.25V4.5C2.25 3.50542 3.00542 2.75 4 2.75H14C14.9946 2.75 15.75 3.50542 15.75 4.5Z"
                fill={activeTab === 'charge' ? '#000' : '#9CA3AF'}
              />
            </svg>
            <span className="font-['nanumsquare'] font-bold text-black">
              충전 보너스
            </span>
          </button>

          {/* 메뉴 관리 탭 */}
          <button
            onClick={() => onTabChange('menu')}
            className={`flex items-center gap-2 ${
              activeTab === 'menu' ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 3H15C15.5523 3 16 3.44772 16 4V14C16 14.5523 15.5523 15 15 15H3C2.44772 15 2 14.5523 2 14V4C2 3.44772 2.44772 3 3 3Z"
                fill={activeTab === 'menu' ? '#000' : '#9CA3AF'}
              />
              <path
                d="M5 7H13M5 9H13M5 11H9"
                stroke="white"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
            <span className="font-['nanumsquare'] font-bold text-black">
              메뉴 관리
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default TabNavigation
