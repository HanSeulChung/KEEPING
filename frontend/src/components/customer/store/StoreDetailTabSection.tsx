'use client'
import { useState } from 'react'
import { PaymentModal } from '../../ui/PaymentModal'

// 타입 정의
interface ChargeOptionData {
  discount: string
  points: string
  originalPrice: number
  discountRate: number
}

interface MenuItemData {
  name: string
  description: string
  price: number
}

interface MenuData {
  meal: MenuItemData[]
  course: MenuItemData[]
  alacarte: MenuItemData[]
}

const TAB_CONFIG = {
  charge: { label: '충전 금액', icon: 'charge' },
  menu: { label: '메뉴', icon: 'menu' },
} as const

const MENU_CATEGORIES = {
  meal: '식사',
  course: '도미코스',
  alacarte: '단품',
} as const

// 충전 옵션 아이템 컴포넌트
interface ChargeOptionProps extends ChargeOptionData {
  isSelected?: boolean
  onClick?: () => void
}

const ChargeOption = ({
  discount,
  points,
  isSelected = false,
  onClick,
}: ChargeOptionProps) => {
  return (
    <div
      className={`flex h-16 md:h-14 w-full cursor-pointer items-center justify-between border border-black px-5 transition-colors ${
        isSelected ? 'bg-yellow-50' : 'bg-white hover:bg-yellow-50'
      }`}
      onClick={onClick}
    >
      <span className="text-base md:text-sm font-bold text-red-500">{discount}</span>
      <span className="text-base md:text-sm font-bold text-black">{points}</span>
    </div>
  )
}

// 메뉴 아이템 컴포넌트
const MenuItem = ({ name, description, price }: MenuItemData) => {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-bold text-gray-800">{name}</h3>
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
        </div>
        <div className="ml-4">
          <span className="text-lg font-bold text-gray-800">
            {price.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  )
}

// 메뉴 섹션 컴포넌트
const MenuSection = ({ menuData }: { menuData: MenuData }) => {
  const [activeCategory, setActiveCategory] = useState<keyof MenuData>('course')

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 메뉴 카테고리 탭 */}
      <div className="mb-6 flex justify-center gap-4">
        {Object.entries(MENU_CATEGORIES).map(([categoryKey, categoryLabel]) => (
          <div key={categoryKey} className="group relative">
            <button
              onClick={() => setActiveCategory(categoryKey as keyof MenuData)}
              className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
                activeCategory === categoryKey
                  ? 'bg-[#efefef]'
                  : 'bg-white hover:bg-[#efefef]'
              }`}
            >
              <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
                {categoryLabel}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 메뉴 아이템들 */}
      <div className="px-4">
        {menuData[activeCategory].length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            준비된 메뉴가 없습니다.
          </div>
        ) : (
          menuData[activeCategory].map((item, index) => (
            <MenuItem
              key={index}
              name={item.name}
              description={item.description}
              price={item.price}
            />
          ))
        )}
      </div>
    </div>
  )
}

// 충전 섹션 컴포넌트
const ChargeSection = ({
  chargeOptions,
}: {
  chargeOptions: ChargeOptionData[]
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 선택된 옵션의 결제 금액 계산
  const calculatePaymentAmount = () => {
    if (selectedIndex === null) return 0
    const selectedOption = chargeOptions[selectedIndex]
    return Math.round(
      selectedOption.originalPrice * (1 - selectedOption.discountRate)
    )
  }

  const paymentAmount = calculatePaymentAmount()

  return (
    <div className="mx-auto w-full max-w-md">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.map((option, index) => (
          <ChargeOption
            key={index}
            discount={option.discount}
            points={option.points}
            originalPrice={option.originalPrice}
            discountRate={option.discountRate}
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="mb-1 text-sm text-gray-600">결제 금액</div>
        <div className="text-xl font-bold text-black">
          {paymentAmount > 0
            ? `${paymentAmount.toLocaleString()}원`
            : '옵션을 선택해주세요'}
        </div>
        {selectedIndex !== null && (
          <div className="mt-1 text-xs text-gray-500">
            원가 {chargeOptions[selectedIndex].originalPrice.toLocaleString()}
            원에서 {chargeOptions[selectedIndex].discount}
          </div>
        )}
      </div>

      {/* 충전하기 버튼 */}
      <button
        className={`flex h-14 w-full items-center justify-center border border-black transition-colors ${
          selectedIndex !== null
            ? 'bg-black hover:bg-gray-800'
            : 'cursor-not-allowed bg-gray-300'
        }`}
        disabled={selectedIndex === null}
        onClick={() => {
          if (selectedIndex !== null) {
            setIsPaymentModalOpen(true)
          }
        }}
      >
        <span
          className={`text-sm font-bold ${
            selectedIndex !== null ? 'text-white' : 'text-gray-500'
          }`}
        >
          충전하기
        </span>
      </button>

      {/* 결제 모달 */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={paymentAmount}
        onPayment={() => {
          console.log('결제 완료:', paymentAmount)
          // 결제 완료 후 로직
        }}
      />
    </div>
  )
}

// 메인 탭 섹션 컴포넌트
interface StoreDetailTabSectionProps {
  chargeOptions: ChargeOptionData[]
  menuData: MenuData
}

export const StoreDetailTabSection = ({
  chargeOptions,
  menuData,
}: StoreDetailTabSectionProps) => {
  const [activeTab, setActiveTab] = useState<'charge' | 'menu'>('charge')

  return (
    <div className="mb-8">
      {/* 메뉴/충전 탭 */}
      <div className="mb-8 flex justify-center gap-8">
        {Object.entries(TAB_CONFIG).map(([tabKey, tabConfig]) => (
          <label
            key={tabKey}
            className="flex cursor-pointer items-center gap-2"
          >
            <input
              type="radio"
              name="tab"
              value={tabKey}
              checked={activeTab === tabKey}
              onChange={() => setActiveTab(tabKey as 'charge' | 'menu')}
              className="sr-only"
            />
            <div
              className={`transition-all ${
                activeTab === tabKey ? 'opacity-100' : 'opacity-30'
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="8.69727"
                  cy="9"
                  r="7.5"
                  fill={activeTab === tabKey ? '#fde047' : 'white'}
                  stroke="black"
                />
                <path
                  d="M11.6973 2C11.6973 2 7.52196 2.90525 5.37247 4.58134C3.12803 6.33147 1.20994 10.3899 1.20994 10.3899"
                  stroke="black"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xs font-extrabold text-black">
              {tabConfig.label}
            </span>
          </label>
        ))}
      </div>

      {/* 탭 내용 */}
      {activeTab === 'charge' ? (
        <ChargeSection chargeOptions={chargeOptions} />
      ) : (
        <MenuSection menuData={menuData} />
      )}
    </div>
  )
}
