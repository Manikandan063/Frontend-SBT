import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { GoogleMap, useJsApiLoader, OverlayView, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { ROUTES } from '../../config/routes';
import api from '../../shared/api/axios';
import { useTheme } from '../../shared/context/ThemeContext';
import { getStudentImageUrl } from '../../shared/utils/imageUtils';

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  gestureHandling: 'greedy',
};

const libraries = ['places'];

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

const isValidCoord = (lat, lng) => {
  const pLat = parseFloat(lat);
  const pLng = parseFloat(lng);
  return !isNaN(pLat) && !isNaN(pLng);
};

const LiveBusMarker = ({ bus }) => {
  const [bearing, setBearing] = useState(0);
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [busStatus, setBusStatus] = useState('IDLE');
  const [animPos, setAnimPos] = useState({ lat: bus.lat, lng: bus.lng });
  const [showPopup, setShowPopup] = useState(false);
  
  const currentPos = useRef({ lat: bus.lat, lng: bus.lng });
  const animationRef = useRef(null);

  useEffect(() => {
    const newPos = { lat: bus.lat, lng: bus.lng };
    const prev = currentPos.current;

    // Very basic distance check to avoid tiny jitters
    const dLat = newPos.lat - prev.lat;
    const dLng = newPos.lng - prev.lng;
    const distSq = dLat*dLat + dLng*dLng;
    if (distSq < 0.000000001) {
      return; 
    }

    setBearing(calculateBearing(prev.lat, prev.lng, newPos.lat, newPos.lng));
    setLastMovedAt(Date.now());

    const duration = 2000;
    const startTime = performance.now();

    const animate = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;

      const currentLat = prev.lat + (newPos.lat - prev.lat) * progress;
      const currentLng = prev.lng + (newPos.lng - prev.lng) * progress;

      setAnimPos({ lat: currentLat, lng: currentLng });
      currentPos.current = { lat: currentLat, lng: currentLng };

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [bus.lat, bus.lng]);

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

  const isMoving = busStatus === 'MOVING';

  return (
    <OverlayView
      position={animPos}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
    >
      <div 
        className="swiggy-marker-wrapper z-50 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setShowPopup(!showPopup); }}
      >
        {/* Pulsing Ring */}
        {isMoving && <div className="pulse-ring"></div>}
        
        {/* Classic Top-Down School Bus */}
        <div className="top-down-bus" style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.8s linear' }}>
          <svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '56px', filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.4))' }}>
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

        {/* Custom Info Window / Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OverlayView>
  );
};

const LiveTracking = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [map, setMap] = useState(null);
  const [busData, setBusData] = useState(null);
  const [busesData, setBusesData] = useState({});
  const [allChildren, setAllChildren] = useState([]);
  const [activeChild, setActiveChild] = useState(null);
  
  const [busPos, setBusPos] = useState({ lat: 11.0168, lng: 76.9558 }); 
  const [homePos, setHomePos] = useState({ lat: 11.0055, lng: 76.9410 });
  const [schoolPos, setSchoolPos] = useState({ lat: 11.0250, lng: 76.9700 });
  
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("0");
  const [eta, setEta] = useState("");
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userPos, setUserPos] = useState(null);
  
  const mapCenterRef = useRef({ lat: 11.0168, lng: 76.9558 });
  const [userPanned, setUserPanned] = useState(false);
  
  const pollInterval = useRef(null);
  const lastRouteFetch = useRef(0);

  const calculateRoute = useCallback(async () => {
    if (!window.google || !busPos || !homePos || isNaN(busPos.lat) || isNaN(homePos.lat)) {
      return;
    }
    const directionsService = new window.google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: new window.google.maps.LatLng(busPos.lat, busPos.lng),
        destination: new window.google.maps.LatLng(homePos.lat, homePos.lng),
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      setDirectionsResponse(results);
      if (results.routes.length > 0 && results.routes[0].legs.length > 0) {
        const leg = results.routes[0].legs[0];
        setDistance(leg.distance.text.replace(' km', '')); 
        setEta(leg.duration.text);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  }, [busPos, homePos]);

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
              setHomePos({ lat: pLat, lng: pLng });
              setBusPos({ lat: pLat, lng: pLng }); 
            }
            if (child.school && child.school.latitude) {
              setSchoolPos({ lat: parseFloat(child.school.latitude), lng: parseFloat(child.school.longitude) });
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
      if (!allChildren || allChildren.length === 0) return;
      
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
        setBusPos({ lat: firstBus.lat, lng: firstBus.lng });
      }
      setLoading(false);
    };

    fetchLiveLocation();
    pollInterval.current = setInterval(fetchLiveLocation, 5000);
    return () => clearInterval(pollInterval.current);
  }, [allChildren]);

  useEffect(() => {
    if (isLoaded && !loading) {
      const now = Date.now();
      if (now - lastRouteFetch.current > 30000) {
        calculateRoute();
        lastRouteFetch.current = now;
      }
    }
  }, [busPos, homePos, isLoaded, loading, calculateRoute]);

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserPos(pos);
          if (map) {
            map.panTo(pos);
            map.setZoom(17);
          }
          setLocating(false);
        },
        () => {
          alert("Unable to find your location. Please ensure GPS is enabled.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setLocating(false);
    }
  };

  useEffect(() => {
    if (map && busPos && !userPanned && !loading) {
      map.panTo(busPos);
    }
  }, [map, busPos, userPanned, loading]);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
    // Optional: mapInstance.setOptions({ styles: myStyles });
  }, []);

  const onUnmount = useCallback(function callback(mapInstance) {
    setMap(null);
  }, []);

  if (loading || !isLoaded) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Calibrating Map...</p>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col relative overflow-hidden bg-background ${isDarkMode ? 'dark' : ''}`}>
      <style>{`
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
      `}</style>
      
      <div className="absolute inset-0 z-0">
        {!busData && !loading && (
           <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[1000] bg-orange-500/90 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl flex items-center justify-center gap-3 animate-pulse whitespace-nowrap">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Waiting for GPS Signal...</span>
           </div>
        )}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenterRef.current}
          zoom={15}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onDragStart={() => setUserPanned(true)}
        >
          {directionsResponse && (
            <DirectionsRenderer 
              directions={directionsResponse} 
              options={{ 
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#3b82f6',
                  strokeWeight: 6,
                  strokeOpacity: 0.8
                }
              }} 
            />
          )}

          <Marker 
            position={schoolPos} 
            icon={{
              url: 'https://img.icons8.com/color/96/school.png',
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
          
          {allChildren.map((child, idx) => {
            if (child.pickupLat && child.pickupLng && isValidCoord(child.pickupLat, child.pickupLng)) {
              return (
                <OverlayView
                  key={idx}
                  position={{ lat: parseFloat(child.pickupLat), lng: parseFloat(child.pickupLng) }}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -height })}
                >
                  <div className="relative group cursor-pointer drop-shadow-2xl z-20 hover:scale-110 transition-transform">
                     <div className="w-11 h-11 bg-white rounded-full p-0.5 shadow-lg border-2 border-[#3b82f6] relative z-10 flex items-center justify-center">
                       <div className="w-full h-full rounded-full overflow-hidden bg-muted">
                         <img 
                           src={getStudentImageUrl(child.profilePhoto) || `https://ui-avatars.com/api/?name=${child.firstName || child.name || 'Student'}&background=3b82f6&color=fff`} 
                           alt="Student" 
                           className="w-full h-full object-cover" 
                         />
                       </div>
                     </div>
                     <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#3b82f6] rotate-45 z-0 shadow-sm rounded-sm"></div>
                     
                     <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                       {child.firstName || child.name || 'Student'} Pickup
                     </div>
                  </div>
                </OverlayView>
              );
            }
            return null;
          })}

          {Object.values(busesData).map((bus, idx) => {
            if (!isValidCoord(bus.lat, bus.lng)) return null;
            return <LiveBusMarker key={bus.id || idx} bus={bus} />;
          })}

          {userPos && (
            <Marker 
              position={userPos} 
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}
        </GoogleMap>

        <button 
          onClick={handleLocate}
          disabled={locating}
          className={`absolute right-6 top-32 z-[1000] p-4 bg-card/90 backdrop-blur-md rounded-[24px] border border-border shadow-sm text-foreground active:scale-95 transition-all pointer-events-auto ${locating ? 'animate-pulse' : ''}`}
        >
          <LocateFixed size={24} />
        </button>
      </div>

      <div className="absolute top-0 inset-x-0 p-6 z-10 flex items-center justify-between pointer-events-none">
        <motion.button 
          onClick={() => navigate(ROUTES.DASHBOARD)} 
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.05 }}
          className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-full border border-slate-100/80 shadow-sm pointer-events-auto flex items-center justify-center relative group overflow-hidden active:scale-95 transition-transform text-foreground will-change-transform"
        >
          <div className="absolute inset-0 bg-[#88B04B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <ArrowLeft className="w-6 h-6 text-foreground group-hover:text-[#88B04B] transition-colors" />
          </motion.div>
        </motion.button>
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
              <span className="text-[8px] font-bold text-foreground/80 uppercase tracking-widest block mb-1">Remaining ({eta || '-- mins'})</span>
              <p className="text-xl font-extrabold text-foreground tracking-tighter">{distance} <span className="text-[10px] opacity-40">KM</span></p>
            </div>
            <div className="bg-foreground/5 p-3 rounded-[20px] border border-border">
              <span className="text-[8px] font-bold text-foreground/80 uppercase tracking-widest block mb-1">Live Speed</span>
              <p className="text-xl font-extrabold text-primary tracking-tighter">{Math.round(busData?.speed || 0)} <span className="text-[10px] opacity-40">KM</span></p>
            </div>
          </div>
          
          {busData && (busData.deviceTime || busData.fixTime || busData.serverTime || busData.lastUpdate || busData.timestamp) && (
            <div className="px-5 pb-4 text-center border-t border-border/50 pt-3">
              <span className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest flex items-center justify-center gap-2">
                <Clock size={10} className="opacity-50" />
                Last Updated: {new Date(busData.deviceTime || busData.fixTime || busData.serverTime || busData.lastUpdate || busData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LiveTracking;
