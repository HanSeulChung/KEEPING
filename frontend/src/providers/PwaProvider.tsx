'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  isPWA, 
  canInstallPWA, 
  installPWA, 
  requestNotificationPermission,
  getServiceWorkerRegistration 
} from '@/pwa/utils'

interface PWAContextType {
  isPWA: boolean
  canInstall: boolean
  installPrompt: () => Promise<boolean>
  notificationPermission: NotificationPermission
  requestNotification: () => Promise<NotificationPermission>
  swRegistration: ServiceWorkerRegistration | null
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export const usePWA = () => {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

export default function PWAProvider({ children }: PWAProviderProps) {
  const [canInstall, setCanInstall] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    const initializePWA = async () => {
      // Service Worker 등록 정보 가져오기
      const registration = await getServiceWorkerRegistration()
      setSwRegistration(registration)

      // 설치 가능 여부 확인
      const installable = await canInstallPWA()
      setCanInstall(installable)

      // 알림 권한 상태 확인
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission)
      }

      // beforeinstallprompt 이벤트 리스너
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        ;(window as any).deferredPrompt = e
        setCanInstall(true)
      }

      // appinstalled 이벤트 리스너
      const handleAppInstalled = () => {
        console.log('PWA가 설치되었습니다!')
        ;(window as any).deferredPrompt = null
        setCanInstall(false)
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    initializePWA()
  }, [])

  const installPrompt = async (): Promise<boolean> => {
    const result = await installPWA()
    if (result) {
      setCanInstall(false)
    }
    return result
  }

  const requestNotification = async (): Promise<NotificationPermission> => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
    return permission
  }

  const value: PWAContextType = {
    isPWA: isPWA(),
    canInstall,
    installPrompt,
    notificationPermission,
    requestNotification,
    swRegistration,
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}
