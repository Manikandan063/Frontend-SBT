import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, 
  MapPin, 
  Wifi, 
  WifiOff, 
  Play, 
  Square, 
  Compass, 
  Activity,
  AlertTriangle,
  Bus,
  ChevronRight,
  Info
} from 'lucide-react';
import api from '../../shared/api/axios';

const DriverSimulation = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [isDriving, setIsDriving] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [status, setStatus] = useState('Idle'); // Idle, Searching, Active, Error
  const [speed, setSpeed] = useState(0);

  const watchId = useRef(null);
  const updateInterval = useRef(null);

  useEffect(() => {
    // Fetch buses for the simulator
    const fetchBuses = async () => {
      try {
        const response = await api.get('/bus');
        setBuses(response.data.data || []);
      } catch (err) {
        console.error('Failed to fetch buses', err);
      }
    };
    fetchBuses();

    return () => {
      stopSimulation();
    };
  }, []);

  const startSimulation = () => {
    if (!selectedBusId) {
      setError('Please select a bus to simulate.');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDriving(true);
    setStatus('Searching');
    setError(null);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed: geoSpeed } = position.coords;
        setLocation({ latitude, longitude });
        setSpeed(geoSpeed ? Math.round(geoSpeed * 3.6) : 0); // convert m/s to km/h
        setStatus('Active');
      },
      (err) => {
        setError(`Location Error: ${err.message}`);
        setStatus('Error');
        stopSimulation();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Periodically send location to backend
    updateInterval.current = setInterval(async () => {
      if (location && selectedBusId) {
        try {
          await api.post('/tracking/update-location', {
            busId: selectedBusId,
            latitude: location.latitude,
            longitude: location.longitude,
            speed: speed || 0,
            status: 'Moving',
            timestamp: new Date().toISOString()
          });
          setLastUpdateTime(new Date().toLocaleTimeString());
        } catch (err) {
          console.error('Update failed', err);
        }
      }
    }, 5000); // Update every 5 seconds
  };

  const stopSimulation = () => {
    setIsDriving(false);
    setStatus('Idle');
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    if (updateInterval.current) clearInterval(updateInterval.current);
    watchId.current = null;
    updateInterval.current = null;
  };

  return (
    <div className="matte-green-theme min-h-screen p-6 font-['Outfit'] flex flex-col gap-6 relative overflow-hidden bg-background">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <header className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Navigation className="text-white" size={20} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-foreground uppercase">Bus Simulator</h1>
        </div>
        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em] ml-1">Laptop GPS Broadcasting</p>
      </header>

      <div className="grid gap-6 flex-1">
        {/* Connection Status Card */}
        <motion.div 
          layout
          className={`p-6 rounded-[32px] border transition-all duration-500 flex flex-col gap-6 ${
            status === 'Active' ? 'bg-primary/5 border-primary/20' : 'bg-white/40 border-black/5'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                status === 'Active' ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/30' : 'bg-foreground/5 text-foreground/40'
              }`}>
                {status === 'Active' ? <Wifi size={24} /> : <WifiOff size={24} />}
              </div>
              <div>
                <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">Signal Status</p>
                <h2 className="text-xl font-bold tracking-tight text-foreground">{status === 'Active' ? 'Broadcasting Live' : status}</h2>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest text-right">Update Frequency</p>
              <p className="text-sm font-bold text-foreground">Every 5 Seconds</p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-600"
            >
              <AlertTriangle size={18} />
              <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 p-4 rounded-2xl border border-black/5">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Latitude</p>
              <p className="font-mono text-sm font-bold text-foreground">{location ? location.latitude.toFixed(6) : '---'}</p>
            </div>
            <div className="bg-white/60 p-4 rounded-2xl border border-black/5">
              <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest mb-1">Longitude</p>
              <p className="font-mono text-sm font-bold text-foreground">{location ? location.longitude.toFixed(6) : '---'}</p>
            </div>
          </div>
        </motion.div>

        {/* Configuration Card */}
        <div className="premium-card !p-8 flex flex-col gap-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1">Select Bus to Simulate</label>
            <div className="grid gap-3">
              {buses.map(bus => (
                <button
                  key={bus.id}
                  disabled={isDriving}
                  onClick={() => setSelectedBusId(bus.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selectedBusId === bus.id 
                    ? 'bg-primary border-primary shadow-lg text-white' 
                    : 'bg-white border-black/5 text-foreground hover:bg-foreground/5'
                  } ${isDriving && selectedBusId !== bus.id ? 'opacity-30' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <Bus size={20} className={selectedBusId === bus.id ? 'text-white' : 'text-primary'} />
                    <div className="text-left">
                      <p className={`text-sm font-extrabold ${selectedBusId === bus.id ? 'text-white' : 'text-foreground'}`}>Bus {bus.busNumber}</p>
                      <p className={`text-[9px] font-bold uppercase opacity-60`}>Driver: {bus.driverName}</p>
                    </div>
                  </div>
                  {selectedBusId === bus.id && <motion.div layoutId="check" className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center"><ChevronRight size={14} /></motion.div>}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            {!isDriving ? (
              <button
                onClick={startSimulation}
                className="w-full py-6 bg-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:brightness-95 active:scale-[0.98] transition-all"
              >
                <Play size={18} fill="currentColor" />
                Start Simulation
              </button>
            ) : (
              <button
                onClick={stopSimulation}
                className="w-full py-6 bg-red-600 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-red-600/20 flex items-center justify-center gap-3 hover:brightness-95 active:scale-[0.98] transition-all"
              >
                <Square size={18} fill="currentColor" />
                Stop Simulation
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-32">
          <div className="premium-card flex flex-col items-center justify-center gap-2 py-8">
            <Activity className="text-primary/40" size={24} />
            <div className="text-center">
              <p className="text-[24px] font-black tracking-tighter text-foreground">{speed} <span className="text-[10px] text-foreground/30 uppercase">km/h</span></p>
              <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Current Speed</p>
            </div>
          </div>
          <div className="premium-card flex flex-col items-center justify-center gap-2 py-8">
            <Compass className="text-accent/40" size={24} />
            <div className="text-center">
              <p className="text-[24px] font-black tracking-tighter text-foreground">{lastUpdateTime || '--:--:--'}</p>
              <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Last Synced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-[280px] z-50">
        <div className="bg-foreground text-white/90 p-4 rounded-3xl shadow-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={18} className="text-accent" />
          </div>
          <p className="text-[9px] font-medium leading-relaxed tracking-tight">
            Keep this tab open and your laptop awake to continue broadcasting GPS coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverSimulation;
