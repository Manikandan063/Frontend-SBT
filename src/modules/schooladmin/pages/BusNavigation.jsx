import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Map, Navigation, Square, AlertCircle, RefreshCcw } from 'lucide-react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Autocomplete } from '@react-google-maps/api';
import api from '../../../shared/api/axios';
import { toast } from 'sonner';

const containerStyle = { width: '100%', height: '500px' };
const libraries = ['places'];

export default function BusNavigation() {
  const [buses, setBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');
  const [destination, setDestination] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  
  const [currentPos, setCurrentPos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  
  const [directions, setDirections] = useState(null);
  const [eta, setEta] = useState('');
  const [distance, setDistance] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [lastRoutedDest, setLastRoutedDest] = useState(null);
  
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(15);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    region: 'IN',
    libraries
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const res = await api.get('/bus');
      if (res.data?.status === 'success' || res.data?.data) {
        setBuses(res.data.data || res.data);
      }
    } catch (err) {
      toast.error('Failed to load buses');
    }
  };

  const handleDestinationSearch = async () => {
    if (!destination || !window.google) return;
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destination }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        setDestPos({ lat: loc.lat(), lng: loc.lng() });
        toast.success('Destination set');
        
        if (mapRef.current) {
          mapRef.current.panTo({ lat: loc.lat(), lng: loc.lng() });
        }
      } else {
        toast.error('Destination not found');
      }
    });
  };

  const onLoadAutocomplete = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const loc = place.geometry.location;
        setDestination(place.formatted_address || place.name);
        setDestPos({ lat: loc.lat(), lng: loc.lng() });
        toast.success('Destination set from suggestion');
        if (mapRef.current) {
          mapRef.current.panTo({ lat: loc.lat(), lng: loc.lng() });
        }
      }
    }
  };

  const handleStartTrip = () => {
    if (!selectedBusId) return toast.error('Select a bus first');
    
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, speed, heading, accuracy } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        setGpsAccuracy(accuracy);
        setIsTracking(true);
        toast.success('Navigation Tracking Started');
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          (watchPos) => {
            const { latitude: lat, longitude: lng, speed: spd, heading: hdg, accuracy: acc } = watchPos.coords;
            setCurrentPos({ lat, lng });
            setGpsAccuracy(acc);
            setLastUpdated(new Date());
            
            // Send to backend
            api.post('/tracking/update-location', {
              busId: selectedBusId,
              latitude: lat,
              longitude: lng,
              speed: (spd || 0) * 3.6, // convert m/s to km/h
              heading: hdg || 0,
              accuracy: acc || 0,
              trackingSource: 'GOOGLE_NAVIGATION',
              tripStatus: 'ACTIVE',
              timestamp: new Date().toISOString()
            }).catch(e => console.error('Failed to update tracking', e));
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              toast.error('Location permission denied');
            } else {
              toast.error('Weak GPS signal. Tracking delayed.');
            }
            console.error(err);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
      },
      (err) => {
        toast.error('Please allow location permissions');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleStopTrip = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    toast.info('Trip Stopped');
    
    if (selectedBusId && currentPos) {
      api.post('/tracking/update-location', {
        busId: selectedBusId,
        latitude: currentPos.lat,
        longitude: currentPos.lng,
        speed: 0,
        trackingSource: 'GOOGLE_NAVIGATION',
        tripStatus: 'COMPLETED',
        status: 'inactive'
      }).catch(e => console.error(e));
    }
  };

  useEffect(() => {
    if (currentPos && destPos && window.google) {
      // Prevent spamming the Directions API on every GPS update
      if (lastRoutedDest && lastRoutedDest.lat === destPos.lat && lastRoutedDest.lng === destPos.lng) {
        return;
      }
      
      const ds = new window.google.maps.DirectionsService();
      ds.route({
        origin: currentPos,
        destination: destPos,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          setLastRoutedDest(destPos);
          if (result.routes[0]?.legs[0]) {
            setEta(result.routes[0].legs[0].duration.text);
            setDistance(result.routes[0].legs[0].distance.text);
          }
        }
      });
    }
  }, [currentPos, destPos, lastRoutedDest]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Navigation className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-black">Bus Navigation Tracking</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">Mobile GPS Source</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground/40 uppercase">Select Bus</label>
          <select 
            value={selectedBusId} 
            onChange={e => setSelectedBusId(e.target.value)}
            disabled={isTracking}
            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary font-bold text-sm"
          >
            <option value="">Select a bus</option>
            {buses.map(b => (
              <option key={b.id} value={b.id}>BUS {b.busNumber} {b.routeName ? `- ${b.routeName}` : ''}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground/40 uppercase">Destination</label>
          <div className="flex gap-2">
            {isLoaded ? (
              <div className="flex-1">
                <Autocomplete
                  onLoad={onLoadAutocomplete}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input 
                    type="text" 
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    placeholder="School, Stop Name, or Address"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm font-bold"
                  />
                </Autocomplete>
              </div>
            ) : (
              <input 
                type="text" 
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="School, Stop Name, or Address"
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary text-sm font-bold"
              />
            )}
            <button 
              onClick={handleDestinationSearch}
              className="bg-primary/10 text-primary px-4 rounded-xl font-bold hover:bg-primary/20 transition-colors"
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {isTracking && (
        <div className="bg-[#1a1c1e] text-white p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)] gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Tracking Source</div>
              <div className="font-black text-lg text-[#10B981]">Google Navigation Active</div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:gap-8 text-center md:text-right">
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">ETA • Distance</div>
              <div className="font-black text-xl">{eta || '--'} • {distance || '--'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Last Updated</div>
              <div className="font-black text-sm text-white/90">
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Waiting...'}
                <br/>
                <span className={gpsAccuracy > 30 ? 'text-red-400 text-xs' : 'text-green-400 text-xs'}>
                  Accuracy: {Math.round(gpsAccuracy)}m
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
        {!isLoaded ? (
          <div className="h-[500px] flex items-center justify-center bg-muted/50">
            <RefreshCcw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentPos || destPos || { lat: 11.0168, lng: 76.9558 }}
            zoom={mapZoom}
            options={{ disableDefaultUI: true, gestureHandling: 'greedy' }}
            onLoad={map => mapRef.current = map}
            onZoomChanged={() => {
              if (mapRef.current) {
                setMapZoom(mapRef.current.getZoom());
              }
            }}
            onClick={(e) => {
              setDestPos({ lat: e.latLng.lat(), lng: e.latLng.lng() });
              setDestination(`${e.latLng.lat().toFixed(4)}, ${e.latLng.lng().toFixed(4)}`);
            }}
          >
            {currentPos && (
              <Marker 
                position={currentPos} 
                icon={{ 
                  path: window.google.maps.SymbolPath.CIRCLE, 
                  scale: 8, 
                  fillColor: '#10B981', 
                  fillOpacity: 1, 
                  strokeWeight: 3, 
                  strokeColor: '#fff' 
                }} 
              />
            )}
            {destPos && <Marker position={destPos} />}
            {directions && (
              <DirectionsRenderer 
                directions={directions} 
                options={{ 
                  preserveViewport: true,
                  suppressMarkers: true, 
                  polylineOptions: { strokeColor: '#10B981', strokeWeight: 6, strokeOpacity: 0.8 } 
                }} 
              />
            )}
          </GoogleMap>
        )}
      </div>

      <div className="flex gap-4">
        {!isTracking ? (
          <button 
            onClick={handleStartTrip}
            className="flex-1 bg-primary text-primary-foreground font-black py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg shadow-lg"
          >
            <Navigation className="w-5 h-5" /> Start Trip
          </button>
        ) : (
          <button 
            onClick={handleStopTrip}
            className="flex-1 bg-destructive text-destructive-foreground font-black py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2 text-lg shadow-lg"
          >
            <Square className="w-5 h-5" fill="currentColor" /> Stop Trip
          </button>
        )}
      </div>
    </div>
  );
}
