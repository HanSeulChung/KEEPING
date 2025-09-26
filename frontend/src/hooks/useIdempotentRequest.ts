/**
 * 멱등키 기반 요청 상태 관리 훅
 *
 * 주요 기능:
 * - 요청 상태 추적 (idle, pending, success, error)
 * - 페이지 재진입 시 이전 상태 복원
 * - 중복 요청 자동 차단
 * - UI 상태 관리 (버튼 비활성화 등)
 */

import {
    executeIdempotentRequest,
    generateIdempotencyKey,
    initializeIdempotency,
    requestStateManager,
    type IdempotentRequestOptions,
    type RequestStatus
} from '@/utils/idempotency'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseIdempotentRequestOptions {
  // 멱등키 생성 옵션
  userId?: string | number
  storeId?: string | number
  action: string
  expiryMinutes?: number

  // 요청 데이터
  data?: any

  // 요청 동작 옵션
  skipIfPending?: boolean
  retryOnError?: boolean

  // 자동 실행 옵션
  immediate?: boolean

  // 콜백
  onSuccess?: (result: any) => void
  onError?: (error: any) => void
  onStateChange?: (status: RequestStatus) => void
}

export interface UseIdempotentRequestReturn<T = any> {
  // 상태
  status: RequestStatus
  data: T | null
  error: any
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  canRetry: boolean

  // 액션
  execute: (requestData?: any) => Promise<T | null>
  reset: () => void

  // 메타데이터
  idempotencyKey: string
  lastExecutedAt: number | null
}

export const useIdempotentRequest = <T = any>(
  requestFn: (data?: any) => Promise<T>,
  options: UseIdempotentRequestOptions
): UseIdempotentRequestReturn<T> => {
  const {
    userId,
    storeId,
    action,
    expiryMinutes,
    skipIfPending = true,
    retryOnError = true,
    immediate = false,
    onSuccess,
    onError,
    onStateChange
  } = options

  // 상태 관리
  const [status, setStatus] = useState<RequestStatus>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)
  const [lastExecutedAt, setLastExecutedAt] = useState<number | null>(null)
  const [currentRequestData, setCurrentRequestData] = useState<any>(null)

  // 멱등키 생성 (요청 데이터가 변경될 때마다 새로 생성)
  const idempotencyKey = generateIdempotencyKey({
    userId,
    storeId,
    action,
    data: currentRequestData,
    expiryMinutes
  })

  // 참조 유지
  const requestFnRef = useRef(requestFn)
  const optionsRef = useRef(options)

  useEffect(() => {
    requestFnRef.current = requestFn
    optionsRef.current = options
  })

  // 초기화 및 이전 상태 복원
  useEffect(() => {
    initializeIdempotency()

    // 이전 요청 상태 복원 (currentRequestData가 설정된 후)
    if (currentRequestData !== null) {
      const savedState = requestStateManager.getRequestState(idempotencyKey)
      if (savedState) {
        setStatus(savedState.status)
        setData(savedState.result || null)
        setError(savedState.error || null)
        setLastExecutedAt(savedState.timestamp)

        // 상태 변경 콜백 호출
        onStateChange?.(savedState.status)

        // 성공/에러 콜백 호출
        if (savedState.status === 'success' && savedState.result && onSuccess) {
          onSuccess(savedState.result)
        } else if (savedState.status === 'error' && savedState.error && onError) {
          onError(savedState.error)
        }
      }
    }
  }, [idempotencyKey, onSuccess, onError, onStateChange, currentRequestData])

  // 요청 실행 함수
  const execute = useCallback(async (requestData?: any): Promise<T | null> => {
    try {
      // 요청 데이터 설정 (멱등키 재생성 트리거)
      setCurrentRequestData(requestData || {})

      // 현재 멱등키로 생성 (requestData 반영)
      const currentKey = generateIdempotencyKey({
        userId,
        storeId,
        action,
        data: requestData || {},
        expiryMinutes
      })

      // 상태 업데이트
      setStatus('pending')
      setError(null)
      onStateChange?.('pending')

      const requestOptions: IdempotentRequestOptions<T> = {
        idempotencyKey: currentKey,
        requestFn: () => requestFnRef.current(requestData),
        skipIfPending,
        retryOnError
      }

      const result = await executeIdempotentRequest(requestOptions)

      // 성공 상태 업데이트
      setStatus('success')
      setData(result)
      setLastExecutedAt(Date.now())
      onStateChange?.('success')
      onSuccess?.(result)

      return result
    } catch (err) {
      // 에러 상태 업데이트
      setStatus('error')
      setError(err)
      setLastExecutedAt(Date.now())
      onStateChange?.('error')
      onError?.(err)

      return null
    }
  }, [userId, storeId, action, expiryMinutes, skipIfPending, retryOnError, onSuccess, onError, onStateChange])

  // 상태 초기화
  const reset = useCallback(() => {
    if (idempotencyKey) {
      requestStateManager.removeRequestState(idempotencyKey)
    }
    setStatus('idle')
    setData(null)
    setError(null)
    setLastExecutedAt(null)
    setCurrentRequestData(null)
    onStateChange?.('idle')
  }, [idempotencyKey, onStateChange])

  // 즉시 실행 옵션
  useEffect(() => {
    if (immediate && status === 'idle') {
      execute()
    }
  }, [immediate, execute, status])

  // 계산된 상태값들
  const isLoading = status === 'pending'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const canRetry = (status === 'error' && retryOnError) || status === 'idle'

  return {
    // 상태
    status,
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    canRetry,

    // 액션
    execute,
    reset,

    // 메타데이터
    idempotencyKey,
    lastExecutedAt
  }
}

