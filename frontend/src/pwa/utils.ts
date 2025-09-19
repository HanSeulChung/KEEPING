// PWA 유틸리티 함수들

export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  )
}

export const isInstallable = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const deferredPrompt = (window as any).deferredPrompt
  return !!deferredPrompt
}

export const canInstallPWA = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  // PWA가 이미 설치되어 있는지 확인
  if (isPWA()) return false
  
  // Service Worker 지원 확인
  if (!('serviceWorker' in navigator)) return false
  
  // beforeinstallprompt 이벤트 지원 확인
  return new Promise((resolve) => {
    const checkInstallable = () => {
      const deferredPrompt = (window as any).deferredPrompt
      resolve(!!deferredPrompt)
    }
    
    // 이미 이벤트가 발생했을 수 있음
    checkInstallable()
    
    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', checkInstallable)
    
    // 3초 후 타임아웃
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', checkInstallable)
      resolve(false)
    }, 3000)
  })
}

export const installPWA = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  const deferredPrompt = (window as any).deferredPrompt
  if (!deferredPrompt) return false
  
  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA 설치 완료')
      return true
    } else {
      console.log('PWA 설치 취소됨')
      return false
    }
  } catch (error) {
    console.error('PWA 설치 중 오류:', error)
    return false
  } finally {
    (window as any).deferredPrompt = null
  }
}

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  
  if (Notification.permission === 'denied') {
    return 'denied'
  }
  
  const permission = await Notification.requestPermission()
  return permission
}

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/qr.png',
      badge: '/icons/qr.png',
      ...options,
    })
  }
}

export const getServiceWorkerRegistration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    return registration
  } catch (error) {
    console.error('Service Worker 등록 정보 가져오기 실패:', error)
    return null
  }
}

export const updateServiceWorker = async (): Promise<boolean> => {
  const registration = await getServiceWorkerRegistration()
  if (!registration) return false
  
  try {
    await registration.update()
    return true
  } catch (error) {
    console.error('Service Worker 업데이트 실패:', error)
    return false
  }
}
