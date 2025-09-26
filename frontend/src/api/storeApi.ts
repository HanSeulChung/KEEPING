import { ApiResponse, StoreAPI } from '@/types/api'
import apiClient from './axios'
import { apiConfig } from './config'

export interface StoreRequestDto {
  storeName: string
  description: string
  address: string
  phoneNumber: string
  category: string
  taxIdNumber: string
  bankAccount: string
  imgFile: File
}

// 매장 관련 API 함수들
export const storeApi = {
  // 점주의 매장 목록 조회
  getOwnerStores: async (): Promise<StoreAPI.StoreResponseDto[]> => {
    try {
      const response =
        await apiClient.get<StoreAPI.OwnerStoresResponse>(`/owners/stores`)

      return response.data.data
    } catch (error) {
      console.error('매장 목록 조회 실패:', error)
      return []
    }
  },

  // 매장 등록
  registerStore: async (
    storeData: StoreRequestDto
  ): Promise<StoreAPI.StoreResponseDto | null> => {
    try {
      const formData = new FormData()

      // 기본 정보 추가
      formData.append('storeName', storeData.storeName)
      formData.append('description', storeData.description)
      formData.append('address', storeData.address)
      formData.append('phoneNumber', storeData.phoneNumber)
      formData.append('category', storeData.category)
      formData.append('taxIdNumber', storeData.taxIdNumber)
      formData.append('bankAccount', storeData.bankAccount)

      // 이미지 파일 추가 (필수)
      formData.append('imgFile', storeData.imgFile)

      const response = await apiClient.post<StoreAPI.StoreRegisterResponse>(
        '/owners/stores',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data.data
    } catch (error) {
      console.error('매장 등록 실패:', error)
      return null
    }
  },

  // 매출 캘린더 조회
  getSalesCalendar: async (
    storeId: number,
    year: number,
    month: number
  ): Promise<StoreAPI.SalesData[]> => {
    try {
      const response = await apiClient.get<StoreAPI.SalesCalendarResponse>(
        `/owners/stores/${storeId}/sales/calendar?year=${year}&month=${month}`
      )

      return response.data.data
    } catch (error) {
      console.error('매출 캘린더 조회 실패:', error)
      return []
    }
  },

  // 월별 통계 조회
  getMonthlyStatistics: async (
    storeId: number,
    year: number,
    month: number
  ): Promise<any> => {
    try {
      const requestBody = {
        date: `${year}-${month.toString().padStart(2, '0')}-01`,
      }

      const response = await apiClient.post(
        `/stores/${storeId}/statistics/monthly`,
        requestBody
      )

      return response.data.data
    } catch (error) {
      console.error('월별 통계 조회 실패:', error)
      return null
    }
  },
}

export interface StoreEditRequestDto {
  name?: string
  description?: string
  address?: string
  phone?: string
  category?: string
  images?: File[]
}

export interface StoreResponseDto {
  id: number
  name: string
  description: string
  address: string
  phone: string
  category: string
  imageUrls: string[]
  ownerId: number
  createdAt: string
  updatedAt: string
}

export interface StorePublicDto {
  id: number
  name: string
  description: string
  address: string
  phone: string
  category: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}

// 가게 등록
export const createStore = async (
  storeData: StoreRequestDto
): Promise<ApiResponse<StoreResponseDto>> => {
  try {
    const formData = new FormData()
    formData.append('taxIdNumber', storeData.taxIdNumber)
    formData.append('storeName', storeData.storeName)
    formData.append('description', storeData.description)
    formData.append('address', storeData.address)
    formData.append('phoneNumber', storeData.phoneNumber)
    formData.append('category', storeData.category)
    formData.append('bankAccount', storeData.bankAccount)

    if (storeData.imgFile) {
      formData.append('imgFile', storeData.imgFile)
    }

    const response = await fetch(`${apiConfig.baseURL}/owners/stores`, {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('가게 등록 실패:', error)
    throw error
  }
}

// 가게 수정
export const editStore = async (
  storeId: number,
  storeData: StoreEditRequestDto
): Promise<ApiResponse<StoreResponseDto>> => {
  try {
    const formData = new FormData()

    if (storeData.name) formData.append('name', storeData.name)
    if (storeData.description)
      formData.append('description', storeData.description)
    if (storeData.address) formData.append('address', storeData.address)
    if (storeData.phone) formData.append('phone', storeData.phone)
    if (storeData.category) formData.append('category', storeData.category)

    if (storeData.images && storeData.images.length > 0) {
      storeData.images.forEach((image, index) => {
        formData.append('images', image)
      })
    }

    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}`, {
      method: 'PATCH',
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('가게 수정 실패:', error)
    throw error
  }
}

// 가게 삭제
export const deleteStore = async (
  storeId: number
): Promise<ApiResponse<StoreResponseDto>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('가게 삭제 실패:', error)
    throw error
  }
}

// 충전 보너스 수정
export const updateChargeBonus = async (
  storeId: number,
  chargeBonusId: number,
  data: { chargeAmount: number; bonusPercentage: number }
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/charge-bonus/${chargeBonusId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data,
      message: result.message || '충전 보너스가 수정되었습니다.',
      statusCode: response.status,
      timestamp: new Date().toISOString(),
    }
  } catch (error: any) {
    console.error('충전 보너스 수정 실패:', error)
    return {
      success: false,
      data: null,
      message: error.message || '충전 보너스 수정에 실패했습니다.',
      statusCode: error.status || 500,
      timestamp: new Date().toISOString(),
    }
  }
}

// 충전 보너스 삭제
export const deleteChargeBonus = async (
  storeId: number,
  chargeBonusId: number
): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/charge-bonus/${chargeBonusId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('충전 보너스 삭제 실패:', error)
    throw error
  }
}

// 전체 가게 조회 (공개용)
export const getAllStores = async (): Promise<
  ApiResponse<StorePublicDto[]>
> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('전체 가게 조회 실패:', error)
    throw error
  }
}

// 특정 가게 조회 (공개용)
export const getStoreById = async (
  storeId: number
): Promise<ApiResponse<StorePublicDto>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('가게 조회 실패:', error)
    throw error
  }
}

// 가게명으로 검색 (공개용)
export const getStoresByName = async (
  name: string
): Promise<ApiResponse<StorePublicDto[]>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/stores?name=${encodeURIComponent(name)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('가게명 검색 실패:', error)
    throw error
  }
}
