import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  Bus, 
  Phone,
  Maximize2,
  Search,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge } from '../../../shared/components/ui';
import api from '../../../shared/api/axios';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { getSnappedPosition } from '../../../shared/utils/mapUtils';

const containerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
};

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

const AdminLiveBusMarker = ({ bus, finalPos, isSelected, onSelect }) => {
  const [bearing, setBearing] = useState(0);
  const [busStatus, setBusStatus] = useState(bus.trackingStatus || 'IDLE');
  const [lastMovedAt, setLastMovedAt] = useState(Date.now());
  const [animPos, setAnimPos] = useState({ lat: finalPos[0], lng: finalPos[1] });
  const [snappedTarget, setSnappedTarget] = useState({ lat: finalPos[0], lng: finalPos[1] });
  
  const currentPos = useRef({ lat: finalPos[0], lng: finalPos[1] });
  const animationRef = useRef(null);
  
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    let active = true;
    const updateTarget = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const snapped = await getSnappedPosition(finalPos[0], finalPos[1], null, apiKey);
      if (active) {
        setSnappedTarget(snapped);
      }
    };
    updateTarget();
    return () => { active = false; };
  }, [finalPos[0], finalPos[1]]);

  useEffect(() => {
    const newPos = snappedTarget;
    const prev = currentPos.current;

    const dLat = newPos.lat - prev.lat;
    const dLng = newPos.lng - prev.lng;
    const distSq = dLat*dLat + dLng*dLng;
    if (distSq < 0.000000001) {
      return;
    }

    const newBearing = bus.heading ?? bus.course ?? calculateBearing(prev.lat, prev.lng, newPos.lat, newPos.lng);
    setBearing(newBearing);
    setLastMovedAt(Date.now());

    const duration = 4500;
    const startTime = performance.now();

    const animate = (time) => {
      let progress = (time - startTime) / duration;
      if (progress > 1) progress = 1;

      const lat = prev.lat + (newPos.lat - prev.lat) * progress;
      const lng = prev.lng + (newPos.lng - prev.lng) * progress;

      currentPos.current = { lat, lng };
      setAnimPos({ lat, lng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [snappedTarget]);

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
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';

  return (
    <OverlayView
      position={animPos}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -30, y: -30 })}
    >
      <div 
        className={`swiggy-marker-wrapper cursor-pointer ${isSelected ? 'z-[9999]' : 'z-10'}`} 
        style={{ transform: scale, transition: 'transform 0.3s ease' }}
        onClick={(e) => { e.stopPropagation(); onSelect(bus); setShowPopup(!showPopup); }}
      >
        {/* Pulsing Ring */}
        {(isMoving || isSelected) && <div className="pulse-ring"></div>}
        
        {/* Classic Top-Down School Bus */}
        <div className="top-down-bus" style={{ transform: `rotate(${bearing}deg)`, transition: 'transform 0.8s linear' }}>
          <svg viewBox="0 0 64 128" xmlns="http://www.w3.org/2000/svg" style={{ width: '28px', height: '56px', filter: isSelected ? 'drop-shadow(0px 0px 15px rgba(136,176,75,0.6))' : 'drop-shadow(0px 6px 8px rgba(0,0,0,0.4))' }}>
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

        {/* Tooltip */}
        <div className={`absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-black text-white shadow-lg whitespace-nowrap pointer-events-none ${isSelected ? 'bg-orange-500 z-[9999]' : 'bg-primary'}`}>
          BUS {bus.busNumber}
          {bus.accuracy > 20 && <span className="ml-1 text-red-200 font-bold opacity-90">(Weak GPS)</span>}
        </div>

        {/* Popup */}
        <AnimatePresence>
          {(showPopup || isSelected) && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-[4.5rem] left-1/2 -translate-x-1/2 w-[220px] bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 cursor-default z-[10000]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bottom pointer */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-card border-b border-r border-border rotate-45"></div>

              <div className="flex items-center gap-3 border-b border-border pb-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Bus size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 leading-none mb-1">Vehicle Unit</p>
                    <h4 className="text-lg font-black uppercase tracking-tighter text-foreground leading-none">Bus {bus.busNumber}</h4>
                  </div>
              </div>
              
              <div className="space-y-2.5 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Registration</span>
                    <span className="text-[10px] font-black text-foreground uppercase">{bus.busRegisterNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Bus Driver</span>
                    <span className="text-[10px] font-black text-primary uppercase">{bus.driverName || 'N/A'}</span>
                  </div>
                  {bus.accuracy > 20 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">GPS Signal</span>
                      <span className="text-[10px] font-black text-red-500 uppercase">Weak ({Math.round(bus.accuracy)}m)</span>
                    </div>
                  )}
              </div>

              <div className={`border rounded-lg py-2 px-3 flex items-center justify-center gap-2 ${
                busStatus === 'MOVING' ? 'bg-success/5 border-success/10' : 
                busStatus === 'IDLE' ? 'bg-orange-500/5 border-orange-500/10' : 
                'bg-red-500/5 border-red-500/10'
              }`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                    busStatus === 'MOVING' ? 'bg-success' : 
                    busStatus === 'IDLE' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    busStatus === 'MOVING' ? 'text-success' : 
                    busStatus === 'IDLE' ? 'text-orange-500' : 'text-red-500'
                  }`}>{busStatus}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OverlayView>
  );
};

const LiveTracking = () => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [isFollowingBus, setIsFollowingBus] = useState(true);
  
  const lastFollowedId = useRef(null);
  const mapRef = useRef(null);
  const initialCenterRef = useRef({ lat: 11.0168, lng: 76.9558 });
  const initialZoomRef = useRef(13);
  const isFirstLoad = useRef(true);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchBuses();
    const interval = setInterval(fetchBuses, 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const busId = new URLSearchParams(window.location.search).get('busId');
    if (busId && buses.length > 0 && !selectedBus) {
      const targetBus = buses.find(b => b.id === busId);
      if (targetBus) {
        setSelectedBus(targetBus);
      }
    }
  }, [buses, selectedBus]);

  const fetchBuses = async () => {
    try {
      const response = await api.get('/tracking/fleet/status');
      const fleet = response.data.data || [];
      setBuses(fleet);
      
      if (selectedBus) {
        const updated = fleet.find(b => b.id === selectedBus.id);
        if (updated) setSelectedBus(updated);
      }
    } catch (error) {
      console.error('Error fetching live fleet telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
    setUserPanned(false);
  };

  const filteredBuses = buses.filter(bus => 
    bus.busNumber?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.busRegisterNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Map panning logic
  useEffect(() => {
    if (!mapRef.current) return;
    
    if (selectedBus) {
      const isNewSelection = lastFollowedId.current !== selectedBus.id;
      if (isValidCoord(selectedBus.latitude, selectedBus.longitude)) {
        const center = { lat: parseFloat(selectedBus.latitude), lng: parseFloat(selectedBus.longitude) };
        if (isNewSelection) {
          mapRef.current.panTo(center);
          mapRef.current.setZoom(16);
          lastFollowedId.current = selectedBus.id;
          setIsFollowingBus(true);
        } else if (isFollowingBus) {
          mapRef.current.panTo(center);
        }
      }
    } else if (buses && buses.length > 0 && isFirstLoad.current) {
      lastFollowedId.current = null;
      const validMarkers = buses
        .filter(b => isValidCoord(b.latitude, b.longitude))
        .map(b => new window.google.maps.LatLng(parseFloat(b.latitude), parseFloat(b.longitude)));
      
      if (validMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        validMarkers.forEach(marker => bounds.extend(marker));
        mapRef.current.fitBounds(bounds);
        mapRef.current.panToBounds(bounds, 50);
        isFirstLoad.current = false;
      }
    }
  }, [selectedBus, buses, isFollowingBus]);

  const onLoad = useCallback(function callback(mapInstance) {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
    mapRef.current = null;
  }, []);



  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Loading Map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pb-20 lg:h-[calc(100vh-140px)]">
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
      `}</style>

      {/* Sidebar - Fleet List */}
      <Card className="w-full lg:w-96 h-[350px] lg:h-auto !p-0 flex flex-col shrink-0 overflow-hidden border-none shadow-2xl bg-card z-10 rounded-[2rem] lg:rounded-[2.5rem]">
        <div className="p-8 border-b border-border space-y-6 bg-muted/30">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">Active Buses</h2>
              <Badge variant="outline" className="!rounded-xl !border-primary/20 text-primary">{buses.length} Vehicles</Badge>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20" size={16} />
              <input 
                type="text" 
                placeholder="Find bus or driver..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border-none rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-tight outline-none shadow-sm focus:ring-2 ring-primary/10 transition-all text-foreground"
              />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
            {loading && buses.length === 0 ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Loading Bus Locations...</p>
              </div>
            ) : filteredBuses.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 italic">No matches found</p>
              </div>
            ) : (
              filteredBuses.map((bus) => (
                <div 
                  key={bus.id}
                  onClick={() => handleBusSelect(bus)}
                  className={`p-3 md:p-4 rounded-[1.25rem] border transition-all duration-300 cursor-pointer group relative overflow-hidden flex items-center justify-between gap-3 ${
                    selectedBus?.id === bus.id 
                      ? 'bg-[#88B04B] border-[#88B04B] text-white shadow-lg shadow-[#88B04B]/20 scale-[1.02]' 
                      : 'bg-white border-slate-100 hover:border-[#88B04B]/30 hover:shadow-md shadow-sm'
                  }`}
                >
                   {selectedBus?.id === bus.id && (
                     <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                   )}
                   
                   <div className="flex items-center gap-3 relative z-10 min-w-0">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        selectedBus?.id === bus.id 
                          ? 'bg-white/20 text-white shadow-inner' 
                          : 'bg-[#88B04B]/5 text-[#88B04B] group-hover:bg-[#88B04B]/10'
                      }`}>
                         <Bus size={20} className={bus.trackingStatus === 'LIVE' ? 'animate-bounce' : ''} />
                      </div>
                      <div className="min-w-0">
                         <div className="flex items-center gap-2">
                            <p className="text-sm md:text-base font-black uppercase tracking-tight truncate leading-none">Bus {bus.busNumber}</p>
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${bus.trackingStatus === 'LIVE' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-300'}`} />
                         </div>
                         <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1.5 truncate ${
                           selectedBus?.id === bus.id ? 'text-white/70' : 'text-slate-400'
                         }`}>
                           {bus.driverName || 'Unassigned'}
                         </p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3 shrink-0 relative z-10">
                      <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors ${
                        selectedBus?.id === bus.id
                          ? 'bg-white/20 text-white'
                          : bus.trackingStatus === 'LIVE'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                      }`}>
                         {bus.trackingStatus || 'OFFLINE'}
                      </div>
                   </div>
                </div>
              ))
            )}
         </div>
      </Card>

      <Card className="w-full lg:flex-1 h-[500px] lg:h-auto !p-0 relative overflow-hidden border-none shadow-2xl bg-card rounded-[2rem] lg:rounded-[2.5rem]">
         <GoogleMap
            mapContainerStyle={containerStyle}
            center={initialCenterRef.current}
            zoom={initialZoomRef.current}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={() => { setSelectedBus(null); setIsFollowingBus(false); }}
            onDragStart={() => setIsFollowingBus(false)}
            onZoomChanged={() => {
              if (mapRef.current && isLoaded) setIsFollowingBus(false);
            }}
         >
            {/* Marker Collision Detection & Rendering */}
            {(() => {
              const posGroups = {};
              buses.forEach(bus => {
                if (isValidCoord(bus.latitude, bus.longitude)) {
                  const key = `${parseFloat(bus.latitude).toFixed(4)},${parseFloat(bus.longitude).toFixed(4)}`;
                  if (!posGroups[key]) posGroups[key] = [];
                  posGroups[key].push(bus);
                }
              });

              Object.values(posGroups).forEach(group => group.sort((a, b) => a.id.localeCompare(b.id)));

              const sortedBuses = [...buses].sort((a, b) => {
                if (selectedBus?.id === a.id) return 1;
                if (selectedBus?.id === b.id) return -1;
                return 0;
              });

              return sortedBuses.map((bus) => {
                if (!isValidCoord(bus.latitude, bus.longitude)) return null;
                
                const lat = parseFloat(bus.latitude);
                const lng = parseFloat(bus.longitude);
                const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
                const group = posGroups[key] || [];
                const index = group.findIndex(b => b.id === bus.id);
                
                let finalPos = [lat, lng];
                if (group.length > 1) {
                  if (selectedBus?.id === bus.id) {
                    finalPos = [lat, lng];
                  } else {
                    const angle = (index / group.length) * 2 * Math.PI;
                    const radius = 0.00035; 
                    finalPos = [lat + Math.cos(angle) * radius, lng + Math.sin(angle) * radius];
                  }
                }

                return (
                  <AdminLiveBusMarker 
                    key={bus.id}
                    bus={bus}
                    finalPos={finalPos}
                    isSelected={selectedBus?.id === bus.id}
                    onSelect={handleBusSelect}
                  />
                );
              });
            })()}
         </GoogleMap>

         {/* Map Interface Overlay Controls */}
         <div className="absolute top-8 right-8 flex flex-col gap-4 z-[1000]">
            <button className="w-14 h-14 bg-background/80 backdrop-blur-md border border-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary transition-all shadow-xl hover:scale-110 active:scale-95">
               <Maximize2 size={24} />
            </button>
            <button className="w-14 h-14 bg-background/80 backdrop-blur-md border border-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary transition-all shadow-xl hover:scale-110 active:scale-95">
               <Activity size={24} />
            </button>
            <div className="flex flex-col gap-2 mt-4">
              <button 
                onClick={() => { if(mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1); setIsFollowingBus(false); }}
                className="w-14 h-14 bg-background/80 backdrop-blur-md border border-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary transition-all shadow-xl hover:scale-110 active:scale-95"
              >
                <Plus size={24} />
              </button>
              <button 
                onClick={() => { if(mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1); setIsFollowingBus(false); }}
                className="w-14 h-14 bg-background/80 backdrop-blur-md border border-border rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary transition-all shadow-xl hover:scale-110 active:scale-95"
              >
                <Minus size={24} />
              </button>
            </div>
            {!isFollowingBus && selectedBus && (
              <button 
                onClick={() => {
                  setIsFollowingBus(true);
                  if (mapRef.current) {
                    mapRef.current.panTo({ lat: parseFloat(selectedBus.latitude), lng: parseFloat(selectedBus.longitude) });
                  }
                }}
                className="w-14 h-14 mt-2 bg-primary text-white backdrop-blur-md border border-border rounded-2xl flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95"
              >
                <Bus size={24} />
              </button>
            )}
         </div>

         {/* Floating Status Card */}
         <AnimatePresence>
           {selectedBus && (
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: 50, opacity: 0 }}
               className="absolute bottom-8 inset-x-8 z-[1000] pointer-events-none"
             >
               <div className="bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 pointer-events-auto flex flex-col md:flex-row items-center justify-between relative overflow-hidden gap-4 md:gap-6">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 pointer-events-none" />
                  
                  {/* Left Side: Bus Profile */}
                  <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto shrink-0 relative z-10">
                     <div className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 relative shrink-0">
                        <Bus size={32} />
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-4 border-background flex items-center justify-center">
                           <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        </div>
                     </div>
                     <div className="space-y-0.5">
                          <div className="flex items-center gap-3">
                             <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground leading-none">Bus {selectedBus.busNumber}</h3>
                             <Badge variant="success" className="!px-2 !py-0.5 !rounded-lg text-[8px] uppercase font-black tracking-widest">{selectedBus.trackingStatus || 'Active'}</Badge>
                          </div>
                          <p className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">{selectedBus.driverName || 'Driver'}</p>
                     </div>
                  </div>

                  {/* Middle: Telemetry Data */}
                  <div className="flex-1 flex items-center justify-center md:justify-between px-2 md:px-8 border-y md:border-y-0 md:border-x border-border py-3 md:py-0 w-full md:w-auto relative z-10 gap-4">
                     <div className="text-center min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20 mb-1">Current Speed</p>
                        <p className="text-lg md:text-xl font-black text-primary truncate leading-none">
                          {selectedBus.speed || '0'} 
                          <span className="text-[9px] opacity-30 ml-0.5 font-bold">KM/H</span>
                        </p>
                     </div>
                     <div className="w-px h-8 bg-border" />

                     <div className="text-center min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-foreground/20 mb-1">GPS Signal</p>
                        <div className="flex items-center justify-center gap-1">
                           <div className="w-1 h-3 bg-success rounded-full" />
                           <div className="w-1 h-4 bg-success rounded-full" />
                           <div className="w-1 h-5 bg-success rounded-full" />
                           <span className="text-[8px] md:text-[9px] font-black text-success ml-1 uppercase">EXCELLENT</span>
                        </div>
                     </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto shrink-0 relative z-10">
                     <Button className="flex-1 md:flex-none !rounded-xl md:!rounded-2xl h-12 md:h-16 !px-4 md:!px-8 !bg-primary shadow-xl shadow-primary/10 hover:scale-[1.02] transition-all text-[9px] md:text-[10px] !font-black !uppercase tracking-widest flex items-center justify-center gap-2 md:gap-3">
                        <Phone size={14} className="md:w-4 md:h-4" />
                        Contact Driver
                     </Button>
                     <button 
                       onClick={() => setSelectedBus(null)}
                       className="w-12 h-12 md:w-16 md:h-16 bg-muted border border-border rounded-xl md:rounded-2xl flex items-center justify-center text-foreground/20 hover:text-error hover:bg-error/5 transition-all shadow-sm shrink-0"
                     >
                        <X size={20} className="md:w-6 md:h-6" />
                     </button>
                  </div>
               </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Signal/Status Indicator overlay */}
         <div className="absolute top-8 left-8 z-[1000] bg-background/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-xl flex items-center gap-4">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-foreground/60">Live GPS Connected</span>
         </div>
      </Card>
    </div>
  );
};

export default LiveTracking;
