import { apiConfig } from './config'

export interface MenuRequestDto {
  name: string
  description: string
  price: number
  category: string
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
  id: number
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
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
    const formData = new FormData()
    formData.append('name', menuData.name)
    formData.append('description', menuData.description)
    formData.append('price', menuData.price.toString())
    formData.append('category', menuData.category)
    
    if (menuData.image) {
      formData.append('image', menuData.image)
    }

    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}/menus`, {
      method: 'POST',
      body: formData,
      headers: {
        // FormData 사용 시 Content-Type 헤더는 자동으로 설정됨
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('메뉴 생성 실패:', error)
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
    if (menuData.description) formData.append('description', menuData.description)
    if (menuData.price) formData.append('price', menuData.price.toString())
    if (menuData.category) formData.append('category', menuData.category)
    if (menuData.image) formData.append('image', menuData.image)

    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}/menus/${menuId}`, {
      method: 'PATCH',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

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

// 전체 메뉴 조회
export const getAllMenus = async (storeId: number): Promise<ApiResponse<MenuResponseDto[]>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}/menus`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

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

// 메뉴 삭제
export const deleteMenu = async (storeId: number, menuId: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}/menus/${menuId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('메뉴 삭제 실패:', error)
    throw error
  }
}

// 전체 메뉴 삭제
export const deleteAllMenus = async (storeId: number): Promise<ApiResponse<void>> => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/stores/${storeId}/menus`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('전체 메뉴 삭제 실패:', error)
    throw error
  }
}
