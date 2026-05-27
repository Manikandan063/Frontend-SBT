import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  User,
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff,
  Building,
  Globe,
  CheckCircle2,
  Cpu,
  Bus,
  MapPin
} from 'lucide-react';
import { ROUTES } from '../../config/routes';
import api from '../api';

const AdminLogin = ({ type = 'SuperAdmin' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const isSuper = type === 'SuperAdmin';
  const roleName = isSuper ? 'Super Admin' : 'School Admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', formData);
      const { token, admin } = response.data;
      
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(admin));

      if (admin.role === 'superadmin') {
        navigate(ROUTES.SUPERADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.SCHOOLADMIN_DASHBOARD);
      }
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Authentication Failed: Invalid credentials';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-[#121212] font-['Outfit'] overflow-hidden relative">
      
      {/* Left curved panel */}
      <div 
        className="hidden lg:flex w-[55%] bg-[#0a110d] relative z-20 flex-col items-center justify-center shadow-2xl overflow-hidden"
        style={{ borderTopRightRadius: '300px 50%', borderBottomRightRadius: '300px 50%' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#8cb845_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03]"></div>

        <div className="relative w-full h-full flex flex-col items-center justify-center max-w-lg mx-auto z-10">
          
          {/* Main Container */}
          <div className="relative w-[500px] h-[500px] min-w-[500px] min-h-[500px] shrink-0 flex items-center justify-center">
            
            {/* Rotating Track */}
            <div 
              className="absolute inset-0 rounded-full border border-[#8cb845]/30 animate-spin"
              style={{
                animationDuration: '25s',
                animationDirection: 'reverse',
                animationPlayState: isHovered ? 'running' : 'paused'
              }}
            >
            
            {/* Small nodes on circle path */}
            <div className="absolute top-[12%] left-[18%] w-2.5 h-2.5 rounded-full bg-[#8cb845]"></div>
            <div className="absolute top-[22%] right-[8%] w-1.5 h-1.5 rounded-full bg-white"></div>
            <div className="absolute bottom-[18%] left-[12%] w-1 h-1 rounded-full bg-[#8cb845]/60"></div>

            {/* Floating Icons on Circle */}
            {/* Top Shield */}
            <div className="absolute -top-7 right-32 w-[60px] h-[60px] rounded-full bg-[#0a110d] border border-[#8cb845]/50 flex items-center justify-center text-[#8cb845] shadow-xl">
              <div
                className="animate-spin flex items-center justify-center w-full h-full"
                style={{
                  animationDuration: '25s',
                  animationPlayState: isHovered ? 'running' : 'paused'
                }}
              >
                <ShieldCheck size={26} strokeWidth={1.5} />
              </div>
            </div>

            {/* Left Map Pin */}
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 w-[72px] h-[72px] rounded-full bg-[#0a110d] border border-[#8cb845]/50 flex items-center justify-center text-[#8cb845] shadow-xl">
              <div
                className="animate-spin flex items-center justify-center w-full h-full"
                style={{
                  animationDuration: '25s',
                  animationPlayState: isHovered ? 'running' : 'paused'
                }}
              >
                <MapPin size={32} strokeWidth={1.5} />
              </div>
            </div>

            {/* Right Bus */}
            <div className="absolute bottom-20 -right-6 w-[60px] h-[60px] rounded-full bg-[#0a110d] border border-[#8cb845]/50 flex items-center justify-center text-[#8cb845] shadow-xl">
              <div
                className="animate-spin flex items-center justify-center w-full h-full"
                style={{
                  animationDuration: '25s',
                  animationPlayState: isHovered ? 'running' : 'paused'
                }}
              >
                <Bus size={26} strokeWidth={1.5} />
              </div>
            </div>
            </div>

            {/* Center Content */}
            <div className="flex flex-col items-center text-center mt-4 z-10 pointer-events-none">
              <Building size={56} className="text-[#8cb845] mb-6" strokeWidth={1.2} />
              
              <h1 className="text-[2.2rem] leading-none font-black tracking-widest text-white mb-1">
                SCHOOL BUS
              </h1>
              
              <h2 className="text-[3.8rem] leading-none font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#c4eb7e] via-[#8cb845] to-[#4d7319] mb-8">
                TRACKING
              </h2>
              
              <div className="flex items-center gap-4 mb-8 w-full justify-center">
                <div className="w-12 h-[1px] bg-[#8cb845]/40"></div>
                <p className="text-[10px] font-black tracking-[0.35em] text-white uppercase">
                  {roleName} LOGIN
                </p>
                <div className="w-12 h-[1px] bg-[#8cb845]/40"></div>
              </div>
              
              <p className="text-xs text-slate-400 font-medium tracking-wider leading-relaxed">
                Manage your school buses and <br/> track students safely.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#121212] z-10 relative">
        <div className="w-full max-w-[420px] ml-0 lg:-ml-10">
          
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 rounded-full bg-[#f2f7ec] flex items-center justify-center text-[#7ca33f] border-2 border-[#e6f0d8]">
              {isSuper ? <Globe size={28} /> : <Building size={28} />}
            </div>
            <div>
              <h2 className="text-4xl font-black text-[#1a2d18] dark:text-white">Sign In</h2>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-slate-300 uppercase mt-2">Enter your details to login</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type="email"
                  required
                  placeholder="admin@school.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full h-16 bg-[#fafcfa] border-2 border-[#f0f4ea] rounded-[1.25rem] pl-14 pr-4 text-sm font-bold text-[#1a2d18] placeholder:text-slate-400 outline-none focus:border-[#8cb845] focus:bg-white transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">Password</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} strokeWidth={2.5} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full h-16 bg-[#fafcfa] border-2 border-[#f0f4ea] rounded-[1.25rem] pl-14 pr-14 text-sm font-bold text-[#1a2d18] placeholder:text-slate-400 outline-none focus:border-[#8cb845] focus:bg-white transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-[6px] flex items-center justify-center border-2 transition-colors ${rememberMe ? 'bg-[#1a2d18] border-[#1a2d18]' : 'bg-[#fafcfa] border-[#e6f0d8] group-hover:border-[#8cb845]'}`}>
                  {rememberMe && <div className="w-2.5 h-2.5 bg-white rounded-[2px]" />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 dark:text-slate-300">Remember Me</span>
              </label>
              <button type="button" className="text-[10px] font-black uppercase tracking-[0.15em] text-[#8cb845] hover:text-[#1a2d18] dark:hover:text-white transition-colors">Forgot Password?</button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full h-16 mt-6 bg-[#1a2d18] text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#254022] transition-colors duration-300 shadow-[0_20px_40px_-10px_rgba(26,45,24,0.5)] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="tracking-[0.2em]">Sign In</span>
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-20 flex items-center justify-center gap-6 text-[9px] font-black tracking-widest text-slate-400 uppercase">
             <span>Secure Login</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             <span>Safe & Secure</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
