'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MenuResponseDto, 
  MenuRequestDto, 
  MenuEditRequestDto,
  getAllMenus, 
  createMenu, 
  editMenu, 
  deleteMenu, 
  deleteAllMenus 
} from '@/api/menuApi'

interface UseMenuManagementReturn {
  menus: MenuResponseDto[]
  loading: boolean
  error: string | null
  fetchMenus: (storeId: number) => Promise<void>
  addMenu: (storeId: number, menuData: MenuRequestDto) => Promise<boolean>
  updateMenu: (storeId: number, menuId: number, menuData: MenuEditRequestDto) => Promise<boolean>
  removeMenu: (storeId: number, menuId: number) => Promise<boolean>
  removeAllMenus: (storeId: number) => Promise<boolean>
  clearError: () => void
}

export const useMenuManagement = (): UseMenuManagementReturn => {
  const [menus, setMenus] = useState<MenuResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 메뉴 목록 조회
  const fetchMenus = useCallback(async (storeId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getAllMenus(storeId)
      
      if (response.success) {
        setMenus(response.data)
      } else {
        setError(response.message || '메뉴 조회에 실패했습니다.')
      }
    } catch (err) {
      console.error('메뉴 조회 오류:', err)
      setError('메뉴 조회 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  // 메뉴 추가
  const addMenu = useCallback(async (storeId: number, menuData: MenuRequestDto): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await createMenu(storeId, menuData)
      
      if (response.success) {
        // 새 메뉴를 목록에 추가
        setMenus(prev => [response.data, ...prev])
        return true
      } else {
        setError(response.message || '메뉴 생성에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('메뉴 생성 오류:', err)
      setError('메뉴 생성 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 메뉴 수정
  const updateMenu = useCallback(async (
    storeId: number, 
    menuId: number, 
    menuData: MenuEditRequestDto
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await editMenu(storeId, menuId, menuData)
      
      if (response.success) {
        // 수정된 메뉴로 목록 업데이트
        setMenus(prev => 
          prev.map(menu => 
            menu.id === menuId ? response.data : menu
          )
        )
        return true
      } else {
        setError(response.message || '메뉴 수정에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('메뉴 수정 오류:', err)
      setError('메뉴 수정 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 메뉴 삭제
  const removeMenu = useCallback(async (storeId: number, menuId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await deleteMenu(storeId, menuId)
      
      if (response.success) {
        // 삭제된 메뉴를 목록에서 제거
        setMenus(prev => prev.filter(menu => menu.id !== menuId))
        return true
      } else {
        setError(response.message || '메뉴 삭제에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('메뉴 삭제 오류:', err)
      setError('메뉴 삭제 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 전체 메뉴 삭제
  const removeAllMenus = useCallback(async (storeId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await deleteAllMenus(storeId)
      
      if (response.success) {
        setMenus([])
        return true
      } else {
        setError(response.message || '전체 메뉴 삭제에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('전체 메뉴 삭제 오류:', err)
      setError('전체 메뉴 삭제 중 오류가 발생했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    menus,
    loading,
    error,
    fetchMenus,
    addMenu,
    updateMenu,
    removeMenu,
    removeAllMenus,
    clearError
  }
}
