import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Navigation, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Clock, 
  Bus,
  ArrowRight,
  X,
  Save,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { motion, AnimatePresence } from 'framer-motion';

const showFriendlyError = (error, fallbackMessage = 'Operation failed. Please try again.') => {
  console.error('Operation failed:', error);
  const rawMessage = error.response?.data?.message;
  let displayMessage = fallbackMessage;

  if (rawMessage) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (Array.isArray(parsed)) {
        displayMessage = parsed.map(err => {
          const field = err.path ? err.path.join('.') : 'Field';
          return `${field}: ${err.message}`;
        }).join('\n');
      } else if (parsed && typeof parsed === 'object') {
        displayMessage = parsed.message || JSON.stringify(parsed);
      } else {
        displayMessage = rawMessage;
      }
    } catch (e) {
      displayMessage = rawMessage;
    }
  } else {
    const validationErrors = error.response?.data?.errors;
    if (Array.isArray(validationErrors)) {
      displayMessage = validationErrors.map(err => err.message).join('\n');
    }
  }

  alert(`Validation Error:\n${displayMessage}`);
};

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    busNumber: '',
    busRegisterNumber: '',
    routeName: '',
    capacity: 40,
    status: 'ACTIVE'
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await api.get('/bus');
      const buses = response.data.data || [];
      const mappedRoutes = buses.map(bus => ({
        id: bus.id,
        name: bus.routeName || 'Unnamed Route',
        busNumber: bus.busNumber,
        busRegisterNumber: bus.busRegisterNumber,
        stops: 0,
        distance: 'TBD',
        time: 'TBD',
        bus: bus.busNumber,
        capacity: bus.capacity,
        status: bus.status === 'ACTIVE' ? 'Active' : 'Inactive'
      }));
      setRoutes(mappedRoutes);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (route = null) => {
    if (route) {
      setIsEditing(true);
      setEditingId(route.id);
      setFormData({
        busNumber: route.busNumber || '',
        busRegisterNumber: route.busRegisterNumber || '',
        routeName: route.name || '',
        capacity: route.capacity || 40,
        status: route.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({
        busNumber: '',
        busRegisterNumber: '',
        routeName: '',
        capacity: 40,
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/bus/${editingId}`, formData);
      } else {
        await api.post('/bus', formData);
      }
      setIsModalOpen(false);
      fetchRoutes();
    } catch (error) {
      showFriendlyError(error, 'Failed to save route details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bus route?')) {
      try {
        await api.delete(`/bus/${id}`);
        fetchRoutes();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Route List</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Manage Bus Routes & Stops</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-32 text-center">
             <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Loading Routes...</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No routes found</p>
          </div>
        ) : (
          routes.map((route) => (
            <Card key={route.id} className="!p-8 group hover:border-primary/30 transition-all border-none shadow-xl bg-card rounded-[2rem]">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                       <Navigation size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">{route.name}</h3>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Bus Number {route.busNumber}</p>
                    </div>
                 </div>
                 <Badge variant={route.status === 'Active' ? 'success' : 'error'} className="!px-4 !py-1 !rounded-xl">
                    {route.status}
                 </Badge>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-muted rounded-3xl border border-border">
                 <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">Stops</p>
                    <p className="text-xl font-black">{route.stops}</p>
                 </div>
                 <div className="text-center border-x border-slate-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">Distance</p>
                    <p className="text-xl font-black">{route.distance}</p>
                 </div>
                 <div className="text-center">
                    <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-1">Travel Time</p>
                    <p className="text-xl font-black">{route.time}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                       <Bus size={20} />
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase text-foreground/60">Assigned Bus</p>
                       <p className="text-[10px] font-bold text-foreground/30 uppercase">{route.busNumber}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Button 
                      onClick={() => handleOpenModal(route)}
                      variant="secondary" 
                      className="!px-6 !py-3 !rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                    >
                      <Edit2 size={14} />
                      Edit Route
                    </Button>
                    <button 
                      onClick={() => handleDelete(route.id)}
                      className="p-4 hover:bg-error/5 rounded-2xl text-foreground/10 hover:text-error transition-all"
                    >
                       <Trash2 size={20} />
                    </button>
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-xl !bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-border"
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-primary/5 p-10 flex items-center justify-between border-b border-primary/10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                      <Navigation size={28} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                        {isEditing ? 'Edit Route' : 'Add Route'}
                      </h2>
                      <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mt-1">Route Details</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center text-foreground/10 hover:text-error hover:bg-error/5 transition-all shadow-sm">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-12 space-y-10">
                  <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-2">Route Name</label>
                       <input 
                         type="text" 
                         required
                         value={formData.routeName}
                         onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                         className="w-full h-16 bg-muted border-none rounded-2xl px-8 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-foreground/10 text-foreground"
                         placeholder="e.g. PEELAMEDU EXPRESS"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-2">Bus Number</label>
                         <input 
                           type="text" 
                           required
                           value={formData.busNumber}
                           onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                           className="w-full h-16 bg-muted border-none rounded-2xl px-8 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-foreground/10 text-foreground"
                           placeholder="T-01"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-2">Registration Number</label>
                         <input 
                           type="text" 
                           required
                           value={formData.busRegisterNumber}
                           onChange={(e) => setFormData({...formData, busRegisterNumber: e.target.value})}
                           className="w-full h-16 bg-muted border-none rounded-2xl px-8 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all placeholder:text-foreground/10 text-foreground"
                           placeholder="TN-38-AB-1234"
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-2">Capacity</label>
                         <input 
                           type="number" 
                           required
                           value={formData.capacity}
                           onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                           className="w-full h-16 bg-muted border-none rounded-2xl px-8 text-sm font-black outline-none focus:ring-2 ring-primary/20 transition-all text-foreground"
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 ml-2">Status</label>
                         <select 
                           value={formData.status}
                           onChange={(e) => setFormData({...formData, status: e.target.value})}
                           className="w-full h-16 bg-muted border-none rounded-2xl px-8 text-[10px] font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all appearance-none cursor-pointer text-foreground"
                         >
                           <option value="ACTIVE">ACTIVE</option>
                           <option value="INACTIVE">INACTIVE</option>
                         </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-6 pt-10 border-t border-slate-50">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-[2] !h-16 !rounded-2xl !bg-primary !text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
                    >
                      {submitting ? 'Processing...' : (isEditing ? 'Update Route' : 'Create Route')}
                    </Button>
                    <Button 
                      type="button"
                      variant="secondary"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 !h-16 !rounded-2xl text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RouteManagement;
