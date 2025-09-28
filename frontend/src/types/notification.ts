// 점주(Owner) 알림 타입
export type OwnerNotificationType =
  | 'PAYMENT_APPROVED' // 결제 수락
  | 'PAYMENT_REQUEST' // 포인트 결제 요청
  | 'PAYMENT_CANCELED' // 결제 취소
  | 'PAYMENT_COMPLETED' // 결제 완료 (호환용)
  | 'GROUP_POINT_USE' // 모임 포인트 사용
  | 'GROUP_JOIN_REQUEST' // 모임 가입 요청
  | 'ORDER_RECEIVED' // 주문 접수
  | 'CUSTOMER_ARRIVED' // 고객 도착
  | 'STORE_INFO_UPDATED' // 매장 정보 수정 완료

// 고객(Customer) 알림 타입
export type CustomerNotificationType =
  | 'POINT_CHARGE' // 포인트 충전
  | 'POINT_CHARGED' // 포인트 충전 (호환용)
  | 'PERSONAL_POINT_USE' // 개인 포인트 사용
  | 'POINT_USED' // 개인/모임 포인트 사용 (호환용)
  | 'POINT_CANCELED' // 포인트 사용 취소
  | 'SETTLEMENT_COMPLETED' // 정산 완료
  | 'GROUP_INVITE' // 모임 초대
  | 'GROUP_INVITATION' // 모임 초대 (호환용)
  | 'GROUP_JOIN_ACCEPTED' // 모임 가입 승인
  | 'GROUP_JOIN_REJECTED' // 모임 가입 거절
  | 'GROUP_JOINED' // 모임 참여 완료
  | 'GROUP_LEADER_CHANGED' // 모임 리더 변경
  | 'MEMBER_EXPELLED' // 모임원 내보내기
  | 'GROUP_POINT_SHARED' // 모임 지갑에 포인트 공유
  | 'GROUP_LEFT' // 모임 나가기
  | 'GROUP_DISBANDED' // 모임 해체

// 공통 타입 (기본/일반 알림)
export type CommonNotificationType = 'GENERAL'

export type NotificationType =
  | OwnerNotificationType
  | CustomerNotificationType
  | CommonNotificationType

// 알림 카테고리 정의
export type NotificationCategory = 'payment' | 'group' | 'point' | 'order'

// 주문 아이템 타입
export interface OrderItem {
  name: string
  quantity: number
  price: number
}

// 알림 데이터 상세 정보 타입
export interface NotificationPayload {
  intentId?: string
  intentPublicId?: string
  customerName?: string
  amount?: number
  storeName?: string
  storeId?: number
  items?: OrderItem[]
}

export interface NotificationData {
  id: number
  type: NotificationType
  title: string
  message: string
  timestamp: string
  isRead: boolean
  data?: NotificationPayload
}

// 알림 타입별 카테고리 매핑
export const getNotificationCategory = (
  type: NotificationType
): NotificationCategory => {
  // 결제/정산 관련
  if (
    [
      'PAYMENT_APPROVED',
      'PAYMENT_REQUEST',
      'PAYMENT_CANCELED',
      'PAYMENT_COMPLETED',
      'SETTLEMENT_COMPLETED',
    ].includes(type as any)
  ) {
    return 'payment'
  }
  // 포인트 관련
  if (
    [
      'POINT_CHARGE',
      'POINT_CHARGED',
      'PERSONAL_POINT_USE',
      'POINT_USED',
      'POINT_CANCELED',
    ].includes(type as any)
  ) {
    return 'point'
  }
  // 주문 관련
  if (['ORDER_RECEIVED'].includes(type as any)) {
    return 'order'
  }
  // 그룹/모임 관련 (그 외 기본)
  return 'group'
}

// 알림 타입별 제목 매핑
export const getNotificationTitle = (type: NotificationType): string => {
  switch (type) {
    // Owner 결제 관련
    case 'PAYMENT_APPROVED':
      return '결제 수락'
    case 'PAYMENT_REQUEST':
      return '포인트 결제 요청'
    case 'PAYMENT_CANCELED':
      return '결제 취소'
    case 'PAYMENT_COMPLETED':
      return '결제 완료'

    // Owner 그룹 관련
    case 'GROUP_POINT_USE':
      return '모임 포인트 사용'
    case 'GROUP_JOIN_REQUEST':
      return '모임 가입 요청'

    // Customer 포인트 관련
    case 'POINT_CHARGE':
      return '포인트 충전'
    case 'POINT_CHARGED':
      return '포인트 충전'
    case 'PERSONAL_POINT_USE':
      return '개인 포인트 사용'
    case 'POINT_USED':
      return '포인트 사용'
    case 'POINT_CANCELED':
      return '포인트 사용 취소'

    // Customer 정산
    case 'SETTLEMENT_COMPLETED':
      return '정산 완료'

    // Customer 그룹 관련
    case 'GROUP_INVITE':
      return '모임 초대'
    case 'GROUP_INVITATION':
      return '모임 초대'
    case 'GROUP_JOIN_ACCEPTED':
      return '모임 가입 승인'
    case 'GROUP_JOIN_REJECTED':
      return '모임 가입 거절'
    case 'GROUP_JOINED':
      return '모임 참여 완료'
    case 'GROUP_LEADER_CHANGED':
      return '모임 리더 변경'
    case 'MEMBER_EXPELLED':
      return '모임원 내보내기'
    case 'GROUP_POINT_SHARED':
      return '모임 지갑에 포인트 공유'
    case 'GROUP_LEFT':
      return '모임 나가기'
    case 'GROUP_DISBANDED':
      return '모임 해체'

    // Owner 기타
    case 'ORDER_RECEIVED':
      return '주문이 접수되었습니다'
    case 'CUSTOMER_ARRIVED':
      return '고객이 도착했습니다'
    case 'STORE_INFO_UPDATED':
      return '매장 정보 수정 완료'

    case 'GENERAL':
      return '알림'

    default:
      return '알림'
  }
}

// 알림 타입별 아이콘 매핑
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    // Owner 결제 관련
    case 'PAYMENT_APPROVED':
    case 'PAYMENT_REQUEST':
    case 'PAYMENT_CANCELED':
    case 'PAYMENT_COMPLETED':
      return '💳'

    // Owner 그룹 관련
    case 'GROUP_POINT_USE':
    case 'GROUP_JOIN_REQUEST':
      return '👥'

    // Customer 포인트 관련
    case 'POINT_CHARGE':
    case 'POINT_CHARGED':
    case 'PERSONAL_POINT_USE':
    case 'POINT_USED':
    case 'POINT_CANCELED':
      return '💰'

    // Customer 정산
    case 'SETTLEMENT_COMPLETED':
      return '📊'

    // Customer 그룹 관련
    case 'GROUP_INVITE':
    case 'GROUP_INVITATION':
    case 'GROUP_JOIN_ACCEPTED':
    case 'GROUP_JOIN_REJECTED':
    case 'GROUP_JOINED':
    case 'GROUP_LEADER_CHANGED':
    case 'MEMBER_EXPELLED':
    case 'GROUP_POINT_SHARED':
    case 'GROUP_LEFT':
    case 'GROUP_DISBANDED':
      return '👥'

    // Owner 기타
    case 'ORDER_RECEIVED':
      return '📦'
    case 'CUSTOMER_ARRIVED':
      return '👋'
    case 'STORE_INFO_UPDATED':
      return '🏪'

    default:
      return '🔔'
  }
}
