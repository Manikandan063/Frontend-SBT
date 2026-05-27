import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  LogOut, 
  Sun, 
  Moon,
  Bell,
  Search,
  User,
  Bus,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = ({ children, menuItems, role = 'Admin' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState(() => localStorage.getItem('school_logo') || null);
  const fileInputRef = React.useRef(null);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result);
        localStorage.setItem('school_logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    const role = user?.role || JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user'))?.role;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    // Also clean legacy keys just in case
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (role === 'superadmin') {
      navigate('/superadmin/login');
    } else if (role === 'school_admin') {
      navigate('/schooladmin/login');
    } else {
      navigate('/');
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-section')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  React.useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user'));
        if (!storedUser || storedUser.role === 'parent') {
          // Do not clear storage, just navigate to appropriate login
          navigate('/');
          return;
        }
        
        // Role-based route protection
        if (storedUser.role === 'school_admin' && location.pathname.startsWith('/superadmin')) {
          navigate('/schooladmin/dashboard', { replace: true });
          return;
        }
        if (storedUser.role === 'superadmin' && location.pathname.startsWith('/schooladmin')) {
          navigate('/superadmin/dashboard', { replace: true });
          return;
        }
        
        setUser(storedUser);
      } catch (e) {
        localStorage.removeItem('admin_user');
        localStorage.removeItem('admin_token');
        navigate('/');
      }
    };
    
    loadUser();

    window.addEventListener('user-updated', loadUser);
    return () => window.removeEventListener('user-updated', loadUser);
  }, [navigate, location.pathname]);

  return (
    <div className="h-screen w-full bg-[#1a2e1a] flex overflow-hidden font-['Outfit',sans-serif]">
      {/* Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col bg-[#1a2e1a] text-white z-50 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'w-[100px]' : 'w-[260px]'}`}>
        <div className="relative bg-[#1e331e] pt-8 pb-8 px-6 mb-6 rounded-br-[50px] shadow-md border-b border-r border-white/5">
           <div className={`relative z-10 flex items-center ${isCollapsed ? 'justify-center pr-0' : 'gap-3'}`}>
             <div className="relative group cursor-pointer" onClick={() => {
                 if (isCollapsed) setIsCollapsed(false);
                 else fileInputRef.current?.click();
               }}>
               <div className="w-12 h-12 bg-[#88B04B] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(136,176,75,0.2)] hover:scale-105 active:scale-95 transition-transform overflow-hidden">
                 {schoolLogo ? (
                   <img src={schoolLogo} alt="School Logo" className="w-full h-full object-cover" />
                 ) : (
                   <Bus size={24} className="text-[#1a2e1a]" />
                 )}
               </div>
               <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[8px] font-bold text-white uppercase text-center leading-tight">Set<br/>Icon</span>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleLogoUpload} 
                 accept="image/*" 
                 className="hidden" 
               />
             </div>
             {!isCollapsed && (
             <div className="overflow-hidden whitespace-nowrap flex-1" onClick={() => setIsCollapsed(true)}>
                <h2 className="text-sm font-black text-white tracking-tight truncate cursor-pointer hover:text-emerald-400 transition-colors" title={user?.school?.schoolName || user?.school_name || (role === 'Super Admin' ? 'SBT GLOBAL ADMIN' : 'School')}>
                  {user?.school?.schoolName || user?.school_name || (role === 'Super Admin' ? 'SBT GLOBAL ADMIN' : 'School')}
                </h2>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                  {role === 'Super Admin' ? 'Super Admin' : 'School Admin'}
                </p>
             </div>
             )}
           </div>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto no-scrollbar overflow-x-hidden px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center h-14 relative transition-all duration-300 rounded-2xl ${isCollapsed ? 'justify-center w-14 mx-auto' : 'justify-start pl-4'} ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 bg-gradient-to-br from-[#88B04B] to-[#5a7a30] rounded-2xl z-0 shadow-[0_4px_15px_rgba(136,176,75,0.4)] border border-[#88B04B]/30"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <div className={`relative z-10 flex items-center justify-center ${isCollapsed ? '' : 'w-8'}`}>
                  <item.icon size={isActive ? 22 : 20} className="transition-all duration-300" />
                </div>
                
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }} 
                      className="relative z-10 font-bold text-[14px] whitespace-nowrap ml-3"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout} 
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3 rounded-2xl' : 'justify-start gap-3 py-3.5 px-4 rounded-2xl'} bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-bold text-sm group shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_4px_15px_rgba(239,68,68,0.3)]`}
          >
            <LogOut size={20} className={!isCollapsed ? 'group-hover:-translate-x-1 transition-transform' : ''} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#1a2e1a] relative">
        
        {/* Header */}
        <header className="h-16 md:h-[80px] flex items-center justify-between px-4 md:px-6 bg-[#1a2e1a] text-white z-40 shrink-0 sticky top-0">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
             {/* Mobile Menu Button */}
             <button 
               onClick={() => setIsMobileMenuOpen(true)}
               className="md:hidden w-10 h-10 shrink-0 flex items-center justify-center bg-white/5 border border-white/10 text-white rounded-xl shadow-sm hover:bg-white/10 active:scale-90 transition-all duration-300"
             >
                <Menu size={20} />
             </button>

             <div className="flex items-center gap-3 flex-1 min-w-0">
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0 ml-2 md:ml-4">
             <button onClick={toggleTheme} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all shrink-0">
                {!isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
             </button>
             
             <button 
               onClick={() => navigate(role === 'Super Admin' ? '/superadmin/dashboard' : '/schooladmin/notifications')}
               className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all shrink-0"
             >
                <Bell size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a2e1a]" />
             </button>
             
             <div className="h-6 w-px bg-white/10 mx-1 md:mx-2 hidden sm:block" />
             
             <div className="relative z-[70] profile-section">
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
                >
                   <div className="text-right hidden lg:block">
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-wide leading-none mb-1">{role}</p>
                      <p className="text-xs font-black text-white leading-none">{user?.name || 'Administrator'}</p>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground/50 overflow-hidden shrink-0">
                      {user?.profilePicture ? (
                        <img src={user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=88B04B&color=fff`} className="w-full h-full object-cover" />
                      )}
                   </div>
                   <ChevronDown size={14} className="text-white/50 hidden sm:block" />
                </button>

                <AnimatePresence>
                   {isProfileOpen && (
                     <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsProfileOpen(false)}
                          className="fixed inset-0 z-[150]"
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-4 w-64 bg-card border border-border rounded-2xl shadow-xl z-[200] overflow-hidden"
                        >
                           <div className="px-5 py-4 border-b border-border bg-muted/30">
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{role}</p>
                              <p className="text-sm font-black text-foreground truncate">{user?.name || 'Administrator'}</p>
                              <p className="text-[11px] font-bold text-foreground/50 truncate mt-0.5">{user?.email || 'admin@school.com'}</p>
                           </div>
                           <div className="p-3">
                              <button 
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors"
                              >
                                 <LogOut size={16} />
                                 Sign Out
                              </button>
                           </div>
                        </motion.div>
                     </>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </header>

        {/* Page Content Area */}
        <div className="flex-1 overflow-hidden p-2 md:p-4 md:pt-0 md:pr-4 md:pb-4 w-full h-full">
           <div className="bg-background w-full h-full rounded-none overflow-y-auto no-scrollbar overflow-x-hidden p-4 md:p-8 lg:p-10 shadow-[0_0_40px_rgba(0,0,0,0.1)] border border-border text-foreground">
              <Outlet />
           </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 z-[100] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}
              animate={{ x: 0, borderTopRightRadius: '0px', borderBottomRightRadius: '0px' }}
              exit={{ x: '-100%', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#1a2e1a] text-white z-[101] flex flex-col md:hidden shadow-2xl overflow-hidden"
            >
               <div className="relative bg-[#1e331e] pt-10 pb-8 px-6 mb-2 border-b border-white/5 flex items-center justify-between">
                  <div className="relative z-10 flex items-center gap-3">
                     <div className="w-12 h-12 bg-gradient-to-br from-[#88B04B] to-[#5a7a30] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(136,176,75,0.4)]">
                        <Bus size={24} className="text-white" />
                     </div>
                     <div>
                        <h2 className="text-lg font-black text-white tracking-tight leading-none">{role === 'Super Admin' ? 'Super' : 'School'}</h2>
                        <h2 className="text-lg font-black text-white tracking-tight leading-none">Admin</h2>
                     </div>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                     <X size={18} />
                  </button>
               </div>
               
               <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                  <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.2em] mb-2 px-2">Main Menu</p>
                  {menuItems.map((item) => {
                     const isActive = location.pathname === item.path;
                     return (
                       <NavLink
                         key={item.path}
                         to={item.path}
                         onClick={() => setIsMobileMenuOpen(false)}
                         className={`relative flex items-center h-14 transition-all duration-300 rounded-2xl justify-start px-4 overflow-hidden group ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                       >
                         {isActive && (
                           <motion.div
                             layoutId="mobile-active-bg"
                             className="absolute inset-0 bg-gradient-to-br from-[#88B04B] to-[#5a7a30] rounded-2xl z-0 shadow-[0_4px_15px_rgba(136,176,75,0.4)] border border-[#88B04B]/30"
                             transition={{ type: "spring", stiffness: 300, damping: 30 }}
                           />
                         )}
                         <div className="relative z-10 flex items-center justify-center w-8">
                           <item.icon size={isActive ? 22 : 20} className={`transition-all duration-300 ${isActive ? 'text-white' : 'group-hover:scale-110'}`} />
                         </div>
                         <span className="relative z-10 font-bold text-[14px] whitespace-nowrap ml-3">
                           {item.label}
                         </span>
                       </NavLink>
                     )
                  })}
               </nav>

               <div className="p-6 mt-auto bg-gradient-to-t from-[#142414] to-transparent">
                  <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <LogOut size={18} />
                    Sign Out
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
