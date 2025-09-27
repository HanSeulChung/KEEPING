'use client'
import { apiConfig, endpoints } from '@/api/config'
import { useUser } from '@/contexts/UserContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

// 가게 데이터 타입 정의
interface Store {
  id: number
  name: string
  location: string
  likes: number
  isLiked: boolean
  image?: string
}

interface StoreListProps {
  type: 'food' | 'life'
  initialCategory?: string
}

export const StoreList = ({ type, initialCategory }: StoreListProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: userLoading, error: userError } = useUser()
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || (type === 'food' ? '한식' : '헤어')
  )
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // 사용자 정보 디버깅
  console.log('StoreList 사용자 정보:', {
    user,
    userLoading,
    hasUserId: !!user?.userId,
    userId: user?.userId,
    userError,
  })

  // 인증 오류가 있으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (userError && !userLoading) {
      console.warn('인증 오류로 인해 로그인 페이지로 리다이렉트:', userError)
      router.push('/customer/login')
    }
  }, [userError, userLoading, router])

  const foodCategories = [
    '한식',
    '중식',
    '일식',
    '양식',
    '분식',
    '아시안',
    '패스트푸드',
    '카페',
    '식료품',
    '반찬/밀키트',
  ]

  const lifeCategories = [
    '헤어',
    '뷰티',
    '꽃',
    '엔터테인먼트',
    '스포츠',
    '자동차',
    '펫',
    '주류',
    '클래스',
    '잡화',
  ]

  const categories = type === 'food' ? foodCategories : lifeCategories

  const categoryFromUrl = searchParams.get('category')
  const [activeCategory, setActiveCategory] = useState(
    categoryFromUrl || initialCategory || (type === 'food' ? '한식' : '헤어')
  )

  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 드롭다운 토글 함수
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  // 카테고리 선택 함수
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setActiveCategory(category)
    setIsDropdownOpen(false)
    // URL 파라미터 업데이트
    router.push(`/customer/list?category=${encodeURIComponent(category)}`)
    setCurrentPage(1)
  }

  // 찜하기 상태 확인 함수
  const checkFavoriteStatus = async (storeId: number): Promise<boolean> => {
    if (!user || !storeId) return false

    try {
      console.log('찜하기 상태 확인 - storeId:', storeId)

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

      const response = await fetch(
        `${apiConfig.baseURL}/favorites/stores/${storeId}/check`,
        {
          method: 'GET',
          credentials: 'include',
          headers,
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('찜하기 상태 응답:', data)
        return data.data?.isFavorited || false
      }
      return false
    } catch (error) {
      console.error('찜하기 상태 확인 실패:', error)
      return false
    }
  }

  // API 호출 함수
  const fetchStoresByCategory = async (category: string) => {
    console.log('🏪 가게 목록 조회 시작:', { category, userId: user?.userId })
    setLoading(true)
    setError(null)

    try {
      // URL 구성 - 카테고리 파라미터 포함
      const url = `${apiConfig.baseURL}${endpoints.stores.search}?category=${encodeURIComponent(category)}`
      console.log('🔗 요청 URL:', url)

      // Authorization 헤더 추가
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (typeof window !== 'undefined') {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`
          console.log(
            '🔑 Access Token 있음:',
            accessToken.substring(0, 20) + '...'
          )
        } else {
          console.warn('⚠️ Access Token 없음')
        }
      }

      console.log('📤 가게 목록 조회 요청:', {
        url,
        category,
        hasAuthHeader: !!headers.Authorization,
        headers,
      })

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include',
      })

      console.log('📥 가게 목록 조회 응답:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ 가게 목록 조회 실패:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url,
        })
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        )
      }

      const data = await response.json()
      console.log('✅ 가게 목록 API 응답 데이터:', data)

      // 백엔드 응답 데이터 구조 확인 및 변환
      let storesData = data

      // 응답이 객체이고 stores 배열을 포함하는 경우
      if (data && typeof data === 'object' && data.stores) {
        storesData = data.stores
      }
      // 응답이 객체이고 data 배열을 포함하는 경우
      else if (data && typeof data === 'object' && data.data) {
        storesData = data.data
      }
      // 응답이 배열인 경우
      else if (Array.isArray(data)) {
        storesData = data
      }
      // 그 외의 경우 빈 배열
      else {
        console.warn('예상하지 못한 API 응답 구조:', data)
        storesData = []
      }

      // 백엔드 응답 데이터를 Store 타입에 맞게 변환
      let transformedStores: Store[] = storesData.map((store: any) => ({
        id: store.storeId || store.id, // 백엔드에서 storeId 또는 id로 들어옴
        name: store.storeName || store.name, // 백엔드에서 storeName 또는 name으로 들어옴
        location: store.address || store.location || store.storeAddress, // 백엔드에서 다양한 필드명
        likes: store.likes || store.likeCount || 0,
        isLiked: store.isLiked || false,
        image: store.imgUrl || store.image || store.storeImageUrl, // 백엔드에서 다양한 필드명
      }))

      console.log('변환된 가게 데이터:', transformedStores)

      // 사용자 정보가 있을 때 찜하기 상태 확인 (일단 스킵하고 나중에 추가)
      if (user && transformedStores.length > 0) {
        console.log(
          '찜하기 상태 확인 시작:',
          transformedStores.length,
          '개 가게'
        )
        try {
          transformedStores = await Promise.all(
            transformedStores.map(async (store: Store) => {
              const isFavorited = await checkFavoriteStatus(store.id)
              return { ...store, isLiked: isFavorited }
            })
          )
        } catch (error) {
          console.warn('찜하기 상태 확인 실패, 기본값 사용:', error)
        }
      }

      console.log('최종 가게 목록:', transformedStores)
      setStores(transformedStores)
    } catch (error) {
      console.error('가게 목록 조회 실패:', error)
      setError('가게 목록을 불러오는데 실패했습니다.')
      // 에러 발생 시 빈 배열로 설정
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  // 카테고리 변경 시 API 호출 (사용자 정보가 로드된 후에만)
  useEffect(() => {
    if (activeCategory && !userLoading && user?.userId) {
      console.log('사용자 정보 로드 완료, 가게 목록 조회 시작:', {
        userId: user.userId,
        activeCategory,
      })
      fetchStoresByCategory(activeCategory)
    } else if (activeCategory && userLoading) {
      console.log('사용자 정보 로딩 중...')
    } else if (activeCategory && !user?.userId) {
      console.warn('사용자 정보가 없어서 가게 목록을 조회할 수 없습니다:', {
        user,
        userLoading,
      })
    }
  }, [activeCategory, user, userLoading, userError])

  // URL 파라미터 변경 감지
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl)
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams, activeCategory])

  // 카테고리 변경 시 가게 목록 업데이트
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setSelectedCategory(category)
    // URL 파라미터 업데이트
    router.push(`/customer/list?category=${encodeURIComponent(category)}`)
    setCurrentPage(1)
  }

  // 좋아요 토글
  const toggleLike = async (storeId: number) => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    if (!storeId) {
      console.error('storeId가 없습니다:', storeId)
      return
    }

    try {
      console.log('찜하기 토글 - storeId:', storeId)

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

      const response = await fetch(
        `${apiConfig.baseURL}/favorites/stores/${storeId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
        }
      )

      if (response.ok) {
        // 성공 시 로컬 상태 업데이트
        setStores(prev =>
          prev.map(store =>
            store.id === storeId
              ? {
                  ...store,
                  isLiked: !store.isLiked,
                  likes: store.isLiked ? store.likes - 1 : store.likes + 1,
                }
              : store
          )
        )
      } else {
        console.error('찜하기 실패')
      }
    } catch (error) {
      console.error('찜하기 요청 실패:', error)
    }
  }

  // 가게 클릭 핸들러
  const handleStoreClick = (storeId: number) => {
    router.push(`/customer/store/${storeId}`)
  }

  return (
    <div className="mx-auto h-[795px] w-[23.6875rem] md:h-auto md:w-full md:max-w-4xl">
      {/* 검색바
      <div className="mb-4 flex h-14 w-[22.5rem] max-w-[720px] flex-shrink-0 items-center gap-1 rounded-[28px] bg-[#f6f8fc] md:w-full">
        <div className="state-layer flex items-center self-stretch p-1">
          <div className="content flex items-center gap-2.5 self-stretch px-5 py-0">
            <span className="font-nanum-square-round-eb text-base text-[#d9d9d9]">
              가게 검색
            </span>
          </div>
          <div className="absolute top-[0.25rem] right-[0.25rem] flex items-center justify-end">
            <div className="flex h-12 w-12 items-center justify-center">
              <div className="flex w-10 flex-shrink-0 flex-col items-center justify-center rounded-full">
                <div className="flex h-10 items-center justify-center self-stretch">
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.14583 15.3708 4.8875 14.1125C3.62917 12.8542 3 11.3167 3 9.5C3 7.68333 3.62917 6.14583 4.8875 4.8875C6.14583 3.62917 7.68333 3 9.5 3C11.3167 3 12.8542 3.62917 14.1125 4.8875C15.3708 6.14583 16 7.68333 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8125 13.5625 12.6875 12.6875C13.5625 11.8125 14 10.75 14 9.5C14 8.25 13.5625 7.1875 12.6875 6.3125C11.8125 5.4375 10.75 5 9.5 5C8.25 5 7.1875 5.4375 6.3125 6.3125C5.4375 7.1875 5 8.25 5 9.5C5 10.75 5.4375 11.8125 6.3125 12.6875C7.1875 13.5625 8.25 14 9.5 14Z"
                      fill="#D9D9D9"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* 카테고리 드롭다운 */}
      <div className="relative mb-6">
        <div className="inline-flex items-center justify-end gap-1.5 rounded-full border-[3px] border-[#fdda60] py-1 pr-1 pl-7">
          <div className="font-jalnan text-[.9375rem] leading-[140%] text-[#ffc800]">
            {selectedCategory}
          </div>
          <button onClick={toggleDropdown}>
            <svg
              width={30}
              height={30}
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 18.75L8.75 12.5H21.25L15 18.75Z" fill="#FFC800" />
            </svg>
          </button>
        </div>

        {/* 드롭다운 메뉴 */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 z-10 mt-2 w-full rounded-lg border border-[#fdda60] bg-white shadow-lg">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className="font-nanum-square-round-eb w-full px-4 py-2 text-left text-sm hover:bg-yellow-50"
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 가게 목록 */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">가게 목록을 불러오는 중...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : stores.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">
              해당 카테고리에 가게가 없습니다.
            </div>
          </div>
        ) : (
          stores.map((store, index) => (
            <div
              key={store.id}
              className="flex h-[4.75rem] w-[23.75rem] flex-shrink-0 items-center rounded-[0.3125rem] bg-[#f8f8f8] p-4 md:w-full"
            >
              {/* 가게 이미지 */}
              <div
                className="mr-4 h-[3.75rem] w-[3.75rem] flex-shrink-0 cursor-pointer overflow-hidden rounded-full bg-gray-200"
                onClick={() => handleStoreClick(store.id)}
              >
                {store.image ? (
                  <img
                    src={
                      Array.isArray(store.image) ? store.image[0] : store.image
                    }
                    alt={store.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    이미지 없음
                  </div>
                )}
              </div>

              {/* 가게 정보 */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleStoreClick(store.id)}
              >
                <div className="font-jalnan mb-1 text-[.9375rem] leading-[140%] text-black">
                  {store.name}
                </div>
                <div className="font-nanum-square-round-eb text-xs leading-[140%] font-extrabold text-[#99a1af]">
                  {store.location}
                </div>
              </div>

              {/* 좋아요 버튼 */}
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleLike(store.id)
                }}
                className="p-2"
              >
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.3671 3.84172C16.9415 3.41589 16.4361 3.0781 15.8799 2.84763C15.3237 2.61716 14.7275 2.49854 14.1254 2.49854C13.5234 2.49854 12.9272 2.61716 12.371 2.84763C11.8147 3.0781 11.3094 3.41589 10.8838 3.84172L10.0004 4.72506L9.11709 3.84172C8.25735 2.98198 7.09129 2.49898 5.87542 2.49898C4.65956 2.49898 3.4935 2.98198 2.63376 3.84172C1.77401 4.70147 1.29102 5.86753 1.29102 7.08339C1.29102 8.29925 1.77401 9.46531 2.63376 10.3251L10.0004 17.6917L17.3671 10.3251C17.7929 9.89943 18.1307 9.39407 18.3612 8.83785C18.5917 8.28164 18.7103 7.68546 18.7103 7.08339C18.7103 6.48132 18.5917 5.88514 18.3612 5.32893C18.1307 4.77271 17.7929 4.26735 17.3671 3.84172Z"
                    stroke="#FF6F6F"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill={store.isLiked ? '#FF6F6F' : 'none'}
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
