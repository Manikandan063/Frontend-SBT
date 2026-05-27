import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Bus,
  ArrowRight,
  Search,
  SlidersHorizontal,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import Header from '../../shared/components/Header';
import api from '../../shared/api/axios';

const MyTrips = () => {
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(localStorage.getItem('selectedChildId'));
  const [loading, setLoading] = useState(true);
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [journeyType, setJourneyType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/parents/profile');
        const profile = response.data.data;
        if (profile && Array.isArray(profile.children)) {
          setChildren(profile.children);
          if (!selectedChildId && profile.children.length > 0) {
            setSelectedChildId(profile.children[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch children for trips:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const schoolName = selectedChild?.school?.schoolName || 'School Campus';
  const busNumber = selectedChild?.bus?.busNumber || 'Bus-Active';

  const generateTrips = () => {
    if (!selectedChild) return [];
    
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    return [
      { id: 1, status: 'Upcoming', type: 'Evening Drop', date: `Today, ${today}`, busId: busNumber, pickup: schoolName, destination: selectedChild.pickupPoint || 'Home' },
      { id: 2, status: 'Completed', type: 'Morning Pickup', date: `Today, ${today}`, busId: busNumber, pickup: selectedChild.pickupPoint || 'Home', destination: schoolName },
      { id: 3, status: 'Completed', type: 'Morning Pickup', date: `Yesterday, ${yesterday}`, busId: busNumber, pickup: selectedChild.pickupPoint || 'Home', destination: schoolName },
      { id: 4, status: 'Completed', type: 'Evening Drop', date: `Yesterday, ${yesterday}`, busId: busNumber, pickup: schoolName, destination: selectedChild.pickupPoint || 'Home' },
    ];
  };

  const allTrips = generateTrips();
  const TRIPS = allTrips.filter(t => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesType = journeyType === 'All' || t.type.includes(journeyType);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      t.pickup?.toLowerCase().includes(searchLower) || 
      t.destination?.toLowerCase().includes(searchLower) ||
      t.busId?.toLowerCase().includes(searchLower) ||
      t.type?.toLowerCase().includes(searchLower) ||
      t.date?.toLowerCase().includes(searchLower) ||
      t.status?.toLowerCase().includes(searchLower);

    return matchesStatus && matchesType && matchesSearch;
  });

  const activeFilterCount = (statusFilter !== 'All' ? 1 : 0) + (journeyType !== 'All' ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Syncing Journey...</p>
      </div>
    );
  }

  return (
    <div className="matte-green-theme min-h-screen pb-32 relative bg-[#f8fafc] overflow-hidden">
      {/* Light Luxury SaaS Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="fixed top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#88B04B]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FACC15]/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Premium Solid Floating Header with Flat Bus Illustration */}
      <div className="relative z-10 px-4 pt-5 pb-2">
        <div className="bg-white rounded-[28px] px-6 py-5 shadow-[0_8px_24px_-6px_rgba(136,176,75,0.15)] dark:shadow-none border border-slate-100">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#88B04B]/10 text-[#88B04B] rounded-full text-[8.5px] font-black uppercase tracking-[0.2em] w-fit border border-[#88B04B]/20">
              <Calendar size={12} />
              History & Schedule
            </span>
            <h1 className="text-2xl font-black tracking-tight text-foreground uppercase leading-none drop-shadow-sm mt-0.5">
              Journey Logs
            </h1>

            {/* Flat Road & Bus Illustration */}
            <div className="w-full h-[20px] mt-1 relative pointer-events-none select-none">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 20" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 0,15 L 300,15" fill="none" stroke="#88B04B" strokeWidth="2" strokeDasharray="5 3" className="opacity-40" />
                <g>
                  <style>{`
                    @keyframes flat-bus-entry {
                      0% { transform: translateX(-50px); }
                      30% { transform: translateX(60px); }
                      100% { transform: translateX(180px); }
                    }
                    @keyframes flat-bus-bounce {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-0.8px); }
                    }
                    .flat-bus-group { 
                      animation: flat-bus-entry 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; 
                    }
                    .flat-bus-body { animation: flat-bus-bounce 0.5s infinite linear; }
                  `}</style>
                  <g className="flat-bus-group" transform="translate(0, -2)">
                    <g className="flat-bus-body">
                      <rect x="0" y="2" width="22" height="12" rx="2.5" fill="#F8BC1C" />
                      <rect x="-1" y="10" width="1.5" height="3" rx="0.5" fill="#3D4042" />
                      <rect x="2" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="7" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="12" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="17" y="4" width="3.5" height="4" rx="0.5" fill="#2E4A62" />
                      <rect x="0" y="9" width="22" height="1" fill="#3D4042" />
                    </g>
                    <circle cx="5" cy="14" r="2.5" fill="#2B2B2B" />
                    <circle cx="5" cy="14" r="1" fill="#FAFBF6" />
                    <circle cx="17" cy="14" r="2.5" fill="#2B2B2B" />
                    <circle cx="17" cy="14" r="1" fill="#FAFBF6" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 mt-4 space-y-6 relative z-20">
        {/* Child Selector */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {children.map((child) => (
            <button 
              key={child.id} 
              onClick={() => setSelectedChildId(child.id)} 
              className={`px-6 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest transition-all shrink-0 ${selectedChildId === child.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-card text-foreground/40 border-border'}`}
            >
              {child.studentName.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Search & Filter Button Group */}
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20" style={{ color: '#FACC15' }}>
              <Search size={20} />
            </div>
            <input 
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-card border border-border rounded-[24px] pl-14 pr-6 py-4 text-sm font-bold placeholder:text-foreground/20 placeholder:font-bold outline-none focus:bg-card/80 focus:border-primary/20 transition-all text-foreground"
            />
          </div>
          <button 
            onClick={() => setShowFilterDrawer(true)}
            className={`w-14 h-14 rounded-[22px] flex items-center justify-center border transition-all relative ${activeFilterCount > 0 ? 'bg-primary border-primary text-white shadow-md' : 'bg-card border-border'}`}
            style={{ color: activeFilterCount > 0 ? '#FFFFFF' : '#FACC15' }}
          >
            <SlidersHorizontal size={22} />
            {activeFilterCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
                {activeFilterCount}
              </div>
            )}
          </button>
        </div>

        {/* Filter Drawer / Modal */}
        <AnimatePresence>
          {showFilterDrawer && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilterDrawer(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 inset-x-0 bg-background rounded-t-[40px] p-8 z-[101] border-t border-border shadow-2xl"
              >
                <div className="w-12 h-1.5 bg-foreground/10 rounded-full mx-auto mb-8" />
                
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">Filter Journeys</h3>
                  <button onClick={() => {setStatusFilter('All'); setJourneyType('All'); setSearchTerm('')}} className="text-[10px] font-bold text-primary uppercase tracking-widest">Reset All</button>
                </div>

                <div className="space-y-8">
                  {/* Status Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Select Status</p>
                    <div className="flex flex-wrap gap-3">
                      {['All', 'Upcoming', 'Completed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            statusFilter === status 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-card text-foreground/40 border border-border'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type Section */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Journey Type</p>
                    <div className="flex flex-wrap gap-3">
                      {['All', 'Morning', 'Evening'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setJourneyType(type)}
                          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            journeyType === type 
                              ? 'bg-secondary text-white shadow-md' 
                              : 'bg-card text-foreground/40 border border-border'
                          }`}
                        >
                          {type === 'All' ? 'Any Type' : type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowFilterDrawer(false)}
                    className="w-full py-5 bg-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] shadow-lg mt-4 active:scale-[0.98] transition-all"
                  >
                    Apply Filters
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {TRIPS.map((trip) => (
            <div 
              key={trip.id} 
              onClick={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id)}
              className="premium-card group cursor-pointer"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${trip.status === 'Upcoming' ? 'bg-primary animate-pulse' : 'bg-primary'}`} />
                  <span className="font-bold text-[10px] uppercase text-foreground tracking-widest">{trip.type}</span>
                </div>
                <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{trip.date}</span>
              </div>
              
              <div className="flex items-center gap-4 bg-foreground/[0.03] p-5 rounded-2xl">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest mb-1">From</p>
                  <p className="text-[11px] font-extrabold truncate text-foreground/80">{trip.pickup}</p>
                </div>
                <div className="w-8 h-8 bg-card rounded-full flex items-center justify-center border border-border">
                  <ArrowRight size={14} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden text-right">
                  <p className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest mb-1">To</p>
                  <p className="text-[11px] font-extrabold truncate text-foreground/80">{trip.destination}</p>
                </div>
              </div>

              {/* Expandable Timeline Section */}
              <AnimatePresence>
                {expandedTripId === trip.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-6 pt-6 border-t border-dashed border-border">
                      <div className="relative px-2 pb-2">
                        <div className="flex flex-col">
                          {/* Timeline Items */}
                          {[
                            { 
                              label: 'Bus Started', 
                              time: trip.type.includes('Morning') ? '07:30 AM' : '03:30 PM', 
                              status: 'completed',
                              icon: <Bus size={14} />
                            },
                            { 
                              label: trip.type.includes('Morning') ? 'Student Picked' : 'Student Dropped', 
                              time: trip.type.includes('Morning') ? '07:45 AM' : '03:45 PM', 
                              status: 'completed',
                              icon: <MapPin size={14} />
                            },
                            { 
                              label: trip.type.includes('Morning') ? 'Arrived School' : 'Bus Parked', 
                              time: trip.type.includes('Morning') ? '08:15 AM' : '04:15 PM', 
                              status: trip.status === 'Completed' ? 'completed' : 'pending',
                              icon: <CheckCircle2 size={14} />
                            }
                          ].map((step, idx, arr) => (
                            <div key={idx} className="flex items-stretch gap-4">
                              {/* Icon & Line Column */}
                              <div className="flex flex-col items-center w-8 shrink-0">
                                {/* Icon Circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                                  step.status === 'completed' 
                                    ? 'bg-[#88B04B] shadow-lg shadow-[#88B04B]/20 text-white' 
                                    : 'bg-slate-100 border border-slate-200 text-slate-400'
                                }`}>
                                  {step.icon}
                                </div>
                                {/* Connecting Line */}
                                {idx !== arr.length - 1 && (
                                  <div className={`w-1 grow my-1 rounded-full ${
                                    arr[idx + 1].status === 'completed' ? 'bg-[#88B04B]' : 'bg-slate-100'
                                  }`} />
                                )}
                              </div>
                              
                              {/* Content Column */}
                              <div className={`flex-1 ${idx !== arr.length - 1 ? 'pb-6' : ''}`}>
                                <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
                                  step.status === 'completed' 
                                    ? 'bg-white border-slate-100 shadow-sm' 
                                    : 'bg-slate-50 border-slate-100/50'
                                }`}>
                                  <div>
                                    <h5 className={`text-[11px] font-extrabold uppercase tracking-tight ${step.status === 'completed' ? 'text-slate-800' : 'text-slate-400'}`}>
                                      {step.label}
                                    </h5>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automated Check-in</p>
                                  </div>
                                  <div className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                    step.status === 'completed' ? 'bg-[#88B04B]/10 text-[#88B04B]' : 'bg-slate-200/50 text-slate-400'
                                  }`}>
                                    {step.time}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-6 pt-6 border-t border-foreground/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-foreground/5 rounded-xl flex items-center justify-center">
                    <Bus size={18} className="text-foreground/40" />
                  </div>
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{trip.busId}</span>
                </div>
                <div className="flex items-center gap-3">
                  {trip.status === 'Completed' && (
                    <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/10">
                      <span className="text-[8px] font-bold text-primary uppercase">Reached</span>
                    </div>
                  )}
                  <span className="text-[8px] font-bold text-foreground/20 uppercase tracking-widest">{expandedTripId === trip.id ? 'Close' : 'Details'}</span>
                </div>
              </div>
            </div>
          ))}
          {TRIPS.length === 0 && (
            <div className="py-32 text-center">
              <div className="w-16 h-16 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 text-foreground/20">
                <Calendar size={32} />
              </div>
              <p className="text-foreground/30 font-bold text-[10px] uppercase tracking-[0.2em]">No logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTrips;
