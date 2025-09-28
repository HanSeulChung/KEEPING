import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface Store {
  storeId: number
  storeName: string
  address: string
  phoneNumber: string
  merchantId: number
  category: string
  storeStatus: 'ACTIVE' | 'INACTIVE'
  description: string
  createdAt: string
  imgUrl: string
  // Calendar 컴포넌트 호환성을 위한 필드들
  id: string
  name: string
  ownerId: string
  phone: string
}

interface StoreState {
  stores: Store[]
  selectedStore: Store | null
  selectedStoreId: string | null
  loading: boolean

  // Actions
  setStores: (stores: Store[]) => void
  setSelectedStore: (store: Store | null) => void
  setSelectedStoreById: (storeId: string) => void
  clearStores: () => void

  // API 호출
  fetchStores: () => Promise<void>
  fetchStoreDetail: (storeId: string) => Promise<Store | null>
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      stores: [],
      selectedStore: null,
      selectedStoreId: null,
      loading: false,

      setStores: stores => {
        set({ stores })
        // 첫 번째 가게를 기본 선택 (선택된 가게가 없을 때만)
        const currentState = get()
        if (!currentState.selectedStore && stores.length > 0) {
          currentState.setSelectedStore(stores[0])
        }
      },

      setSelectedStore: store => {
        set({
          selectedStore: store,
          selectedStoreId: store ? store.id : null,
        })
      },

      setSelectedStoreById: storeId => {
        const store = get().stores.find(s => s.id === storeId)
        if (store) {
          get().setSelectedStore(store)
        }
      },

      clearStores: () => {
        set({
          stores: [],
          selectedStore: null,
          selectedStoreId: null,
        })
      },

      fetchStores: async () => {
        set({ loading: true })
        try {
          // 토큰 가져오기 - 여러 소스에서 확인
          const accessToken = localStorage.getItem('accessToken')

          // localStorage에서 찾을 수 없으면 auth-storage에서 확인
          if (!accessToken) {
            const authStorage = localStorage.getItem('auth-storage')
            if (authStorage) {
              try {
                const parsed = JSON.parse(authStorage)
                if (parsed.state?.user) {
                  // 사용자가 로그인되어 있으면 계속 진행 (토큰은 쿠키에 있을 수 있음)
                  console.log(
                    '사용자 정보는 있지만 localStorage에 토큰이 없습니다. API 호출을 시도합니다.'
                  )
                } else {
                  console.log('로그인되지 않은 상태입니다.')
                  set({ loading: false })
                  return
                }
              } catch (e) {
                console.error('auth-storage 파싱 오류:', e)
              }
            } else {
              console.log('인증 정보가 없습니다. 로그인이 필요합니다.')
              set({ loading: false })
              return
            }
          }

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          // 토큰이 있으면 Authorization 헤더 추가
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://j13a509.p.ssafy.io/api'}/owners/stores`,
            {
              method: 'GET',
              headers,
              credentials: 'include', // 쿠키 기반 인증도 포함
            }
          )

          if (response.ok) {
            const result = await response.json()

            // API 응답에서 가게 배열 추출
            let rawStoreList = []
            if (Array.isArray(result)) {
              rawStoreList = result
            } else if (result.data && Array.isArray(result.data)) {
              rawStoreList = result.data
            } else {
              // 숫자 키로 된 객체를 배열로 변환
              const storeKeys = Object.keys(result).filter(
                key => !isNaN(Number(key))
              )
              rawStoreList = storeKeys.map(key => result[key])
            }

            // Store 인터페이스에 맞게 변환
            const stores: Store[] = rawStoreList.map((store: any) => ({
              ...store,
              // Calendar 컴포넌트 호환성을 위한 변환
              id: store.storeId.toString(),
              name: store.storeName,
              ownerId: '', // 필요시 user store에서 가져오기
              phone: store.phoneNumber,
            }))

            get().setStores(stores)
          } else {
            console.error(
              '가게 목록 조회 실패:',
              response.status,
              response.statusText
            )
          }
        } catch (error) {
          console.error('가게 목록 조회 중 오류:', error)
        } finally {
          set({ loading: false })
        }
      },

      fetchStoreDetail: async (storeId: string) => {
        try {
          const accessToken = localStorage.getItem('accessToken')

          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          }

          // 토큰이 있으면 Authorization 헤더 추가
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://j13a509.p.ssafy.io/api'}/owners/stores/${storeId}`,
            {
              method: 'GET',
              headers,
              credentials: 'include', // 쿠키 기반 인증도 포함
            }
          )

          if (response.ok) {
            const result = await response.json()
            const storeData = result.data || result

            // Store 인터페이스에 맞게 변환
            const store: Store = {
              ...storeData,
              id: storeData.storeId.toString(),
              name: storeData.storeName,
              ownerId: '',
              phone: storeData.phoneNumber,
            }

            return store
          } else {
            console.error(
              '가게 상세 정보 조회 실패:',
              response.status,
              response.statusText
            )
            return null
          }
        } catch (error) {
          console.error('가게 상세 정보 조회 중 오류:', error)
          return null
        }
      },
    }),
    {
      name: 'store-storage',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage
        }
        return localStorage
      }),
      partialize: state => ({
        selectedStore: state.selectedStore,
        selectedStoreId: state.selectedStoreId,
      }),
    }
  )
)
