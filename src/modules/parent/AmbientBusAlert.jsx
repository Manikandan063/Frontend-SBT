// ✅ Ambient Mode Added
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Navigation } from "lucide-react";

const AmbientBusAlert = ({
  mapDistanceKm,
  busNumber = "Bus 02",
  onAmbientModeChange = () => {},
}) => {
  const [distance, setDistance] = useState(null);
  const [activeState, setActiveState] = useState(null); // 'nearing' (<=1KM), 'ready' (<=300M), or null
  const [isVisible, setIsVisible] = useState(false);
  const [hasDismissedState, setHasDismissedState] = useState(null); // track last dismissed state to prevent spam

  // Proximity Logic based on live route/map driving distance
  useEffect(() => {
    if (mapDistanceKm && mapDistanceKm !== "--") {
      const dist = parseFloat(mapDistanceKm);
      setDistance(dist);

      let newState = null;
      if (dist <= 0.3) {
        newState = "ready";
      } else if (dist <= 1.0) {
        newState = "nearing";
      }

      if (newState !== activeState) {
        setActiveState(newState);
        onAmbientModeChange(newState);

        // Auto-show when transition occurs and hasn't been dismissed
        if (newState && hasDismissedState !== newState) {
          setIsVisible(true);
        }
      }
    } else {
      setDistance(null);
      if (activeState !== null) {
        setActiveState(null);
        onAmbientModeChange(null);
      }
    }
  }, [mapDistanceKm, activeState, hasDismissedState]);

  // Auto-hide after 8 seconds of premium display
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, activeState]);

  const handleClose = () => {
    setIsVisible(false);
    if (activeState) {
      setHasDismissedState(activeState);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && activeState && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={
            activeState === "ready"
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  x: [0, -2, 2, -2, 2, 0], // shake/vibration alert for urgent mode
                  transition: {
                    x: {
                      repeat: 2,
                      duration: 0.15,
                      ease: "linear",
                      delay: 0.4,
                    },
                    default: { type: "spring", damping: 25, stiffness: 350 },
                  },
                }
              : {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: "spring", damping: 25, stiffness: 350 },
                }
          }
          exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.2 } }}
          className={`fixed bottom-28 left-6 right-6 z-[9999] p-5 rounded-[30px] border backdrop-blur-xl shadow-2xl flex items-center gap-4 transition-all duration-300
            ${
              activeState === "ready"
                ? "bg-white/90 border-amber-200/70 shadow-amber-500/10"
                : "bg-white/90 border-emerald-200/70 shadow-emerald-500/10"
            }`}
        >
          {/* Soft Ambient Radial Background Glow */}
          <div
            className={`absolute -inset-px -z-10 rounded-[30px] opacity-10 blur-xl transition-all duration-500
              ${activeState === "ready" ? "bg-amber-500" : "bg-emerald-500"}`}
          />

          {/* Glowing Proximity Illustration Frame */}
          <div className="relative shrink-0 flex items-center justify-center">
            {/* Pulse rings */}
            <span
              className={`absolute w-12 h-12 rounded-2xl opacity-20 animate-ping
                ${activeState === "ready" ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ animationDuration: activeState === "ready" ? "1.5s" : "2.5s" }}
            />
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors shadow-inner
                ${
                  activeState === "ready"
                    ? "bg-amber-50 border-amber-200/50 text-amber-500"
                    : "bg-emerald-50 border-emerald-200/50 text-emerald-500"
                }`}
            >
              {/* Custom animated Mini Yellow Bus SVG */}
              <svg
                className="w-7 h-7 animate-bounce"
                style={{ animationDuration: activeState === "ready" ? "0.6s" : "1.2s" }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="5" width="20" height="11" rx="2.5" fill="#F8BC1C" />
                <rect x="4" y="7" width="3" height="3" rx="0.5" fill="#2E4A62" />
                <rect x="9" y="7" width="3" height="3" rx="0.5" fill="#2E4A62" />
                <rect x="14" y="7" width="3" height="3" rx="0.5" fill="#2E4A62" />
                <rect x="19" y="7" width="1.5" height="3" rx="0.5" fill="#2E4A62" />
                <rect x="2" y="12" width="20" height="0.8" fill="#3D4042" />
                <circle cx="6" cy="17" r="2.5" fill="#2B2B2B" />
                <circle cx="6" cy="17" r="1" fill="#FAFBF6" />
                <circle cx="17" cy="17" r="2.5" fill="#2B2B2B" />
                <circle cx="17" cy="17" r="1" fill="#FAFBF6" />
              </svg>
            </div>

            {/* Tiny Badge */}
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border flex items-center justify-center shadow-sm
                ${
                  activeState === "ready"
                    ? "bg-amber-100 border-amber-300 text-amber-600"
                    : "bg-emerald-100 border-emerald-300 text-emerald-600"
                }`}
            >
              {activeState === "ready" ? (
                <Sparkles size={10} className="animate-pulse" />
              ) : (
                <Navigation size={9} className="rotate-45" fill="currentColor" />
              )}
            </div>
          </div>

          {/* Typography Content */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-[8.5px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border leading-none
                  ${
                    activeState === "ready"
                      ? "bg-amber-50 border-amber-200/50 text-amber-600"
                      : "bg-emerald-50 border-emerald-200/50 text-emerald-600"
                  }`}
              >
                {distance ? `${(distance * 1000).toFixed(0)}m Stop Away` : "NearingStop"}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                {busNumber}
              </span>
            </div>

            <h4 className="font-black text-slate-800 tracking-tight text-[13.5px] mt-1.5 uppercase leading-none">
              {activeState === "ready"
                ? "Please be ready for pickup!"
                : `${busNumber} is entering your area`}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wide leading-tight">
              {activeState === "ready"
                ? "The bus is very close to your stop"
                : "The bus is within 1 KM from your stop"}
            </p>
          </div>

          {/* Dismiss Close Button */}
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/30 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AmbientBusAlert;
