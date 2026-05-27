import { getMessagingInstance } from './firebase';
import { getToken } from 'firebase/messaging';
import axios from 'axios';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async () => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null; // Silence redundant warning, already handled in firebase.js init

    console.log('[Firebase] Requesting permission...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('[Firebase] Notification permission granted.');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (token) {
        console.log('[Firebase] FCM Token:', token);
        // Store in localStorage for easy access
        localStorage.setItem('fcmToken', token);
        return token;
      } else {
        console.warn('[Firebase] No registration token available. Request permission to generate one.');
      }
    } else {
      console.warn('[Firebase] Unable to get permission to notify.');
    }
  } catch (error) {
    console.error('[Firebase] An error occurred while retrieving token:', error);
  }
  return null;
};

/**
 * Send the token to the backend server
 */
export const syncFcmTokenWithBackend = async (token) => {
  try {
    const apiBase = import.meta.env.VITE_API_URL;
    const jwtToken = localStorage.getItem('token'); // Adjust based on your auth storage

    if (!jwtToken || !token) return;

    await axios.patch(`${apiBase}/parents/fcm-token`, 
      { fcmToken: token },
      { headers: { Authorization: `Bearer ${jwtToken}` } }
    );
    console.log('[Firebase] FCM token synced with backend');
  } catch (error) {
    console.error('[Firebase] Failed to sync FCM token:', error.message);
  }
};
