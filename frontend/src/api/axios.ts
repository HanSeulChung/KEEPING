import axios from 'axios'

import { apiConfig, buildURL } from './config'

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 모든 요청에 자동으로 Authorization 헤더 추가
apiClient.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
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

        const refreshResponse = await fetch(buildURL('/auth/refresh'), {
          method: 'POST',
          credentials: 'include'
        })

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json()
          const newAccessToken = refreshData.data.accessToken
          
          // 새로운 accessToken을 localStorage에 저장
          localStorage.setItem('accessToken', newAccessToken)
          
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