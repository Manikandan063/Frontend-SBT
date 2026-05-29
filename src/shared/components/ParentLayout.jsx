import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { ROUTES } from '../../config/routes';
import api from '../api/axios';
import { toast } from 'sonner';

const ParentLayout = () => {
  const location = useLocation();
  const knownIdsRef = useRef(new Set());
  
  useEffect(() => {
    try {
      const stored = localStorage.getItem('knownNotificationIds');
      if (stored) knownIdsRef.current = new Set(JSON.parse(stored));
    } catch(e) {}

    const pollNotifications = async () => {
      try {
        const response = await api.get(`/notifications/parent?t=${Date.now()}`);
        const notifications = response.data.data || [];
        
        const getDismissedKey = () => {
          try {
            const user = JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user') || '{}');
            const userId = user.id || user.parent?.id || user.userId || 'guest';
            return `dismissed_notifications_${userId}`;
          } catch (e) {
            return 'dismissed_notifications_guest';
          }
        };
        const dismissed = new Set(JSON.parse(localStorage.getItem(getDismissedKey()) || '[]'));
        
        let newCount = 0;
        const currentKnown = knownIdsRef.current;
        
        notifications.forEach(n => {
          if (!dismissed.has(n.id) && !currentKnown.has(n.id)) {
            newCount++;
            currentKnown.add(n.id);
          }
        });
        
        if (newCount > 0) {
          localStorage.setItem('knownNotificationIds', JSON.stringify(Array.from(currentKnown)));
          
          if (location.pathname !== ROUTES.NOTIFICATIONS) {
             const currentUnread = parseInt(localStorage.getItem('unreadNotificationCount') || '0', 10);
             const newTotal = currentUnread + newCount;
             localStorage.setItem('unreadNotificationCount', newTotal.toString());
             
             window.dispatchEvent(new CustomEvent('new-notification', { detail: { count: newTotal } }));
             
             toast.success('New notification received', {
               description: `You have ${newTotal} unread message(s).`,
               duration: 4000
             });
          }
        }
      } catch (err) {
        console.error('[ParentLayout] Notification polling error:', err);
      }
    };

    pollNotifications();
    const interval = setInterval(pollNotifications, 15000);
    
    return () => clearInterval(interval);
  }, [location.pathname]);
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === ROUTES.DASHBOARD) return 'home';
    if (path === ROUTES.TRIPS) return 'trips';
    if (path === ROUTES.NOTIFICATIONS) return 'alerts';
    if (path === ROUTES.PROFILE) return 'profile';
    return null;
  };

  const activeTab = getActiveTab();
  const showNavbar = activeTab !== null;

  return (
    <div className="matte-green-theme min-h-screen">
      <motion.div
        className="min-h-screen bg-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
      {showNavbar && <BottomNavbar activeTab={activeTab} />}
    </div>
  );
};

export default ParentLayout;
