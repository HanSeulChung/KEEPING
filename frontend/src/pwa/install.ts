// 앱 설치 배너 제어

export const installApp = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  const deferredPrompt = (window as any).deferredPrompt
  if (!deferredPrompt) return false
  
  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    return outcome === 'accepted'
  } catch (error) {
    console.error('앱 설치 중 오류:', error)
    return false
  } finally {
    (window as any).deferredPrompt = null
  }
}

export const showInstallBanner = (): boolean => {
  if (typeof window === 'undefined') return false
  return !!(window as any).deferredPrompt
}