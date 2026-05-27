import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Bus, 
  User, 
  ShieldAlert,
  ChevronRight,
  Plus,
  X,
  Save,
  Search,
  ArrowRight,
  Pencil
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { motion, AnimatePresence } from 'framer-motion';

const TransferManagement = () => {
  const [transfers, setTransfers] = useState([]);
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: '',
    newBusId: '',
    reason: '',
  });

  const [emergencyData, setEmergencyData] = useState({
    oldBusId: '',
    newBusId: '',
    reason: 'Vehicle Breakdown',
  });

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ studentId: '', newBusId: '', reason: '' });
  };

  const handleEditClick = (transfer) => {
    setEditingId(transfer.id);
    setFormData({
      studentId: transfer.studentId,
      newBusId: transfer.newBusId,
      reason: transfer.reason,
    });
    setIsModalOpen(true);
  };

  const playSuccessChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playPing = (time, frequency, duration, volume) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, time);
        
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      playPing(now, 523.25, 0.5, 0.08);
      playPing(now + 0.06, 659.25, 0.5, 0.07);
      playPing(now + 0.12, 783.99, 0.5, 0.06);
      playPing(now + 0.18, 1046.50, 0.7, 0.05);
    } catch (e) {
      console.error('Failed to play success chime:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [transfersRes, studentsRes, busesRes] = await Promise.all([
        api.get('/transfer'),
        api.get('/students'),
        api.get('/bus')
      ]);
      setTransfers(transfersRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setBuses(busesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/transfer/${editingId}`, formData);
      } else {
        await api.post('/transfer/student', formData);
      }
      playSuccessChime();
      setIsModalOpen(false);
      setEditingId(null);
      fetchData();
      setFormData({ studentId: '', newBusId: '', reason: '' });
    } catch (error) {
      console.error('Transfer save failed:', error);
      alert(error.response?.data?.message || 'Transfer save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transfer/emergency', emergencyData);
      playSuccessChime();
      setIsEmergencyModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Emergency transfer failed:', error);
      alert(error.response?.data?.message || 'Emergency transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Transfer Control</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Manage Student Transit Reassignments & Emergencies</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="!rounded-2xl h-14 !px-8 shadow-xl shadow-primary/20 bg-primary"
        >
          <Plus size={20} />
          New Transfer Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Active Transfers List */}
         <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-black uppercase tracking-tight ml-2">Recent Fleet Reassignments</h2>
            
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Accessing Logs...</p>
              </div>
            ) : transfers.length === 0 ? (
              <Card className="!p-10 text-center border-dashed border-2 border-slate-200 bg-transparent">
                 <ArrowLeftRight size={40} className="mx-auto text-slate-200 mb-4" />
                 <p className="text-xs font-black uppercase tracking-widest text-slate-300">No transfer history found</p>
              </Card>
            ) : (
              transfers.map((t) => (
                <Card key={t.id} className="!p-8 group hover:border-primary/20 transition-all shadow-lg hover:shadow-primary/5">
                   <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1 space-y-4">
                         <div className="flex items-center gap-3">
                            <Badge variant={t.reason.includes('EMERGENCY') ? 'error' : 'warning'}>
                              {t.reason.includes('EMERGENCY') ? 'Emergency' : 'Regular'}
                            </Badge>
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                              {new Date(t.createdAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                            </span>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center text-foreground/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                               <User size={24} />
                            </div>
                            <div>
                               <h4 className="text-lg font-black uppercase tracking-tight">{t.student?.studentName || 'Student Unlinked'}</h4>
                               <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">ID: {t.student?.rollNo || 'N/A'}</p>
                            </div>
                         </div>
                      </div>
  
                      <div className="flex items-center gap-6 bg-muted p-6 rounded-3xl border border-border">
                         <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">From</p>
                            <Badge variant="outline" className="!bg-card border border-border font-mono text-[10px]">
                              {t.oldBus?.busNumber || 'None'}
                            </Badge>
                         </div>
                         <ArrowRight size={20} className="text-primary animate-pulse" />
                         <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">To</p>
                            <Badge variant="success" className="font-mono text-[10px]">
                              {t.newBus?.busNumber}
                            </Badge>
                         </div>
                      </div>
  
                      <div className="text-right min-w-[120px]">
                         <p className="text-[9px] font-black uppercase tracking-widest text-foreground/20 mb-1">Reason</p>
                         <p className="text-xs font-black uppercase truncate max-w-[150px]">{t.reason}</p>
                      </div>

                      <div className="flex items-center justify-end">
                         <button 
                            onClick={() => handleEditClick(t)}
                            className="p-3.5 bg-primary/10 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
                            title="Edit Reassignment"
                         >
                            <Pencil size={16} />
                         </button>
                      </div>
                   </div>
                </Card>
              ))
            )}
         </div>

         {/* Emergency Sidebar */}
         <div className="space-y-8">
            <h2 className="text-xl font-black uppercase tracking-tight ml-2">Breakdown Protocol</h2>
            <Card className="p-8 !bg-card border border-error/20 space-y-8 relative overflow-hidden group shadow-2xl shadow-error/10">
               <div className="absolute right-[-10%] top-[-10%] opacity-5 rotate-12 transition-transform duration-700 group-hover:scale-110 text-error">
                  <ShieldAlert size={180} />
               </div>
               <div className="relative z-10">
                  <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mb-6 text-error">
                     <AlertTriangle size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-error">Emergency Hub</h3>
                  <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-2 leading-relaxed">Instantly redirect all students from a disabled bus to an active replacement.</p>
               </div>
               <Button 
                onClick={() => setIsEmergencyModalOpen(true)}
                className="!bg-error !text-white !rounded-2xl h-14 w-full relative z-10 shadow-lg shadow-error/20 font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] transition-transform"
               >
                  Initiate Bulk Transfer
               </Button>
            </Card>

            <Card className="p-8 space-y-6 border-none shadow-xl">
               <h3 className="text-sm font-black uppercase tracking-tight">Active Fleet Availability</h3>
               <div className="space-y-4">
                  {buses.length === 0 ? (
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">No buses active</p>
                  ) : buses.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted border border-border group hover:border-primary/20 transition-all">
                       <div className="flex items-center gap-3">
                          <Bus size={18} className="text-primary" />
                          <div>
                            <span className="text-xs font-black uppercase">Bus {b.busNumber}</span>
                            <p className="text-[8px] font-black text-foreground/20 uppercase">Reg: {b.busRegisterNumber}</p>
                          </div>
                       </div>
                       <Badge variant="success" className="text-[10px]">{b.capacity} Seats</Badge>
                    </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>

      {/* Individual Transfer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl !bg-card rounded-[2rem] shadow-2xl overflow-hidden border border-border">
               <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                        <ArrowLeftRight size={24} />
                     </div>
                     <h2 className="text-2xl font-black uppercase tracking-tight">{editingId ? 'Edit Transfer' : 'Manual Transfer'}</h2>
                  </div>
                  <button onClick={closeModal} className="w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center text-foreground/20 hover:text-error transition-all"><X size={20} /></button>
               </div>
               <form onSubmit={handleTransferSubmit} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Select Student</label>
                     <select 
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                      className="w-full h-16 bg-slate-50 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all appearance-none cursor-pointer"
                     >
                        <option value="">Choose Student from Registry</option>
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.studentName} ({s.rollNo})</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Assign to New Bus</label>
                     <select 
                      required
                      value={formData.newBusId}
                      onChange={(e) => setFormData({...formData, newBusId: e.target.value})}
                      className="w-full h-16 bg-slate-50 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all appearance-none cursor-pointer"
                     >
                        <option value="">Select Destination Vehicle</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id}>Bus {b.busNumber} ({b.capacity} Seats)</option>
                        ))}
                     </select>
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Reason for Transfer</label>
                     <textarea 
                      required
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full h-32 bg-slate-50 rounded-2xl p-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all resize-none"
                      placeholder="E.G. PERMANENT ROUTE CHANGE"
                     />
                  </div>
                  <div className="pt-4 flex gap-4">
                     <Button type="submit" disabled={submitting} className="flex-1 !h-16 !rounded-2xl !bg-slate-900 !text-white text-xs font-black uppercase tracking-widest shadow-2xl">
                        {submitting ? 'Updating Transit Node...' : (editingId ? 'Save Changes' : 'Confirm Transfer')}
                        <Save size={18} />
                     </Button>
                     <Button type="button" onClick={closeModal} variant="secondary" className="!h-16 !px-8 !rounded-2xl text-xs font-black uppercase tracking-widest !bg-muted !text-muted-foreground border border-border">Cancel</Button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Emergency Bulk Transfer Modal */}
      <AnimatePresence>
        {isEmergencyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEmergencyModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-xl !bg-card rounded-[2rem] shadow-2xl overflow-hidden border-4 border-error/20">
               <div className="p-8 border-b border-error/10 flex justify-between items-center bg-error/5">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-error rounded-2xl flex items-center justify-center text-white shadow-lg shadow-error/20">
                        <ShieldAlert size={24} />
                     </div>
                     <h2 className="text-2xl font-black uppercase tracking-tight text-error">Emergency Redirection</h2>
                  </div>
                  <button onClick={() => setIsEmergencyModalOpen(false)} className="w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center text-error/20 hover:text-error transition-all"><X size={20} /></button>
               </div>
               <form onSubmit={handleEmergencySubmit} className="p-8 space-y-6">
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Source Vehicle (Disabled)</label>
                     <select 
                      required
                      value={emergencyData.oldBusId}
                      onChange={(e) => setEmergencyData({...emergencyData, oldBusId: e.target.value})}
                      className="w-full h-16 bg-error/5 border border-error/10 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-error/20 appearance-none cursor-pointer text-error"
                     >
                        <option value="">Select Breakdown Vehicle</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id}>Bus {b.busNumber} (Active Logs)</option>
                        ))}
                     </select>
                  </div>
                  <div className="flex justify-center py-2">
                    <ArrowLeftRight size={32} className="text-error/30 rotate-90" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[10px] font-black uppercase tracking-widest text-foreground/30 px-2">Destination Vehicle (Rescue)</label>
                     <select 
                      required
                      value={emergencyData.newBusId}
                      onChange={(e) => setEmergencyData({...emergencyData, newBusId: e.target.value})}
                      className="w-full h-16 bg-emerald-50 border border-emerald-100 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-emerald-200 appearance-none cursor-pointer text-emerald-700"
                     >
                        <option value="">Select Rescue Vehicle</option>
                        {buses.map(b => (
                          <option key={b.id} value={b.id}>Bus {b.busNumber} ({b.capacity} Seats Available)</option>
                        ))}
                     </select>
                  </div>
                  <div className="pt-4 flex gap-4">
                     <Button type="submit" disabled={submitting} className="flex-1 !h-16 !rounded-2xl !bg-error !text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-error/20">
                        {submitting ? 'Redirecting Nodes...' : 'Initiate Mass Transfer'}
                        <CheckCircle2 size={18} />
                     </Button>
                     <Button type="button" onClick={() => setIsEmergencyModalOpen(false)} variant="secondary" className="!h-16 !px-8 !rounded-2xl text-xs font-black uppercase tracking-widest !bg-muted !text-muted-foreground border border-border">Cancel</Button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransferManagement;
