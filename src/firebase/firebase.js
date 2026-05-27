import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, isSupported } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging initialization with support check
let messaging = null;

// Initialize messaging only if supported (requires HTTPS or localhost)
const initMessaging = async () => {
  if (typeof window === 'undefined') return null;

  try {
    const supported = await isSupported();
    const hasServiceWorker = 'serviceWorker' in navigator;

    if (!supported || !hasServiceWorker) {
      return null;
    }

    // Manually register service worker with config as query params
    const configParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId
    }).toString();

    try {
      await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?${configParams}`,
        { scope: '/' }
      );
      
      messaging = getMessaging(app);
      return messaging;
    } catch (swError) {
      console.warn('[FCM] Service Worker registration failed:', swError.message);
      return null;
    }
  } catch (err) {
    // Avoid spamming error if it's just a support issue
    return null;
  }
};

// Async initialization export
export const getMessagingInstance = initMessaging;

const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, messaging, analytics, onMessage };
