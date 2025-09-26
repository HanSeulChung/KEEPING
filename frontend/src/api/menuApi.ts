import apiClient from './axios'
import { apiConfig } from './config'

export interface MenuRequestDto {
  menuName: string
  description: string
  price: number
  categoryId: number
  storeId: number
  image?: File
}

export interface MenuEditRequestDto {
  name?: string
  description?: string
  price?: number
  category?: string
  image?: File
}

export interface MenuResponseDto {
  menuId: number
  storeId: number
  menuName: string
  categoryId: number
  categoryName: string
  displayOrder: number
  soldOut: boolean
  imgUrl: string
  description: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

// 메뉴 생성
export const createMenu = async (
  storeId: number,
  menuData: MenuRequestDto
): Promise<ApiResponse<MenuResponseDto>> => {
  try {
    console.log('메뉴 생성 시작:', { storeId, menuData })

    const formData = new FormData()
    formData.append('menuName', menuData.menuName) // 백엔드가 기대하는 필드명

    // categoryId는 필수값이므로 검증
    if (!menuData.categoryId || menuData.categoryId <= 0) {
      throw new Error('유효한 카테고리를 선택해주세요.')
    }
    formData.append('categoryId', menuData.categoryId.toString())

    // Optional fields
    if (menuData.price && menuData.price > 0) {
      formData.append('price', menuData.price.toString())
    }
    if (menuData.description && menuData.description.trim()) {
      formData.append('description', menuData.description.trim())
    }

    if (menuData.image) {
      formData.append('imgFile', menuData.image) // API 명세에 따라 'imgFile' 사용

      // storeId 추가
      formData.append('storeId', menuData.storeId.toString())
    }

    // FormData 내용 로깅
    console.log('전송할 FormData:')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value)
    }

    const url = `/owners/stores/${storeId}/menus`
    console.log('메뉴 생성 API URL:', url)
    console.log('전체 URL:', apiClient.defaults.baseURL + url)

    const response = await apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    console.log('메뉴 생성 성공:', response.data)

    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || '메뉴가 생성되었습니다.',
      statusCode: response.status,
    }
  } catch (error: any) {
    console.error('메뉴 생성 실패:', {
      storeId,
      menuData,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    })

    // 서버에서 반환한 에러 메시지가 있으면 사용
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }

    // 상태 코드에 따른 에러 메시지
    if (error.response?.status === 500) {
      throw new Error('서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } else if (error.response?.status === 400) {
      throw new Error('입력한 정보를 확인해주세요.')
    } else if (error.response?.status === 401) {
      throw new Error('로그인이 필요합니다.')
    } else if (error.response?.status === 403) {
      throw new Error('권한이 없습니다.')
    }

    throw error
  }
}

// 메뉴 수정
export const editMenu = async (
  storeId: number,
  menuId: number,
  menuData: MenuEditRequestDto
): Promise<ApiResponse<MenuResponseDto>> => {
  try {
    const formData = new FormData()

    if (menuData.name) formData.append('name', menuData.name)
    if (menuData.description)
      formData.append('description', menuData.description)
    if (menuData.price) formData.append('price', menuData.price.toString())
    if (menuData.category) formData.append('category', menuData.category)
    if (menuData.image) formData.append('image', menuData.image)

    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/menus/${menuId}`,
      {
        method: 'PATCH',
        body: formData,
        headers: {
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
    console.error('메뉴 수정 실패:', error)
    throw error
  }
}

// 개별 메뉴 삭제
export const deleteMenu = async (
  storeId: number,
  menuId: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/menus/${menuId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: undefined,
      message: result.message || '메뉴가 삭제되었습니다.',
      statusCode: response.status,
    }
  } catch (error: any) {
    console.error('메뉴 삭제 실패:', error)
    return {
      success: false,
      data: undefined,
      message: error.message || '메뉴 삭제에 실패했습니다.',
      statusCode: error.status || 500,
    }
  }
}

// 전체 메뉴 삭제
export const deleteAllMenus = async (
  storeId: number
): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/menus`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: undefined,
      message: result.message || '모든 메뉴가 삭제되었습니다.',
      statusCode: response.status,
    }
  } catch (error: any) {
    console.error('전체 메뉴 삭제 실패:', error)
    return {
      success: false,
      data: undefined,
      message: error.message || '전체 메뉴 삭제에 실패했습니다.',
      statusCode: error.status || 500,
    }
  }
}

// 전체 메뉴 조회
export const getAllMenus = async (
  storeId: number
): Promise<ApiResponse<MenuResponseDto[]>> => {
  try {
    const response = await fetch(
      `${apiConfig.baseURL}/owners/stores/${storeId}/menus`,
      {
        method: 'GET',
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
    console.error('메뉴 조회 실패:', error)
    throw error
  }
}

