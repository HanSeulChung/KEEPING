// 점주(Owner) 알림 타입
export type OwnerNotificationType =
  | 'PAYMENT_APPROVED'    // 결제 수락
  | 'PAYMENT_REQUEST'     // 포인트 결제 요청
  | 'PAYMENT_CANCELED'    // 결제 취소
  | 'GROUP_POINT_USE'     // 모임 포인트 사용
  | 'GROUP_JOIN_REQUEST'  // 모임 가입 요청

// 고객(Customer) 알림 타입
export type CustomerNotificationType =
  | 'POINT_CHARGE'         // 포인트 충전
  | 'PERSONAL_POINT_USE'   // 개인 포인트 사용
  | 'POINT_CANCELED'       // 포인트 사용 취소
  | 'SETTLEMENT_COMPLETED' // 정산 완료
  | 'GROUP_INVITE'         // 모임 초대
  | 'GROUP_JOIN_ACCEPTED'  // 모임 가입 승인
  | 'GROUP_JOIN_REJECTED'  // 모임 가입 거절
  | 'GROUP_JOINED'         // 모임 참여 완료
  | 'GROUP_LEADER_CHANGED' // 모임 리더 변경
  | 'MEMBER_EXPELLED'      // 모임원 내보내기
  | 'GROUP_POINT_SHARED'   // 모임 지갑에 포인트 공유
  | 'GROUP_LEFT'           // 모임 나가기
  | 'GROUP_DISBANDED'      // 모임 해체

export type NotificationType = OwnerNotificationType | CustomerNotificationType

// 알림 카테고리 정의
export type NotificationCategory = 'payment' | 'group' | 'point'

export interface NotificationData {
  id: number
  type: NotificationType
  title: string
  message: string
  timestamp: string
  isRead: boolean
  data?: any
}

// 알림 타입별 카테고리 매핑
export const getNotificationCategory = (type: NotificationType): NotificationCategory => {
  // 결제/정산 관련
  if (['PAYMENT_APPROVED', 'PAYMENT_REQUEST', 'PAYMENT_CANCELED', 'SETTLEMENT_COMPLETED'].includes(type)) {
    return 'payment'
  }
  // 포인트 관련
  if (['POINT_CHARGE', 'PERSONAL_POINT_USE', 'POINT_CANCELED'].includes(type)) {
    return 'point'
  }
  // 그룹/모임 관련
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

    // Owner 그룹 관련
    case 'GROUP_POINT_USE':
      return '모임 포인트 사용'
    case 'GROUP_JOIN_REQUEST':
      return '모임 가입 요청'

    // Customer 포인트 관련
    case 'POINT_CHARGE':
      return '포인트 충전'
    case 'PERSONAL_POINT_USE':
      return '개인 포인트 사용'
    case 'POINT_CANCELED':
      return '포인트 사용 취소'

    // Customer 정산
    case 'SETTLEMENT_COMPLETED':
      return '정산 완료'

    // Customer 그룹 관련
    case 'GROUP_INVITE':
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
      return '💳'

    // Owner 그룹 관련
    case 'GROUP_POINT_USE':
    case 'GROUP_JOIN_REQUEST':
      return '👥'

    // Customer 포인트 관련
    case 'POINT_CHARGE':
    case 'PERSONAL_POINT_USE':
    case 'POINT_CANCELED':
      return '💰'

    // Customer 정산
    case 'SETTLEMENT_COMPLETED':
      return '📊'

    // Customer 그룹 관련
    case 'GROUP_INVITE':
    case 'GROUP_JOIN_ACCEPTED':
    case 'GROUP_JOIN_REJECTED':
    case 'GROUP_JOINED':
    case 'GROUP_LEADER_CHANGED':
    case 'MEMBER_EXPELLED':
    case 'GROUP_POINT_SHARED':
    case 'GROUP_LEFT':
    case 'GROUP_DISBANDED':
      return '👥'

    default:
      return '🔔'
  }
}