import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Trash2,
  Undo2
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../shared/api/axios';

const NotificationItem = React.memo(({ notif, getIcon, getStatusColor, onDelete }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 1]);
  const deleteOpacity = useTransform(x, [-100, -50], [1, 0]);
  const Icon = getIcon(notif.type);

  return (
    <div className="relative overflow-hidden rounded-[20px] mb-4">
      {/* Background Delete Action */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-8">
        <motion.div 
          style={{ opacity: deleteOpacity }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <Trash2 size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Delete</span>
        </motion.div>
      </div>

      {/* Foreground Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            onDelete(notif.id);
          }
        }}
        style={{ x }}
        className="bg-card rounded-[20px] p-6 border border-border shadow-sm flex gap-5 group hover:border-primary/20 transition-all relative z-10 cursor-grab active:cursor-grabbing"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${getStatusColor(notif.type)}`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h4 className="font-black text-base text-foreground uppercase tracking-tight leading-tight pt-1">{notif.title}</h4>
            <span className="text-[9px] font-black text-foreground/20 uppercase tracking-widest whitespace-nowrap mt-1">
              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-xs font-bold text-foreground/60 leading-relaxed">{notif.body}</p>
          <div className="flex items-center gap-4 mt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/60 px-3 py-1 bg-primary/5 rounded-lg">
                {notif.targetType === 'all' ? 'School Message' : 'Bus Alert'}
              </span>
              {notif.type === 'urgent' && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-500">
                  <AlertTriangle size={10} /> Urgent
                </span>
              )}
          </div>
        </div>
      </motion.div>
    </div>
  );
});

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await api.get(`/notifications/parent?t=${Date.now()}`);
      const fetchedNotifications = response.data.data;
      setNotifications(fetchedNotifications);
      
      if (fetchedNotifications && fetchedNotifications.length > 0) {
        localStorage.setItem('lastSeenNotificationId', fetchedNotifications[0].id);
      }
      
      // Clean up legacy local storage if it exists
      const userStr = localStorage.getItem('parent_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.removeItem(`dismissed_notifications_${user.id || 'guest'}`);
      }
      localStorage.removeItem('dismissed_notifications_global');
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Mark as read logic
    localStorage.removeItem('hasUnreadNotifications');
    window.dispatchEvent(new CustomEvent('read-notifications'));

    // Real-time automatic list reload when a new message arrives!
    const handleNewMessageIncoming = () => {
      fetchNotifications();
      // Keep unread state cleared since they are already viewing the notifications page
      localStorage.removeItem('hasUnreadNotifications');
      window.dispatchEvent(new CustomEvent('read-notifications'));
    };

    window.addEventListener('new-notification', handleNewMessageIncoming);

    return () => {
      window.removeEventListener('new-notification', handleNewMessageIncoming);
    };
  }, []);

  const handleDelete = async (id) => {
    const deletedNotification = notifications.find(n => n.id === id);
    if (!deletedNotification) return;

    // Optimistically remove from state immediately
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      await api.post('/notifications/dismiss', { notificationId: id });
    } catch (err) {
      console.error('[Notifications] Failed to persist dismissal to database:', err);
    }

    // CUSTOM PREMIUM UNDO TOAST
    toast.dismiss();
    toast.custom((t) => (
      <div 
        className="w-[90vw] max-w-[340px] bg-foreground backdrop-blur-2xl rounded-[28px] p-4 flex items-center justify-between shadow-2xl border border-white/10"
        onClick={() => toast.dismiss(t)}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
            <Trash2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-background leading-none">Dismissed</p>
            <p className="text-[9px] font-bold text-background/40 uppercase tracking-widest mt-1">Tap to close</p>
          </div>
        </div>
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            
            // Re-insert into state optimistically
            setNotifications(prev => {
              const exists = prev.some(n => n.id === deletedNotification.id);
              if (exists) return prev;
              const newList = [deletedNotification, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
              return newList;
            });
            
            try {
              await api.post('/notifications/undodismiss', { notificationId: id });
            } catch (err) {
              console.error('[Notifications] Failed to restore notification in database:', err);
              // If it failed to restore, remove it again
              setNotifications(prev => prev.filter(n => n.id !== id));
            }
            
            toast.dismiss(t);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary rounded-[18px] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          <Undo2 size={14} />
          Undo
        </button>
      </div>
    ), {
      duration: 4000,
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'urgent': return AlertTriangle;
      case 'delay': return Clock;
      case 'holiday': return Bell;
      default: return Bell;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'urgent': return 'text-red-500 bg-red-500/10';
      case 'delay': return 'text-blue-500 bg-blue-500/10';
      case 'holiday': return 'text-primary bg-primary/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  const filteredNotifications = notifications
    .filter(n => activeTab === 'all' || n.type === activeTab);

  return (
    <div className="matte-green-theme min-h-screen bg-transparent pb-32 relative overflow-hidden">
      
      {/* Premium Solid Floating Header with Flat Bus Illustration */}
      <div className="relative z-10 px-4 pt-5 pb-2">
        <div className="bg-white rounded-[28px] px-6 py-5 shadow-[0_8px_24px_-6px_rgba(136,176,75,0.15)] dark:shadow-none border border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[8.5px] font-black uppercase tracking-[0.2em] w-fit border border-primary/20">
              <Bell size={12} />
              Total ({filteredNotifications.length})
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none drop-shadow-sm mt-0.5">
              Notifications
            </h1>

            {/* Flat Road & Bus Illustration */}
            <div className="w-full h-[20px] mt-1 relative pointer-events-none select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0,15 L 300,15" fill="none" stroke="#88B04B" strokeWidth="2" strokeDasharray="5 3" className="opacity-40" />
                <g>
                  <style>{`
                    @keyframes flat-bus-entry {
                      0% { transform: translateX(-50px); }
                      30% { transform: translateX(60px); }
                      100% { transform: translateX(180px); }
                    }
                    @keyframes flat-bus-bounce {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-0.8px); }
                    }
                    .flat-bus-group { 
                      animation: flat-bus-entry 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
                    }
                    .flat-bus-body { animation: flat-bus-bounce 0.5s infinite linear; }
                  `}</style>
                  <g className="flat-bus-group" transform="translate(0, -2)">
                    <g className="flat-bus-body">
                      <rect x="0" y="2" width="22" height="12" rx="2.5" fill="#F8BC1C" />
                      <rect x="-1" y="10" width="1.5" height="3" rx="0.5" fill="#3D4042" />
                      <rect x="2" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="7" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="12" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="17" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="0" y="9" width="22" height="1" fill="#3D4042" />
                    </g>
                    <circle cx="5" cy="14" r="2.5" fill="#2B2B2B" />
                    <circle cx="5" cy="14" r="1" fill="#FAFBF6" />
                    <circle cx="17" cy="14" r="2.5" fill="#2B2B2B" />
                    <circle cx="17" cy="14" r="1" fill="#FAFBF6" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 mt-2 space-y-6 relative z-20">
        <div className="bg-card/75 backdrop-blur-md p-1 rounded-2xl border border-border flex w-full relative shadow-sm">
          {[
            { id: 'all', label: 'All' },
            { id: 'normal', label: 'General' },
            { id: 'delay', label: 'Bus' },
            { id: 'urgent', label: 'Urgent' },
            { id: 'holiday', label: 'Holiday' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 py-2.5 rounded-[12px] text-[8.5px] font-black uppercase tracking-wider transition-all whitespace-nowrap z-10 text-center ${
                  isActive 
                  ? 'text-white font-extrabold' 
                  : 'text-foreground/45 hover:text-foreground/60'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-primary rounded-[12px] shadow-sm shadow-primary/25 z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
              <RefreshCw className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">Checking Messages...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif) => (
                <motion.div
                  layout
                  key={notif.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -200, transition: { duration: 0.3 } }}
                >
                  <NotificationItem 
                    notif={notif}
                    getIcon={getIcon}
                    getStatusColor={getStatusColor}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-10 text-center">
              <div className="w-20 h-20 bg-muted rounded-[2.5rem] flex items-center justify-center text-foreground/10 mb-6">
                <Bell size={40} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-foreground/40 mb-2">No Messages</h3>
              <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                Stay tuned! New school news and bus updates will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
