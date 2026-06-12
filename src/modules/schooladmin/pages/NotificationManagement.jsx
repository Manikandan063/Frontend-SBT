import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  Bus, 
  AlertTriangle, 
  Clock, 
  History,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api/axios';

const NotificationManagement = () => {
  const [activeTab, setActiveTab] = useState('New Message');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [history, setHistory] = useState([]);
  const [buses, setBuses] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'normal',
    targetType: 'all',
    targetId: ''
  });
  
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchHistory();
    fetchBuses();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/notifications/history');
      setHistory(response.data.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setFetching(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await api.get('/bus');
      setBuses(response.data.data);
    } catch (err) {
      console.error('Failed to fetch buses:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      setFeedback({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    setLoading(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        title: formData.title,
        body: formData.body,
        type: formData.type.toLowerCase(),
        targetType: formData.targetType,
        targetId: formData.targetId
      };
      
      if (showScheduler && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      }

      await api.post('/notifications/send', payload);

      setFeedback({ type: 'success', message: showScheduler && scheduledAt ? 'Notification scheduled successfully!' : 'Notification sent successfully!' });
      setFormData({ ...formData, title: '', body: '' }); // Reset form
      setShowScheduler(false);
      setScheduledAt('');
      fetchHistory(); // Refresh history
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to send notification' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase">Notification Center</h1>
          <p className="text-[10px] md:text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Send Messages & Alerts to Parents</p>
        </div>
        
        {feedback.message && (
          <div className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-red-50 border-red-100 text-red-600'
          }`}>
            {feedback.message}
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {['New Message', 'Past Messages'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 md:px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-muted/40 text-foreground/40 hover:bg-muted/60 border border-border'}`}
            >
              {tab}
            </button>
          ))}
      </div>

      {activeTab === 'New Message' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Main Compose Area */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 md:p-10 space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-lg md:text-xl font-black uppercase tracking-tight">Write New Message</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Alert Type</label>
                           <select 
                             value={formData.type}
                             onChange={(e) => setFormData({...formData, type: e.target.value})}
                             className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-4 text-sm font-bold outline-none uppercase"
                           >
                              <option value="normal">Normal Update</option>
                              <option value="delay">Bus Delay</option>
                              <option value="urgent">Urgent Message</option>
                              <option value="holiday">Holiday Information</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Send To</label>
                           <select 
                             value={formData.targetType}
                             onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                             className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-4 text-sm font-bold outline-none uppercase"
                           >
                              <option value="all">All Parents</option>
                              <option value="bus">One Bus Route</option>
                           </select>
                        </div>
                    </div>

                    {formData.targetType === 'bus' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Select Bus Route</label>
                        <select 
                          value={formData.targetId}
                          onChange={(e) => setFormData({...formData, targetId: e.target.value})}
                          className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-4 text-sm font-bold outline-none uppercase"
                        >
                          <option value="">Choose a Bus</option>
                          {buses.map(bus => (
                            <option key={bus.id} value={bus.id}>{bus.busNumber} - {bus.routeCode || 'Main Route'}</option>
                          ))}
                        </select>
                      </div>
                    )}
                 </div>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Topic</label>
                        <input 
                           type="text" 
                           value={formData.title}
                           onChange={(e) => setFormData({...formData, title: e.target.value})}
                           placeholder="e.g., Bus 02 Morning Pickup"
                           className="w-full bg-foreground/5 border border-border rounded-xl px-6 py-4 text-sm font-bold outline-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 ml-1">Write Message</label>
                        <textarea 
                           rows="6"
                           value={formData.body}
                           onChange={(e) => setFormData({...formData, body: e.target.value})}
                           placeholder="Write your message here..."
                           className="w-full bg-foreground/5 border border-border rounded-xl px-6 py-4 text-sm font-bold outline-none resize-none"
                        ></textarea>
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                     <Button 
                       onClick={handleSend}
                       disabled={loading || (showScheduler && !scheduledAt)}
                       className="flex-1 h-14 md:h-16 !rounded-2xl !text-xs md:!text-sm !tracking-widest shadow-xl shadow-primary/20"
                     >
                        {loading ? <Loader2 className="animate-spin" /> : (showScheduler ? <Clock size={20} /> : <Send size={20} />)}
                        {loading ? 'Sending...' : (showScheduler ? 'Schedule Now' : 'Send Now')}
                     </Button>
                     {!showScheduler ? (
                       <Button 
                         variant="secondary" 
                         onClick={() => setShowScheduler(true)}
                         className="flex-1 h-14 md:h-16 !rounded-2xl !text-xs md:!text-sm !tracking-widest"
                       >
                          <Clock size={20} />
                          Send Later
                       </Button>
                     ) : (
                       <div className="flex-1 flex gap-2">
                         <input 
                           type="datetime-local" 
                           value={scheduledAt}
                           onChange={(e) => setScheduledAt(e.target.value)}
                           min={new Date().toISOString().slice(0, 16)}
                           className="w-full bg-foreground/5 border border-border rounded-xl px-4 py-4 text-xs font-bold outline-none"
                         />
                         <Button 
                           variant="ghost" 
                           onClick={() => {
                             setShowScheduler(false);
                             setScheduledAt('');
                           }}
                           className="h-14 md:h-16 w-14 md:w-16 !rounded-xl !p-0"
                         >
                            <Trash2 size={20} className="text-foreground/40" />
                         </Button>
                       </div>
                     )}
                  </div>
              </Card>
           </div>

           {/* Sidebar - Quick Alerts */}
            <div className="space-y-6 md:space-y-8">
               <h2 className="text-xl font-black uppercase tracking-tight ml-2">Quick Alerts</h2>
               <Card className="p-6 md:p-8 space-y-6">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Common Alerts</p>
                  <div className="space-y-4">
                     {[
                       { label: 'Bus Breakdown', title: 'Technical Issue', body: 'The bus has encountered a technical breakdown. A backup vehicle is being dispatched.', type: 'urgent', icon: AlertTriangle, color: 'text-error bg-error/10' },
                       { label: 'Rain Delay', title: 'Weather Delay', body: 'Due to heavy rains, the bus is running 15-20 minutes late. Thank you for your patience.', type: 'delay', icon: Clock, color: 'text-blue-500 bg-blue-500/10' },
                       { label: 'School Holiday', title: 'Holiday Notice', body: 'The school will remain closed tomorrow on account of the public holiday.', type: 'holiday', icon: Bell, color: 'text-primary bg-primary/10' },
                     ].map((preset, i) => (
                      <button 
                        key={i} 
                        onClick={() => setFormData({
                          ...formData,
                          title: preset.title,
                          body: preset.body,
                          type: preset.type
                        })}
                        className="w-full flex items-center justify-between p-4 rounded-2xl bg-foreground/[0.02] border border-border hover:bg-foreground/[0.05] transition-all group text-left"
                      >
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${preset.color}`}>
                               <preset.icon size={20} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tight">{preset.label}</span>
                         </div>
                         <div className="p-1 bg-foreground/5 rounded-full group-hover:bg-primary transition-colors">
                            <Send size={14} className="text-foreground/20 group-hover:text-white" />
                         </div>
                      </button>
                    ))}
                  </div>
               </Card>

               <Card className="p-6 md:p-8 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-tight">System Status</h3>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Alert Server</span>
                        <Badge variant="success">Active</Badge>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">History Count</span>
                        <span className="text-xs font-bold">{history.length} Messages</span>
                     </div>
                  </div>
               </Card>
            </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
           <div className="grid grid-cols-1 gap-4">
              {fetching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Loading History...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                  <History className="w-10 h-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No messages sent yet</p>
                </div>
              ) : history.map((item) => (
                <Card key={item.id} className="p-4 md:p-6 hover:bg-muted/30 transition-all border-l-4 border-l-primary/30">
                   <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                      <div className="flex items-start gap-4 md:gap-5">
                         <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl shrink-0 flex items-center justify-center ${
                           item.type === 'urgent' ? 'bg-red-500/10 text-red-500' : 
                           item.type === 'delay' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'
                         }`}>
                           {item.type === 'urgent' ? <AlertTriangle size={18} /> : <Bell size={18} />}
                         </div>
                         <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                              <h4 className="text-base md:text-lg font-black uppercase tracking-tight truncate">{item.title}</h4>
                              <Badge variant={getStatusColor(item.status)} className="text-[8px] px-2">{item.status}</Badge>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-foreground/60 mt-1 line-clamp-2 md:line-clamp-1">{item.body}</p>
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-3">
                               <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/30">
                                 <Users size={10} /> {item.targetType === 'all' ? 'All Parents' : `Bus Route: ${item.targetId}`}
                               </span>
                               <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-foreground/30">
                                 <Clock size={10} /> {new Date(item.createdAt).toLocaleString()}
                               </span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 self-end md:self-auto">
                         <Button variant="ghost" size="sm" className="h-9 w-9 !p-0">
                            <MoreVertical size={16} />
                         </Button>
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;
