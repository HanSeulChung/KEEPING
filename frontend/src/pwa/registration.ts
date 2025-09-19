// SW 등록/해제 유틸

export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    
    console.log('Service Worker 등록 완료:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker 등록 실패:', error)
    return null
  }
}

export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    
    await Promise.all(
      registrations.map(registration => registration.unregister())
    )
    
    console.log('Service Worker 해제 완료')
    return true
  } catch (error) {
    console.error('Service Worker 해제 실패:', error)
    return false
  }
}

export const getServiceWorkerState = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    
    if (registration.active) {
      return 'activated'
    } else if (registration.installing) {
      return 'installing'
    } else if (registration.waiting) {
      return 'waiting'
    }
    
    return 'unknown'
  } catch (error) {
    console.error('Service Worker 상태 확인 실패:', error)
    return null
  }
}