/**
 * 멱등키 기반 API 클라이언트 래퍼
 *
 * 기존 axios 클라이언트에 멱등키 기능을 추가하여
 * 중요한 API 요청에 대한 중복 실행 방지
 */

import apiClient from './axios'
import { generateIdempotencyKey, type IdempotencyOptions } from '@/utils/idempotency'

// 멱등키가 필요한 API 요청 옵션
export interface IdempotentApiOptions extends IdempotencyOptions {
  // HTTP 요청 옵션
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  data?: any
  params?: any
  headers?: Record<string, string>

  // 멱등키 동작 옵션
  skipIfPending?: boolean
  retryOnError?: boolean
  useIdempotencyHeader?: boolean // 백엔드에 멱등키 헤더 전송 여부
}

/**
 * 멱등키 기반 API 요청 함수
 */
export const idempotentRequest = async <T = any>(
  options: IdempotentApiOptions
): Promise<T> => {
  const {
    method = 'POST',
    url,
    data,
    params,
    headers = {},
    skipIfPending = true,
    retryOnError = true,
    useIdempotencyHeader = true,
    ...idempotencyOptions
  } = options

  // 멱등키 생성
  const idempotencyKey = generateIdempotencyKey(idempotencyOptions)

  // 요청 함수 정의
  const requestFn = async (): Promise<T> => {
    const requestHeaders = { ...headers }

    // 백엔드에 멱등키 헤더 추가
    if (useIdempotencyHeader) {
      requestHeaders['Idempotency-Key'] = idempotencyKey
    }

    const response = await apiClient.request({
      method,
      url,
      data,
      params,
      headers: requestHeaders
    })

    return response.data
  }

  // 멱등키 기반 실행
  const { executeIdempotentRequest } = await import('@/utils/idempotency')

  return executeIdempotentRequest({
    idempotencyKey,
    requestFn,
    skipIfPending,
    retryOnError
  })
}

/**
 * 결제 관련 API 래퍼
 */
export const paymentApi = {
  /**
   * 선결제 요청
   */
  createPrepayment: (data: {
    userId: number
    storeId: number
    amount: number
    description?: string
  }) => {
    return idempotentRequest({
      action: 'payment_prepay',
      method: 'POST',
      url: '/payment/prepay',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 60 // 결제는 1시간 내 중복 방지
    })
  },

  /**
   * 결제 승인
   */
  approvePayment: (data: {
    userId: number
    storeId: number
    paymentId: string
    amount: number
  }) => {
    return idempotentRequest({
      action: 'payment_approve',
      method: 'POST',
      url: `/payment/${data.paymentId}/approve`,
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  },

  /**
   * 결제 취소
   */
  cancelPayment: (data: {
    userId: number
    storeId: number
    paymentId: string
    reason?: string
  }) => {
    return idempotentRequest({
      action: 'payment_cancel',
      method: 'POST',
      url: `/payment/${data.paymentId}/cancel`,
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  }
}

/**
 * QR 코드 처리 관련 API 래퍼
 */
export const qrApi = {
  /**
   * QR 코드 스캔 처리
   */
  processQrScan: (data: {
    userId: number
    storeId: number
    qrData: string
    scanType: 'payment' | 'checkin' | 'order'
  }) => {
    return idempotentRequest({
      action: `qr_scan_${data.scanType}`,
      method: 'POST',
      url: '/qr/process',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 10 // QR 처리는 10분 내 중복 방지
    })
  },

  /**
   * QR 결제 처리
   */
  processQrPayment: (data: {
    userId: number
    storeId: number
    qrToken: string
    amount: number
  }) => {
    return idempotentRequest({
      action: 'qr_payment',
      method: 'POST',
      url: '/qr/payment',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  }
}

/**
 * 포인트 관련 API 래퍼
 */
export const pointApi = {
  /**
   * 포인트 충전
   */
  chargePoints: (data: {
    userId: number
    storeId?: number
    amount: number
    paymentMethod: string
  }) => {
    return idempotentRequest({
      action: 'point_charge',
      method: 'POST',
      url: '/points/charge',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 60
    })
  },

  /**
   * 포인트 사용
   */
  usePoints: (data: {
    userId: number
    storeId: number
    amount: number
    orderId?: string
  }) => {
    return idempotentRequest({
      action: 'point_use',
      method: 'POST',
      url: '/points/use',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  }
}

/**
 * 매장 관리 관련 API 래퍼
 */
export const storeApi = {
  /**
   * 매장 등록
   */
  registerStore: (data: {
    ownerId: number
    storeName: string
    address: string
    phone: string
    description?: string
  }) => {
    return idempotentRequest({
      action: 'store_register',
      method: 'POST',
      url: '/stores',
      data,
      userId: data.ownerId,
      expiryMinutes: 120 // 매장 등록은 2시간 내 중복 방지
    })
  },

  /**
   * 매장 정보 수정
   */
  updateStore: (data: {
    ownerId: number
    storeId: number
    updates: any
  }) => {
    return idempotentRequest({
      action: 'store_update',
      method: 'PUT',
      url: `/stores/${data.storeId}`,
      data: data.updates,
      userId: data.ownerId,
      storeId: data.storeId,
      expiryMinutes: 60
    })
  }
}

/**
 * 주문 관련 API 래퍼
 */
export const orderApi = {
  /**
   * 주문 생성
   */
  createOrder: (data: {
    userId: number
    storeId: number
    items: any[]
    totalAmount: number
  }) => {
    return idempotentRequest({
      action: 'order_create',
      method: 'POST',
      url: '/orders',
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  },

  /**
   * 주문 취소
   */
  cancelOrder: (data: {
    userId: number
    storeId: number
    orderId: string
    reason?: string
  }) => {
    return idempotentRequest({
      action: 'order_cancel',
      method: 'POST',
      url: `/orders/${data.orderId}/cancel`,
      data,
      userId: data.userId,
      storeId: data.storeId,
      expiryMinutes: 30
    })
  }
}

/**
 * 일반적인 GET 요청용 캐시 기반 래퍼
 * 멱등키보다는 단순 캐싱이 적합한 경우
 */
export const cachedRequest = async <T = any>(
  url: string,
  params?: any,
  cacheDuration: number = 5 * 60 * 1000 // 5분 기본 캐시
): Promise<T> => {
  const cacheKey = `cached_${url}_${JSON.stringify(params)}`
  const cached = localStorage.getItem(cacheKey)

  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < cacheDuration) {
      return data
    }
  }

  const response = await apiClient.get(url, { params })
  const result = response.data

  // 캐시 저장
  localStorage.setItem(cacheKey, JSON.stringify({
    data: result,
    timestamp: Date.now()
  }))

  return result
}