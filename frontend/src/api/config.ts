//API 호출을 위한 클라이언트 사이드 설정
//브라우저에서 서버로 API 요청할 때 사용

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}

// 중앙 URL 빌더 (index.ts 제거 후 대체)
export const buildURL = (path: string): string => {
  const base = apiConfig.baseURL.replace(/\/$/, '')
  return `${base}${path}`
}

export const endpoints = {
  auth: {
    // 로그아웃
    logout: '/auth/logout',
    // 토큰 갱신
    refresh: '/auth/refresh',
    // 세션 정보 조회
    sessionInfo: '/auth/session-info',
    // 소셜 로그인 (카카오)
    kakaoOwner: '/auth/kakao/owner',
    kakaoCustomer: '/auth/kakao/customer',
    // 소셜 로그인 (구글) - 향후 구현
    // googleOwner: '/auth/google/owner',
    // googleCustomer: '/auth/google/customer',
    // 회원가입 완료
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
    ownerStores: '/owners/stores?ownerId={ownerId}',
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
    ownerList: '/notifications/owner/{ownerId}',
    ownerUnreadCount: '/notifications/owner/{ownerId}/unread-count',
    ownerUnreadList: '/notifications/owner/{ownerId}/unread',
    ownerMarkAsRead:
      '/notifications/owner/{ownerId}/mark-read/{notificationId}',
    ownerMarkAllAsRead: '/notifications/owner/{ownerId}/mark-all-read',
    // 고객 알림
    customerList: '/notifications/customer/{customerId}',
    customerUnreadCount: '/notifications/customer/{customerId}/unread-count',
    customerMarkAsRead:
      '/notifications/customer/{customerId}/mark-read/{notificationId}',
    // 알림 설정
    updateSettings: '/notifications/settings',
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