/**
 * 단순한 멱등키 기반 뮤테이션 훅
 * 한 번만 실행되고 성공하면 재실행되지 않는 요청에 최적화
 */
export const useIdempotentMutation = <T = any>(
  mutationFn: (data?: any) => Promise<T>,
  options: Omit<UseIdempotentRequestOptions, 'immediate'>
) => {
  const result = useIdempotentRequest(mutationFn, { ...options, immediate: false })

  return {
    ...result,
    mutate: result.execute,
    mutateAsync: result.execute
  }
}

/**
 * 버튼 비활성화 상태 관리 훅
 * UI 컴포넌트에서 쉽게 사용할 수 있도록 최적화된 훅
 */
export interface UseIdempotentButtonOptions extends UseIdempotentRequestOptions {
  confirmMessage?: string
  successMessage?: string
  errorMessage?: string
}

export const useIdempotentButton = <T = any>(
  buttonAction: (data?: any) => Promise<T>,
  options: UseIdempotentButtonOptions
) => {
  const {
    confirmMessage,
    successMessage,
    errorMessage,
    ...requestOptions
  } = options

  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')

  const request = useIdempotentRequest(buttonAction, {
    ...requestOptions,
    onSuccess: (result) => {
      if (successMessage) {
        setMessage(successMessage)
        setMessageType('success')
        setTimeout(() => setMessage(''), 3000)
      }
      requestOptions.onSuccess?.(result)
    },
    onError: (error) => {
      if (errorMessage) {
        setMessage(errorMessage)
        setMessageType('error')
        setTimeout(() => setMessage(''), 5000)
      }
      requestOptions.onError?.(error)
    }
  })

  const handleClick = useCallback(async (data?: any) => {
    if (confirmMessage && !showConfirm) {
      setShowConfirm(true)
      return
    }

    setShowConfirm(false)
    return await request.execute(data)
  }, [confirmMessage, showConfirm, request.execute])

  const handleConfirm = useCallback(async (data?: any) => {
    setShowConfirm(false)
    return await request.execute(data)
  }, [request.execute])

  const handleCancel = useCallback(() => {
    setShowConfirm(false)
  }, [])

  return {
    ...request,

    // 버튼 관련 상태
    disabled: request.isLoading || (request.isSuccess && !request.canRetry),
    loading: request.isLoading,

    // 액션
    handleClick,
    handleConfirm,
    handleCancel,

    // 메시지 관리
    message,
    messageType,
    showConfirm,

    // 버튼 텍스트 헬퍼
    getButtonText: (defaultText: string, loadingText?: string) => {
      if (request.isLoading) return loadingText || '처리 중...'
      if (request.isSuccess) return '완료됨'
      if (request.isError && request.canRetry) return '재시도'
      return defaultText
    }
  }
}