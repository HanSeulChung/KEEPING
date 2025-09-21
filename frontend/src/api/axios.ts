import axios from 'axios'
import { apiConfig } from './config'

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true, // HttpOnly 쿠키 포함
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 자동으로 Authorization 헤더 추가
apiClient.interceptors.request.use(
  config => {
    // localStorage에서 accessToken 확인
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
        console.log('🔑 Authorization 헤더 추가:', accessToken.substring(0, 20) + '...')
      }
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 토큰 만료 시 자동 갱신 (클로드 방식)
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
        console.log('🔄 401 에러 - 토큰 갱신 시도')
        
        // 클로드 방식: 직접 백엔드로 토큰 갱신 요청
        const refreshResponse = await fetch('http://localhost:8080/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.data.accessToken
          
          // 새로운 accessToken을 localStorage에 저장
          localStorage.setItem('accessToken', newAccessToken)
          console.log('🔄 새로운 accessToken으로 재시도:', newAccessToken.substring(0, 20) + '...')
          
          // 실패한 요청을 새 토큰으로 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return apiClient(originalRequest)
        }

        // 토큰 갱신 실패 시 로그아웃 처리
        throw new Error('Token refresh failed')
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          window.location.href = '/customer/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient