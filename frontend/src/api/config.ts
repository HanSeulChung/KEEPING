//API 호출을 위한 클라이언트 사이드 설정
//브라우저에서 서버로 API 요청할 때 사용

// 환경변수 값을 그대로 신뢰하며, 운영 기본값만 "/api" 포함
const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : 'https://j13a509.p.ssafy.io/api')

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

export const buildURL = (path: string): string => {
  const base = apiConfig.baseURL.replace(/\/$/, '')
  return `${base}${path}`
}

// QR URI의 도메인을 현재 환경의 baseURL로 교체하는 함수
export const replaceQRDomain = (qrUri: string): string => {
  try {
    const url = new URL(qrUri)
    const currentBaseURL = apiConfig.baseURL.replace(/\/$/, '')

    // 기존 도메인을 현재 환경의 baseURL로 교체
    return qrUri.replace(url.origin, currentBaseURL)
  } catch (error) {
    console.error('QR URI 파싱 오류:', error)
    return qrUri // 파싱 실패 시 원본 반환
  }
}

export const endpoints = {
  auth: {
    // 로그아웃
    logout: '/auth/logout',
    // 토큰 갱신
    refresh: '/auth/refresh',
    // 사용자 정보 조회
    me: '/auth/me',
    // 소셜 로그인 (카카오)

    kakaoOwner: '/auth/kakao/owner',
    kakaoCustomer: '/auth/kakao/customer',

    signupCustomer: '/auth/signup/customer',
    signupOwner: '/auth/signup/owner',
    // OTP 인증
    otpRequest: '/otp/request',
    otpVerify: '/otp/verify',
  },
  customer: {
    signup: '/customers',
    me: '/customers/me',
  },
  owner: {
    signup: '/owners',
  },
  group: {
    create: '/groups',
    search: '/groups/{groupId}',
    members: '/groups/{groupId}/group-members',
    request: '/groups/{groupId}/add-requests',
    searchRequest: '/groups/{groupId}/add-requests?status=PENDING',
    responseRequest: '/groups/{groupId}/add-requests',
    enterGroup: '/groups/{groupId}/entrance',
    searchGroupbyName: '/groups?name={groupName}',
    changeLeader: '/groups/{groupId}/group-leader',
    removeMember: '/groups/{groupId}/group-member',
    leaveGroup: '/groups/{groupId}/group-member',
    deleteGroup: '/groups/{groupId}',
  },
  stores: {
    // 매장 검색 및 조회
    search: '/stores',
    searchById: '/stores/{storeId}',
    searchByName: '/stores?name={storeName}',
    // 점주 매장 관리
    register: '/owners/stores',
    updateStore: '/owners/stores/{storeId}',
    deleteStore: '/owners/stores/{storeId}',
    ownerStores: '/owners/stores',
    ownerStoreDetail: '/owners/stores/{storeId}',
    // 매장 이미지 관리
    uploadImage: '/stores/{storeId}/images',
    deleteImage: '/stores/{storeId}/images/{imageId}',
    // 매장 카테고리 관리
    createCategory: '/stores/{storeId}/menus/categories',
    updateCategory: '/stores/{storeId}/menus/categories/{categoryId}',
    deleteCategory: '/stores/{storeId}/menus/categories/{categoryId}',
    listCategory: '/stores/{storeId}/menus/categories',
    menuByCategory: '/stores/{storeId}/menus/categories/{categoryId}',
    // 매출 관리
    salesCalendar: '/owners/stores/{storeId}/sales/calendar',
    salesStats: '/owners/stores/{storeId}/sales/stats',
    salesReport: '/owners/stores/{storeId}/sales/report',
    // 통계 관리
    statisticsOverall: '/stores/{storeId}/statistics/overall',
    statisticsDaily: '/stores/{storeId}/statistics/daily',
    statisticsPeriod: '/stores/{storeId}/statistics/period',
    statisticsMonthly: '/stores/{storeId}/statistics/monthly',
  },
  menu: {
    list: '/stores/{storeId}/menus',
    create: '/stores/{storeId}/menus',
    update: '/stores/{storeId}/menus/{menuId}',
    partialDelete: '/stores/{storeId}/menus/{menuId}',
    allDelete: '/stores/{storeId}/menus',
  },
  likes: {
    like: '/stores/{storeId}',
    unlike: '/stores/{storeId}',
  },
  notifications: {
    // 점주 알림
    ownerList: '/api/notifications/owner/{ownerId}',
    ownerUnreadCount: '/api/notifications/owner/{ownerId}/unread-count',
    ownerUnreadList: '/api/notifications/owner/{ownerId}/unread',
    ownerMarkAsRead:
      '/api/notifications/owner/{ownerId}/mark-read/{notificationId}',
    ownerMarkAllAsRead: '/api/notifications/owner/{ownerId}/mark-all-read',
    // 고객 알림
    customerList: '/api/notifications/customer/{customerId}',
    customerUnreadCount:
      '/api/notifications/customer/{customerId}/unread-count',
    customerMarkAsRead:
      '/api/notifications/customer/{customerId}/mark-read/{notificationId}',
    // 알림 설정
    updateSettings: '/api/notifications/settings',
    // FCM 토큰 등록
    registerFcmToken: '/notifications/fcm/register',
  },
  // 결제 관련 API
  payments: {
    // 충전 및 결제
    charge: '/payments/charge',
    pay: '/payments/pay',
    refund: '/payments/refund',
    // 결제 내역
    history: '/payments/history',
    // QR 결제
    qrPay: '/payments/qr',
    // 그룹 결제
    groupPay: '/payments/group',
    // 결제 의도 조회 (백엔드 API에 맞게 수정)
    intentDetail: '/api/payments/intent/{intentPublicId}',
    // 결제 승인 (추가 필요)
    approve: '/payments/{intentId}/approve',
  },
  // QR 코드 관련 API
  qr: {
    generate: '/qr/generate',
    scan: '/qr/scan',
    validate: '/qr/validate',
  },
  // SSE (Server-Sent Events)
  sse: {
    connect: '/sse/connect',
    ownerNotifications: '/sse/owner/{ownerId}/notifications',
    customerNotifications: '/sse/customer/{customerId}/notifications',
  },
} as const
