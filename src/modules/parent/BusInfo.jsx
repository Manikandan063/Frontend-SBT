import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Bus, 
  User, 
  Phone, 
  ShieldCheck, 
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../shared/api/axios';

const BusInfo = () => {
  const navigate = useNavigate();
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusInfo = async () => {
      try {
        const selectedChildId = localStorage.getItem('selectedChildId');
        const response = await api.get('/parents/profile');
        const profile = response.data.data;
        
        if (profile && Array.isArray(profile.children)) {
          // Find the bus for the selected child
          const activeChild = profile.children.find(c => c.id === selectedChildId) || profile.children[0];
          if (activeChild && activeChild.bus) {
            setBusData(activeChild.bus);
          }
        }
      } catch (err) {
        console.error('Failed to fetch bus info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">Syncing Vehicle Info...</p>
      </div>
    );
  }

  if (!busData) {
    return (
      <div className="matte-green-theme min-h-screen p-8 text-center">
        <button onClick={() => navigate(-1)} className="mb-8 p-3 bg-card border border-border rounded-xl inline-flex items-center gap-2 text-foreground/40 font-bold text-xs uppercase">
          <ArrowLeft size={18} /> Back
        </button>
        <p className="text-foreground/30 font-bold uppercase text-xs">No Bus Assigned Yet</p>
      </div>
    );
  }

  return (
    <div className="matte-green-theme min-h-screen pb-10">
      <div className="px-8 pt-12 pb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-3 bg-card border border-border rounded-2xl shadow-sm text-foreground/40 active:scale-90 transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">Vehicle Info</h1>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-primary p-10 rounded-[40px] text-white text-center shadow-lg relative overflow-hidden">
          <div className="absolute right-[-10%] top-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="w-20 h-20 bg-white/15 rounded-[32px] flex items-center justify-center mx-auto mb-6 border border-white/10">
            <Bus size={44} />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tighter leading-none">{busData.busNumber}</h2>
          <p className="text-[10px] font-bold uppercase opacity-60 tracking-[0.2em] mt-3">Verified Transit Vehicle</p>
        </div>

        <div className="premium-card !p-8">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center overflow-hidden border border-border p-1">
              <img src={`https://ui-avatars.com/api/?name=${busData.driverName}&background=88B04B&color=fff`} className="w-full h-full object-cover rounded-xl" alt="" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase text-foreground/30 tracking-widest mb-1">Primary Driver</p>
              <h4 className="text-xl font-extrabold text-foreground tracking-tight leading-none">{busData.driverName}</h4>
            </div>
            {busData.driverMobileNumber && (
              <a 
                href={`tel:${busData.driverMobileNumber}`}
                className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 transition-transform"
              >
                <Phone size={22} />
              </a>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-foreground/5">
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase text-foreground/30 tracking-widest">Reg No.</p>
              <p className="text-xs font-extrabold text-foreground uppercase">{busData.busRegisterNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-bold uppercase text-foreground/30 tracking-widest">Capacity</p>
              <p className="text-xs font-extrabold text-foreground">{busData.capacity} Students</p>
            </div>
          </div>
        </div>

        <div className="bg-accent/10 p-6 rounded-[32px] border border-accent/20 flex items-center gap-5">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-foreground uppercase tracking-tight leading-none mb-1">Safety Verified</h4>
            <p className="text-[10px] font-bold text-foreground/40 leading-tight">This vehicle and driver have cleared all SBT background checks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusInfo;
