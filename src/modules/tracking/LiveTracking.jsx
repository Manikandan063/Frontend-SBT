import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Bus as BusIcon,
  ShieldCheck,
  LocateFixed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ROUTES } from '../../config/routes';
import api from '../../shared/api/axios';
import { useTheme } from '../../shared/context/ThemeContext';

// Leaflet Icon Fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const schoolIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/color/96/school.png', 
  iconSize: [50, 50],
  iconAnchor: [25, 50],
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

const createAnimatedBusIcon = (busData, bearing, busStatus) => {
  const isMoving = busStatus === 'MOVING';
  
  return L.divIcon({
    className: 'custom-live-bus-marker',
    html: `
      <div class="swiggy-marker-wrapper">
        <!-- Pulsing Ring -->
        ${isMoving ? `<div class="pulse-ring"></div>` : ''}
        
        <!-- Top-Down Bus -->
        <div class="top-down-bus" style="transform: rotate(${bearing}deg); transition: transform 0.8s linear;">
          <svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 56px; filter: drop-shadow(0px 6px 8px rgba(0,0,0,0.4));">
            <!-- Mirrors -->
            <rect x="2" y="24" width="8" height="12" fill="#374151" rx="2"/>
            <rect x="54" y="24" width="8" height="12" fill="#374151" rx="2"/>
            
            <!-- Main Body -->
            <rect x="8" y="4" width="48" height="120" fill="#FBBF24" rx="8" />
            
            <!-- Bumpers -->
            <rect x="12" y="2" width="40" height="4" fill="#4B5563" rx="2"/>
            <rect x="12" y="122" width="40" height="4" fill="#4B5563" rx="2"/>

            <!-- Front Windshield -->
            <path d="M10 20 Q 32 14 54 20 L 50 32 L 14 32 Z" fill="#111827" />

            <!-- Rear Window -->
            <rect x="14" y="112" width="36" height="6" fill="#111827" rx="2" />

            <!-- Roof details -->
            <rect x="20" y="40" width="24" height="64" fill="#F59E0B" rx="4" />
            <rect x="24" y="48" width="16" height="12" fill="#FDE68A" rx="2" />
            <rect x="24" y="80" width="16" height="12" fill="#FDE68A" rx="2" />

            <!-- Tail Lights -->
            <rect x="12" y="120" width="8" height="4" fill="#EF4444" rx="1" />
            <rect x="44" y="120" width="8" height="4" fill="#EF4444" rx="1" />

            <!-- Headlights -->
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

const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: '<div class="user-dot"><div class="user-dot-pulse"></div></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const isValidCoord = (lat, lng) => {
  const pLat = parseFloat(lat);
  const pLng = parseFloat(lng);
  return !isNaN(pLat) && !isNaN(pLng);
};

const createStudentIcon = (photoUrl, name) => {
  if (photoUrl) {
    return L.divIcon({
      className: 'custom-student-marker',
      html: `
        <div class="student-marker-wrapper">
           <img src="https://img.icons8.com/color/48/marker--v1.png" class="pin-bg" />
           <div class="student-photo-overlay">
             <img src="${photoUrl}" onerror="this.src='https://ui-avatars.com/api/?name=${name}&background=0F4C5C&color=fff'" />
           </div>
        </div>
      `,
      iconSize: [40, 45],
      iconAnchor: [20, 45],
    });
  }
  return new L.Icon({
    iconUrl: 'https://img.icons8.com/color/96/marker--v1.png',
    iconSize: [45, 45],
    iconAnchor: [22, 45],
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  const hasFitInitially = useRef(false);
  
  useEffect(() => {
    if (!center) return;
    if (isNaN(center[0]) || isNaN(center[1])) return;
    if (hasFitInitially.current) return;

    // Use setView instead of flyTo for the initial immediate load to prevent animation glitches
    map.setView(center, 16);
    hasFitInitially.current = true;
  }, [center, map]);

  return null;
};

const LocateControl = ({ onLocate }) => {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  const handleLocate = () => {
    setLocating(true);
    map.locate({ enableHighAccuracy: true })
      .on('locationfound', (e) => {
        map.flyTo(e.latlng, 17, { animate: true });
        onLocate(e.latlng);
        setLocating(false);
      })
      .on('locationerror', (err) => {
        console.warn("Location error:", err.message);
        alert("Unable to find your location. Please ensure GPS is enabled.");
        setLocating(false);
      });
  };

  return (
    <button 
      onClick={handleLocate}
      disabled={locating}
      className={`absolute right-6 top-32 z-[1000] p-4 bg-card/90 backdrop-blur-md rounded-[24px] border border-border shadow-sm text-foreground active:scale-95 transition-all pointer-events-auto ${locating ? 'animate-pulse' : ''}`}
    >
      <LocateFixed size={24} />
    </button>
  );
};

const LiveBusMarker = ({ bus }) => {
  const [prevPos, setPrevPos] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [busStatus, setBusStatus] = useState('IDLE');
  
  useEffect(() => {
    if (prevPos && (prevPos[0] !== bus.lat || prevPos[1] !== bus.lng)) {
      setBearing(calculateBearing(prevPos[0], prevPos[1], bus.lat, bus.lng));
      setPrevPos([bus.lat, bus.lng]);
      setLastMovedAt(Date.now());
    } else if (!prevPos) {
      setPrevPos([bus.lat, bus.lng]);
    } else if (bus.speed > 0) {
      setLastMovedAt(Date.now());
    }
  }, [bus.lat, bus.lng, bus.speed, prevPos]);

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
    <Marker position={[bus.lat, bus.lng]} icon={createAnimatedBusIcon(bus, bearing, busStatus)} zIndexOffset={1000}>
      <Popup className="custom-dark-popup" offset={[0, -25]}>
        <div className="relative bg-[#1a1c1e]/95 backdrop-blur-xl p-4 rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex flex-col font-['Outfit'] min-w-[230px] border border-white/10 overflow-visible">
          {/* Glowing orb background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#88B04B]/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>
          
          {/* Bottom pointer */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#1a1c1e] border-b border-r border-white/10 rotate-45"></div>

          {/* Header: Driver Info & Bus Badge */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                 <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/10 bg-[#0f1113]">
                   <img src={`https://ui-avatars.com/api/?name=${bus.driverName || bus.busInfo?.driverName || 'Driver'}&background=88B04B&color=fff`} className="w-full h-full object-cover" />
                 </div>
                 {/* Driver Status Dot */}
                 <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1a1c1e] shadow-sm ${busStatus === 'MOVING' ? 'bg-[#10B981]' : busStatus === 'IDLE' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'}`}></span>
              </div>
              <div className="flex flex-col">
                 <span className="font-black text-white text-[13px] leading-none mb-1 tracking-wide">{bus.driverName || bus.busInfo?.driverName || 'Driver'}</span>
                 <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-white/40">Driver</span>
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 px-2 py-1.5 rounded-lg shadow-inner">
               <span className="font-black text-white text-[11px] tracking-widest">{bus.busNumber || bus.busInfo?.busNumber || 'T-02'}</span>
            </div>
          </div>

          {/* Speed Gauge Dashboard Block */}
          <div className="bg-[#0f1113] rounded-[14px] p-3 border border-white/5 flex items-center justify-between z-10 relative overflow-hidden shadow-inner">
             {/* Animated road sliding background when moving */}
             {busStatus === 'MOVING' && (
               <div className="animated-road-line"></div>
             )}
             
             <div className="flex flex-col z-10">
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Live Speed</span>
                <div className="flex items-baseline gap-1">
                   <span className={`font-black text-[28px] leading-none tracking-tighter ${busStatus === 'MOVING' ? 'text-[#88B04B] drop-shadow-[0_0_8px_rgba(136,176,75,0.4)]' : 'text-white/20'}`}>
                     {bus.speed > 0 ? Math.round(bus.speed) : '0'}
                   </span>
                   <span className="font-bold text-[9px] text-white/30 tracking-widest">KM/H</span>
                </div>
             </div>

             <div className="flex flex-col items-end z-10">
                <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-2">Status</span>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-sm tracking-wider ${
                  busStatus === 'MOVING' ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30' : 
                  busStatus === 'IDLE' ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30' : 
                  'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                }`}>
                  {busStatus}
                </span>
             </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

const LiveTracking = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [busData, setBusData] = useState(null);
  const [busesData, setBusesData] = useState({});
  const [allChildren, setAllChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  const [busPos, setBusPos] = useState([11.0168, 76.9558]); 
  const [loading, setLoading] = useState(true);
  const pollInterval = useRef(null);

  const [homePos, setHomePos] = useState([11.0055, 76.9410]);
  const [schoolPos, setSchoolPos] = useState([11.0250, 76.9700]);
  const [routePath, setRoutePath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const selectedChildId = localStorage.getItem('selectedChildId');
        const response = await api.get('/parents/profile');
        const profile = response.data.data;
        
        if (profile && Array.isArray(profile.children)) {
          setAllChildren(profile.children);
          const child = profile.children.find(c => c.id === selectedChildId) || profile.children[0];
          setActiveChild(child);
          if (child) {
            if (child.pickupLat && child.pickupLng) {
              const pLat = parseFloat(child.pickupLat);
              const pLng = parseFloat(child.pickupLng);
              setHomePos([pLat, pLng]);
              setBusPos([pLat, pLng]); // Use home as initial fallback if bus offline
            }
            if (child.school && child.school.latitude) {
              setSchoolPos([parseFloat(child.school.latitude), parseFloat(child.school.longitude)]);
            }
          }
          if (profile.children.length === 0) {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch initial context:', err);
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchLiveLocation = async () => {
      if (!allChildren || allChildren.length === 0) {
        return; // Wait for fetchInitialData to resolve children
      }
      
      const uniqueBusIdentifiers = new Set();
      const busDetailsMap = {};
      
      allChildren.forEach(child => {
        const id = child.currentBusId || child.bus?.driverMobileNumber;
        if (id) {
          uniqueBusIdentifiers.add(id);
          busDetailsMap[id] = child.bus;
        }
      });

      if (uniqueBusIdentifiers.size === 0) {
        setLoading(false);
        return;
      }

      const fetchedBuses = {};
      let anyFound = false;

      for (const id of uniqueBusIdentifiers) {
        try {
          const response = await api.get(`/tracking/live-location/${id}`);
          const location = response.data.data;
          
          if (location && location.latitude && location.longitude) {
            const lat = parseFloat(location.latitude);
            const lng = parseFloat(location.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
              fetchedBuses[id] = {
                ...location,
                lat,
                lng,
                busInfo: busDetailsMap[id]
              };
              anyFound = true;
            }
          }
        } catch (err) {
          console.warn(`Tracking fetch failed for identifier ${id}:`, err.message);
        }
      }
      
      if (anyFound) {
        setBusesData(prev => ({ ...prev, ...fetchedBuses }));
        const firstBus = Object.values(fetchedBuses)[0];
        setBusData(firstBus);
        setBusPos([firstBus.lat, firstBus.lng]);
      }
      setLoading(false);
    };

    fetchLiveLocation();
    pollInterval.current = setInterval(fetchLiveLocation, 5000);
    return () => clearInterval(pollInterval.current);
  }, [allChildren]);

  useEffect(() => {
    const fetchRoadRoute = async () => {
      try {
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${busPos[1]},${busPos[0]};${homePos[1]},${homePos[0]}?overview=full&geometries=geojson`
        );
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePath(coords);
          setDistance((data.routes[0].distance / 1000).toFixed(1));
        }
      } catch (error) {
        console.error("Error fetching road route:", error);
      }
    };

    if (busPos && homePos) {
      fetchRoadRoute();
    }
  }, [busPos, homePos]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Calibrating Map...</p>
      </div>
    );
  }

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const then = new Date(timestamp);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return then.toLocaleDateString();
  };



  return (
    <div className={`h-screen flex flex-col relative overflow-hidden bg-background ${isDarkMode ? 'dark' : ''}`}>
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
        .custom-dark-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .custom-dark-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-dark-popup .leaflet-popup-close-button {
          display: none;
        }
        .animated-road-line {
          position: absolute;
          inset: 0;
          opacity: 0.1;
          background-image: repeating-linear-gradient(90deg, #88B04B 0px, #88B04B 12px, transparent 12px, transparent 24px);
          background-size: 200% 2px;
          background-position: center;
          background-repeat: no-repeat;
          animation: dash-scroll 0.6s linear infinite;
        }
        @keyframes dash-scroll {
          0% { background-position: 0px center; }
          100% { background-position: -48px center; }
        }
        .route-glow {
          filter: drop-shadow(0 0 6px rgba(136, 176, 75, 0.6));
          animation: route-pulse 2s infinite alternate;
        }
        @keyframes route-pulse {
          0% { opacity: 0.2; }
          100% { opacity: 0.5; }
        }
        .student-marker-wrapper {
          position: relative;
          width: 40px;
          height: 45px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }
        .pin-bg {
          width: 40px;
          height: 40px;
        }
        .student-photo-overlay {
          position: absolute;
          top: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          overflow: hidden;
          background: #fff;
          border: 1.5px solid #fff;
        }
        .student-photo-overlay img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .user-dot {
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          position: relative;
        }
        .user-dot-pulse {
          position: absolute;
          width: 300%;
          height: 300%;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 50%;
          top: -100%;
          left: -100%;
          animation: pulse-dot 2s infinite ease-out;
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.1); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
        .leaflet-container {
          background: ${isDarkMode ? '#09090B' : '#f8f9fa'} !important;
        }
      `}</style>
      <div className="absolute inset-0 z-0">
        <MapContainer center={busPos} zoom={15} zoomControl={false} className="h-full w-full">
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
          />
          <MapController center={busPos} />
          
          {routePath.length > 0 && isValidCoord(busPos[0], busPos[1]) && isValidCoord(homePos[0], homePos[1]) && (
            <>
              <Polyline positions={routePath} color="#88B04B" weight={10} opacity={0.2} lineJoin="round" className="route-glow" />
              <Polyline positions={routePath} color="#88B04B" weight={4} opacity={1} lineJoin="round" />
            </>
          )}

          <Marker position={schoolPos} icon={schoolIcon} zIndexOffset={500} />
          {allChildren.map((child, idx) => {
            if (child.pickupLat && child.pickupLng && isValidCoord(child.pickupLat, child.pickupLng)) {
              return (
                <Marker 
                  key={idx}
                  position={[parseFloat(child.pickupLat), parseFloat(child.pickupLng)]} 
                  icon={createStudentIcon(
                    child.profilePhoto ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${child.profilePhoto}` : null, 
                    child.studentName || 'Student'
                  )} 
                />
              );
            }
            return null;
          })}
          {Object.values(busesData).map((bus, idx) => {
            if (!isValidCoord(bus.lat, bus.lng)) return null;
            return <LiveBusMarker key={idx} bus={bus} />;
          })}

          {userPos && (
            <Marker position={userPos} icon={userLocationIcon} zIndexOffset={2000} />
          )}

          <LocateControl onLocate={(latlng) => setUserPos(latlng)} />
        </MapContainer>
      </div>

      <div className="absolute top-0 inset-x-0 p-6 z-10 flex items-center justify-between pointer-events-none">
        <motion.button 
          onClick={() => navigate(ROUTES.DASHBOARD)} 
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-full border border-slate-100/80 shadow-sm pointer-events-auto flex items-center justify-center relative group overflow-hidden active:scale-95 transition-transform text-foreground will-change-transform"
        >
          {/* Subtle micro-glow aura */}
          <div className="absolute inset-0 bg-[#88B04B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground group-hover:text-[#88B04B] transition-colors" />
          </motion.div>
        </motion.button>
        <div className="w-14 h-14"></div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <motion.div 
          initial={{ y: 100, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="bg-card backdrop-blur-md rounded-[32px] shadow-lg border border-border overflow-hidden will-change-transform"
        >
          <div className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-foreground/5 border border-border p-0.5">
                <img src={`https://ui-avatars.com/api/?name=${busData?.driverName || 'Driver'}&background=88B04B&color=fff&bold=true`} alt="" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div>
                <p className="text-[8px] font-bold text-foreground/80 uppercase tracking-widest mb-0.5">Bus Driver</p>
                <h4 className="font-extrabold text-lg text-foreground uppercase tracking-tight leading-none">{busData?.driverName || 'Active'}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-14 h-12 bg-primary text-white rounded-2xl flex flex-col items-center justify-center">
                <p className="text-[7px] font-bold opacity-90 uppercase leading-none mb-1">Bus</p>
                <span className="text-[11px] font-black uppercase tracking-widest leading-none">{busData?.busNumber || 'T-02'}</span>
              </div>
              
              {activeChild?.bus?.driverMobileNumber && (
                <motion.a 
                  whileTap={{ scale: 0.9 }}
                  href={`tel:${activeChild.bus.driverMobileNumber}`}
                  className="w-14 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-colors"
                >
                  <Phone size={20} fill="currentColor" />
                </motion.a>
              )}
            </div>
          </div>
          
          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <div className="bg-foreground/5 p-3 rounded-[20px] border border-border">
              <span className="text-[8px] font-bold text-foreground/80 uppercase tracking-widest block mb-1">Remaining</span>
              <p className="text-xl font-extrabold text-foreground tracking-tighter">{distance} <span className="text-[10px] opacity-40">KM</span></p>
            </div>
            <div className="bg-foreground/5 p-3 rounded-[20px] border border-border">
              <span className="text-[8px] font-bold text-foreground/80 uppercase tracking-widest block mb-1">Live Speed</span>
              <p className="text-xl font-extrabold text-primary tracking-tighter">{Math.round(busData?.speed || 0)} <span className="text-[10px] opacity-40">KM</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveTracking;
