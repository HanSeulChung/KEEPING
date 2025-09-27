'use client'

import { apiConfig, buildURL } from '@/api/config'
import { useAuthStore } from '@/store/useAuthStore'
import { Heart } from 'lucide-react'
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
}

interface MenuData {
  meal: MenuItemData[]
  course: MenuItemData[]
  alacarte: MenuItemData[]
}

// 가게 정보 컴포넌트
const StoreInfo = ({
  storeData,
  onToggleLike,
}: {
  storeData: StoreData
  onToggleLike: (storeId: number) => void
}) => {
  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* 가게 이름과 하트 버튼 */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-black">
          {storeData.storeName}
        </h1>
        <div className="flex items-center gap-2">
          <Heart
            size={20}
            fill={storeData.isLiked ? 'currentColor' : 'none'}
            className={`cursor-pointer transition-colors ${
              storeData.isLiked
                ? 'fill-red-500 text-red-500'
                : 'text-gray-400 hover:text-red-500'
            }`}
            onClick={() => onToggleLike(storeData.storeId)}
          />
        </div>
      </div>

      {/* 가게 이미지들 - 좌우 스크롤 */}
      {storeData.imageUrl && (
        <div className="mb-8">
          <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-4">
            {Array.isArray(storeData.imageUrl) ? (
              storeData.imageUrl.map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <div className="relative h-48 w-64 overflow-hidden rounded-lg bg-gray-200">
                    <Image
                      src={image}
                      alt={`${storeData.storeName} 이미지 ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-shrink-0">
                <div className="relative h-48 w-64 overflow-hidden rounded-lg bg-gray-200">
                  <Image
                    src={storeData.imageUrl}
                    alt={`${storeData.storeName} 이미지`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

  const { user, loading: userLoading, error: userError } = useAuthStore()
  console.log('StoreDetail - useUser 상태:', {
    user,
    loading: userLoading,
    error: userError,
  })

  const [storeData, setStoreData] = useState<StoreData | null>(null)
  const [chargeOptions, setChargeOptions] = useState<ChargeOptionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 찜하기 상태 확인 API 호출 함수
  const checkFavoriteStatus = async (storeId: string) => {
    if (!user) return false

    try {
      const url = buildURL(`/favorites/stores/${storeId}/check`)
      console.log('찜하기 상태 확인 URL:', url)

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
          imageUrl: data.imageUrl || data.image || data.storeImage,
          phoneNumber: data.phoneNumber || data.phone,
          likes: data.likes || data.likeCount || 0,
          isLiked: data.isLiked || false,
        }

        console.log('변환된 가게 데이터:', transformedStoreData) // 디버깅용

        setStoreData(transformedStoreData)

        // 가게 정보 조회 성공 후 충전 옵션과 찜하기 상태도 조회
        await Promise.all([
          fetchChargeOptions(storeId),
          checkFavoriteStatus(storeId),
        ])
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
        <StoreInfo storeData={storeData} onToggleLike={toggleLike} />
        <StoreDetailTabSection
          chargeOptions={chargeOptions}
          storeId={storeId}
        />
      </div>
    </div>
  )
}
