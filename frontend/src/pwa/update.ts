// 새 버전 감지/적용

export const checkForUpdates = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    return true
  } catch (error) {
    console.error('업데이트 확인 중 오류:', error)
    return false
  }
}

export const applyUpdate = async (): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    
    if (registration.waiting) {
      // 새 Service Worker가 대기 중이면 즉시 활성화
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  } catch (error) {
    console.error('업데이트 적용 중 오류:', error)
  }
}

export const registerUpdateListener = (callback: () => void): void => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }
  
  navigator.serviceWorker.addEventListener('controllerchange', callback)
}