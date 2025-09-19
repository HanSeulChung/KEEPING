'use client'
import Image from 'next/image'
import { StoreDetailTabSection } from './StoreDetailTabSection'

// 타입 정의
interface StoreData {
  name: string
  description: string
  galleryImages: string[]
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

// 더미 데이터
const STORE_DATA: StoreData = {
  name: '코미도리',
  description:
    '"역삼 직장인들의 추천 맛집, 코미도리"\n숙성된 도미로 만드는 다양한 요리로 점심은 물론 저녁 술자리까지\n가능합니다 :)',
  galleryImages: [
    '/store/gallery1.jpg',
    '/store/gallery2.jpg',
    '/store/gallery3.jpg',
  ],
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
        <h1 className="text-2xl font-extrabold text-black">{storeData.name}</h1>
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

      {/* 가게 이미지 갤러리 */}
      <div className="mb-8 grid grid-cols-3 gap-4 px-4">
        {storeData.galleryImages.map((image, index) => (
          <div
            key={index}
            className="aspect-[4/3] overflow-hidden rounded bg-gray-300"
          >
            <Image
              src={image}
              alt={`가게 이미지 ${index + 1}`}
              width={200}
              height={150}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// 메인 컴포넌트
export const StoreDetailPage = () => {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <StoreInfo storeData={STORE_DATA} />
        <StoreDetailTabSection
          chargeOptions={CHARGE_OPTIONS}
          menuData={MENU_DATA}
        />
      </div>
    </div>
  )
}
