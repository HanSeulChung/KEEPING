// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 앱 인스턴스 (지연 초기화)
let app: any = null;
let messaging: any = null;
let analytics: any = null;

// Firebase 초기화 함수 (브라우저에서만 실행)
const initializeFirebase = async () => {
  if (typeof window === 'undefined') {
    return { app: null, messaging: null, analytics: null };
  }

  try {
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getMessaging } = await import("firebase/messaging");
    const { getAnalytics } = await import("firebase/analytics");

    if (!app) {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApp();
      }
    }

    if (!messaging) {
      messaging = getMessaging(app);
    }

    if (!analytics) {
      analytics = getAnalytics(app);
    }

    return { app, messaging, analytics };
  } catch (error) {
    console.error('Firebase 초기화 실패:', error);
    return { app: null, messaging: null, analytics: null };
  }
};

// 지연 초기화된 Firebase 서비스들
export const getFirebaseApp = async () => {
  const { app } = await initializeFirebase();
  return app;
};

export const getFirebaseMessaging = async () => {
  const { messaging } = await initializeFirebase();
  return messaging;
};

export const getFirebaseAnalytics = async () => {
  const { analytics } = await initializeFirebase();
  return analytics;
};

// VAPID Key for FCM
const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY;

// FCM 토큰 발급 함수
export const getFcmToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    console.warn("브라우저 환경이 아님");
    return null;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("messaging이 초기화되지 않음");
      return null;
    }

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      console.log("FCM 토큰:", token);
      return token;
    } else {
      console.warn("토큰을 가져올 수 없음 ❌");
      return null;
    }
  } catch (err) {
    console.error("토큰 가져오기 실패:", err);
    return null;
  }
};

// 알림 권한 요청 함수
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn("브라우저가 알림을 지원하지 않음");
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("알림 권한 허용됨 ✅");
      return true;
    } else {
      console.warn("알림 권한 거부됨 ❌");
      return false;
    }
  } catch (error) {
    console.error("알림 권한 요청 실패:", error);
    return false;
  }
};

// 포그라운드 메시지 수신 처리 (SSE와 함께 사용)
export const setupForegroundMessageListener = async () => {
  if (typeof window === 'undefined') {
    console.warn("브라우저 환경이 아님");
    return;
  }

  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn("messaging이 초기화되지 않음");
      return;
    }

    const { onMessage } = await import("firebase/messaging");
    onMessage(messaging, (payload) => {
      console.log("포그라운드 메시지 수신:", payload);
      
      // 포그라운드에서는 SSE로 처리하므로 여기서는 로그만 출력
      // 필요시 추가 처리 로직 구현
    });
  } catch (error) {
    console.error("포그라운드 메시지 리스너 설정 실패:", error);
  }
};

export default app;
