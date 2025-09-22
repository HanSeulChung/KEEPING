'use client'

import { useState, useCallback } from 'react'
import { 
  StoreRequestDto, 
  StoreEditRequestDto, 
  StoreResponseDto,
  createStore, 
  editStore, 
  deleteStore 
} from '@/api/storeApi'

interface UseStoreManagementReturn {
  loading: boolean
  error: string | null
  createNewStore: (storeData: StoreRequestDto) => Promise<StoreResponseDto | null>
  updateStore: (storeId: number, storeData: StoreEditRequestDto) => Promise<StoreResponseDto | null>
  removeStore: (storeId: number) => Promise<boolean>
  clearError: () => void
}

export const useStoreManagement = (): UseStoreManagementReturn => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 가게 생성
  const createNewStore = useCallback(async (storeData: StoreRequestDto): Promise<StoreResponseDto | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await createStore(storeData)
      
      if (response.success) {
        return response.data
      } else {
        setError(response.message || '가게 생성에 실패했습니다.')
        return null
      }
    } catch (err) {
      console.error('가게 생성 오류:', err)
      setError('가게 생성 중 오류가 발생했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 가게 수정
  const updateStore = useCallback(async (
    storeId: number, 
    storeData: StoreEditRequestDto
  ): Promise<StoreResponseDto | null> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await editStore(storeId, storeData)
      
      if (response.success) {
        return response.data
      } else {
        setError(response.message || '가게 수정에 실패했습니다.')
        return null
      }
    } catch (err) {
      console.error('가게 수정 오류:', err)
      setError('가게 수정 중 오류가 발생했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // 가게 삭제
  const removeStore = useCallback(async (storeId: number): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await deleteStore(storeId)
      
      if (response.success) {
        return true
      } else {
        setError(response.message || '가게 삭제에 실패했습니다.')
        return false
      }
    } catch (err) {
      console.error('가게 삭제 오류:', err)
      setError('가게 삭제 중 오류가 발생했습니다.')
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
    loading,
    error,
    createNewStore,
    updateStore,
    removeStore,
    clearError
  }
}
