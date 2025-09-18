import axios from 'axios'
import { apiConfig } from './config'

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
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터 - 토큰 만료 시 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // 401 에러이고 아직 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // 토큰 갱신 시도
        const refreshResponse = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {}, {
          withCredentials: true // RefreshToken 쿠키 포함
        })
        
        const newToken = refreshResponse.data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        
        // 실패한 요청을 새 토큰으로 재시도
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
        
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/owner/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
