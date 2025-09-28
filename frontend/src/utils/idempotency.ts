/**
 * 멱등키 기반 중복 요청 방지 유틸리티
 *
 * 사용 목적:
 * - 결제, QR 처리 등 중요한 요청의 중복 실행 방지
 * - 페이지 재진입 시 이전 요청 상태 복원
 * - 네트워크 문제로 인한 중복 요청 방지
 */

import CryptoJS from 'crypto-js'

// 요청 상태 타입 정의
export type RequestStatus = 'pending' | 'success' | 'error' | 'idle'

// 요청 상태 정보
export interface RequestState {
  status: RequestStatus
  timestamp: number
  result?: any
  error?: any
  idempotencyKey: string
}

// 멱등키 생성 옵션
export interface IdempotencyOptions {
  userId?: string | number
  storeId?: string | number
  action: string
  data?: any
  expiryMinutes?: number // 기본 30분
}

/**
 * 요청 내용 기반 멱등키 생성
 * SHA-256 해시를 사용하여 동일한 요청에 대해 동일한 키 생성
 */
export const generateIdempotencyKey = (options: IdempotencyOptions): string => {
  const {
    userId = '',
    storeId = '',
    action,
    data = {},
    expiryMinutes = 30
  } = options

  // 멱등키 생성을 위한 데이터 정규화
  const normalizedData = {
    userId: String(userId),
    storeId: String(storeId),
    action,
    data: JSON.stringify(data, Object.keys(data).sort()), // 키 순서 정렬로 일관성 보장
    timestamp: Math.floor(Date.now() / (1000 * 60 * expiryMinutes)) // 시간 기반 그룹핑
  }

  const hashInput = JSON.stringify(normalizedData)
  const hash = CryptoJS.SHA256(hashInput).toString(CryptoJS.enc.Hex)

  return `idem_${action}_${hash.substring(0, 16)}`
}

/**
 * localStorage 기반 요청 상태 관리
 */
const STORAGE_PREFIX = 'request_state_'
const STORAGE_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24시간

export const requestStateManager = {
  /**
   * 요청 상태 저장
   */
  saveRequestState: (idempotencyKey: string, state: RequestState): void => {
    try {
      const storageKey = STORAGE_PREFIX + idempotencyKey
      const dataWithExpiry = {
        ...state,
        expiresAt: Date.now() + STORAGE_EXPIRY_MS
      }
      localStorage.setItem(storageKey, JSON.stringify(dataWithExpiry))
    } catch (error) {
      console.warn('Failed to save request state:', error)
    }
  },

  /**
   * 요청 상태 조회
   */
  getRequestState: (idempotencyKey: string): RequestState | null => {
    try {
      const storageKey = STORAGE_PREFIX + idempotencyKey
      const stored = localStorage.getItem(storageKey)

      if (!stored) return null

      const data = JSON.parse(stored)

      // 만료 체크
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(storageKey)
        return null
      }

      return {
        status: data.status,
        timestamp: data.timestamp,
        result: data.result,
        error: data.error,
        idempotencyKey: data.idempotencyKey
      }
    } catch (error) {
      console.warn('Failed to get request state:', error)
      return null
    }
  },

  /**
   * 요청 상태 삭제
   */
  removeRequestState: (idempotencyKey: string): void => {
    try {
      const storageKey = STORAGE_PREFIX + idempotencyKey
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.warn('Failed to remove request state:', error)
    }
  },

  /**
   * 만료된 요청 상태 정리
   */
  cleanupExpiredStates: (): void => {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()

      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const data = JSON.parse(stored)
              if (data.expiresAt && now > data.expiresAt) {
                localStorage.removeItem(key)
              }
            }
          } catch (error) {
            // 파싱 에러가 발생한 경우 해당 키 제거
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      console.warn('Failed to cleanup expired states:', error)
    }
  }
}

/**
 * 멱등키 기반 요청 실행 함수
 */
export interface IdempotentRequestOptions<T = any> {
  idempotencyKey: string
  requestFn: () => Promise<T>
  skipIfPending?: boolean // 진행 중인 요청이 있으면 건너뛸지 여부
  retryOnError?: boolean // 에러 시 재시도 허용 여부
}

// 진행 중인 요청들을 메모리에서 관리
const pendingRequests = new Map<string, Promise<any>>()

export const executeIdempotentRequest = async <T = any>(
  options: IdempotentRequestOptions<T>
): Promise<T> => {
  const { idempotencyKey, requestFn, skipIfPending = true, retryOnError = true } = options

  // 1. 기존 상태 확인
  const existingState = requestStateManager.getRequestState(idempotencyKey)

  // 2. 성공한 요청이 있으면 기존 결과 반환
  if (existingState?.status === 'success') {
    console.log('Returning cached successful result for:', idempotencyKey)
    return existingState.result
  }

  // 3. 진행 중인 요청이 있으면 처리
  if (pendingRequests.has(idempotencyKey)) {
    if (skipIfPending) {
      throw new Error('Request already in progress')
    } else {
      console.log('Waiting for existing request:', idempotencyKey)
      return await pendingRequests.get(idempotencyKey)!
    }
  }

  // 4. 에러 상태인 경우 재시도 여부 확인
  if (existingState?.status === 'error' && !retryOnError) {
    throw new Error(`Previous request failed: ${existingState.error?.message || 'Unknown error'}`)
  }

  // 5. 새로운 요청 실행
  const requestPromise = (async () => {
    try {
      // pending 상태로 저장
      const pendingState: RequestState = {
        status: 'pending',
        timestamp: Date.now(),
        idempotencyKey
      }
      requestStateManager.saveRequestState(idempotencyKey, pendingState)

      // 요청 실행
      const result = await requestFn()

      // 성공 상태로 저장
      const successState: RequestState = {
        status: 'success',
        timestamp: Date.now(),
        result,
        idempotencyKey
      }
      requestStateManager.saveRequestState(idempotencyKey, successState)

      return result
    } catch (error) {
      // 에러 상태로 저장
      const errorState: RequestState = {
        status: 'error',
        timestamp: Date.now(),
        error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
        idempotencyKey
      }
      requestStateManager.saveRequestState(idempotencyKey, errorState)

      throw error
    } finally {
      // 진행 중인 요청에서 제거
      pendingRequests.delete(idempotencyKey)
    }
  })()

  // 진행 중인 요청으로 등록
  pendingRequests.set(idempotencyKey, requestPromise)

  return await requestPromise
}

/**
 * 컴포넌트 마운트 시 만료된 상태 정리
 */
export const initializeIdempotency = (): void => {
  requestStateManager.cleanupExpiredStates()
}