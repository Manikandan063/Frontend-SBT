import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ArrowRight, Check, ShieldCheck, MapPin } from 'lucide-react';
import { ROUTES } from '../../config/routes';
import { parentLogin } from '../../shared/api/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSessionConflictModal, setShowSessionConflictModal] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // If the user already has an active session, skip the login screen
    if (localStorage.getItem('token')) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Standardize session state by overwriting only necessary auth items
      await parentLogin(mobileNumber, password);
      
      // Integrate Firebase Notification Request (Non-blocking)
      import('../../firebase/getToken').then(async ({ requestNotificationPermission, syncFcmTokenWithBackend }) => {
        try {
          const token = await requestNotificationPermission();
          if (token) {
            await syncFcmTokenWithBackend(token);
          }
        } catch (fcmError) {
          console.error('[FCM] Setup failed in background:', fcmError.message);
        }
      }).catch(err => console.error('[FCM] Dynamic import failed:', err));

      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      console.error('Login failed:', err);
      
      if (err.response?.data?.code === 'ACTIVE_SESSION_EXISTS') {
        setConflictMessage(err.response.data.message);
        setShowSessionConflictModal(true);
        setLoading(false);
        return;
      }

      let errMsg = 'Invalid credentials. Please try again.';
      if (err.response?.data?.message) {
        const rawMessage = err.response.data.message;
        if (typeof rawMessage === 'string') {
          try {
            const parsed = JSON.parse(rawMessage);
            if (Array.isArray(parsed)) {
              errMsg = parsed.map(e => e.message || JSON.stringify(e)).join('\n');
            } else if (parsed && parsed.message) {
              errMsg = parsed.message;
            } else {
              errMsg = rawMessage;
            }
          } catch (e) {
            errMsg = rawMessage;
          }
        } else if (Array.isArray(rawMessage)) {
          errMsg = rawMessage.map(e => e.message || JSON.stringify(e)).join('\n');
        } else {
          errMsg = String(rawMessage);
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setShowSessionConflictModal(false);
    setLoading(true);
    setError('');
    
    try {
      await parentLogin(mobileNumber, password, true);
      
      // Integrate Firebase Notification Request (Non-blocking)
      import('../../firebase/getToken').then(async ({ requestNotificationPermission, syncFcmTokenWithBackend }) => {
        try {
          const token = await requestNotificationPermission();
          if (token) {
            await syncFcmTokenWithBackend(token);
          }
        } catch (fcmError) {
          console.error('[FCM] Setup failed in background:', fcmError.message);
        }
      }).catch(err => console.error('[FCM] Dynamic import failed:', err));

      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError('Force login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center font-['Outfit'] overflow-hidden relative bg-[#f8faf7] pt-12 sm:pt-20">
      
      {/* Immersive Full-Screen Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          src="/bus_parent.png" 
          alt="Full Background Illustration" 
          className="w-full h-full object-cover"
        />
        {/* Subtle protective overlay for text legibility */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="container max-w-6xl mx-auto px-6 relative z-10 flex items-start justify-center lg:justify-end">
        {/* Compact Premium White Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-[380px] bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden group"
        >
          {/* Top Branding Section - More Compact */}
          <div className="space-y-0.5 mb-6 text-center relative z-10">
            <h2 className="text-3xl font-black tracking-tighter leading-tight text-[#1a2e1a]">
              Welcome back
            </h2>
            <p className="text-xs font-bold text-slate-500/80 leading-relaxed">Stay connected with your child's journey.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 bg-red-50/90 border border-red-100 rounded-2xl flex flex-col gap-2 shadow-sm"
            >
              {error.split('\n').map((errLine, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0 animate-pulse" />
                  <p className="text-red-700 text-[10px] font-extrabold uppercase tracking-wider leading-relaxed">
                    {errLine.trim()}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div className="space-y-3.5">
              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#6B9E43] transition-colors">
                  <User size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Mobile Number"
                  className="w-full h-13 bg-[#f4f7f2] border-none rounded-xl pl-14 pr-6 text-sm font-bold text-[#1a2e1a] placeholder:text-slate-400 focus:ring-2 focus:ring-[#6B9E43]/20 transition-all outline-none"
                />
              </div>

              <div className="relative group/input">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-[#6B9E43] transition-colors">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full h-13 bg-[#f4f7f2] border-none rounded-xl pl-14 pr-14 text-sm font-bold text-[#1a2e1a] placeholder:text-slate-400 focus:ring-2 focus:ring-[#6B9E43]/20 transition-all outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#6B9E43] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end px-1">
              <button type="button" className="text-[10px] font-black text-[#6B9E43] hover:text-[#4F6D3F] transition-colors uppercase tracking-widest">
                RECOVERY?
              </button>
            </div>

            <motion.button
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#6B9E43] to-[#88B04B] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(107,158,67,0.3)] hover:shadow-[0_20px_40px_rgba(107,158,67,0.45)] border border-emerald-400/20 flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-70 group/btn relative overflow-hidden"
            >
              {/* Premium Shimmer Laser Sweep */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={isHovered ? { x: "250%" } : { x: "-100%" }}
                  transition={{
                    duration: 0.9,
                    ease: "easeInOut",
                  }}
                  style={{ width: "50%" }}
                />
              )}

              {loading ? (
                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin z-10" />
              ) : (
                <div className="flex items-center gap-3 z-10 select-none">
                  <span className="tracking-[0.25em]">LOGIN</span>
                  <ArrowRight 
                    size={18} 
                    strokeWidth={3} 
                    className="group-hover/btn:translate-x-1.5 transition-transform duration-300 ease-out" 
                  />
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Session Conflict Modal */}
      <AnimatePresence>
        {showSessionConflictModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSessionConflictModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto border border-red-100">
                <ShieldCheck size={32} className="text-red-500" />
              </div>
              
              <h3 className="text-2xl font-black text-center text-[#1a2e1a] mb-2">Active Session Detected</h3>
              <p className="text-sm font-bold text-center text-slate-500 mb-8 px-4 leading-relaxed">
                {conflictMessage || 'You are already logged in on another device.'}
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleForceLogin}
                  className="w-full py-4 bg-red-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                >
                  Logout Other Device & Continue
                </button>
                <button 
                  onClick={() => setShowSessionConflictModal(false)}
                  className="w-full py-4 bg-slate-100 text-slate-500 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginPage;
