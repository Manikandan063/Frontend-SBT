import React, { useEffect, useRef } from 'react';
import { onMessage, getMessagingInstance } from './firebase/firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from './config/routes';
import api from './shared/api/axios';

const NotificationHandler = () => {
  const navigate = useNavigate();
  const audioRef = useRef(new Audio('/sounds/notification.mp3'));

  useEffect(() => {
    // Helper to play sound
    const playNotificationSound = () => {
      try {
        const audio = audioRef.current;
        audio.currentTime = 0;
        audio.play().catch(e => console.warn('[Audio] Auto-play prevented by browser:', e));
      } catch (err) {
        console.warn('[Audio] Failed to play notification sound', err);
      }
    };

    // 1. Listen for Firebase Messages (Foreground)
    const setupListener = async () => {
      const messaging = await getMessagingInstance();
      if (!messaging) return;

      onMessage(messaging, (payload) => {
        const { title, body } = payload.notification;
        
        // Skip test or ignore messages
        if (/ignore|test/i.test(title || '') || /ignore|test/i.test(body || '')) {
          return;
        }

        // Play Sound
        playNotificationSound();

        // Trigger UI Dot
        localStorage.setItem('hasUnreadNotifications', 'true');
        window.dispatchEvent(new CustomEvent('new-notification'));

        // Removed intrusive toast popup
      });
    };

    setupListener();

    // 2. Initial/Periodic Check (Pull fallback)
    const checkServerForNewNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; // Don't check if not logged in

      try {
        const response = await api.get(`/notifications/parent?t=${Date.now()}`);
        const latestNotif = response.data.data[0];
        
        if (latestNotif) {
          const lastSeenId = localStorage.getItem('lastSeenNotificationId');
          
          // Check if this latest notification was already dismissed
          const user = JSON.parse(localStorage.getItem('parent_user') || localStorage.getItem('admin_user') || localStorage.getItem('user') || '{}');
          const dismissedKey = `dismissed_notifications_${user.id || 'guest'}`;
          const dismissedIds = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
          const globalDismissedIds = JSON.parse(localStorage.getItem('dismissed_notifications_global') || '[]');
          
          const isDismissed = dismissedIds.includes(latestNotif.id) || globalDismissedIds.includes(latestNotif.id);

          if (lastSeenId !== latestNotif.id && !isDismissed) {
            playNotificationSound(); // Play sound for pulled notification too
            localStorage.setItem('hasUnreadNotifications', 'true');
            window.dispatchEvent(new CustomEvent('new-notification'));
            
            // Skip test or ignore messages for toast alerts
            // Removed intrusive toast popup

            // Update lastSeenId so we don't spam the toast every 2 mins
            localStorage.setItem('lastSeenNotificationId', latestNotif.id);
          }
        }
      } catch (err) {
        console.error('[NotificationHandler] Background check failed:', err);
      }
    };

    // Run check on mount
    checkServerForNewNotifications();

    // Check again every 8 seconds while app is open
    const interval = setInterval(checkServerForNewNotifications, 8000);

    return () => clearInterval(interval);
  }, [navigate]);

  return null;
};

export default NotificationHandler;
