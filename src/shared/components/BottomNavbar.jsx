import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Map, Bell, BellRing, User } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const playNotificationSound = () => {
  try {
    const isSoundEnabled = localStorage.getItem('notificationSoundEnabled') !== 'false';
    if (!isSoundEnabled) return;

    const audio = new Audio('/sounds/notification.mp3');
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Audio play blocked by browser, but badge will still update.', error);
      });
    }
  } catch (error) {
    console.warn('Audio fallback failed:', error);
  }
};

const BottomNavbar = ({ activeTab }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. Initial check
    const checkUnread = () => {
      const count = parseInt(localStorage.getItem('unreadNotificationCount') || '0', 10);
      setUnreadCount(count);
    };
    checkUnread();

    // 2. Listen for custom events
    const handleNewNotification = (e) => {
      setUnreadCount(e.detail?.count || parseInt(localStorage.getItem('unreadNotificationCount') || '0', 10));
      playNotificationSound();
    };
    const handleReadNotifications = () => {
      setUnreadCount(0);
      localStorage.setItem('unreadNotificationCount', '0');
    };

    window.addEventListener('new-notification', handleNewNotification);
    window.addEventListener('read-notifications', handleReadNotifications);
    window.addEventListener('storage', checkUnread);

    // Initial silent audio tap unlock (optional but good for mobile)
    const unlockAudio = () => {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.01;
        audio.play().then(() => {
          audio.pause();
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        }).catch(() => {});
      } catch (e) {}
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
      window.removeEventListener('read-notifications', handleReadNotifications);
      window.removeEventListener('storage', checkUnread);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  const tabs = [
    { id: 'home', icon: Home, label: t('home'), path: ROUTES.DASHBOARD },
    { id: 'trips', icon: Map, label: t('trips'), path: ROUTES.TRIPS },
    { id: 'alerts', icon: Bell, label: t('notifications'), path: ROUTES.NOTIFICATIONS },
    { id: 'profile', icon: User, label: t('profile'), path: ROUTES.PROFILE },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 px-6 pointer-events-none matte-green-theme">
      <div className="bg-card backdrop-blur-md border border-border rounded-[32px] p-2 flex items-center gap-1 w-full max-w-md shadow-lg pointer-events-auto transition-colors duration-300 will-change-transform">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const showDot = tab.id === 'alerts' && unreadCount > 0 && !isActive;
          const IconComponent = tab.id === 'alerts' && unreadCount > 0 ? BellRing : tab.icon;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate(tab.path)}
              className="relative flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[24px] transition-all duration-300 group outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-primary shadow-md shadow-primary/20"
                  transition={{ 
                    type: "spring", 
                    stiffness: 380, 
                    damping: 30,
                    mass: 1
                  }}
                  style={{ borderRadius: 24 }}
                />
              )}
              
              <motion.div 
                animate={showDot ? {
                  rotate: [0, -18, 15, -12, 8, -4, 0]
                } : {
                  scale: isActive ? 1.05 : 1,
                  y: isActive ? 0 : 0
                }}
                transition={showDot ? {
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeInOut"
                } : undefined}
                style={showDot ? { transformOrigin: 'top center' } : undefined}
                className="relative z-10"
              >
                <IconComponent 
                  size={20} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-foreground/30 group-hover:text-foreground/50'}`}
                />
                {tab.id === 'alerts' && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-card shadow-sm">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </motion.div>

            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BottomNavbar);
