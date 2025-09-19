// PWA 관련 상수들
export const PWA_CACHE_NAME = 'keeping-v1'
export const PWA_CACHE_URLS = [
  '/',
  '/offline.html',
  '/icons/qr.png',
  '/fonts/NanumSquareNeo-bRg.ttf',
  '/fonts/Tenada.ttf',
]

// 캐시 전략
export const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
} as const

// 알림 관련 상수
export const NOTIFICATION_PERMISSION = {
  GRANTED: 'granted',
  DENIED: 'denied',
  DEFAULT: 'default',
} as const
