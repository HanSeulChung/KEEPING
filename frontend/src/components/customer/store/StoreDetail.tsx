'use client'

import { apiConfig, buildURL } from '@/api/config'
import { useAuthStore } from '@/store/useAuthStore'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { PaymentModal } from '../../ui/PaymentModal'

// 타입 정의
interface StoreData {
  storeId: number
  storeName: string
  description: string
  address: string
  phoneNumber: string
  category: string
  storeStatus: string
  imageUrl?: string
  likes: number
  isLiked: boolean
}

interface ChargeOptionData {
  chargeAmount: number
  bonusPercentage: number
  expectedTotalPoints: number
}

interface MenuItemData {
  name: string
  description: string
  price: number
  imageUrl?: string
}

interface CategoryData {
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
  categoryId: number
  categoryName: string
  displayOrder: number
  soldOut: boolean
  imgUrl: string
  description: string
  price: number
}

// 검색바 컴포넌트
const SearchBar = () => {
  return (
    <div className="mx-auto mb-6 flex h-14 w-[360px] max-w-[720px] items-center gap-1 rounded-[28px] bg-[#f6f8fc]">
      <div className="flex w-full items-center self-stretch p-1">
        <div className="flex w-full items-center gap-2.5 self-stretch px-5 py-0 text-base leading-6 text-[#d9d9d9]">
          가게 검색
        </div>
        <div className="flex h-12 w-12 items-center justify-center">
          <div className="flex w-10 flex-shrink-0 flex-col items-center justify-center rounded-full">
            <div className="flex h-10 items-center justify-center self-stretch"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 탭 섹션 컴포넌트
const TabSection = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) => {
  return (
    <div className="mb-6 flex w-[240px] items-start md:w-[260px]">
      <button
        onClick={() => onTabChange('menu')}
        className={`flex h-[2.5rem] w-[110px] items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
          activeTab === 'menu'
            ? 'bg-[#fdda60] text-white'
            : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
        } font-jalnan text-lg leading-[140%] whitespace-nowrap`}
      >
        메뉴
      </button>
      <button
        onClick={() => onTabChange('charge')}
        className={`flex h-[2.5rem] w-[110px] items-center justify-center rounded-tl-lg rounded-tr-lg px-3 py-1 ${
          activeTab === 'charge'
            ? 'bg-[#fdda60] text-white'
            : 'border-t border-r border-b border-l border-[#fdda60] bg-white text-[#fdda60]'
        } font-jalnan text-lg leading-[140%] whitespace-nowrap`}
      >
        충전금액
      </button>
    </div>
  )
}

// 카테고리 태그 컴포넌트
const CategoryTag = ({
  category,
  isActive = false,
  onClick,
}: {
  category: string
  isActive?: boolean
  onClick?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border border-[#cccccc]/80 px-6 py-3 ${
        isActive ? 'bg-[#cccccc]/80 text-white' : 'bg-white text-[#99a1af]'
      } font-nanum-square-round-eb text-base leading-[140%] font-extrabold whitespace-nowrap transition-colors hover:bg-[#cccccc]/60`}
    >
      {category}
    </button>
  )
}

// 메뉴 아이템 컴포넌트
const MenuItem = ({ menu }: { menu: MenuItemData }) => {
  return (
    <div className="mb-4 flex h-[70px] w-full max-w-[380px] items-center rounded-[5px] bg-[#f8f8f8] p-3 md:max-w-none">
      <div className="mr-3 h-[54px] w-[54px] flex-shrink-0 rounded bg-gray-300">
        {menu.imgUrl ? (
          <img
            src={menu.imgUrl}
            alt={menu.menuName}
            className="h-full w-full rounded object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
            이미지 없음
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-nanum-square-round-eb mb-1 text-lg leading-[140%] text-black">
            {menu.menuName}
          </div>
          <div className="font-nanum-square-round-eb text-lg font-bold text-[#ffc800]">
            {menu.price.toLocaleString()}원
          </div>
        </div>
        <div className="font-nanum-square-round-eb text-sm leading-[140%] font-extrabold text-[#99a1af]">
          {menu.description}
        </div>
        {menu.soldOut && (
          <div className="font-nanum-square-round-eb mt-2 text-sm leading-[140%] font-extrabold text-red-500">
            품절
          </div>
        )}
      </div>
    </div>
  )
}

// 가게 사진 및 정보 컴포넌트
const StoreImageAndInfo = ({
  storeData,
  onToggleLike,
}: {
  storeData: StoreData
  onToggleLike: (storeId: number) => void
}) => {
  return (
    <div className="relative mb-6 pt-4">
      {/* 가게 사진 */}
      <div className="relative h-[200px] w-full overflow-hidden rounded-lg">
        {storeData.imageUrl ? (
          <img
            src={storeData.imageUrl}
            alt={storeData.storeName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200">
            <div className="text-center text-gray-500">
              <div className="font-jalnan text-lg">이미지 없음</div>
            </div>
          </div>
        )}
      </div>

      {/* 가게 정보 카드 (사진 아래에 배치) */}
      <div className="mx-4 mt-4 rounded-[20px] border border-gray-200 bg-white px-8 py-6 shadow-lg md:mx-8 md:px-12 md:py-8">
        <div className="text-center">
          {/* 가게 이름과 하트 버튼 */}
          <div className="relative mb-2 flex items-center justify-center">
            <div className="font-jalnan text-xl leading-[140%] text-black md:text-2xl">
              {storeData.storeName}
            </div>
            <button
              onClick={() => onToggleLike(storeData.storeId)}
              className="absolute -top-3 right-0 flex items-center justify-center"
              aria-label={storeData.isLiked ? '찜하기 취소' : '찜하기'}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill={storeData.isLiked ? 'currentColor' : 'none'}
                className={`transition-colors ${
                  storeData.isLiked
                    ? 'text-red-500'
                    : 'text-gray-400 hover:text-red-500'
                }`}
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
          <div className="font-nanum-square-round-eb mb-1 text-xl leading-[140%] font-extrabold text-[#99a1af]">
            {storeData.phoneNumber}
          </div>
          <div className="font-nanum-square-round-eb text-xl leading-[140%] font-extrabold text-[#99a1af]">
            {storeData.address}
          </div>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export const StoreDetailPage = () => {
  const params = useParams()
  const storeId = params.id as string

  const { user, loading: userLoading, error: userError } = useAuthStore()
  console.log('StoreDetail - useUser 상태:', {
    user,
    loading: userLoading,
    error: userError,
  })

  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [chargeOptions, setChargeOptions] = useState<ChargeOptionData[]>([])
  const [menuData, setMenuData] = useState<MenuItemData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [activeTab, setActiveTab] = useState('menu')
  const [activeCategory, setActiveCategory] = useState<CategoryData | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedChargeIndex, setSelectedChargeIndex] = useState<number | null>(
    null
  )
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // 디버깅용 useEffect
  useEffect(() => {
    console.log('🍽️ 메뉴 렌더링 상태:', {
      activeTab,
      menuData,
      hasMenuData: !!menuData,
      activeCategory,
      menuDataLength: menuData?.length || 0,
      isArray: Array.isArray(menuData),
    })
  }, [activeTab, menuData, activeCategory])

  useEffect(() => {
    console.log('🏷️ 카테고리 렌더링 체크:', {
      categories,
      categoriesLength: categories.length,
      activeCategory,
    })
  }, [categories, activeCategory])

  // 카테고리 변경 시 메뉴 데이터 조회
  useEffect(() => {
    if (activeCategory && storeId) {
      fetchMenuData(storeId, activeCategory.categoryId)
    }
  }, [activeCategory, storeId])

  // 카테고리 데이터 조회 함수
  const fetchCategories = async (storeId: string) => {
    try {
      const url = buildURL(`/stores/${storeId}/menus/categories`)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...apiConfig.headers,
        },
      })

      console.log(
        '🏷️ 카테고리 API 응답 상태:',
        response.status,
        response.statusText
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData.success && responseData.data) {
        const categoriesData: CategoryData[] = responseData.data
        setCategories(categoriesData)

        // 첫 번째 카테고리를 기본 선택으로 설정
        if (categoriesData.length > 0 && !activeCategory) {
          setActiveCategory(categoriesData[0])
        }
      }
    } catch (error) {
      setCategories([])
    }
  }

  // 메뉴 데이터 조회 함수
  const fetchMenuData = async (storeId: string, categoryId: number) => {
    try {
      const url = buildURL(`/stores/${storeId}/menus/categories/${categoryId}`)

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...apiConfig.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()

      if (responseData.success && responseData.data) {
        const menuData: MenuItemData[] = responseData.data
        setMenuData(menuData)
      } else {
        setMenuData([])
      }
    } catch (error) {
      setMenuData([])
    }
  }

  // 찜하기 상태 확인 API 호출 함수
  const checkFavoriteStatus = async (storeId: string) => {
    if (!user) return false

    try {
      const url = buildURL(`/favorites/stores/${storeId}/check`)

      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('찜하기 상태 확인 응답:', responseData)

      // 응답에서 isFavorited 상태 추출
      const isFavorited = responseData?.data?.isFavorited || false

      // storeData 업데이트
      setStoreData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          isLiked: isFavorited,
        }
      })

      return isFavorited
    } catch (error) {
      console.error('찜하기 상태 확인 실패:', error)
      return false
    }
  }

  // 결제 금액 계산 (할인 없음, chargeAmount 그대로)
  const calculatePaymentAmount = () => {
    if (selectedChargeIndex === null || !chargeOptions[selectedChargeIndex])
      return 0
    const selectedOption = chargeOptions[selectedChargeIndex]
    return selectedOption.chargeAmount || 0
  }

  // 충전 금액 계산 (보너스 포함)
  const calculateChargeAmount = () => {
    if (selectedChargeIndex === null || !chargeOptions[selectedChargeIndex])
      return 0
    const selectedOption = chargeOptions[selectedChargeIndex]

    const originalAmount = selectedOption.chargeAmount || 0
    const bonusAmount = originalAmount * (selectedOption.bonusPercentage / 100)
    return originalAmount + bonusAmount
  }

  // 찜하기/찜취소 API 호출 함수
  const toggleLike = async (storeId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!storeData) return

    try {
      const url = buildURL(`/favorites/stores/${storeId}`)
      console.log('찜하기 토글 URL:', url)

      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('찜하기 토글 응답:', responseData)

      // 성공 시 로컬 상태 즉시 업데이트
      setStoreData(prev => {
        if (!prev) return prev
        return {
          ...prev,
          isLiked: !prev.isLiked,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
        }
      })
    } catch (error) {
      console.error('찜하기 토글 실패:', error)
      // 에러 발생 시 사용자에게 알림
      alert('찜하기 처리 중 오류가 발생했습니다.')
    }
  }

  // 충전 옵션 조회
  const fetchChargeOptions = async (storeId: string) => {
    try {
      const url = buildURL(`/api/v1/stores/${storeId}/charge-bonus`)
      console.log('충전 옵션 조회 URL:', url) // 디버깅용

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // HttpOnly 쿠키 포함 (PaymentModal과 동일)
        headers: {
          ...apiConfig.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('충전 옵션 응답 데이터:', responseData) // 디버깅용

      // 응답 데이터에서 실제 데이터 추출
      let data = responseData
      if (responseData && responseData.data) {
        data = responseData.data
      }

      console.log('추출된 충전 옵션 데이터:', data) // 디버깅용

      // 배열인지 확인
      if (Array.isArray(data)) {
        setChargeOptions(data)
      } else {
        console.warn('충전 옵션 데이터가 배열이 아닙니다:', data)
        setChargeOptions([])
      }
    } catch (error) {
      console.error('충전 옵션 조회 실패:', error)
      setChargeOptions([])
    }
  }

  // 가게 상세 정보 조회
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!storeId) return

      setLoading(true)
      setError(null)

      try {
        const url = buildURL(`/stores/${storeId}`)
        console.log('가게 상세 조회 URL:', url) // 디버깅용

        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include', // HttpOnly 쿠키 포함 (PaymentModal과 동일)
          headers: {
            ...apiConfig.headers,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const responseData = await response.json()
        console.log('가게 상세 응답 데이터:', responseData) // 디버깅용

        // 응답 데이터에서 실제 데이터 추출
        let data = responseData
        if (responseData && responseData.data) {
          data = responseData.data
        }

        console.log('추출된 데이터:', data) // 디버깅용

        // 백엔드 응답 데이터를 StoreData 타입에 맞게 변환
        const transformedStoreData: StoreData = {
          storeId: data.storeId || data.id,
          storeName: data.storeName || data.name,
          description: data.description || data.storeDescription,
          address: data.address || data.location,
          category: data.category || data.businessType,
          storeStatus: data.storeStatus || 'ACTIVE',
          imageUrl:
            data.imgUrl || data.imageUrl || data.image || data.storeImage,
          phoneNumber: data.phoneNumber || data.phone,
          likes: data.likes || data.likeCount || 0,
          isLiked: data.isLiked || false,
        }

        console.log('변환된 가게 데이터:', transformedStoreData) // 디버깅용

        setStoreData(transformedStoreData)

        // 가게 정보 조회 성공 후 충전 옵션, 찜하기 상태, 카테고리 데이터도 조회
        console.log('🏪 가게 정보 조회 완료, 추가 데이터 조회 시작')
        await Promise.all([
          fetchChargeOptions(storeId),
          checkFavoriteStatus(storeId),
          fetchCategories(storeId),
        ])
        console.log('🏪 모든 데이터 조회 완료')
      } catch (error) {
        console.error('가게 상세 조회 실패:', error)
        setError('가게 정보를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreDetail()
  }, [storeId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">가게 정보를 불러오는 중...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    )
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">가게 정보를 찾을 수 없습니다.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[412px] overflow-y-auto bg-gray-50 md:w-full md:max-w-none">
      {/* 가게 사진 및 정보 */}
      {storeData && (
        <StoreImageAndInfo storeData={storeData} onToggleLike={toggleLike} />
      )}

      {/* 탭 섹션 */}
      <div className="px-4 pb-20">
        <TabSection activeTab={activeTab} onTabChange={setActiveTab} />

        {/* 카테고리 태그들 - 메뉴 탭일 때만 표시 */}
        {activeTab === 'menu' && categories.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex min-w-max space-x-1 pb-2">
              {categories.map(category => (
                <CategoryTag
                  key={category.categoryId}
                  category={category.categoryName}
                  isActive={activeCategory?.categoryId === category.categoryId}
                  onClick={() => setActiveCategory(category)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 메뉴 탭 내용 */}
        {activeTab === 'menu' && (
          <div>
            {menuData && Array.isArray(menuData) && menuData.length > 0 ? (
              <div className="space-y-4">
                {menuData.map((menu, index) => (
                  <MenuItem key={menu.menuId} menu={menu} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                {!activeCategory
                  ? '카테고리를 선택해주세요.'
                  : '선택된 카테고리에 메뉴가 없습니다.'}
              </div>
            )}
          </div>
        )}

        {/* 충전금액 탭 내용 */}
        {activeTab === 'charge' && (
          <div className="mx-auto w-full max-w-md md:max-w-2xl">
            {/* 충전 옵션들 */}
            <div className="mb-8 space-y-3">
              {chargeOptions.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  충전 옵션을 불러오는 중...
                </div>
              ) : (
                chargeOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`flex h-16 w-full cursor-pointer items-center justify-between rounded-lg border-2 px-4 transition-colors ${
                      selectedChargeIndex === index
                        ? 'border-[#fdda60] bg-yellow-50'
                        : 'border-gray-300 bg-white hover:bg-yellow-50'
                    }`}
                    onClick={() => setSelectedChargeIndex(index)}
                  >
                    <div className="font-nanum-square-round-eb text-base font-bold text-[#fdda60]">
                      {option.bonusPercentage}% 보너스
                    </div>
                    <div className="font-nanum-square-round-eb text-lg font-bold text-black">
                      {option.chargeAmount.toLocaleString()}원
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 결제 금액 */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <div className="font-jalnan mb-2 text-base font-bold text-gray-600">
                결제 금액
              </div>
              <div className="font-nanum-square-round-eb text-lg font-bold text-black">
                {calculatePaymentAmount() > 0
                  ? `${calculatePaymentAmount().toLocaleString()}원`
                  : '옵션을 선택해주세요'}
              </div>
              {calculateChargeAmount() > 0 && (
                <div className="font-jalnan mt-2 text-lg font-bold text-[#fdda60]">
                  충전 금액: {calculateChargeAmount().toLocaleString()}원
                </div>
              )}
            </div>

            {/* 충전하기 버튼 */}
            <button
              className={`mb-20 flex h-12 w-full items-center justify-center rounded-lg border-2 transition-colors ${
                selectedChargeIndex !== null
                  ? 'border-[#fdda60] bg-[#fdda60] hover:bg-[#f4d03f]'
                  : 'cursor-not-allowed border-gray-300 bg-gray-300'
              }`}
              disabled={selectedChargeIndex === null}
              onClick={() => {
                if (selectedChargeIndex !== null) {
                  setIsPaymentModalOpen(true)
                }
              }}
            >
              <span
                className={`font-jalnan text-lg font-bold ${
                  selectedChargeIndex !== null ? 'text-white' : 'text-gray-500'
                }`}
              >
                충전하기
              </span>
            </button>

            {/* 결제 모달 */}
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              amount={calculatePaymentAmount()}
              storeId={storeId}
              onPayment={() => {
                console.log('결제 완료:', calculatePaymentAmount())
                // 결제 완료 후 로직
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
