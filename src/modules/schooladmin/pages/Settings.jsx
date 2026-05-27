import React, { useState, useEffect } from 'react';
import { 
  User, 
  Camera, 
  Mail, 
  Shield, 
  Building, 
  Save, 
  Bell, 
  Globe, 
  Key,
  Smartphone,
  Lock,
  Clock,
  CheckCircle2,
  Settings as SettingsIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Security and Password Reset State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    language: 'English (US)',
    timezone: 'UTC+05:30 (Chennai)',
    notifications: {
      email: true,
      push: true,
      alerts: true
    }
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData({
        ...formData,
        name: storedUser.name || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        schoolName: storedUser.school?.schoolName || 'Shri Nehru Vidyalaya MHSS'
      });
      if (storedUser.profilePicture) {
        setProfileImage(storedUser.profilePicture);
      }
    }
    setLoading(false);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetFields = () => {
    if (activeTab === 'security') {
      setCurrentPassword('');
      setNewPassword('');
    } else if (activeTab === 'profile') {
      const storedUser = JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user'));
      if (storedUser) {
        setFormData({
          ...formData,
          name: storedUser.name || '',
          email: storedUser.email || '',
          phone: storedUser.phone || '',
          schoolName: storedUser.school?.schoolName || 'Shri Nehru Vidyalaya MHSS'
        });
        setProfileImage(storedUser.profilePicture || null);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('admin_user') || localStorage.getItem('user') || '{}');
      
      let payload = {};
      if (activeTab === 'profile') {
        payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profilePicture: profileImage || storedUser.profilePicture
        };
      } else if (activeTab === 'security') {
        if (!newPassword) {
          alert('Please enter a new password');
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          alert('Password must be at least 6 characters long');
          setSaving(false);
          return;
        }
        payload = {
          password: newPassword
        };
      }

      const response = await api.put('/auth/profile', payload);
      
      if (response.data && response.data.status === 'success') {
        const updatedUser = response.data.data;
        const finalUser = {
          ...storedUser,
          ...updatedUser
        };
        
        localStorage.setItem('admin_user', JSON.stringify(finalUser));
        window.dispatchEvent(new CustomEvent('user-updated'));

        if (activeTab === 'security') {
          setCurrentPassword('');
          setNewPassword('');
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert(error.response?.data?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 relative min-h-screen">
      {/* Decorative Background Orbs */}
      <div className="absolute top-0 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-40 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center gap-4">
            <SettingsIcon className="text-primary animate-[spin_10s_linear_infinite]" size={40} />
            Platform Settings
          </h1>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-2">Configuration & Security Center</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-6 py-3 rounded-2xl text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md"
            >
              <CheckCircle2 size={20} className="drop-shadow-md" />
              <span className="text-[11px] font-black uppercase tracking-widest">Changes Saved Successfully</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-3">
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-3 shadow-xl">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'security', label: 'Security', icon: Lock },
              { id: 'institution', label: 'School Details', icon: Building },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'preferences', label: 'General', icon: Globe },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 text-left relative group outline-none
                    ${isActive ? 'text-white' : 'text-foreground/50 hover:text-foreground hover:bg-white/5'}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settings-tab-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl z-0 shadow-lg shadow-primary/20"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  <tab.icon size={18} className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10 text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <Card className="!p-8 md:!p-12 border border-border/50 shadow-2xl bg-card/70 backdrop-blur-3xl relative overflow-hidden rounded-[2rem]">
             {/* Dynamic Tab Content */}
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
               className="space-y-12"
             >
                 {activeTab === 'profile' && (
                  <>
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                       <div className="relative group perspective-1000">
                          <div className="w-36 h-36 rounded-full bg-muted overflow-hidden border-4 border-card shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.05] group-hover:rotate-y-12">
                             {profileImage ? (
                               <img src={profileImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-foreground/10 bg-gradient-to-br from-muted to-muted/50">
                                  <User size={60} />
                                </div>
                             )}
                             <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                <Camera size={28} className="text-white mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Update Photo</span>
                                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                             </label>
                          </div>
                          <div className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 border-4 border-card transform group-hover:rotate-12 transition-transform">
                             <Camera size={16} />
                          </div>
                       </div>
                       <div className="flex-1 space-y-3 text-center md:text-left pt-2">
                          <h2 className="text-3xl font-black tracking-tight text-foreground">Personal Profile</h2>
                          <p className="text-[11px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Manage your identity and contact preferences</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
                             <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <Shield size={12} /> Administrator
                             </div>
                             <div className="px-4 py-1.5 rounded-full bg-muted/80 border border-border text-foreground/50 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                               <CheckCircle2 size={12} /> Verified
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-8 mt-8 border-t border-border/50">
                       <div className="space-y-2 group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                             <User size={12} /> Full Legal Name
                          </label>
                          <Input 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="!h-14 !rounded-xl !bg-muted/30 border-border/50 focus:!bg-card focus:!border-primary/50 focus:!ring-2 focus:!ring-primary/20 transition-all shadow-inner"
                            placeholder="Enter your full name"
                          />
                       </div>
                       <div className="space-y-2 group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                             <Mail size={12} /> Primary Email Address
                          </label>
                          <Input 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="!h-14 !rounded-xl !bg-muted/30 border-border/50 focus:!bg-card focus:!border-primary/50 focus:!ring-2 focus:!ring-primary/20 transition-all shadow-inner"
                            placeholder="admin@institution.edu"
                          />
                       </div>
                       <div className="space-y-2 group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                             <Smartphone size={12} /> Mobile Number
                          </label>
                          <Input 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            className="!h-14 !rounded-xl !bg-muted/30 border-border/50 focus:!bg-card focus:!border-primary/50 focus:!ring-2 focus:!ring-primary/20 transition-all shadow-inner"
                            placeholder="+1 (555) 000-0000"
                          />
                       </div>
                       <div className="space-y-2 group">
                          <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                             <Building size={12} /> Institution Name
                          </label>
                          <Input 
                            value={formData.schoolName}
                            onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                            className="!h-14 !rounded-xl !bg-muted/30 border-border/50 focus:!bg-card focus:!border-primary/50 focus:!ring-2 focus:!ring-primary/20 transition-all shadow-inner"
                            placeholder="Enter the official school name"
                          />
                       </div>
                    </div>
                  </>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                     <div className="p-8 bg-muted/30 rounded-3xl border border-border">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                              <Shield size={28} />
                           </div>
                           <div>
                              <h3 className="text-lg font-black uppercase tracking-tight">Two-Factor Auth</h3>
                              <p className="text-xs font-bold text-foreground/30 uppercase mt-1 tracking-widest">Extra protection for your account</p>
                           </div>
                           <div className="ml-auto">
                              <Button variant="outline" className="!rounded-xl !px-6 border-amber-500/20 text-amber-500">SETUP</Button>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                              <Key size={12} className="text-primary" /> Current Password
                           </label>
                           <Input 
                             type="password" 
                             placeholder="••••••••" 
                             value={currentPassword}
                             onChange={(e) => setCurrentPassword(e.target.value)}
                             className="!h-16 !rounded-2xl !bg-muted/50 border-transparent focus:!border-primary/30" 
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                              <Key size={12} className="text-primary" /> New Password
                           </label>
                           <Input 
                             type="password" 
                             placeholder="ENTER NEW PASSWORD" 
                             value={newPassword}
                             onChange={(e) => setNewPassword(e.target.value)}
                             className="!h-16 !rounded-2xl !bg-muted/50 border-transparent focus:!border-primary/30" 
                           />
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'preferences' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                            <Globe size={12} className="text-primary" /> Language
                         </label>
                         <select className="w-full h-16 bg-muted border-none rounded-2xl px-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none">
                            <option>English (US)</option>
                            <option>Tamil</option>
                            <option>Hindi</option>
                         </select>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2 flex items-center gap-2">
                            <Clock size={12} className="text-primary" /> Timezone
                         </label>
                         <select className="w-full h-16 bg-muted border-none rounded-2xl px-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none">
                            <option>UTC+05:30 (Chennai)</option>
                            <option>UTC+00:00 (London)</option>
                         </select>
                      </div>
                   </div>
                )}

                 {/* Shared Footer for all tabs */}
                 <div className="pt-8 mt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-foreground/30 bg-muted/30 px-4 py-2 rounded-xl border border-border/30">
                       <Shield size={18} className="text-primary" />
                       <p className="text-[10px] font-bold uppercase tracking-[0.1em]">All configuration changes are securely encrypted.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                       <Button 
                         variant="outline" 
                         onClick={handleResetFields}
                         className="flex-1 md:flex-none !h-12 !rounded-xl !px-8 text-[11px] font-black uppercase tracking-widest border-border/50 hover:bg-muted/50"
                       >
                          Discard
                       </Button>
                       <Button 
                         onClick={handleSave}
                         disabled={saving}
                         className="flex-1 md:flex-none !h-12 !rounded-xl !px-10 !bg-gradient-to-r from-primary to-accent !text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 flex items-center gap-2"
                       >
                          {saving ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save size={14} />
                              Save Changes
                            </>
                          )}
                       </Button>
                    </div>
                 </div>
             </motion.div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
