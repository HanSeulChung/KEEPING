// API Types Definition - 백엔드 API와 1:1 매칭되는 타입 정의

// 공통 응답 타입
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  statusCode: number
  data: T
  timestamp: string
}

export interface PageInfo {
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface Page<T> {
  content: T[]
  pageable: PageInfo
}

// Auth API Types
export namespace AuthAPI {
  // 소셜 로그인 (자동 리다이렉트)
  // GET /auth/kakao/owner
  // GET /auth/kakao/customer
  
  // 세션 정보 조회
  export interface SessionInfoResponse {
    success: boolean
    status: number
    message: string
    data: string
    timestamp: string
  }
  
  // 회원가입 완료
  export interface CustomerSignupRequest {
    regSessionId: string
    paymentPin: string
  }
  
  export interface OwnerSignupRequest {
    regSessionId: string
  }
  
  export interface SignupCustomerResponse {
    accessToken: string
    user: {
      id: number
      name: string
      email: string
      role: 'CUSTOMER'
    }
  }
  
  export interface SignupOwnerResponse {
    accessToken: string
    user: {
      id: number
      name: string
      email: string
      role: 'OWNER'
    }
  }
  
  // 토큰 갱신
  export interface TokenResponse {
    accessToken: string
    refreshToken?: string
  }
}

// Notification API Types
export namespace NotificationAPI {
  export interface NotificationResponseDto {
    id: number
    title: string
    message: string
    type: 'PAYMENT' | 'CHARGE' | 'STORE_PROMOTION' | 'PREPAYMENT_PURCHASE' | 'SYSTEM'
    isRead: boolean
    createdAt: string
    data?: {
      storeId?: number
      storeName?: string
      amount?: number
      paymentId?: string
      [key: string]: any
    }
  }

  // 알림 설정 관련 타입
  export interface NotificationSettings {
    enabled: boolean
    pushEnabled: boolean
    emailEnabled: boolean
  }

  export interface UserNotificationSettings {
    userId: number
    userType: 'OWNER' | 'CUSTOMER'
    settings: {
      PAYMENT: NotificationSettings
      CHARGE: NotificationSettings
      STORE_PROMOTION: NotificationSettings
      PREPAYMENT_PURCHASE: NotificationSettings
    }
  }
  
  // GET /notifications/owner/{ownerId}?page={page}&size={size}
  export interface OwnerNotificationListRequest {
    ownerId: number
    page?: number
    size?: number
  }
  
  export type OwnerNotificationListResponse = ApiResponse<Page<NotificationResponseDto>>
  
  // GET /notifications/owner/{ownerId}/unread-count
  export interface UnreadCountRequest {
    ownerId: number
  }
  
  export interface UnreadCountResponse {
    unreadCount: number
  }
  
  // POST /notifications/owner/{ownerId}/mark-read/{notificationId}
  export interface MarkAsReadRequest {
    ownerId: number
    notificationId: number
  }
  
  // POST /notifications/fcm/register
  export interface RegisterFcmTokenRequest {
    fcmToken: string
    userId: number
    deviceType: 'WEB' | 'ANDROID' | 'IOS'
  }

  // 알림 설정 API
  export interface GetSettingsRequest {
    ownerId: number
  }

  export interface GetSettingsResponse {
    success: boolean
    data: UserNotificationSettings
  }

  export interface UpdateSettingsRequest {
    settings: {
      [key in NotificationType]?: NotificationSettings
    }
  }

  export interface UpdateSettingsResponse {
    success: boolean
    message: string
    data: {
      userId: number
      updatedAt: string
    }
  }
}

export type NotificationType = 
  | 'PAYMENT'
  | 'CHARGE' 
  | 'STORE_PROMOTION'
  | 'PREPAYMENT_PURCHASE'

// Store API Types
export namespace StoreAPI {
  export interface StoreResponseDto {
    id: number
    name: string
    description: string
    address: string
    phone: string
    category: string
    images: string[]
    rating: number
    isLiked: boolean
    createdAt: string
  }
  
  // POST /owners/stores
  export interface StoreRegisterRequest {
    name: string
    description: string
    address: string
    phone: string
    category: string
    images: File[] // 이미지 파일들
  }
  
  export type StoreRegisterResponse = ApiResponse<StoreResponseDto>
  
  // GET /owners/stores?ownerId={ownerId}
  export interface OwnerStoresRequest {
    ownerId: number
  }
  
  export type OwnerStoresResponse = ApiResponse<StoreResponseDto[]>
  
  // GET /owners/stores/{storeId}/sales/calendar
  export interface SalesCalendarRequest {
    storeId: number
    year: number
    month: number
  }
  
  export interface SalesData {
    date: string
    totalSales: number
    orderCount: number
    avgOrderAmount: number
  }
  
  export type SalesCalendarResponse = ApiResponse<SalesData[]>
}

// Menu API Types
export namespace MenuAPI {
  export interface MenuResponseDto {
    id: number
    name: string
    description: string
    price: number
    category: string
    images: string[]
    isAvailable: boolean
    createdAt: string
  }
  
  // GET /stores/{storeId}/menus
  export interface MenuListRequest {
    storeId: number
    category?: string
  }
  
  export type MenuListResponse = ApiResponse<MenuResponseDto[]>
  
  // POST /stores/{storeId}/menus
  export interface MenuCreateRequest {
    name: string
    description: string
    price: number
    category: string
    images: File[]
  }
  
  export type MenuCreateResponse = ApiResponse<MenuResponseDto>
}

// Payment API Types
export namespace PaymentAPI {
  export interface PaymentResponseDto {
    id: string
    amount: number
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
    paymentMethod: 'CARD' | 'CASH' | 'QR' | 'GROUP'
    storeId: number
    storeName: string
    createdAt: string
  }
  
  // POST /payments/charge
  export interface ChargeRequest {
    amount: number
    paymentMethod: 'CARD' | 'BANK_TRANSFER'
  }
  
  // POST /payments/qr
  export interface QrPaymentRequest {
    qrData: string
    amount: number
  }
  
  export type PaymentResponse = ApiResponse<PaymentResponseDto>
}

// QR API Types
export namespace QrAPI {
  // POST /qr/generate
  export interface QrGenerateRequest {
    storeId: number
    tableNumber?: string
    amount?: number
    expiryMinutes?: number
  }
  
  export interface QrGenerateResponse {
    qrCode: string
    qrData: string
    expiresAt: string
  }
  
  // POST /qr/scan
  export interface QrScanRequest {
    qrData: string
  }
  
  export interface QrScanResponse {
    storeId: number
    storeName: string
    tableNumber?: string
    amount?: number
    isValid: boolean
  }
}

// Group API Types
export namespace GroupAPI {
  export interface GroupResponseDto {
    id: number
    name: string
    description: string
    leaderId: number
    memberCount: number
    totalBalance: number
    createdAt: string
  }
  
  // POST /groups
  export interface GroupCreateRequest {
    name: string
    description: string
    initialAmount?: number
  }
  
  export type GroupCreateResponse = ApiResponse<GroupResponseDto>
}

// OTP API Types
export namespace OtpAPI {
  // POST /otp/request
  export interface OtpRequestRequest {
    phoneNumber: string
    purpose: 'SIGNUP' | 'LOGIN' | 'VERIFICATION'
  }
  
  export interface OtpRequestResponse {
    requestId: string
    expiresAt: string
  }
  
  // POST /otp/verify
  export interface OtpVerifyRequest {
    requestId: string
    code: string
    phoneNumber: string
  }
  
  export interface OtpVerifyResponse {
    isValid: boolean
    verificationToken?: string
  }
}
