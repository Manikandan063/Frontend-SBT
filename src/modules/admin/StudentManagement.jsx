import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  ChevronRight,
  ArrowLeft,
  Smartphone,
  User,
  ShieldCheck,
  School
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/api/axios';
import { ROUTES } from '../../config/routes';
import { motion, AnimatePresence } from 'framer-motion';

const StudentManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    class: '',
    section: '',
    pickupPoint: '',
    parent: {
      parentName: '',
      mobileNumber: '',
      email: '',
      password: '' // Will be auto-filled from mobile last 4 digits
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/students/create', formData);
      setSuccessData(response.data.data);
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.response?.data?.message || 'Failed to create student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="matte-green-theme min-h-screen bg-[#F2EDC5] pb-20">
      {/* Header */}
      <div className="bg-card/40 backdrop-blur-xl border-b border-border px-6 py-8 flex items-center gap-4 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-3 bg-card border border-border rounded-2xl shadow-sm text-foreground/40">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Student Registry</h1>
          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] mt-1">Onboarding System</p>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info */}
          <div className="premium-card !bg-muted/60 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <User size={20} className="text-primary" />
              <h3 className="font-black text-sm uppercase tracking-widest">Student Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-primary/20"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Roll Number</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. SC-1024"
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 ring-primary/20"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Grade</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 5"
                    className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Section</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. A"
                    className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                    value={formData.section}
                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Pickup Point</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Main Road Junction"
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                  value={formData.pickupPoint}
                  onChange={(e) => setFormData({...formData, pickupPoint: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <div className="premium-card !bg-white/60">
            <div className="flex items-center gap-3 mb-6">
              <Smartphone size={20} className="text-secondary" />
              <h3 className="font-black text-sm uppercase tracking-widest">Parent Credentials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Guardian Name</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                  value={formData.parent.parentName}
                  onChange={(e) => setFormData({...formData, parent: {...formData.parent, parentName: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Mobile Number</label>
                <input 
                  required
                  type="tel" 
                  placeholder="9876543210"
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                  value={formData.parent.mobileNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    const lastFour = val.length >= 4 ? val.slice(-4) : '';
                    setFormData({
                      ...formData, 
                      parent: {
                        ...formData.parent, 
                        mobileNumber: val,
                        password: lastFour || formData.parent.password
                      }
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  className="w-full bg-white border border-black/5 rounded-2xl px-5 py-4 text-sm font-medium outline-none"
                  value={formData.parent.email}
                  onChange={(e) => setFormData({...formData, parent: {...formData.parent, email: e.target.value}})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Set Password (Auto-filled)</label>
                <input 
                  required
                  type="text" 
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-sm font-medium outline-none font-mono text-foreground"
                  value={formData.parent.password}
                  onChange={(e) => setFormData({...formData, parent: {...formData.parent, password: e.target.value}})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                Register Student
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {successData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSuccessData(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-card rounded-[40px] p-10 w-full max-w-md relative z-10 text-center shadow-2xl border border-border"
            >
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Registration Success!</h2>
              <p className="text-sm text-foreground/60 mb-8 font-medium">Student *{successData.student?.studentName}* has been linked to the parent portal.</p>
              
              <div className="space-y-4">
                <a 
                  href={successData.parent?.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-5 bg-[#25D366] text-white rounded-[24px] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  <MessageCircle size={20} fill="white" />
                  Send WhatsApp Invite (Free)
                </a>
                
                <button 
                  onClick={() => {
                    setSuccessData(null);
                    setFormData({
                      studentName: '',
                      rollNumber: '',
                      class: '',
                      section: '',
                      pickupPoint: '',
                      parent: {
                        parentName: '',
                        mobileNumber: '',
                        email: '',
                        password: 'Parent@' + Math.floor(1000 + Math.random() * 9000)
                      }
                    });
                  }}
                  className="w-full py-5 bg-foreground/5 text-foreground/40 rounded-[24px] font-black uppercase tracking-widest text-[10px]"
                >
                  Close & New Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;
