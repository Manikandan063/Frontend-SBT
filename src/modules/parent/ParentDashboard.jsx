import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bus,
  MapPin,
  Clock,
  User,
  Navigation,
  Navigation2,
  Calendar,
  ArrowRight,
  Phone,
  Settings,
  ClipboardList,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { ROUTES } from "../../config/routes";
import api from "../../shared/api/axios";
import Header from "../../shared/components/Header";
import AmbientBusAlert from "./AmbientBusAlert";
import { useLanguage } from "../../shared/context/LanguageContext";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [parentData, setParentData] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [etaData, setEtaData] = useState({ minutes: "--", km: "--" });
  const [loading, setLoading] = useState(true);
  const [busLocation, setBusLocation] = useState(null);
  const [ambientMode, setAmbientMode] = useState(null); // 'nearing', 'ready', or null
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[DASHBOARD] Fetching parent profile...");
        const response = await api.get("/parents/profile");
        const data = response.data.data;
        console.log(
          "[DASHBOARD] Profile retrieved:",
          data.parentName,
          data.mobileNumber,
        );
        setParentData(data);
        if (data.children?.length > 0) {
          setChildren(data.children);
          const storedChildId = localStorage.getItem("selectedChildId");
          const isChildValid = data.children.some(
            (child) => child.id === storedChildId,
          );

          const initialChildId = isChildValid
            ? storedChildId
            : data.children[0].id;
          setSelectedChildId(initialChildId);
          localStorage.setItem("selectedChildId", initialChildId);
        } else {
          setChildren([]);
          setSelectedChildId(null);
          localStorage.removeItem("selectedChildId");
        }
      } catch (err) {
        console.error("[DASHBOARD] Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedChild = children.find((c) => c.id === selectedChildId);

  useEffect(() => {
    const fetchETA = async () => {
      if (!selectedChildId || !selectedChild?.currentBusId) return;
      try {
        const response = await api.get(
          `/tracking/live-location/${selectedChild.currentBusId}`,
        );
        const location = response.data.data;

        const busLat = parseFloat(location?.latitude);
        const busLng = parseFloat(location?.longitude);
        const pickupLat = parseFloat(selectedChild?.pickupLat);
        const pickupLng = parseFloat(selectedChild?.pickupLng);

        if (busLat && busLng && pickupLat && pickupLng) {
          setBusLocation({ latitude: busLat, longitude: busLng });
          console.log(
            `[ETA] Calculating: Bus(${busLat}, ${busLng}) -> Student(${pickupLat}, ${pickupLng})`,
          );

          // Haversine Distance (as immediate fallback/validation)
          const R = 6371; // km
          const dLat = ((pickupLat - busLat) * Math.PI) / 180;
          const dLon = ((pickupLng - busLng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((busLat * Math.PI) / 180) *
              Math.cos((pickupLat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const directDist = R * c;

          try {
            const osrmResponse = await fetch(
              `https://router.project-osrm.org/route/v1/driving/${busLng},${busLat};${pickupLng},${pickupLat}?overview=false`,
            ).catch(() => null);

            const osrmData = osrmResponse ? await osrmResponse.json() : null;

            if (osrmData?.routes?.length > 0) {
              const route = osrmData.routes[0];
              setEtaData({
                minutes: Math.max(1, Math.round(route.duration / 60))
                  .toString()
                  .padStart(2, "0"),
                km: (route.distance / 1000).toFixed(1),
              });
            } else {
              // Fallback to Haversine + Heuristic (2 mins per km + 2 mins buffer)
              setEtaData({
                minutes: Math.max(2, Math.round(directDist * 2 + 2))
                  .toString()
                  .padStart(2, "0"),
                km: directDist.toFixed(1),
              });
            }
          } catch (osrmErr) {
            setEtaData({
              minutes: Math.max(2, Math.round(directDist * 2 + 2))
                .toString()
                .padStart(2, "0"),
              km: directDist.toFixed(1),
            });
          }
        } else {
          setEtaData({ minutes: "--", km: "--" });
        }
      } catch (err) {
        console.error("[ETA] Error:", err);
        setEtaData({ minutes: "--", km: "--" });
        setBusLocation(null);
      }
    };
    fetchETA();
    const interval = setInterval(fetchETA, 10000);
    return () => clearInterval(interval);
  }, [selectedChildId, selectedChild?.currentBusId]);

  if (loading) return null;

  return (
    <div className="matte-green-theme min-h-screen bg-transparent pb-32">
      <Header
        title={`Hi, ${parentData?.parentName?.split(" ")[0] || "Parent"}`}
        subtitle={t("dashboard_title")}
        onAssistantClick={() => navigate(ROUTES.TRACKING)}
        ambientMode={ambientMode}
      />

      {/* ✅ Ambient Mode Added */}
      <AmbientBusAlert
        mapDistanceKm={etaData.km}
        busNumber={selectedChild?.bus?.busNumber || "Bus 02"}
        onAmbientModeChange={(mode) => setAmbientMode(mode)}
      />

      <div className="px-6 space-y-6 -mt-6 relative z-30">
        {/* 1. Child Selection (Pills) */}
        <div className="flex gap-3.5 overflow-x-auto pb-2 no-scrollbar">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                setSelectedChildId(child.id);
                localStorage.setItem("selectedChildId", child.id);
              }}
              className={`px-8 py-3 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all shrink-0 active:scale-95 ${
                selectedChildId === child.id
                  ? "bg-[#88B04B] text-white"
                  : "bg-white text-slate-500 border border-slate-200"
              }`}
            >
              {child.studentName.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* 2. Child Info Card */}
        {selectedChild && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card backdrop-blur-md rounded-[32px] border border-border shadow-sm relative overflow-hidden"
          >
            {/* Clean Boarding Pass Flex Container */}
            <div className="flex divide-x divide-dashed divide-slate-200">
              {/* Left Stub: Student Pass Details */}
              <div className="w-[38%] p-4 flex flex-col items-center text-center justify-center shrink-0">
                <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center text-primary font-black text-2xl shadow-inner shrink-0 overflow-hidden">
                  {selectedChild.profilePhoto ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${selectedChild.profilePhoto}`} 
                      alt={selectedChild.studentName} 
                      className="w-full h-full object-cover animate-fade-in"
                    />
                  ) : (
                    selectedChild.studentName[0]
                  )}
                </div>
                <div className="mt-3 min-w-0 w-full">
                  <h4 className="font-black text-foreground uppercase tracking-tight text-sm truncate leading-tight">
                    {selectedChild.studentName}
                  </h4>
                  <span className="inline-block px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[8.5px] font-black uppercase tracking-widest mt-1.5 leading-none">
                    {t("grade")} {selectedChild.class}-{selectedChild.section}
                  </span>
                </div>
              </div>

              {/* Right Content: Route Stub Details */}
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                {/* Ticket Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/5">
                  <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {t("transit_pass")}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[7.5px] font-black uppercase tracking-wider leading-none">
                    {t("active")}
                  </span>
                </div>

                {/* Route Details (BOARDING -> VEHICLE) */}
                <div className="space-y-3 mt-2.5">
                  {/* Pickup Point */}
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 bg-primary/5 rounded-[12px] flex items-center justify-center text-primary shrink-0">
                      <MapPin size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {t("boarding_point")}
                      </p>
                      <p className="text-[11px] font-black text-slate-700 uppercase mt-0.5 leading-tight truncate">
                        {selectedChild.pickupPoint}
                      </p>
                    </div>
                  </div>

                  {/* Active Bus */}
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 bg-primary/5 rounded-[12px] flex items-center justify-center text-primary shrink-0">
                      <Bus size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        {t("assigned_bus")}
                      </p>
                      <p className="text-[11px] font-black text-slate-700 uppercase mt-0.5 leading-tight">
                        Bus {selectedChild.bus?.busNumber || "T-02"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elegant Boarding Pass Ticket Half-Circle Notches on Top and Bottom */}
            <div className="absolute left-[38%] -top-2.5 w-5 h-5 bg-background border border-border rounded-full transform -translate-x-1/2 pointer-events-none" />
            <div className="absolute left-[38%] -bottom-2.5 w-5 h-5 bg-background border border-border rounded-full transform -translate-x-1/2 pointer-events-none" />
          </motion.div>
        )}

        {/* 3. Bus Arriving In Card */}
        {selectedChild && (
          <motion.div
            onClick={() => navigate(ROUTES.TRACKING)}
            className="bg-primary rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden group cursor-pointer"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4">
                {t("transit_status")}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-white font-black text-2xl uppercase tracking-tighter">
                    {t("bus_arriving_in")}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl font-black tracking-tighter">
                      {etaData.minutes}
                    </span>
                    <span className="text-lg font-bold opacity-40 uppercase">
                      {t("min")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl mb-2">
                    <MapPin size={12} className="text-accent" />
                    <span className="text-[11px] font-bold">
                      {etaData.km} {t("km_away")}
                    </span>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest bg-white text-primary px-4 py-2 rounded-xl shadow-sm flex items-center justify-center gap-1.5">
                    <span className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center p-[2px] shrink-0">
                      <Navigation
                        size={8}
                        className="fill-current text-primary"
                      />
                    </span>
                    {t("track_now")}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute right-[-5%] top-[-5%] opacity-10 rotate-12">
              <Bus size={150} />
            </div>
          </motion.div>
        )}

        {/* 4. Small Action Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Bus Info small card */}
          <div
            onClick={() => navigate(ROUTES.BUS_INFO)}
            className="bg-card p-6 rounded-[32px] border border-border flex flex-col gap-4 group hover:bg-card/80 transition-all cursor-pointer min-h-[140px] justify-between"
          >
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Bus size={20} />
            </div>
            <div>
              <p className="font-black text-[11px] uppercase tracking-widest text-foreground">
                {t("bus_info")}
              </p>
              <p className="text-[9px] font-bold text-foreground/60 uppercase mt-1 tracking-widest">
                {t("vehicle_details")}
              </p>
            </div>
          </div>

          {/* Trip Logs small card */}
          <div
            onClick={() => navigate(ROUTES.TRIPS)}
            className="bg-card p-6 rounded-[32px] border border-border flex flex-col gap-4 group hover:bg-card/80 transition-all cursor-pointer min-h-[140px] justify-between"
          >
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-black text-[11px] uppercase tracking-widest text-foreground">
                {t("trip_logs")}
              </p>
              <p className="text-[9px] font-bold text-foreground/60 uppercase mt-1 tracking-widest">
                {t("history")}
              </p>
            </div>
          </div>
        </div>

        {/* Today's Overview Sleek Rectangular Row Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card backdrop-blur-md rounded-[32px] p-6 border border-border shadow-sm"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <ClipboardList size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-foreground uppercase tracking-tight text-sm">
                {t("todays_overview")}
              </h4>
              <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest mt-0.5">Evening Transit • May 26</p>
            </div>
          </div>

          {/* Vertical Timeline Layout */}
          <div className="relative pl-3 space-y-8 mt-2">
            {/* Timeline Line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-slate-100 rounded-full" />

            {/* Step 1: Departed School */}
            <div className="relative flex items-center gap-5 group">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)] z-10 shrink-0" />
              <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 transition-all">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-black uppercase text-slate-700 tracking-widest">Departed School</h5>
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-emerald-600 mt-1.5 uppercase">03:45 PM <span className="text-[9px] text-slate-400 ml-1">May 26, 2026</span></p>
              </div>
            </div>

            {/* Step 2: In Transit */}
            <div className="relative flex items-center gap-5 group">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.1)] z-10 shrink-0 relative">
                 <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75" />
              </div>
              <div className="flex-1 bg-white rounded-2xl p-4 border border-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.05)] transition-all">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{t("in_transit")}</h5>
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-slate-600 mt-1.5 uppercase">03:55 PM <span className="text-[9px] text-slate-400 ml-1">May 26, 2026</span></p>
              </div>
            </div>

            {/* Step 3: ETA Home */}
            <div className="relative flex items-center gap-5 group">
              <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-[0_0_0_2px_rgba(226,232,240,1)] z-10 shrink-0" />
              <div className="flex-1 bg-transparent rounded-2xl p-4 border border-dashed border-slate-200 transition-all">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ETA Home</h5>
                  <Clock size={14} className="text-slate-300 shrink-0" />
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-1.5 uppercase">04:10 PM <span className="text-[9px] text-slate-300 ml-1">May 26, 2026</span></p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
