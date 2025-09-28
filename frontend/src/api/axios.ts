import { useAuthStore } from '@/store/useAuthStore'
import axios from 'axios'

import { apiConfig, buildURL } from './config'

// 멱등키 생성기: crypto.randomUUID 가급적 사용, 폴백 제공
const generateIdempotencyKey = (): string => {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof (crypto as any).randomUUID === 'function'
    ) {
      return (crypto as any).randomUUID()
    }
  } catch {}
  return `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 Authorization 헤더 추가(가능한 경우)
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const tokenFromStore = useAuthStore.getState().getAccessToken()
      const tokenFromLocal = localStorage.getItem('accessToken')
      const accessToken = tokenFromStore || tokenFromLocal
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    // 멱등키 자동 주입: 변이 메서드에 한해, 이미 지정된 경우는 보존
    const method = (config.method || 'get').toLowerCase()
    const isMutating = ['post', 'put', 'patch', 'delete'].includes(method)
    // AxiosHeaders 안전 처리
    const headers = config.headers ?? {}
    const currentKey =
      (headers as any)['Idempotency-Key'] ?? (headers as any)['idempotency-key']
    if (isMutating && !currentKey) {
      ;(headers as any)['Idempotency-Key'] = generateIdempotencyKey()
      config.headers = headers
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 토큰 갱신 중복 요청 방지를 위한 플래그
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: any) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config || {}

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      ;(originalRequest as any)._retry = true
      isRefreshing = true

      try {
        // 백엔드의 /auth/refresh는 HttpOnly 쿠키 기반으로 처리되고,
        // 프론트는 refreshToken을 저장/조작하지 않습니다.
        const refreshResponse = await fetch(buildURL('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json().catch(() => ({}))
          let newAccessToken =
            refreshData?.data?.accessToken ||
            refreshData?.accessToken ||
            refreshData?.token

          // 개발 환경: 응답에 토큰이 없을 경우 DEV 토큰 사용
          if (!newAccessToken && process.env.NODE_ENV === 'development') {
            const devToken = (
              process.env.NEXT_PUBLIC_DEV_ACCESS_TOKEN || ''
            ).trim()
            if (devToken) newAccessToken = devToken
          }

          if (!newAccessToken) throw new Error('Token refresh failed')

          // 새로운 accessToken 저장 (store + localStorage)
          try {
            useAuthStore.getState().setAccessToken(newAccessToken)
          } catch {}
          try {
            localStorage.setItem('accessToken', newAccessToken)
          } catch {}

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

          // 대기열에 있는 요청들 처리
          processQueue(null, newAccessToken)

          return apiClient(originalRequest)
        }

        // 토큰 갱신 실패 시 에러 처리
        throw new Error('Token refresh failed')
      } catch (refreshError) {
        // 대기열에 있는 요청들 실패 처리
        processQueue(refreshError, null)
        // 개발 환경에서는 강제 로그아웃/리다이렉트 하지 않음
        if (process.env.NODE_ENV !== 'development') {
          try {
            useAuthStore.getState().logout()
          } catch {}
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('accessToken')
            } catch {}

            const currentPath = window.location.pathname
            const isOwnerPage = currentPath.startsWith('/owner')

            if (isOwnerPage) {
              window.location.href = '/'
            } else {
              window.location.href = '/customer/login'
            }
          }
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
