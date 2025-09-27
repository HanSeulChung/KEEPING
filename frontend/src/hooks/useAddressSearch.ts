import type {
  AddressData,
  AddressSearchOptions,
  DaumPostcodeData,
} from '@/types/address'
import { useCallback, useRef } from 'react'

// Daum Postcode API 전역 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        onresize?: (size: { width: number; height: number }) => void
        onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
        width?: string | number
        height?: string | number
        animation?: boolean
        focusInput?: boolean
        focusContent?: boolean
        autoMapping?: boolean
        shorthand?: boolean
        pleaseReadGuide?: number
        pleaseReadGuideTimer?: number
        maxSuggestItems?: number
        showMoreHName?: boolean
        hideMapBtn?: boolean
        hideEngBtn?: boolean
        alwaysShowEngAddr?: boolean
        zonecodeOnly?: boolean
        theme?: {
          bgColor?: string
          searchBgColor?: string
          contentBgColor?: string
          pageBgColor?: string
          textColor?: string
          queryTextColor?: string
          postcodeTextColor?: string
          emphTextColor?: string
          outlineColor?: string
        }
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}

interface UseAddressSearchReturn {
  searchAddress: (
    options?: Partial<AddressSearchOptions>
  ) => Promise<AddressData | null>
  isLoading: boolean
  error: string | null
}

export function useAddressSearch(
  onAddressSelect?: (address: AddressData) => void
): UseAddressSearchReturn {
  const isLoadingRef = useRef(false)
  const errorRef = useRef<string | null>(null)

  const searchAddress = useCallback(
    (
      options: Partial<AddressSearchOptions> = {}
    ): Promise<AddressData | null> => {
      return new Promise(resolve => {
        // Daum Postcode API 로드 확인
        if (!window.daum?.Postcode) {
          const error = 'Daum Postcode API가 로드되지 않았습니다.'
          errorRef.current = error
          console.error(error)
          resolve(null)
          return
        }

        isLoadingRef.current = true
        errorRef.current = null

        const defaultOptions: AddressSearchOptions = {
          width: 500,
          height: 600,
          autoClose: true,
          animation: true,
          focusInput: true,
          focusContent: true,
          ...options,
        }

        new window.daum.Postcode({
          oncomplete: (data: DaumPostcodeData) => {
            try {
              // 도로명주소 우선, 없으면 지번주소 사용
              const mainAddress = data.roadAddress || data.jibunAddress

              // 참고항목 구성 (건물명, 공동주택명 등)
              let extraAddress = ''
              if (data.buildingName) {
                extraAddress = data.buildingName
              }
              if (data.apartment === 'Y') {
                extraAddress = extraAddress
                  ? `${extraAddress}, 공동주택`
                  : '공동주택'
              }

              const addressData: AddressData = {
                zipCode: data.zonecode,
                address: mainAddress,
                detailAddress: '',
                jibunAddress: data.jibunAddress,
                extraAddress: extraAddress || undefined,
              }

              // 콜백 호출
              onAddressSelect?.(addressData)

              isLoadingRef.current = false
              resolve(addressData)
            } catch (error) {
              const errorMessage = '주소 데이터 처리 중 오류가 발생했습니다.'
              errorRef.current = errorMessage
              console.error(errorMessage, error)
              isLoadingRef.current = false
              resolve(null)
            }
          },
          onclose: state => {
            isLoadingRef.current = false
            if (state === 'FORCE_CLOSE') {
              resolve(null)
            }
          },
          width: defaultOptions.width?.toString(),
          height: defaultOptions.height?.toString(),
          animation: defaultOptions.animation,
          focusInput: defaultOptions.focusInput,
          focusContent: defaultOptions.focusContent,
        }).open()
      })
    },
    [onAddressSelect]
  )

  return {
    searchAddress,
    isLoading: isLoadingRef.current,
    error: errorRef.current,
  }
}

// 임베드 모드로 주소검색을 특정 요소에 삽입하는 훅
export function useEmbeddedAddressSearch(
  containerRef: React.RefObject<HTMLElement>,
  onAddressSelect: (address: AddressData) => void
) {
  const embedSearch = useCallback(() => {
    if (!window.daum?.Postcode || !containerRef.current) {
      console.error(
        'Daum Postcode API 또는 컨테이너 요소가 준비되지 않았습니다.'
      )
      return
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const mainAddress = data.roadAddress || data.jibunAddress

        let extraAddress = ''
        if (data.buildingName) {
          extraAddress = data.buildingName
        }
        if (data.apartment === 'Y') {
          extraAddress = extraAddress ? `${extraAddress}, 공동주택` : '공동주택'
        }

        const addressData: AddressData = {
          zipCode: data.zonecode,
          address: mainAddress,
          detailAddress: '',
          jibunAddress: data.jibunAddress,
          extraAddress: extraAddress || undefined,
        }

        onAddressSelect(addressData)
      },
      width: '100%',
      height: '100%',
    }).embed(containerRef.current)
  }, [containerRef, onAddressSelect])

  return { embedSearch }
}
