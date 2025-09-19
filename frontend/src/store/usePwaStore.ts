import { create } from 'zustand'

interface PWAState {
  isInstalled: boolean
  canInstall: boolean
  notificationPermission: NotificationPermission
  pushSubscription: PushSubscription | null
  isOnline: boolean
  lastUpdateCheck: number | null
}

interface PWAActions {
  setInstalled: (installed: boolean) => void
  setCanInstall: (canInstall: boolean) => void
  setNotificationPermission: (permission: NotificationPermission) => void
  setPushSubscription: (subscription: PushSubscription | null) => void
  setOnlineStatus: (isOnline: boolean) => void
  setLastUpdateCheck: (timestamp: number) => void
  reset: () => void
}

const initialState: PWAState = {
  isInstalled: false,
  canInstall: false,
  notificationPermission: 'default',
  pushSubscription: null,
  isOnline: true,
  lastUpdateCheck: null,
}

export const usePwaStore = create<PWAState & PWAActions>((set) => ({
  ...initialState,

  setInstalled: (installed) => set({ isInstalled: installed }),
  setCanInstall: (canInstall) => set({ canInstall }),
  setNotificationPermission: (permission) => set({ notificationPermission: permission }),
  setPushSubscription: (subscription) => set({ pushSubscription: subscription }),
  setOnlineStatus: (isOnline) => set({ isOnline }),
  setLastUpdateCheck: (timestamp) => set({ lastUpdateCheck: timestamp }),
  
  reset: () => set(initialState),
}))
