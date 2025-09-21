import axios from 'axios'
import { apiConfig, endpoints } from './config'

const build = (path: string) => `${apiConfig.baseURL.replace(/\/$/, '')}${path}`

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 자동으로 Authorization 헤더 추가
apiClient.interceptors.request.use(
  config => {
    // 쿠키에서 토큰 확인
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null
      }
      return null
    }

    const possibleTokenNames = ['accessToken', 'access_token', 'token', 'authToken', 'jwt']
    let token = null

    for (const name of possibleTokenNames) {
      token = getCookie(name)
      if (token) break
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
        // 토큰 갱신 시도
        const refreshUrl = build(endpoints.auth.refresh)
        const refreshResponse = await axios.post(
          refreshUrl,
          {},
          {
            withCredentials: true,
          }
        )

        const newToken = refreshResponse.data?.data?.accessToken
        if (newToken) {
          // 새 토큰은 쿠키로 설정되므로 별도 저장 불필요
          // 실패한 요청을 새 토큰으로 재시도
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }

        // 토큰이 없다면 실패 처리
        throw new Error('No accessToken from refresh')
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        window.location.href = '/owner/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
