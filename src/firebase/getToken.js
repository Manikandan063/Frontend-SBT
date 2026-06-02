import { getMessagingInstance } from './firebase';
import { getToken } from 'firebase/messaging';
import axios from 'axios';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const requestNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      try {
        if (!Capacitor.isPluginAvailable('PushNotifications')) {
          console.warn('[Capacitor] PushNotifications plugin not available. Skipping native push.');
          return null;
        }

        // Prevent duplicate registration on every reload
        const isRegistered = localStorage.getItem('cap_push_registered');

        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          try {
            permStatus = await PushNotifications.requestPermissions();
          } catch (permErr) {
            console.error('[Capacitor] requestPermissions exception:', permErr);
            return null;
          }
        }
        
        if (permStatus.receive !== 'granted') {
          console.warn('[Capacitor] User denied push notification permissions!');
          return null;
        }

        if (isRegistered) {
          console.log('[Capacitor] Already registered. Returning cached token if available.');
          return localStorage.getItem('fcmToken') || null;
        }

        try {
          await PushNotifications.removeAllListeners();
        } catch (e) {
          console.warn('[Capacitor] removeAllListeners error (ignoring):', e);
        }

        return await new Promise(async (resolve) => {
          let timeoutId = setTimeout(() => {
             console.warn('[Capacitor] Registration timed out.');
             resolve(null);
          }, 10000); // 10 second timeout

          try {
            await PushNotifications.addListener('registration', (token) => {
              clearTimeout(timeoutId);
              console.log('[Capacitor] Push registration success, token: ' + token.value);
              localStorage.setItem('fcmToken', token.value);
              localStorage.setItem('cap_push_registered', 'true');
              resolve(token.value);
            });

            await PushNotifications.addListener('registrationError', (error) => {
              clearTimeout(timeoutId);
              console.error('[Capacitor] Error on registration: ' + JSON.stringify(error));
              localStorage.removeItem('cap_push_registered');
              resolve(null);
            });

            // Register AFTER listeners are attached
            await PushNotifications.register();
          } catch (regErr) {
            clearTimeout(timeoutId);
            console.error('[Capacitor] Registration exception:', regErr);
            resolve(null);
          }
        });
      } catch (capErr) {
        console.error('[Capacitor] Push setup failed:', capErr);
        return null;
      }
    }

    // Web Firebase Logic
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
