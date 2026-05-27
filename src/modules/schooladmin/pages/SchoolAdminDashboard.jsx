import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Bus, 
  MapPin, 
  ShieldCheck, 
  Download,
  Calendar,
  ChevronDown,
  ArrowRight,
  User,
  AlertCircle,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import api from '../../../shared/api';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const calculateBearing = (startLat, startLng, destLat, destLng) => {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

const createAnimatedBusIcon = (busData, bearing, busStatus, isSelected) => {
  const isMoving = busStatus === 'MOVING';
  const scale = isSelected ? 'scale(1.2)' : 'scale(0.8)';
  
  return L.divIcon({
    className: 'custom-live-bus-marker',
    html: `
      <div class="swiggy-marker-wrapper" style="transform: ${scale}; transition: transform 0.3s ease;">
        ${isMoving || isSelected ? `<div class="pulse-ring"></div>` : ''}
        <div class="top-down-bus" style="transform: rotate(${bearing}deg); transition: transform 0.8s linear;">
          <svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 56px; filter: drop-shadow(0px 6px 8px rgba(0,0,0,0.4));">
            <rect x="2" y="24" width="8" height="12" fill="#374151" rx="2"/>
            <rect x="54" y="24" width="8" height="12" fill="#374151" rx="2"/>
            <rect x="8" y="4" width="48" height="120" fill="#FBBF24" rx="8" />
            <rect x="12" y="2" width="40" height="4" fill="#4B5563" rx="2"/>
            <rect x="12" y="122" width="40" height="4" fill="#4B5563" rx="2"/>
            <path d="M10 20 Q 32 14 54 20 L 50 32 L 14 32 Z" fill="#111827" />
            <rect x="14" y="112" width="36" height="6" fill="#111827" rx="2" />
            <rect x="20" y="40" width="24" height="64" fill="#F59E0B" rx="4" />
            <rect x="24" y="48" width="16" height="12" fill="#FDE68A" rx="2" />
            <rect x="24" y="80" width="16" height="12" fill="#FDE68A" rx="2" />
            <rect x="12" y="120" width="8" height="4" fill="#EF4444" rx="1" />
            <rect x="44" y="120" width="8" height="4" fill="#EF4444" rx="1" />
            <rect x="12" y="4" width="8" height="4" fill="#FEF08A" rx="1" />
            <rect x="44" y="4" width="8" height="4" fill="#FEF08A" rx="1" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [60, 60],
    iconAnchor: [30, 30],
  });
};

const DashboardLiveBusMarker = ({ bus, isSelected, onSelect }) => {
  const [prevPos, setPrevPos] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [busStatus, setBusStatus] = useState(bus.trackingStatus || 'IDLE');
  
  useEffect(() => {
    if (prevPos && (prevPos[0] !== bus.latitude || prevPos[1] !== bus.longitude)) {
      setBearing(calculateBearing(prevPos[0], prevPos[1], bus.latitude, bus.longitude));
      setPrevPos([bus.latitude, bus.longitude]);
      setLastMovedAt(Date.now());
    } else if (!prevPos) {
      setPrevPos([bus.latitude, bus.longitude]);
    } else if (bus.speed > 0) {
      setLastMovedAt(Date.now());
    }
  }, [bus.latitude, bus.longitude, bus.speed, prevPos]);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      if (bus?.speed > 0) {
        setBusStatus('MOVING');
      } else {
        const stoppedDuration = (Date.now() - lastMovedAt) / 1000;
        if (stoppedDuration > 48) {
          setBusStatus('STOPPED');
        } else {
          setBusStatus('IDLE');
        }
      }
    }, 1000);
    return () => clearInterval(statusInterval);
  }, [bus, lastMovedAt]);

  return (
    <Marker 
      position={[bus.latitude, bus.longitude]}
      icon={createAnimatedBusIcon(bus, bearing, busStatus, isSelected)}
      zIndexOffset={isSelected ? 9999 : 0}
      eventHandlers={{ click: () => onSelect(bus) }}
    />
  );
};

const customStopIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/96/marker--v1.png',
  iconSize: [20, 20],
  iconAnchor: [10, 20],
});

const SchoolAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 1248,
    busFleet: 28,
    drivers: 32,
    routes: 18,
    performance: 92,
    busOverview: { onRoute: 14, standby: 6, maintenance: 3, inactive: 5 },
    chartData: [
      { month: 'Jan', value: 45 }, { month: 'Feb', value: 52 }, { month: 'Mar', value: 48 },
      { month: 'Apr', value: 61 }, { month: 'May', value: 55 }, { month: 'Jun', value: 67 }
    ],
    alerts: []
  });
  const [fleet, setFleet] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isChartMenuOpen, setIsChartMenuOpen] = useState(false);
  const [chartRange, setChartRange] = useState('This Month');

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading) {
      // Mock different data based on the selected range to make the chart interactive
      const newChartData = [];
      if (chartRange === 'This Week') {
        newChartData.push({ month: 'Mon', value: 82 }, { month: 'Tue', value: 88 }, { month: 'Wed', value: 95 }, { month: 'Thu', value: 90 }, { month: 'Fri', value: 92 });
      } else if (chartRange === 'This Quarter') {
        newChartData.push({ month: 'Week 1', value: 85 }, { month: 'Week 4', value: 88 }, { month: 'Week 8', value: 92 }, { month: 'Week 12', value: 94 });
      } else if (chartRange === 'This Year') {
        newChartData.push({ month: 'Jan', value: 80 }, { month: 'Apr', value: 85 }, { month: 'Jul', value: 90 }, { month: 'Oct', value: 92 }, { month: 'Dec', value: 96 });
      } else {
        newChartData.push({ month: 'Jan', value: 85 }, { month: 'Feb', value: 88 }, { month: 'Mar', value: 92 }, { month: 'Apr', value: 89 }, { month: 'May', value: 95 }, { month: 'Jun', value: 94 });
      }
      setStats(prev => ({ ...prev, chartData: newChartData }));
    }
  }, [chartRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/school-admin');
      const data = response.data.data;
      
      if (data) {
        setStats(prev => ({
          ...prev,
          totalStudents: data.totalStudents || prev.totalStudents,
          busFleet: data.busFleet || prev.busFleet,
          performance: data.fleetEfficiency || prev.performance,
          drivers: data.totalDrivers || prev.drivers,
          routes: data.totalRoutes || prev.routes,
          busOverview: data.busOverview || prev.busOverview,
          chartData: data.chartData || prev.chartData,
          alerts: data.alerts || prev.alerts
        }));
        if (data.fleetLocations) {
           setFleet(data.fleetLocations);
           const firstLive = data.fleetLocations.find(b => b.trackingStatus === 'LIVE' && b.latitude && b.longitude);
           setSelectedBus(firstLive || data.fleetLocations[0] || null);
        }
      }
    } catch (error) {
      console.error('Error fetching school stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Mock Map Route
  const routePoints = [
    [11.0168, 76.9558],
    [11.0180, 76.9600],
    [11.0200, 76.9650],
    [11.0220, 76.9620],
    [11.0250, 76.9700]
  ];

  const handleDownloadReport = () => {
    navigate('/schooladmin/reports');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto text-[#1a2e1a] font-['Outfit',sans-serif] pb-10">
      <style>{`
        .custom-live-bus-marker {
          transition: margin 0.8s linear, transform 0.8s linear !important; 
          z-index: 1000 !important;
        }
        .swiggy-marker-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .top-down-bus {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          will-change: transform;
        }
        .pulse-ring {
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #88B04B;
          opacity: 0;
          animation: swiggy-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 5;
        }
        @keyframes swiggy-pulse {
          0% { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {getGreeting()}, School Admin!
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Here's what's happening with your school transport today.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={handleDownloadReport}
             className="flex items-center gap-2 px-5 py-2.5 bg-[#88B04B] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#729c3a] transition-colors"
           >
              Download Report <Download size={16} />
           </button>
           <div className="relative">
             <button onClick={() => document.getElementById('dashboard-date')?.showPicker?.()} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                <Calendar size={16} className="text-slate-400" />
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : currentDate}
                <ChevronDown size={14} className="text-slate-400" />
             </button>
             <input 
               type="date" 
               id="dashboard-date"
               className="absolute top-0 right-0 w-8 h-full opacity-0 cursor-pointer"
               onChange={(e) => setSelectedDate(e.target.value)}
             />
           </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
         {/* Card 1 */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <Users size={22} className="text-emerald-600" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Students</p>
               <h3 className="text-2xl font-black mt-0.5">{loading ? "..." : stats.totalStudents.toLocaleString()}</h3>
               <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 12 this month</p>
            </div>
         </div>
         {/* Card 2 */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <Bus size={22} className="text-emerald-600" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Buses</p>
               <h3 className="text-2xl font-black mt-0.5">{loading ? "..." : stats.busFleet}</h3>
               <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 2 this month</p>
            </div>
         </div>
         {/* Card 3 */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <User size={22} className="text-emerald-600" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Drivers</p>
               <h3 className="text-2xl font-black mt-0.5">{loading ? "..." : stats.drivers}</h3>
               <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 3 this month</p>
            </div>
         </div>
         {/* Card 4 */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
               <MapPin size={22} className="text-slate-400" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Total Routes</p>
               <h3 className="text-2xl font-black mt-0.5">{loading ? "..." : stats.routes}</h3>
               <p className="text-[11px] font-bold text-slate-400 mt-1">No change</p>
            </div>
         </div>
         {/* Card 5 */}
         <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
               <ShieldCheck size={22} className="text-emerald-600" />
            </div>
            <div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide leading-tight">On Time Performance</p>
               <h3 className="text-2xl font-black mt-0.5">{loading ? "..." : `${stats.performance}%`}</h3>
               <p className="text-[11px] font-bold text-emerald-600 mt-1">↑ 5% this week</p>
            </div>
         </div>
      </div>

      {/* Main Grid: Map & Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* Left Side: Map Card (Span 2) */}
         <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col h-[520px]">
            <div className="flex justify-between items-center mb-5">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-lg font-black tracking-tight">Live Bus Tracking</h3>
               </div>
               <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
               </span>
            </div>
            
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-100 bg-[#f8f9fa]">
               {/* Map Background Layer */}
               <MapContainer center={[11.0200, 76.9600]} zoom={13} zoomControl={false} className="h-full w-full absolute inset-0 z-0" attributionControl={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  
                  {/* Dynamic Bus Markers */}
                  {fleet.map((bus) => {
                    if (bus.latitude && bus.longitude) {
                      return (
                        <DashboardLiveBusMarker
                          key={bus.id}
                          bus={bus}
                          isSelected={selectedBus?.id === bus.id}
                          onSelect={setSelectedBus}
                        />
                      );
                    }
                    return null;
                  })}
               </MapContainer>

               {/* Floating Map Info Card */}
               {selectedBus && (
               <div className="absolute top-3 left-3 md:top-6 md:left-6 z-[10] bg-white/95 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-5 w-[160px] md:w-64 shadow-lg border border-slate-100">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                     <div>
                        <h4 className="font-black text-[11px] md:text-sm">{selectedBus.busRegisterNumber || selectedBus.busNumber}</h4>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-400 mt-0.5">{selectedBus.routeName || 'Unknown Route'}</p>
                     </div>
                     <span className={`px-1.5 md:px-2 py-0.5 text-[7px] md:text-[9px] font-black uppercase rounded-full ${selectedBus.trackingStatus === 'LIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        {selectedBus.trackingStatus === 'LIVE' ? 'On Route' : 'Offline'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2 md:mb-4 pb-2 md:pb-4 border-b border-slate-100">
                     <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedBus.driverName || 'Driver')}&background=f1f5f9&color=64748b`} className="w-5 h-5 md:w-8 md:h-8 rounded-full" />
                     <div>
                        <p className="text-[7px] md:text-[9px] font-bold text-slate-400 uppercase">Driver</p>
                        <p className="text-[9px] md:text-xs font-bold">{selectedBus.driverName || 'Not Assigned'}</p>
                     </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-3 mb-3 md:mb-5">
                     <div className="flex justify-between">
                        <span className="text-[8px] md:text-[11px] font-bold text-slate-400">Bus No</span>
                        <span className="text-[8px] md:text-[11px] font-black">{selectedBus.busNumber || 'N/A'}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[8px] md:text-[11px] font-bold text-slate-400">Speed</span>
                        <span className="text-[8px] md:text-[11px] font-black">{Math.round(selectedBus.speed || 0)} km/h</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[8px] md:text-[11px] font-bold text-slate-400">Status</span>
                        <span className="text-[8px] md:text-[11px] font-black">{selectedBus.trackingStatus}</span>
                     </div>
                     <div className="flex justify-between">
                        <span className="text-[8px] md:text-[11px] font-bold text-slate-400">Capacity</span>
                        <span className="text-[8px] md:text-[11px] font-black">{selectedBus.capacity || 0} Seats</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => navigate('/schooladmin/tracking')}
                    className="w-full py-1.5 md:py-2.5 bg-[#88B04B] text-white text-[9px] md:text-xs font-black rounded-lg md:rounded-xl hover:bg-[#729c3a] transition-colors flex justify-center items-center gap-1.5 shadow-sm"
                  >
                     <MapPin size={12} className="md:w-3.5 md:h-3.5" /> View Details
                  </button>
               </div>
               )}
            </div>
         </div>

         {/* Right Side Stack: Donut Chart & Alerts */}
         <div className="xl:col-span-1 flex flex-col gap-6 h-[520px]">
            {/* Bus Overview Chart Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex-1 flex flex-col">
               <h3 className="text-lg font-black tracking-tight mb-4">Bus Overview</h3>
               <div className="flex-1 flex items-center justify-between">
                  {/* CSS SVG Donut Chart */}
                  <div className="relative w-36 h-36 shrink-0">
                     <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Gray (Inactive) */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset="0" />
                        {/* Yellow (Maintenance) */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - ((stats.busOverview.inactive + stats.busOverview.maintenance) / Math.max(stats.busFleet, 1)))}`} />
                        {/* Light Green (Standby) */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#bbf7d0" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - ((stats.busFleet - stats.busOverview.onRoute) / Math.max(stats.busFleet, 1)))}`} />
                        {/* Green (On Route) */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#88B04B" strokeWidth="16" strokeDasharray="251.2" strokeDashoffset={`${251.2 * (1 - (stats.busOverview.onRoute / Math.max(stats.busFleet, 1)))}`} />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black">{loading ? "..." : stats.busFleet}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Total Buses</span>
                     </div>
                  </div>

                  <div className="flex-1 ml-6 space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-[3px] bg-[#88B04B]" />
                           <span className="text-[11px] font-bold text-slate-600">On Route</span>
                        </div>
                        <span className="text-[11px] font-black">{stats.busOverview.onRoute}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-[3px] bg-[#bbf7d0]" />
                           <span className="text-[11px] font-bold text-slate-600">Standby</span>
                        </div>
                        <span className="text-[11px] font-black">{stats.busOverview.standby}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-[3px] bg-[#fbbf24]" />
                           <span className="text-[11px] font-bold text-slate-600">Maintenance</span>
                        </div>
                        <span className="text-[11px] font-black">{stats.busOverview.maintenance}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <div className="w-2.5 h-2.5 rounded-[3px] bg-slate-300" />
                           <span className="text-[11px] font-bold text-slate-600">Inactive</span>
                        </div>
                        <span className="text-[11px] font-black">{stats.busOverview.inactive}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Alerts & Notifications Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-black tracking-tight">Alerts & Notifications</h3>
                  <button onClick={() => navigate('/schooladmin/notifications')} className="text-[10px] font-bold text-slate-500 hover:text-[#1a2e1a]">View All</button>
               </div>
               <div className="space-y-5 overflow-y-auto pr-2 no-scrollbar">
                  {stats.alerts.map((alert, i) => (
                    <div key={alert.id || i} className="flex items-start justify-between gap-4">
                       <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            alert.title.toLowerCase().includes('track') || alert.title.toLowerCase().includes('safe') 
                              ? 'bg-emerald-50 text-emerald-500' 
                              : alert.title.toLowerCase().includes('delay') 
                                ? 'bg-amber-50 text-amber-500' 
                                : 'bg-red-50 text-red-500'
                          }`}>
                             {alert.title.toLowerCase().includes('track') ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <div>
                             <h5 className="text-[11.5px] font-bold">{alert.title}</h5>
                             <p className="text-[10px] text-slate-400 mt-0.5">{alert.body}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                         {new Date(alert.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                  ))}
                  {stats.alerts.length === 0 && (
                     <p className="text-xs text-slate-400 text-center py-4">No recent alerts</p>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Bottom Row: Table & Line Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
         {/* Table Card */}
         <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
               <div>
                  <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                     <Bus size={18} className="text-[#88B04B]" /> Bus Usage & Performance
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">Overview of bus usage and performance this month</p>
               </div>
               <button onClick={() => navigate('/schooladmin/buses')} className="px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-bold hover:bg-slate-50 transition-colors">View All</button>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                     <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                        <th className="py-3 px-4 text-[10px] font-bold text-white/80 uppercase">Bus</th>
                        <th className="py-3 text-[10px] font-bold text-white/80 uppercase">Route</th>
                        <th className="py-3 text-[10px] font-bold text-white/80 uppercase">Trips</th>
                        <th className="py-3 text-[10px] font-bold text-white/80 uppercase">Students</th>
                        <th className="py-3 text-[10px] font-bold text-white/80 uppercase">Performance</th>
                        <th className="py-3 px-4 text-[10px] font-bold text-white/80 uppercase text-right pr-2">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {fleet.slice(0, 5).map((bus) => (
                       <tr key={bus.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-xs font-black">{bus.busRegisterNumber || bus.busNumber}</td>
                          <td className="py-4 text-xs font-bold text-slate-600">{bus.routeName || 'N/A'}</td>
                          <td className="py-4 text-xs font-bold text-slate-600">{bus.trackingStatus === 'LIVE' ? '2' : '0'}</td>
                          <td className="py-4 text-xs font-bold text-slate-600">{bus.capacity || 0}</td>
                          <td className="py-4">
                             <div className="flex items-center gap-3">
                                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-[#88B04B]" style={{ width: `${bus.trackingStatus === 'LIVE' ? 100 : 75}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-600">{bus.trackingStatus === 'LIVE' ? '100%' : '75%'}</span>
                             </div>
                          </td>
                          <td className="py-4 text-right">
                             <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase rounded-full border ${
                               bus.trackingStatus === 'LIVE' 
                               ? 'bg-white border-emerald-200 text-emerald-600' 
                               : bus.status === 'MAINTENANCE' 
                               ? 'bg-red-50 border-red-200 text-red-600'
                               : 'bg-amber-50 border-amber-200 text-amber-600'
                             }`}>
                               {bus.trackingStatus === 'LIVE' ? 'On Route' : bus.status}
                             </span>
                          </td>
                       </tr>
                     ))}
                     {fleet.length === 0 && !loading && (
                       <tr>
                         <td colSpan="6" className="py-8 text-center text-xs text-slate-400">No buses available</td>
                       </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Line Chart Card */}
         <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[300px]">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-lg font-black tracking-tight">Monthly Performance</h3>
                  <p className="text-[11px] font-medium text-slate-400 mt-1">Bus performance overview</p>
               </div>
               <div className="relative">
                 <button 
                   onClick={() => setIsChartMenuOpen(!isChartMenuOpen)} 
                   className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition-colors"
                 >
                    {chartRange} <ChevronDown size={14} />
                 </button>
                 {isChartMenuOpen && (
                   <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-1 overflow-hidden">
                     {['This Week', 'This Month', 'This Quarter', 'This Year'].map(range => (
                       <button 
                         key={range}
                         onClick={() => { setChartRange(range); setIsChartMenuOpen(false); }}
                         className="w-full text-left px-4 py-2 text-[10px] font-bold hover:bg-slate-50 text-slate-600 transition-colors"
                       >
                         {range}
                       </button>
                     ))}
                   </div>
                 )}
               </div>
            </div>
            
            <div className="flex-1 relative mt-4 min-h-[220px] w-full">
               {/* Y-axis labels */}
               <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[9px] font-bold text-slate-400 text-right pr-2 z-10">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
               </div>
               {/* Grid lines */}
               <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between z-0">
                  <div className="w-full border-t border-slate-100 border-dashed" />
                  <div className="w-full border-t border-slate-100 border-dashed" />
                  <div className="w-full border-t border-slate-100 border-dashed" />
                  <div className="w-full border-t border-slate-100 border-dashed" />
                  <div className="w-full border-t border-slate-100 border-dashed" />
               </div>
               
               {/* Bar Chart */}
               <div className="absolute left-8 right-0 top-0 bottom-6 z-10 flex items-end justify-between px-2 sm:px-4">
                  {stats.chartData.map((d, i) => (
                    <div key={i} className="w-4 sm:w-10 relative flex flex-col items-center justify-end h-full group">
                      {/* Tooltip */}
                      <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                        {d.value}%
                      </div>
                      {/* Bar */}
                      <div 
                        className="w-full bg-[#88B04B] rounded-t-md transition-all duration-500 ease-out hover:bg-[#729c3a]" 
                        style={{ height: `${d.value || 0}%` }}
                      />
                    </div>
                  ))}
               </div>

               {/* X-axis labels */}
               <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-end text-[9px] sm:text-[10px] font-bold text-slate-400 px-2 sm:px-4">
                  {stats.chartData.map((d, i) => (
                    <div key={i} className="w-4 sm:w-10 text-center truncate">{d.month}</div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
