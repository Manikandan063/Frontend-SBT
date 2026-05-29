import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  HelpCircle, 
  Camera, 
  Pencil,
  ArrowRight,
  Shield,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { logout } from '../../shared/api/authService';
import api from '../../shared/api/axios';
import { useLanguage } from '../../shared/context/LanguageContext';
import { toast } from 'sonner';
import { getStudentImageUrl, handleImageError } from '../../shared/utils/imageUtils';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [parentInfo, setParentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  // Profile Edit Form States
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Collapsible Header Scroll State
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/parents/profile');
        const data = response.data.data;
        setParentInfo(data);
        setParentName(data?.parentName || '');
        setEmail(data?.email || '');
        setAddress(data?.address || '');
      } catch (err) {
        console.error('Failed to fetch parent profile:', err);
        toast.error('Could not load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.LOGIN);
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();
    setUpdating(true);
    try {
      const response = await api.patch('/parents/profile', {
        parentName,
        email,
        address,
        ...(password ? { password } : {})
      });
      if (response.data?.status === 'success') {
        const updatedParent = response.data.data;
        setParentInfo(updatedParent);
        setParentName(updatedParent.parentName || '');
        setEmail(updatedParent.email || '');
        setAddress(updatedParent.address || '');
        setPassword('');
        
        toast.success('Profile updated successfully!', {
          description: 'Your changes have been saved to your account.',
          duration: 3000,
        });
        setActiveModal(null);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Failed to update profile.', {
        description: err.response?.data?.message || 'Please check your inputs and try again.'
      });
    } finally {
      setUpdating(false);
    }
  };

  const menuItems = [
    { id: 'students', label: t('student_details'), icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Registered children and transit details' },
    { id: 'privacy', label: t('privacy'), icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Active encryption & account privacy settings' },
    { id: 'settings', label: t('app_settings'), icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50', path: ROUTES.SETTINGS, state: { section: 'general' }, desc: 'System languages and preferences' },
    { id: 'help', label: t('help'), icon: HelpCircle, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Emergency school contacts & support desk' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 font-['Outfit']">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="matte-green-theme min-h-screen bg-background pb-32 font-['Outfit'] relative overflow-x-hidden pt-[180px] flex flex-col items-center">
      
      {/* Elegant Curved Collapsible Top Banner Card Container (Centered and aligned with global layout) */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <motion.div 
          animate={{ height: isScrolled ? 72 : 180 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{ pointerEvents: 'auto' }}
          className="w-full max-w-md bg-background/95 backdrop-blur-md overflow-hidden select-none border-b border-border shadow-sm relative animate-none"
        >
          {/* Illustrative 3D Green Hill Landscape SVG (Fades out when minimized) */}
          <motion.div 
            animate={{ opacity: isScrolled ? 0 : 1, y: isScrolled ? 10 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 inset-x-0 h-[45px] w-full pointer-events-none select-none z-0"
          >
            <svg className="w-full h-full" viewBox="0 0 375 45" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="profile-hill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#A2C765" />
                  <stop offset="100%" stopColor="#88B04B" />
                </linearGradient>
              </defs>

              {/* Background Hill (slight contrast) */}
              <path d="M -20,45 L -20,28 C 100,14 280,24 395,30 L 395,45 Z" fill="#98BE5C" className="opacity-40" />

              {/* Foreground Main Curved Hill */}
              <path d="M -20,45 L -20,31 C 100,16 275,20 395,32 L 395,45 Z" fill="url(#profile-hill-gradient)" />

              {/* Road White Lane Dash Line along the hill curve */}
              <path 
                d="M -20,32 C 100,17 275,21 395,33" 
                fill="none" 
                stroke="#FAFBF6" 
                strokeWidth="1.2" 
                strokeDasharray="3 2.5" 
                className="opacity-60" 
              />

              {/* Cute 3D Trees on the hill (Scaled down to fit 45px height!) */}
              {/* Tree 1: Left */}
              <g transform="translate(30, 20) scale(0.55)">
                <rect x="-0.8" y="7" width="1.6" height="10" fill="#755139" />
                <circle cx="0" cy="7" r="7" fill="#7FA442" />
                <circle cx="-2.5" cy="5.5" r="4.5" fill="#8BB34C" />
              </g>

              {/* Tree 2: Center Left */}
              <g transform="translate(68, 16) scale(0.5)">
                <rect x="-0.75" y="6" width="1.5" height="9" fill="#755139" />
                <circle cx="0" cy="6" r="6" fill="#7FA442" />
                <circle cx="-2" cy="4" r="4.5" fill="#8BB34C" />
              </g>

              {/* Tree 3: Center */}
              <g transform="translate(155, 14) scale(0.55)">
                <rect x="-0.8" y="7" width="1.6" height="10" fill="#755139" />
                <circle cx="0" cy="7" r="7.5" fill="#7FA442" />
                <circle cx="-3" cy="5" r="5" fill="#8BB34C" />
              </g>

              {/* Tree 4: Right */}
              <g transform="translate(330, 24) scale(0.55)">
                <rect x="-0.8" y="6.5" width="1.6" height="9.5" fill="#755139" />
                <circle cx="0" cy="6.5" r="6.5" fill="#7FA442" />
                <circle cx="-2" cy="4.5" r="4.5" fill="#8BB34C" />
              </g>

              {/* Tree 5: Far Right */}
              <g transform="translate(360, 20) scale(0.5)">
                <rect x="-0.75" y="6" width="1.5" height="8.5" fill="#755139" />
                <circle cx="0" cy="6" r="5.5" fill="#7FA442" />
                <circle cx="-1.8" cy="4" r="4" fill="#8BB34C" />
              </g>

              {/* Animated/Responsive Yellow School Bus driving up the hill (Scaled down to scale(0.65)!) */}
              <g transform="scale(0.65)">
                <style>{`
                  @keyframes profile-bus-entry {
                    0% { transform: translate(-100px, 40px) rotate(-6deg); }
                    30% { transform: translate(50px, 20px) rotate(-2deg); }
                    100% { transform: translate(220px, 15px) rotate(4.2deg); }
                  }
                  @keyframes profile-bus-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-0.8px); }
                  }
                  .profile-bus-group {
                    animation: profile-bus-entry 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                  }
                  .profile-yellow-bus-body {
                    animation: profile-bus-bounce 0.5s infinite linear;
                  }
                `}</style>
                <g className="profile-bus-group">
                  <g className="profile-yellow-bus-body">
                  {/* Bus Yellow Main Shell */}
                  <rect x="0" y="2" width="26" height="14" rx="3" fill="#F8BC1C" />
                  {/* Bus Back Bumper */}
                  <rect x="-1" y="11" width="2" height="4" rx="0.5" fill="#3D4042" />
                  {/* Bus Glass Windows */}
                  <rect x="2" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="8" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="14" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="20" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  {/* Black Stripe */}
                  <rect x="0" y="10" width="26" height="1" fill="#3D4042" />
                </g>
                {/* Wheels */}
                <circle cx="6" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="6" cy="16" r="1.2" fill="#FAFBF6" />
                <circle cx="20" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="20" cy="16" r="1.2" fill="#FAFBF6" />
                </g>
              </g>
            </svg>
          </motion.div>
          
          {/* EXPANDED COLUMN CONTENT: Fades out and slides up when scrolling down */}
          <motion.div 
            animate={{ 
              opacity: isScrolled ? 0 : 1, 
              y: isScrolled ? -20 : 0,
              scale: isScrolled ? 0.9 : 1
            }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ pointerEvents: isScrolled ? 'none' : 'auto' }}
            className="flex flex-col items-center text-center relative z-10 pt-4 pb-4"
          >
            {/* Elegant Circular Avatar with soft pulsing active indicator */}
            <div className="relative mb-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveModal('edit')}
                className="w-20 h-20 rounded-full bg-card p-1 border border-border shadow relative overflow-hidden group cursor-pointer"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${parentInfo?.parentName || 'P'}&background=88B04B&color=fff&size=150`} 
                  alt="Parent Avatar" 
                  className="w-full h-full object-cover rounded-full" 
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera size={18} className="text-white" />
                </div>
              </motion.div>
              
              {/* Soft active green indicator dot */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-background flex items-center justify-center shadow-md">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none">
                {parentInfo?.parentName || 'Ravisankar'}
              </h2>
              <p className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mt-2 bg-foreground/[0.04] px-3 py-1 rounded-full inline-block">
                Parent ID: {parentInfo?.id?.substring(0, 8).toUpperCase() || 'P-24082'}
              </p>
            </div>
          </motion.div>

          {/* COLLAPSED STICKY BAR CONTENT: Fades in and slides down when scrolling down */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ 
              opacity: isScrolled ? 1 : 0, 
              y: isScrolled ? 0 : 15 
            }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            style={{ pointerEvents: isScrolled ? 'auto' : 'none' }}
            className="absolute inset-0 px-6 flex items-center justify-between z-20 h-[72px]"
          >
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveModal('edit')}
                className="w-10 h-10 rounded-full bg-card p-0.5 border border-border shadow-sm overflow-hidden group cursor-pointer relative"
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${parentInfo?.parentName || 'P'}&background=88B04B&color=fff&size=80`} 
                  alt="Parent Avatar" 
                  className="w-full h-full object-cover rounded-full" 
                />
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                  <Camera size={10} className="text-white" />
                </div>
              </motion.div>
              <div className="flex flex-col text-left">
                <h2 className="text-sm font-black uppercase tracking-tight text-foreground leading-none">
                  {parentInfo?.parentName || 'Ravisankar'}
                </h2>
                <span className="text-[8px] font-bold text-foreground/45 uppercase tracking-widest mt-1">
                  Parent Profile
                </span>
              </div>
            </div>
            
            <div className="px-2.5 py-1 bg-foreground/[0.04] rounded-lg border border-foreground/[0.04]">
              <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">
                ID: {parentInfo?.id?.substring(0, 8).toUpperCase() || 'P-24082'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <div className="w-full max-w-md px-6 space-y-6 mt-8 relative z-10">
        
        {/* Clean Unified Contact Details Glass Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/70 backdrop-blur-xl rounded-[28px] border border-border p-5 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-foreground/5">
            <span className="text-[9.5px] font-black uppercase text-foreground/35 tracking-widest">{t('personal_details')}</span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
              <CheckCircle2 size={10} className="text-primary" />
              <span className="text-[8px] font-black text-primary uppercase tracking-wider leading-none">Authorized</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                <Phone size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-foreground/35 uppercase tracking-widest leading-none">{t('mobile_number')}</p>
                <p className="text-foreground font-bold text-sm mt-1">{parentInfo?.mobileNumber || '+91 98765 43210'}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                <Mail size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-foreground/35 uppercase tracking-widest leading-none">{t('email_address')}</p>
                <p className="text-foreground font-bold text-sm mt-1 truncate">{parentInfo?.email || 'ravi@xtown.com'}</p>
              </div>
            </div>

            {/* Residential Address */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                <MapPin size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-black text-foreground/35 uppercase tracking-widest leading-none">{t('residential_address')}</p>
                <p className="text-foreground font-bold text-sm mt-1 truncate">{parentInfo?.address || 'Peelamedu, Coimbatore'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minimal Control Center - Action Stack */}
        <div className="space-y-3">
          <span className="text-[9.5px] font-black uppercase text-foreground/35 tracking-widest ml-2 block">{t('control_center')}</span>
          
          <div className="bg-card/70 backdrop-blur-xl rounded-[28px] border border-border p-2 space-y-1.5 shadow-sm">
            {menuItems.map((item, idx) => (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.99, x: 2 }}
                onClick={() => {
                  if (item.path) {
                    navigate(item.path, { state: item.state });
                  } else {
                    setActiveModal(item.id);
                  }
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-foreground/[0.03] transition-all rounded-2xl group text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center shrink-0 shadow-inner`}>
                    <item.icon size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-foreground font-extrabold text-sm block leading-none">{item.label}</span>
                    <span className="text-[8.5px] font-bold text-foreground/35 uppercase tracking-wider mt-1 block leading-none truncate">{item.desc}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-350 shrink-0 group-hover:text-primary transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quiet Minimal Logout Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full py-4.5 bg-card/70 backdrop-blur-xl text-foreground font-extrabold rounded-[28px] flex items-center justify-center gap-2.5 border border-border transition-all uppercase tracking-[0.2em] text-[10px] hover:border-red-500/20 hover:text-red-500 shadow-sm"
        >
          <LogOut size={16} className="text-red-500" />
          {t('logout')}
        </motion.button>
      </div>

      {/* Elegant Slide-Up Minimal Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6 sm:items-center sm:p-0">
            {/* Blurred Glass Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-lg"
            />
            
            {/* Sheet Container */}
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 210 }}
              className="bg-card backdrop-blur-2xl rounded-[36px] p-6.5 w-full max-w-md relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.25)] border border-border"
            >
              {/* Decorative top drag bar */}
              <div className="w-10 h-1 bg-foreground/10 rounded-full mx-auto mb-5" />

              <div className="flex justify-between items-center mb-5 pb-3 border-b border-foreground/5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <h3 className="text-base font-black uppercase tracking-widest text-foreground">
                    {activeModal === 'students' ? 'Student Profiles' : 
                     activeModal === 'privacy' ? 'Privacy Vault' : 
                     activeModal === 'edit' ? 'Update Details' : 'Support Center'}
                  </h3>
                </div>
                
                <button 
                  onClick={() => setActiveModal(null)} 
                  className="w-7 h-7 bg-foreground/5 rounded-full flex items-center justify-center text-foreground/40 hover:text-red-500 transition-colors"
                >
                  <LogOut size={13} className="rotate-90" />
                </button>
              </div>

              {/* MODAL 1: EDIT PROFILE */}
              {activeModal === 'edit' && (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-3.5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-foreground/45 ml-1">Full Name</label>
                      <input 
                        type="text" 
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                        disabled={updating}
                        className="w-full h-12 bg-foreground/[0.02] border border-border rounded-xl px-4.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Parent Name"
                      />
                    </div>

                    {/* Email Read-Only */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-foreground/30 ml-1">Email Address (Secure)</label>
                      <div className="w-full h-12 bg-foreground/[0.01] border border-dashed border-border rounded-xl px-4.5 flex items-center text-sm font-bold text-foreground/40 cursor-not-allowed truncate">
                        {parentInfo?.email || 'yourname@domain.com'}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-foreground/45 ml-1">Residential Address</label>
                      <input 
                        type="text" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        disabled={updating}
                        className="w-full h-12 bg-foreground/[0.02] border border-border rounded-xl px-4.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Coimbatore, Tamil Nadu"
                      />
                    </div>

                    {/* Phone Number Read-Only */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-foreground/30 ml-1">Registered Phone (Secure)</label>
                      <div className="w-full h-12 bg-foreground/[0.01] border border-dashed border-border rounded-xl px-4.5 flex items-center text-sm font-bold text-foreground/40 cursor-not-allowed">
                        {parentInfo?.mobileNumber || '+91 98765 43210'}
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-black uppercase tracking-widest text-foreground/45 ml-1">New Password (Optional)</label>
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={updating}
                        className="w-full h-12 bg-foreground/[0.02] border border-border rounded-xl px-4.5 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={updating}
                    className="w-full h-13 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-md shadow-primary/10 flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                  >
                    {updating ? (
                      <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Save Changes</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </motion.button>
                </form>
              )}

              {/* MODAL 2: STUDENT DETAILS */}
              {activeModal === 'students' && (
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto no-scrollbar">
                  {parentInfo?.children?.map((child, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3.5 bg-foreground/[0.02] rounded-2xl border border-border shadow-sm">
                      <div className="w-13 h-13 rounded-xl overflow-hidden shadow-inner border border-primary/20 shrink-0">
                        <img 
                          src={getStudentImageUrl(child.profilePhoto, child.studentName)} 
                          alt="" 
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e, child.studentName)}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-foreground text-sm uppercase leading-tight truncate">{child.studentName}</h4>
                        <p className="text-[8.5px] font-bold text-foreground/40 uppercase tracking-wider mt-1 truncate">{child.school?.schoolName || 'Main Campus'}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                           <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[8px] font-black uppercase leading-none">Bus: {child.bus?.busNumber || 'T-02'}</div>
                           <div className="px-2 py-0.5 bg-foreground/5 text-foreground/50 rounded-md text-[8px] font-black uppercase leading-none">Class: {child.class}-{child.section}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODAL 3: PRIVACY VAULT */}
              {activeModal === 'privacy' && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-5 rounded-[28px] border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-inner shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground leading-none">Privacy & Security</h4>
                      <p className="text-[9px] font-bold text-foreground/30 uppercase mt-1.5">End-to-End Encrypted</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 px-2 text-left">
                    <p className="text-xs font-bold text-foreground/70 leading-relaxed">
                      Your privacy and data security are our top priorities. All real-time GPS tracking data is encrypted using military-grade AES-256 encryption.
                    </p>
                    <p className="text-xs font-bold text-foreground/70 leading-relaxed">
                      We strictly comply with global data protection regulations to ensure that your child's transit information is never compromised, sold, or shared with unauthorized third parties.
                    </p>
                  </div>

                  <div className="bg-foreground/[0.02] border border-border p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/60">Biometric Login</span>
                      <div className="w-8 h-4.5 bg-primary/20 border border-primary/30 rounded-full p-[2px] flex items-center justify-end cursor-pointer">
                        <div className="w-3.5 h-3.5 bg-primary rounded-full" />
                      </div>
                    </div>
                    <div className="h-px bg-border w-full" />
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-foreground/60">Location Privacy Mode</span>
                      <div className="w-8 h-4.5 bg-foreground/10 border border-foreground/20 rounded-full p-[2px] flex items-center justify-start cursor-pointer">
                        <div className="w-3.5 h-3.5 bg-slate-300 rounded-full" />
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4.5 bg-foreground text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] mt-4 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Close Settings
                  </button>
                </div>
              )}

              {/* MODAL 4: HELP DESK */}
              {activeModal === 'help' && (
                <div className="space-y-6">
                  <div className="bg-primary/5 p-5 rounded-[28px] border border-primary/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-inner shrink-0">
                      <HelpCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground leading-none">Help & Support</h4>
                      <p className="text-[9px] font-bold text-foreground/30 uppercase mt-1.5">24/7 Assistance</p>
                    </div>
                  </div>

                  <div className="space-y-4 px-2 text-left">
                    <p className="text-xs font-bold text-foreground/70 leading-relaxed">
                      Need assistance? Our dedicated support team is available 24/7 to help you with real-time bus tracking, route information, or technical issues.
                    </p>
                  </div>
                  
                  <div className="bg-foreground/[0.02] border border-border p-4 rounded-2xl space-y-3">
                    <motion.a 
                      href="tel:+919876543210"
                      whileTap={{ scale: 0.98 }}
                      className="flex justify-between items-center group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                          <Phone size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">Call Helpline</span>
                      </div>
                      <ChevronRight size={14} className="text-foreground/20 group-hover:text-primary transition-colors" />
                    </motion.a>
                    
                    <div className="h-px bg-border w-full" />
                    
                    <motion.a 
                      href="mailto:support@xtown.in"
                      whileTap={{ scale: 0.98 }}
                      className="flex justify-between items-center group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                          <Mail size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">Email Support</span>
                      </div>
                      <ChevronRight size={14} className="text-foreground/20 group-hover:text-primary transition-colors" />
                    </motion.a>
                    
                    <div className="h-px bg-border w-full" />
                    
                    <motion.div 
                      whileTap={{ scale: 0.98 }}
                      className="flex justify-between items-center group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                          <HelpCircle size={14} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">FAQs & Guide</span>
                      </div>
                      <ChevronRight size={14} className="text-foreground/20 group-hover:text-primary transition-colors" />
                    </motion.div>
                  </div>

                  <button 
                    onClick={() => setActiveModal(null)}
                    className="w-full py-4.5 bg-foreground text-white rounded-[20px] font-black uppercase tracking-widest text-[10px] mt-4 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    Close Support
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
