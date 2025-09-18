// 푸시 알림 관련 함수들

export interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
}

export const requestPushSubscription = async (): Promise<PushSubscription | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    if (!('PushManager' in window)) {
      console.log('Push messaging is not supported')
      return null
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    })

    console.log('Push subscription created:', subscription)
    return subscription
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription
  } catch (error) {
    console.error('Failed to get push subscription:', error)
    return null
  }
}

export const unsubscribePush = async (): Promise<boolean> => {
  try {
    const subscription = await getPushSubscription()
    if (subscription) {
      const result = await subscription.unsubscribe()
      console.log('Push unsubscription result:', result)
      return result
    }
    return true
  } catch (error) {
    console.error('Failed to unsubscribe from push:', error)
    return false
  }
}

export const sendPushNotification = async (data: NotificationData): Promise<void> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted')
    return
  }

  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon || '/icons/qr.png',
    badge: data.badge || '/icons/qr.png',
    tag: data.tag,
    data: data.data,
    actions: data.actions,
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false,
  }

  new Notification(data.title, options)
}

export const sendPushToServer = async (
  subscription: PushSubscription,
  data: NotificationData
): Promise<Response | null> => {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        notification: data,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error('Failed to send push notification to server:', error)
    return null
  }
}

export const registerPushSubscription = async (
  subscription: PushSubscription,
  userId?: string
): Promise<Response | null> => {
  try {
    const response = await fetch('/api/push/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error('Failed to register push subscription:', error)
    return null
  }
}
