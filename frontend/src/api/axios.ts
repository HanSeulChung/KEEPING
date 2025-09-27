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

// 요청 인터셉터 - 회원가입 페이지가 아닌 경우에만 Authorization 헤더 추가
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      // 회원가입 페이지에서는 Authorization 헤더 추가하지 않음
      const isRegisterPage = window.location.pathname.includes('/register/')
      if (!isRegisterPage) {
        const tokenFromStore = useAuthStore.getState().getAccessToken()
        const tokenFromLocal = localStorage.getItem('accessToken')
        const accessToken = tokenFromStore || tokenFromLocal
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
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

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config

    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // 백엔드의 /auth/refresh는 HttpOnly 쿠키 기반으로 처리되고,
        // 프론트는 refreshToken을 저장/조작하지 않습니다.
        const refreshResponse = await fetch(buildURL('/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.data?.accessToken

          if (!newAccessToken) throw new Error('Token refresh failed')

          // 새로운 accessToken 저장 (store + localStorage)
          try {
            useAuthStore.getState().setAccessToken(newAccessToken)
          } catch {}
          try {
            localStorage.setItem('accessToken', newAccessToken)
          } catch {}

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }

        // 토큰 갱신 실패 시 로그아웃 처리
        throw new Error('Token refresh failed')
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        try {
          useAuthStore.getState().logout()
        } catch {}
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('accessToken')
          } catch {}

          // 현재 페이지가 점주 페이지인지 고객 페이지인지 확인
          const currentPath = window.location.pathname
          const isOwnerPage = currentPath.startsWith('/owner')

          if (isOwnerPage) {
            window.location.href = '/' // 점주는 홈페이지로
          } else {
            window.location.href = '/customer/login' // 고객은 고객 로그인으로
          }
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
