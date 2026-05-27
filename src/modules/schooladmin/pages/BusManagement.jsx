import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Bus, 
  User, 
  Users,
  Phone, 
  Wifi, 
  WifiOff, 
  Edit2, 
  Trash2, 
  Settings,
  Activity,
  MapPin,
  Clock,
  MoreVertical,
  X,
  Save,
  ShieldCheck,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { toast } from 'sonner';

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

  toast.error(`Validation Error:\n${displayMessage}`);
};

const BusManagement = () => {
  const navigate = useNavigate();
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBusId, setEditingBusId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState(null);

  const [formData, setFormData] = useState({
    busNumber: '',
    busRegisterNumber: '',
    driverName: '',
    driverMobileNumber: '',
    gpsProvider: 'Traccar',
    gpsDeviceId: '',
    deviceIdentifier: '',
    status: 'Active',
    capacity: 40,
    routeName: ''
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/tracking/fleet/status');
      setBuses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching buses:', error);
      toast.error('Failed to synchronize fleet data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bus = null) => {
    if (bus) {
      setIsEditing(true);
      setEditingBusId(bus.id);
      setFormData({
        busNumber: bus.busNumber || '',
        busRegisterNumber: bus.busRegisterNumber || '',
        driverName: bus.driverName || '',
        driverMobileNumber: bus.driverMobileNumber || '',
        gpsProvider: bus.gpsProvider || 'Traccar',
        gpsDeviceId: bus.gpsDeviceId || '',
        deviceIdentifier: bus.deviceIdentifier || '',
        status: bus.status || 'Active',
        capacity: bus.capacity || 40,
        routeName: bus.routeName || ''
      });
    } else {
      setIsEditing(false);
      setEditingBusId(null);
      setFormData({
        busNumber: '', busRegisterNumber: '', driverName: '', driverMobileNumber: '', gpsProvider: 'Traccar', gpsDeviceId: '', deviceIdentifier: '', status: 'Active', capacity: 40, routeName: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/bus/${editingBusId}`, formData);
        toast.success(`Vehicle ${formData.busNumber} updated successfully`);
      } else {
        await api.post('/bus', formData);
        toast.success(`Vehicle ${formData.busNumber} authorized in fleet`);
      }
      setIsModalOpen(false);
      fetchBuses();
    } catch (error) {
      showFriendlyError(error, 'Fleet operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, busNum) => {
    if (window.confirm(`Are you sure you want to decommission Bus ${busNum} from the fleet registry?`)) {
      try {
        await api.delete(`/bus/${id}`);
        toast.success(`Bus ${busNum} decommissioned`);
        fetchBuses();
      } catch (error) {
        console.error('Delete failed:', error);
        toast.error('Failed to remove vehicle asset');
      }
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = 
      bus.busNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.busRegisterNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driverName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      bus.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">School Bus Management</h1>
            <Badge variant="outline" className="h-8 px-4 !rounded-xl border-primary/20 text-primary font-black text-[10px] uppercase">
              {filteredBuses.length} {searchQuery || statusFilter !== 'ALL' ? 'Found' : 'Total'}
            </Badge>
          </div>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Live Vehicle Tracking System</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="!rounded-2xl h-16 !px-10 shadow-2xl shadow-primary/20 !bg-primary hover:scale-105 transition-all"
        >
          <Plus size={24} />
          Register New Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <Card className="lg:col-span-4 !p-4 flex flex-col md:flex-row items-center gap-4 border-none shadow-xl bg-card">
            <div className="flex-1 w-full relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20" size={20} />
               <input 
                 type="text" 
                 placeholder="Search by bus number, registration, or driver..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-muted border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-tight outline-none focus:ring-2 ring-primary/20 transition-all"
               />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative w-full md:w-auto">
                  <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none z-10" />
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-14 pl-12 pr-10 bg-muted border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted/80 transition-all appearance-none min-w-[160px] text-foreground font-black"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/30 text-[9px]">▼</div>
               </div>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="col-span-full py-32 text-center">
            <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Synchronizing Fleet Telematics...</p>
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="col-span-full py-32 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No vehicles match your search</p>
          </div>
        ) : (
          filteredBuses.map((bus) => (
          <Card key={bus.id} className="p-6 md:p-8 border border-border/60 hover:border-primary/30 shadow-lg hover:shadow-primary/5 transition-all duration-300 rounded-[2.5rem] bg-card/60 backdrop-blur-md overflow-hidden relative flex flex-col xl:flex-row xl:items-center justify-between gap-6 group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700 blur-xl pointer-events-none" />
            
            {/* Left Section: Vehicle Icon & Identity Plate */}
            <div className="flex items-center gap-5 relative z-10 w-full xl:w-auto xl:min-w-[240px]">
               <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center flex-shrink-0 transition-all duration-500 shadow-md ${
                 bus.trackingStatus === 'LIVE'
                   ? 'bg-gradient-to-tr from-success/20 to-success/10 text-success border border-success/30 shadow-success/10'
                   : 'bg-gradient-to-tr from-primary/10 to-primary/5 text-primary border border-primary/10'
               }`}>
                  <Bus size={28} className={bus.trackingStatus === 'LIVE' ? 'animate-bounce' : ''} />
               </div>
               <div className="space-y-2">
                  <h4 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none group-hover:text-primary transition-colors flex items-center gap-2">
                     Bus {bus.busNumber}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2">
                     <div className="inline-flex items-center gap-1.5 bg-muted/80 px-2.5 py-1 rounded-xl border border-border text-[9px] font-black font-mono tracking-widest text-foreground/60 shadow-inner uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        {bus.busRegisterNumber}
                     </div>
                     <div className="inline-flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-xl border border-primary/10 text-[9px] font-black text-primary uppercase">
                        <Users size={11} className="stroke-[2.5]" />
                        {bus.capacity || 40} Seats
                     </div>
                  </div>
               </div>
            </div>

            {/* Middle Section: Route & Operator Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 relative z-10 w-full xl:w-auto xl:min-w-[320px]">
               {/* Route Card */}
               <div className="bg-muted/30 hover:bg-muted/50 transition-colors p-3.5 rounded-[1.5rem] border border-border/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 flex-shrink-0">
                     <MapPin size={16} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Active Sector Route</p>
                     <p className="text-xs font-black uppercase text-foreground/80 truncate">{bus.routeName || 'No Assigned Route'}</p>
                  </div>
               </div>

               {/* Driver Row */}
               <div className="bg-muted/30 p-3.5 rounded-[1.5rem] border border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                     <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-foreground/10 to-foreground/5 text-foreground/60 flex items-center justify-center flex-shrink-0 font-black text-xs uppercase shadow-sm">
                        {bus.driverName ? bus.driverName.charAt(0) : '?'}
                     </div>
                     <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-foreground/30">Operator</p>
                        <p className="text-xs font-black uppercase text-foreground/70 truncate">{bus.driverName || 'Unassigned'}</p>
                     </div>
                  </div>
                  {bus.driverMobileNumber && (
                     <a 
                        href={`tel:${bus.driverMobileNumber}`} 
                        className="w-9 h-9 rounded-xl bg-success/5 hover:bg-success/15 border border-success/10 hover:border-success/30 text-success flex items-center justify-center transition-all flex-shrink-0"
                        title="Call Driver"
                     >
                        <Phone size={14} className="stroke-[2.5]" />
                     </a>
                  )}
               </div>
            </div>

            {/* Right Section: Telematics, Status Badges & Actions */}
            <div className="flex flex-wrap xl:flex-nowrap items-center gap-4 xl:gap-6 relative z-10 w-full xl:w-auto xl:min-w-[340px] justify-between xl:justify-end xl:pl-4 xl:border-l border-border/40">
               {/* Telematics IDs */}
               <div className="flex flex-col gap-1.5 text-left min-w-[120px]">
                  <div className="flex items-center gap-1.5">
                     <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30">ID:</span>
                     <span className="text-[10px] font-black font-mono text-foreground/60 truncate max-w-[100px]">{bus.gpsDeviceId || 'UNLINKED'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className="text-[8px] font-black uppercase tracking-widest text-foreground/30">IMEI:</span>
                     <span className="text-[10px] font-black font-mono text-foreground/60 truncate max-w-[100px]">{bus.deviceIdentifier || 'UNLINKED'}</span>
                  </div>
               </div>

               {/* Status Badges */}
               <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge variant={bus.status?.toUpperCase() === 'ACTIVE' ? 'success' : 'warning'} className="!px-3 !py-1 !rounded-xl text-[9px] font-black uppercase tracking-widest">{bus.status}</Badge>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    bus.trackingStatus === 'LIVE' 
                      ? 'bg-success/10 text-success border border-success/20 animate-pulse' 
                      : 'bg-muted text-foreground/40 border border-border'
                  }`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${bus.trackingStatus === 'LIVE' ? 'bg-success' : 'bg-muted-foreground/40'}`} />
                     {bus.trackingStatus || 'Offline'}
                  </div>
               </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                   {/* Live Track Vehicle (Permanently Visible Nearby) */}
                   <button 
                    onClick={() => navigate(`/schooladmin/tracking?busId=${bus.id}`)}
                    className="w-12 h-12 rounded-xl bg-muted border border-transparent text-[#88B04B] hover:bg-[#88B04B] hover:text-white transition-all shadow-md flex items-center justify-center hover:shadow-[#88B04B]/20 transition-all duration-300"
                    title="Live Track Vehicle"
                   >
                      <MapPin size={16} className="stroke-[2.5]" />
                   </button>

                   <AnimatePresence mode="wait">
                      {expandedRow === bus.id ? (
                         <motion.div 
                           key="actions"
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: 20 }}
                           className="flex items-center gap-2"
                         >
                            {/* Edit Option */}
                            <button 
                             onClick={() => {
                               handleOpenModal(bus);
                               setExpandedRow(null);
                             }}
                             className="w-12 h-12 rounded-xl bg-muted border border-transparent text-primary hover:border-primary/20 hover:bg-primary hover:text-white transition-all shadow-md flex items-center justify-center hover:shadow-primary/20 transition-all duration-300"
                             title="Edit Vehicle"
                            >
                               <Edit2 size={16} className="stroke-[2.5]" />
                            </button>
                            
                            {/* Delete Option */}
                            <button 
                             onClick={() => {
                               handleDelete(bus.id, bus.busNumber);
                               setExpandedRow(null);
                             }}
                             className="w-12 h-12 rounded-xl bg-muted border border-transparent text-error hover:border-error/20 hover:bg-error hover:text-white transition-all shadow-md flex items-center justify-center hover:shadow-error/20 transition-all duration-300"
                             title="Decommission Asset"
                            >
                               <Trash2 size={16} className="stroke-[2.5]" />
                            </button>

                            {/* Close Option */}
                            <button 
                             onClick={() => setExpandedRow(null)}
                             className="w-12 h-12 rounded-xl bg-muted border border-border text-foreground/40 hover:text-foreground hover:bg-muted/80 transition-all shadow-sm flex items-center justify-center transition-all duration-300"
                             title="Close Operations"
                            >
                               <X size={16} className="stroke-[2.5]" />
                            </button>
                         </motion.div>
                      ) : (
                         <motion.button 
                          key="eye-trigger"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setExpandedRow(bus.id)}
                          className="w-12 h-12 rounded-xl bg-muted border border-transparent text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all shadow-md flex items-center justify-center hover:shadow-primary/20 transition-all duration-300"
                          title="Reveal Operations"
                         >
                            <Eye size={18} className="stroke-[2.5]" />
                         </motion.button>
                      )}
                   </AnimatePresence>
                </div>
            </div>
          </Card>
          ))
        )}

        {/* Horizontal Add Vehicle Button */}
        <Card 
          onClick={() => handleOpenModal()}
          className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-center md:justify-between border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.02] transition-all rounded-[2.5rem] cursor-pointer group gap-6 min-h-[100px]"
        >
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground/30 group-hover:bg-primary group-hover:text-white transition-all duration-500 flex-shrink-0">
                <Plus size={28} className="stroke-[2.5]" />
             </div>
             <div className="text-center md:text-left">
                <h4 className="text-xl font-black tracking-tight text-foreground/60 uppercase group-hover:text-primary transition-colors">Add New Vehicle</h4>
                <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">Authorize inside fleet</p>
             </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 text-xs font-black text-primary uppercase">
             Register Asset
          </div>
        </Card>
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl !bg-card rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex flex-col">
                {/* Modal Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                      <ShieldCheck size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">{isEditing ? 'Update Vehicle' : 'Register Vehicle'}</h2>
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] mt-1">Fleet Asset Registry • V2.0</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center text-foreground/20 hover:text-error hover:bg-error/10 transition-all">
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Bus Identifier</label>
                        <input 
                           required
                           value={formData.busNumber}
                           onChange={(e) => setFormData({...formData, busNumber: e.target.value})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all"
                           placeholder="E.G. B-104"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Govt Registration No</label>
                        <input 
                           required
                           value={formData.busRegisterNumber}
                           onChange={(e) => setFormData({...formData, busRegisterNumber: e.target.value})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all"
                           placeholder="TN-66-A-XXXX"
                        />
                     </div>
                  </div>

 
                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Assigned Driver Name</label>
                        <div className="relative">
                           <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                           <input 
                              required
                              value={formData.driverName}
                              onChange={(e) => setFormData({...formData, driverName: e.target.value})}
                              className="w-full h-14 bg-muted rounded-2xl pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all"
                              placeholder="FULL NAME"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Driver Mobile Number</label>
                        <div className="relative">
                           <Phone size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                           <input 
                              required
                              type="tel"
                              value={formData.driverMobileNumber}
                              onChange={(e) => setFormData({...formData, driverMobileNumber: e.target.value})}
                              className="w-full h-14 bg-muted rounded-2xl pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all"
                              placeholder="10 DIGIT NUMBER"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Route Name / Area</label>
                        <div className="relative">
                           <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                           <input 
                              required
                              value={formData.routeName}
                              onChange={(e) => setFormData({...formData, routeName: e.target.value})}
                              className="w-full h-14 bg-muted rounded-2xl pl-14 pr-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/20 transition-all"
                              placeholder="E.G. SARAVANAMPATTI"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">GPS Provider</label>
                        <select 
                           value={formData.gpsProvider}
                           onChange={(e) => setFormData({...formData, gpsProvider: e.target.value})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black uppercase outline-none cursor-pointer"
                        >
                           <option value="Traccar">Traccar Engine</option>
                           <option value="Simulated">Simulated Node</option>
                           <option value="Standard">Standard GPS</option>
                           <option value="Enterprise">Enterprise Node</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Vehicle Capacity</label>
                        <input 
                           type="number"
                           required
                           value={formData.capacity}
                           onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black outline-none focus:ring-2 ring-primary/20 transition-all"
                           placeholder="40"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Hardware Device ID</label>
                        <input 
                           required
                           value={formData.gpsDeviceId}
                           onChange={(e) => setFormData({...formData, gpsDeviceId: e.target.value})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black font-mono outline-none focus:ring-2 ring-primary/20 transition-all"
                           placeholder="GPS_HWD_XX"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-foreground/30 px-2">Device Identifier (IMEI)</label>
                        <input 
                           required
                           value={formData.deviceIdentifier}
                           onChange={(e) => setFormData({...formData, deviceIdentifier: e.target.value})}
                           className="w-full h-14 bg-muted rounded-2xl px-6 text-sm font-black font-mono outline-none focus:ring-2 ring-primary/20 transition-all"
                           placeholder="15-DIGIT IMEI"
                        />
                     </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                     <Button 
                       type="button"
                       onClick={() => setIsModalOpen(false)}
                       variant="secondary" 
                       className="flex-1 !h-16 !rounded-2xl !text-sm !font-black !uppercase tracking-widest border-none !bg-muted"
                     >
                       Cancel
                     </Button>
                     <Button 
                       type="submit"
                       disabled={submitting}
                       className="flex-[2] !h-16 !rounded-2xl !text-sm !font-black !uppercase tracking-widest !bg-primary shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
                     >
                       {submitting ? 'Processing Asset...' : isEditing ? 'Update Asset' : 'Authorize Asset'}
                       <Save size={20} />
                     </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusManagement;
