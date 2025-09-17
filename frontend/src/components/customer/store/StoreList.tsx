'use client'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// 가게 데이터 타입 정의
interface Store {
  id: number
  name: string
  location: string
  likes: number
  isLiked: boolean
  image?: string
}

// Food 카테고리별 더미 데이터
const foodStoreData: Record<string, Store[]> = {
  한식: [
    {
      id: 1,
      name: '코미드리',
      location: '서울시 강남구',
      likes: 2,
      isLiked: true,
    },
    {
      id: 2,
      name: '한식당',
      location: '서울시 서초구',
      likes: 5,
      isLiked: false,
    },
    {
      id: 3,
      name: '전통한식',
      location: '서울시 강남구',
      likes: 3,
      isLiked: false,
    },
  ],
  중식: [
    {
      id: 4,
      name: '차이나타운',
      location: '서울시 중구',
      likes: 8,
      isLiked: false,
    },
    {
      id: 5,
      name: '홍콩반점',
      location: '서울시 강남구',
      likes: 4,
      isLiked: true,
    },
  ],
  일식: [
    {
      id: 6,
      name: '스시야마',
      location: '서울시 강남구',
      likes: 12,
      isLiked: false,
    },
    {
      id: 7,
      name: '라멘코야',
      location: '서울시 서초구',
      likes: 7,
      isLiked: true,
    },
  ],
  양식: [
    {
      id: 8,
      name: '이탈리안키친',
      location: '서울시 강남구',
      likes: 9,
      isLiked: false,
    },
    {
      id: 9,
      name: '프렌치비스트로',
      location: '서울시 서초구',
      likes: 6,
      isLiked: false,
    },
  ],
  분식: [
    {
      id: 10,
      name: '떡볶이천국',
      location: '서울시 강남구',
      likes: 15,
      isLiked: true,
    },
    {
      id: 11,
      name: '김밥나라',
      location: '서울시 서초구',
      likes: 8,
      isLiked: false,
    },
  ],
  아시안: [
    {
      id: 12,
      name: '타이키친',
      location: '서울시 강남구',
      likes: 6,
      isLiked: false,
    },
    {
      id: 13,
      name: '베트남쌀국수',
      location: '서울시 서초구',
      likes: 4,
      isLiked: true,
    },
  ],
  패스트푸드: [
    {
      id: 14,
      name: '버거킹',
      location: '서울시 강남구',
      likes: 20,
      isLiked: false,
    },
    {
      id: 15,
      name: '맥도날드',
      location: '서울시 서초구',
      likes: 25,
      isLiked: true,
    },
  ],
  카페: [
    {
      id: 16,
      name: '스타벅스',
      location: '서울시 강남구',
      likes: 30,
      isLiked: true,
    },
    {
      id: 17,
      name: '이디야커피',
      location: '서울시 서초구',
      likes: 18,
      isLiked: false,
    },
  ],
  식료품: [
    {
      id: 18,
      name: '이마트',
      location: '서울시 강남구',
      likes: 45,
      isLiked: false,
    },
    {
      id: 19,
      name: '롯데마트',
      location: '서울시 서초구',
      likes: 38,
      isLiked: true,
    },
  ],
  '반찬/밀키트': [
    {
      id: 20,
      name: '반찬가게',
      location: '서울시 강남구',
      likes: 12,
      isLiked: false,
    },
    {
      id: 21,
      name: '밀키트마켓',
      location: '서울시 서초구',
      likes: 8,
      isLiked: true,
    },
  ],
}

// Life 카테고리별 더미 데이터
const lifeStoreData: Record<string, Store[]> = {
  헤어: [
    {
      id: 101,
      name: '헤어살롱',
      location: '서울시 강남구',
      likes: 15,
      isLiked: true,
    },
    {
      id: 102,
      name: '뷰티헤어',
      location: '서울시 서초구',
      likes: 8,
      isLiked: false,
    },
  ],
  뷰티: [
    {
      id: 103,
      name: '뷰티샵',
      location: '서울시 강남구',
      likes: 12,
      isLiked: false,
    },
    {
      id: 104,
      name: '화장품매장',
      location: '서울시 서초구',
      likes: 6,
      isLiked: true,
    },
  ],
  꽃: [
    {
      id: 105,
      name: '꽃집',
      location: '서울시 강남구',
      likes: 9,
      isLiked: true,
    },
    {
      id: 106,
      name: '플라워샵',
      location: '서울시 서초구',
      likes: 4,
      isLiked: false,
    },
  ],
  엔터테인먼트: [
    {
      id: 107,
      name: '노래방',
      location: '서울시 강남구',
      likes: 20,
      isLiked: false,
    },
    {
      id: 108,
      name: 'PC방',
      location: '서울시 서초구',
      likes: 25,
      isLiked: true,
    },
  ],
  스포츠: [
    {
      id: 109,
      name: '헬스장',
      location: '서울시 강남구',
      likes: 18,
      isLiked: true,
    },
    {
      id: 110,
      name: '요가원',
      location: '서울시 서초구',
      likes: 7,
      isLiked: false,
    },
  ],
  자동차: [
    {
      id: 111,
      name: '자동차정비소',
      location: '서울시 강남구',
      likes: 10,
      isLiked: false,
    },
    {
      id: 112,
      name: '세차장',
      location: '서울시 서초구',
      likes: 5,
      isLiked: true,
    },
  ],
  펫: [
    {
      id: 113,
      name: '펫샵',
      location: '서울시 강남구',
      likes: 14,
      isLiked: true,
    },
    {
      id: 114,
      name: '동물병원',
      location: '서울시 서초구',
      likes: 8,
      isLiked: false,
    },
  ],
  주류: [
    {
      id: 115,
      name: '와인샵',
      location: '서울시 강남구',
      likes: 6,
      isLiked: false,
    },
    {
      id: 116,
      name: '전통주매장',
      location: '서울시 서초구',
      likes: 3,
      isLiked: true,
    },
  ],
  클래스: [
    {
      id: 117,
      name: '요리학원',
      location: '서울시 강남구',
      likes: 11,
      isLiked: true,
    },
    {
      id: 118,
      name: '언어학원',
      location: '서울시 서초구',
      likes: 9,
      isLiked: false,
    },
  ],
  잡화: [
    {
      id: 119,
      name: '생활용품점',
      location: '서울시 강남구',
      likes: 7,
      isLiked: false,
    },
    {
      id: 120,
      name: '문구점',
      location: '서울시 서초구',
      likes: 4,
      isLiked: true,
    },
  ],
}

