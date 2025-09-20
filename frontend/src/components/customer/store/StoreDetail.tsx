'use client'

import { apiConfig, endpoints } from '@/api/config'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { StoreDetailTabSection } from './StoreDetailTabSection'

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
}

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

const CHARGE_OPTIONS: ChargeOptionData[] = [
  {
    discount: '3% 할인',
    points: '30,000 포인트',
    originalPrice: 30000,
    discountRate: 0.03,
  },
  {
    discount: '5% 할인',
    points: '50,000 포인트',
    originalPrice: 50000,
    discountRate: 0.05,
  },
  {
    discount: '7% 할인',
    points: '100,000 포인트',
    originalPrice: 100000,
    discountRate: 0.07,
  },
  {
    discount: '10% 할인',
    points: '150,000 포인트',
    originalPrice: 150000,
    discountRate: 0.1,
  },
  {
    discount: '12% 할인',
    points: '200,000 포인트',
    originalPrice: 200000,
    discountRate: 0.12,
  },
  {
    discount: '15% 할인',
    points: '300,000 포인트',
    originalPrice: 300000,
    discountRate: 0.15,
  },
]

const MENU_DATA: MenuData = {
  meal: [
    {
      name: '도미정식 1人',
      description:
        '도라지탕 + 도미숙성회 + 도미머리구이 + 모듬튀김 + 도미해물라면 OR 도미덮밥',
      price: 39000,
    },
    {
      name: '도미정식 2人',
      description:
        '도라지탕 + 도미숙성회 + 도미머리구이 + 모듬튀김 + 도미해물라면 OR 도미덮밥 (2인분)',
      price: 75000,
    },
    {
      name: '런치 세트',
      description: '도미회 + 된장국 + 밥 + 반찬 3종',
      price: 28000,
    },
  ],
  course: [
    {
      name: '프리미엄 도미 코스',
      description: '전채 + 도미숙성회 + 도미머리구이 + 도미탕 + 디저트',
      price: 65000,
    },
    {
      name: '스탠다드 도미 코스',
      description:
        '도라지탕 + 도미숙성회 + 도미머리구이 + 모듬튀김 + 도미해물라면',
      price: 45000,
    },
    {
      name: '라이트 도미 코스',
      description: '도미회 + 도미구이 + 된장국 + 밥',
      price: 35000,
    },
    {
      name: '시그니처 코스',
      description: '셰프 특선 도미 요리 7품 + 와인 페어링',
      price: 89000,
    },
  ],
  alacarte: [
    {
      name: '도미숙성회',
      description: '72시간 숙성한 프리미엄 도미회 (소/중/대)',
      price: 28000,
    },
    {
      name: '도미머리구이',
      description: '도미 머리를 정성껏 구워낸 특별 요리',
      price: 22000,
    },
    {
      name: '도미해물라면',
      description: '도미와 신선한 해물이 들어간 진한 국물 라면',
      price: 15000,
    },
    {
      name: '도미덮밥',
      description: '숙성 도미회와 신선한 야채를 올린 덮밥',
      price: 18000,
    },
    {
      name: '도미카라아게',
      description: '바삭하게 튀긴 도미 튀김',
      price: 16000,
    },
    {
      name: '도미탕',
      description: '진한 국물의 도미탕 (2-3인분)',
      price: 32000,
    },
  ],
}

// 가게 정보 컴포넌트
const StoreInfo = ({ storeData }: { storeData: StoreData }) => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 가게 이름 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-black">
          {storeData.storeName}
        </h1>
      </div>

      {/* 가게 소개 섹션 */}
      <div className="mb-8 flex items-center gap-4 px-4">
        <Image
          src="/store/ownerIntro.svg"
          alt="가게소개"
          width={69}
          height={92}
          className="flex-shrink-0"
        />
        <div className="flex-1 rounded-3xl bg-yellow-50 p-4">
          <p className="text-center text-lg leading-6 whitespace-pre-line text-black">
            {storeData.description}
          </p>
        </div>
      </div>
    </div>
  )
}

// 메인 컴포넌트
export const StoreDetailPage = () => {
  const params = useParams()
  const storeId = params.id as string

  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 가게 상세 정보 조회
  useEffect(() => {
    const fetchStoreDetail = async () => {
      if (!storeId) return

      setLoading(true)
      setError(null)

      try {
        const url = `${apiConfig.baseURL}${endpoints.stores.searchById.replace('{storeId}', storeId)}`
        console.log('가게 상세 조회 URL:', url) // 디버깅용

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            ...apiConfig.headers,
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log('가게 상세 응답 데이터:', data) // 디버깅용

        // 백엔드 응답 데이터를 StoreData 타입에 맞게 변환
        const transformedStoreData: StoreData = {
          storeId: data.storeId,
          storeName: data.storeName,
          description: data.description,
          address: data.address,
          category: data.category,
          storeStatus: data.storeStatus,
          imageUrl: data.imageUrl || data.image,
          phoneNumber: data.phoneNumber,
        }

        setStoreData(transformedStoreData)
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
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <StoreInfo storeData={storeData} />
        <StoreDetailTabSection
          chargeOptions={CHARGE_OPTIONS}
          menuData={MENU_DATA}
        />
      </div>
    </div>
  )
}
