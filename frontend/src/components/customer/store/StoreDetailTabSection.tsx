'use client'

import { buildURL, endpoints } from '@/api/config'
import React, { useState } from 'react'
import { PaymentModal } from '../../ui/PaymentModal'

// 타입 정의
interface ChargeOptionData {
  chargeAmount: number
  bonusPercentage: number
  expectedTotalPoints: number
}

interface MenuCategoryData {
  categoryId: number
  storeId: number
  parentId: number
  categoryName: string
  displayOrder: number
  createdAt: string
}

interface MenuItemData {
  menuId: number
  storeId: number
  menuName: string
  description?: string
  categoryId: number
  categoryName: string
  displayOrder: number
  soldOut: boolean
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
  chargeAmount,
  bonusPercentage,
  expectedTotalPoints,
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
      <span className="text-base md:text-sm font-bold text-red-500">{bonusPercentage}% 보너스</span>
      <span className="text-base md:text-sm font-bold text-black">{chargeAmount.toLocaleString()}원</span>
    </div>
  )
}

// 메뉴 아이템 컴포넌트
const MenuItem = ({ menuName, description }: { menuName: string; description?: string }) => {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-bold text-gray-800">{menuName}</h3>
          {description && (
          <p className="text-sm leading-relaxed text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// 메뉴 섹션 컴포넌트
const MenuSection = ({ storeId }: { storeId: string }) => {
  const [categories, setCategories] = useState<MenuCategoryData[]>([])
  const [menus, setMenus] = useState<MenuItemData[]>([])
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 카테고리 조회
  const fetchCategories = async () => {
    try {
      const url = buildURL(endpoints.stores.listCategory.replace('{storeId}', storeId))
      console.log('메뉴 카테고리 조회 URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('메뉴 카테고리 응답 데이터:', responseData)

      let data = responseData
      if (responseData && responseData.data) {
        data = responseData.data
      }

      // displayOrder 순으로 정렬
      const sortedCategories = data.sort((a: MenuCategoryData, b: MenuCategoryData) => 
        a.displayOrder - b.displayOrder
      )

      setCategories(sortedCategories)
      
      // 첫 번째 카테고리를 기본 선택
      if (sortedCategories.length > 0) {
        setActiveCategoryId(sortedCategories[0].categoryId)
      }
    } catch (error) {
      console.error('메뉴 카테고리 조회 실패:', error)
      setError('메뉴 카테고리를 불러오는데 실패했습니다.')
    }
  }

  // 카테고리별 메뉴 조회
  const fetchMenusByCategory = async (categoryId: number) => {
    setLoading(true)
    setError(null)

    try {
      const url = buildURL(endpoints.stores.menuByCategory.replace('{storeId}', storeId).replace('{categoryId}', categoryId.toString()))
      console.log('카테고리별 메뉴 조회 URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('카테고리별 메뉴 응답 데이터:', responseData)

      let data = responseData
      if (responseData && responseData.data) {
        data = responseData.data
      }

      // 각 메뉴 아이템의 필드 확인
      console.log('메뉴 데이터 상세:', data)
      data.forEach((menu: any, index: number) => {
        console.log(`메뉴 ${index}:`, {
          menuId: menu.menuId,
          menuName: menu.menuName,
          description: menu.description,
          categoryName: menu.categoryName,
          soldOut: menu.soldOut
        })
      })

      // displayOrder 순으로 정렬
      const sortedMenus = data.sort((a: MenuItemData, b: MenuItemData) => 
        a.displayOrder - b.displayOrder
      )

      setMenus(sortedMenus)
    } catch (error) {
      console.error('카테고리별 메뉴 조회 실패:', error)
      setError('메뉴를 불러오는데 실패했습니다.')
      setMenus([])
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 카테고리 조회
  React.useEffect(() => {
    fetchCategories()
  }, [storeId])

  // 활성 카테고리 변경 시 메뉴 조회
  React.useEffect(() => {
    if (activeCategoryId !== null) {
      fetchMenusByCategory(activeCategoryId)
    }
  }, [activeCategoryId])

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 메뉴 카테고리 탭 */}
      <div className="mb-6 flex justify-center gap-4">
        {categories.map((category) => (
          <div key={category.categoryId} className="group relative">
            <button
              onClick={() => setActiveCategoryId(category.categoryId)}
              className={`flex h-[31px] items-center gap-2 border border-solid border-black px-3 transition-colors ${
                activeCategoryId === category.categoryId
                  ? 'bg-[#efefef]'
                  : 'bg-white hover:bg-[#efefef]'
              }`}
            >
              <span className="font-nanum text-xs leading-6 font-normal tracking-[0] text-black">
                {category.categoryName}
              </span>
            </button>
          </div>
        ))}
      </div>

      {/* 메뉴 아이템들 */}
      <div className="px-4">
        {loading ? (
          <div className="py-8 text-center text-gray-500">
            메뉴를 불러오는 중...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            {error}
          </div>
        ) : menus.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            준비된 메뉴가 없습니다.
          </div>
        ) : (
          menus.map((menu) => {
            console.log('렌더링할 메뉴:', {
              menuId: menu.menuId,
              menuName: menu.menuName,
              description: menu.description,
              hasDescription: !!menu.description
            })
            
            return (
              <div key={menu.menuId} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-gray-800">{menu.menuName}</h3>
                    {menu.description && (
                      <p className="text-sm leading-relaxed text-gray-600">{menu.description}</p>
                    )}
                  </div>
                  <div className="ml-4">
                    {menu.soldOut && (
                      <span className="text-lg font-bold text-red-500">품절</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// 충전 섹션 컴포넌트
const ChargeSection = ({
  chargeOptions,
  storeId,
}: {
  chargeOptions: ChargeOptionData[]
  storeId: string
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 결제 금액 계산 (할인 없음, chargeAmount 그대로)
  // 예: chargeAmount=25000 → 결제금액 = 25000원
  const calculatePaymentAmount = () => {
    if (selectedIndex === null || !chargeOptions[selectedIndex]) return 0
    const selectedOption = chargeOptions[selectedIndex]
    return selectedOption.chargeAmount || 0
  }

  // 충전 금액 계산 (보너스 포함)
  // 예: chargeAmount=25000, bonusPercentage=4% → 충전금액 = 25000 + (25000 * 0.04) = 26000원
  const calculateChargeAmount = () => {
    if (selectedIndex === null || !chargeOptions[selectedIndex]) return 0
    const selectedOption = chargeOptions[selectedIndex]

    const originalAmount = selectedOption.chargeAmount || 0
    const bonusAmount = originalAmount * (selectedOption.bonusPercentage / 100)
    return originalAmount + bonusAmount
  }

  const paymentAmount = calculatePaymentAmount()
  const chargeAmount = calculateChargeAmount()

  return (
    <div className="mx-auto w-full max-w-md">
      {/* 충전 옵션들 */}
      <div className="mb-6 space-y-2">
        {chargeOptions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            충전 옵션을 불러오는 중...
          </div>
        ) : (
          chargeOptions.map((option, index) => (
          <ChargeOption
            key={index}
              chargeAmount={option.chargeAmount}
              bonusPercentage={option.bonusPercentage}
              expectedTotalPoints={option.expectedTotalPoints}
            isSelected={selectedIndex === index}
            onClick={() => setSelectedIndex(index)}
          />
          ))
        )}
      </div>

      {/* 결제 금액 */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="mb-1 text-sm text-gray-600">결제 금액</div>
        <div className="text-xl font-bold text-black">
          {paymentAmount > 0
            ? `${paymentAmount.toLocaleString()}원`
            : '옵션을 선택해주세요'}
        </div>
        {chargeAmount > 0 && (
          <div className="mt-2 text-sm font-medium text-blue-600">
            충전 금액: {chargeAmount.toLocaleString()}원
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
        storeId={storeId}
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
  storeId: string
}

export const StoreDetailTabSection = ({
  chargeOptions,
  storeId,
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
        <ChargeSection chargeOptions={chargeOptions} storeId={storeId} />
      ) : (
        <MenuSection storeId={storeId} />
      )}
    </div>
  )
}