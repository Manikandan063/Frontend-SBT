import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Map, Bell, BellRing, User } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

// Global audio context tracking and chime queue
let globalAudioCtx = null;
let chimeQueued = false;

const triggerChime = () => {
  if (!globalAudioCtx) return;
  try {
    const playPing = (time, frequency, duration, volume) => {
      const osc = globalAudioCtx.createOscillator();
      const gain = globalAudioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, time);
      
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      
      osc.connect(gain);
      gain.connect(globalAudioCtx.destination);
      
      osc.start(time);
      osc.stop(time + duration);
    };
    
    const now = globalAudioCtx.currentTime;
    // Elegant crystalline major chord chime (C5 -> E5 -> G5 -> C6)
    playPing(now, 523.25, 0.5, 0.08);       // C5
    playPing(now + 0.06, 659.25, 0.5, 0.07);  // E5
    playPing(now + 0.12, 783.99, 0.5, 0.06);  // G5
    playPing(now + 0.18, 1046.50, 0.7, 0.05); // C6 (sustained high octave chime)
    
    chimeQueued = false; // Reset queue
  } catch (err) {
    console.error('Triggering audio chime failed:', err);
  }
};

const unlockAudio = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioContext();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      globalAudioCtx.resume().then(() => {
        // If a chime was queued because of a reload, play it now that we are unlocked!
        if (chimeQueued) {
          triggerChime();
        }
      });
    } else {
      if (chimeQueued) {
        triggerChime();
      }
    }
    
    // Play a microscopic silent buffer to guarantee hardware activation on mobile/iOS Safari
    const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
    const source = globalAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioCtx.destination);
    source.start(0);
    
    // Remove listeners once successfully unlocked
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  } catch (e) {
    console.error('Failed to unlock audio context:', e);
  }
};

const playNotificationSound = () => {
  try {
    const isSoundEnabled = localStorage.getItem('notificationSoundEnabled') !== 'false';
    if (!isSoundEnabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!globalAudioCtx) {
      // Fallback in case gesture hasn't fired yet
      globalAudioCtx = new AudioContext();
    }
    
    if (globalAudioCtx.state === 'suspended') {
      // Audio is blocked/suspended (e.g. on fresh reload). Queue the sound!
      chimeQueued = true;
      return;
    }

    triggerChime();
  } catch (error) {
    console.error('Audio synthesis failed:', error);
  }
};

const BottomNavbar = ({ activeTab }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    // 1. Initial check
    const checkUnread = () => {
      const unread = localStorage.getItem('hasUnreadNotifications') === 'true';
      setHasUnread(unread);
    };
    checkUnread();

    // 2. Listen for custom events
    const handleNewNotification = () => {
      setHasUnread(true);
      playNotificationSound();
    };
    const handleReadNotifications = () => setHasUnread(false);

    window.addEventListener('new-notification', handleNewNotification);
    window.addEventListener('read-notifications', handleReadNotifications);
    
    // Also listen for storage changes (in case other tabs update it)
    window.addEventListener('storage', checkUnread);

    // 3. Autoplay policy bypass listeners (runs on user gesture)
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
          const showDot = tab.id === 'alerts' && hasUnread && !isActive;
          const IconComponent = tab.id === 'alerts' && hasUnread ? BellRing : tab.icon;

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
              </motion.div>

            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(BottomNavbar);