interface StoreListProps {
  type: 'food' | 'life'
  initialCategory?: string
}

export const StoreList = ({ type, initialCategory }: StoreListProps) => {
  const router = useRouter()

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
  const storeData = type === 'food' ? foodStoreData : lifeStoreData

  const [activeCategory, setActiveCategory] = useState(
    initialCategory || categories[0]
  )
  const [stores, setStores] = useState<Store[]>(() => {
    const category = initialCategory || categories[0]
    return storeData[category] || []
  })
  const [currentPage, setCurrentPage] = useState(1)

  // 카테고리 변경 시 가게 목록 업데이트
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category)
    setStores(storeData[category] || [])
    setCurrentPage(1)
  }

  // 좋아요 토글
  const toggleLike = (storeId: number) => {
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
          <div className="w-[932px] h-[20px] md:w-[90vw] md:max-w-[932px] relative overflow-hidden">
            <div className="w-[37px] h-1 absolute left-2.5 top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[47px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[84px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[121px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[158px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[195px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[232px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[269px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[306px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[343px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[380px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[417px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[454px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[491px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[528px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[565px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[602px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[639px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[676px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[713px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[750px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[787px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[824px] top-[10px] bg-black" />
            <div className="w-[37px] h-1 absolute left-[861px] top-[10px] bg-white border border-black" />
            <div className="w-[37px] h-1 absolute left-[898px] top-[10px] bg-black" />
          </div>
        </div>
      </div>

      {/* 카테고리 탭들 */}
      <div className="mb-6 mt-1">
        <div className="relative">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto justify-center">
            {categories.map(category => (
              <div
                key={category}
                className="w-[93px] h-[46px] relative overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center"
                onClick={() => handleCategoryChange(category)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    width={17}
                    height={17}
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[16.7px] h-[16.51px] flex-shrink-0"
                    preserveAspectRatio="none"
                  >
                    <circle 
                      cx="8.69727" 
                      cy="8.51172" 
                      r="7.5" 
                      fill={activeCategory === category ? "black" : "white"} 
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
                  <p className="text-[13.6px] font-bold text-black whitespace-nowrap">
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
        {stores.map((store, index) => (
          <div key={store.id}>
            <div className="flex items-center gap-4 bg-white p-4 transition-colors hover:bg-gray-50">
              {/* 가게 이미지 (플레이스홀더) */}
              <div
                className="h-16 w-16 flex-shrink-0 cursor-pointer bg-gray-200"
                onClick={() => handleStoreClick(store.id)}
              ></div>

              {/* 가게 정보 */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => handleStoreClick(store.id)}
              >
                <h3 className="mb-1 font-medium text-black">{store.name}</h3>
                <p className="mb-2 text-sm text-gray-600">{store.location}</p>
                <div className="flex items-center gap-1">
                  <Heart
                    size={16}
                    fill={store.isLiked ? 'currentColor' : 'none'}
                    className={`${store.isLiked ? 'fill-gray-400 text-gray-400' : 'text-gray-400'}`}
                  />
                  <span className="text-sm text-gray-600">{store.likes}</span>
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
                <div className="w-[932px] md:w-[90vw] md:max-w-[932px] flex justify-center">
                  <svg
                    width="932"
                    height="2"
                    viewBox="0 0 932 2"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-0.5"
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
        ))}
      </div>

      {/* 빈 상태 */}
      {stores.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {activeCategory} 카테고리에 등록된 가게가 없습니다.
        </div>
      )}

      {/* 페이지네이션 */}
      {stores.length > 0 && (
        <div className="mt-8 flex justify-center gap-2">
          {[1, 2, 3].map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-full border transition-colors ${
                currentPage === page
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-black hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
