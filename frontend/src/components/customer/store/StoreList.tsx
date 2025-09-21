'use client'
import { apiConfig, endpoints } from '@/api/config'
import { useUser } from '@/contexts/UserContext'
import { Heart } from 'lucide-react'
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
  const { user, loading: userLoading } = useUser()

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
    categoryFromUrl || initialCategory || categories[0]
  )

  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // 찜하기 상태 확인 함수
  const checkFavoriteStatus = async (storeId: number): Promise<boolean> => {
    if (!user || !storeId) return false

    try {
      console.log('찜하기 상태 확인 - storeId:', storeId)
      const response = await fetch(`${apiConfig.baseURL}/favorites/stores/${storeId}/check`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

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
    setLoading(true)
    setError(null)

    try {
      const url = `${apiConfig.baseURL}${endpoints.stores.search}?category=${encodeURIComponent(category)}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...apiConfig.headers,
          // 필요한 경우 Authorization 헤더 추가
          // 'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data) // 디버깅용

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
        id: store.storeId, // 백엔드에서 storeId로 들어옴
        name: store.storeName, // 백엔드에서 storeName으로 들어옴
        location: store.address, // 백엔드에서 address로 들어옴
        likes: store.likes || store.likeCount || 0,
        isLiked: store.isLiked || false,
        image: store.imgUrl, // 백엔드에서 imgUrl로 들어옴
      }))

      console.log('변환된 가게 데이터:', transformedStores)

      // 사용자 정보가 있을 때 찜하기 상태 확인
      if (user) {
        transformedStores = await Promise.all(
          transformedStores.map(async (store: Store) => {
            const isFavorited = await checkFavoriteStatus(store.id)
            return { ...store, isLiked: isFavorited }
          })
        )
      }

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

  // 카테고리 변경 시 API 호출
  useEffect(() => {
    if (activeCategory) {
      fetchStoresByCategory(activeCategory)
    }
  }, [activeCategory, user])

  // URL 파라미터 변경 감지
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl && categoryFromUrl !== activeCategory) {
      setActiveCategory(categoryFromUrl)
    }
  }, [searchParams, activeCategory])

  // 카테고리 변경 시 가게 목록 업데이트
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
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
      const response = await fetch(`${apiConfig.baseURL}/favorites/stores/${storeId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

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
    <div className="w-full">
      {/* 제목 */}
      <div className="mb-2 text-center">
        <h1 className="font-display text-2xl font-bold">
          {type === 'food' ? 'Food' : 'Life'}
        </h1>
        {/* 검/흰 번갈아가는 줄 */}
        <div className="mt-1 flex justify-center">
          <div className="relative h-[20px] w-[932px] overflow-hidden md:w-[90vw] md:max-w-[932px]">
            <div className="absolute top-[10px] left-2.5 h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[47px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[84px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[121px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[158px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[195px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[232px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[269px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[306px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[343px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[380px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[417px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[454px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[491px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[528px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[565px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[602px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[639px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[676px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[713px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[750px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[787px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[824px] h-1 w-[37px] bg-black" />
            <div className="absolute top-[10px] left-[861px] h-1 w-[37px] border border-black bg-white" />
            <div className="absolute top-[10px] left-[898px] h-1 w-[37px] bg-black" />
          </div>
        </div>
      </div>

      {/* 카테고리 탭들 */}
      <div className="mt-1 mb-6">
        <div className="relative">
          <div className="scrollbar-hide flex justify-center gap-2 overflow-x-auto">
            {categories.map(category => (
              <div
                key={category}
                className="relative flex h-[46px] w-[93px] flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden"
                onClick={() => handleCategoryChange(category)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    width={17}
                    height={17}
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[16.51px] w-[16.7px] flex-shrink-0"
                    preserveAspectRatio="none"
                  >
                    <circle
                      cx="8.69727"
                      cy="8.51172"
                      r="7.5"
                      fill={activeCategory === category ? 'black' : 'white'}
                      stroke="black"
                    />
                    {activeCategory === category && (
                      <path
                        d="M5.5 8.5L7.5 10.5L12 6"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {activeCategory !== category && (
                      <path
                        d="M11.6973 1.51172C11.6973 1.51172 7.52196 2.41697 5.37247 4.09306C3.12803 5.84319 1.20994 9.90158 1.20994 9.90158"
                        stroke="black"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                  <p className="text-[13.6px] font-bold whitespace-nowrap text-black">
                    {category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 가게 목록 */}
      <div className="space-y-0">
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
            <div key={store.id}>
              <div className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-gray-50">
                {/* 가게 이미지 */}
                <div
                  className="h-16 w-16 flex-shrink-0 cursor-pointer bg-gray-200 rounded overflow-hidden"
                  onClick={() => handleStoreClick(store.id)}
                >
                  {store.image ? (
                    <img 
                      src={Array.isArray(store.image) ? store.image[0] : store.image} 
                      alt={store.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                      이미지 없음
                    </div>
                  )}
                </div>

                {/* 가게 정보 */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleStoreClick(store.id)}
                >
                  <h3 className="mb-1 font-medium text-black">{store.name}</h3>
                  <p className="mb-2 text-sm text-gray-600">{store.location}</p>
                  <div className="flex items-center gap-1">
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
                  <Heart
                    size={20}
                    fill={store.isLiked ? 'currentColor' : 'none'}
                    className={`transition-colors ${
                      store.isLiked
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  />
                </button>
              </div>
              {/* 가게 간 구분선 */}
              {index < stores.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className="flex w-[932px] justify-center md:w-[90vw] md:max-w-[932px]">
                    <svg
                      width="932"
                      height="2"
                      viewBox="0 0 932 2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-0.5 w-full"
                    >
                      <path
                        d="M0 1H932"
                        stroke="black"
                        strokeWidth="1"
                        strokeDasharray="10 10"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}