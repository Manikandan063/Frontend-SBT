import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Cpu } from 'lucide-react';

const MaintenanceScreen = () => {
  return (
    <div className="fixed inset-0 z-[99999] bg-[#0B0F19] flex items-center justify-center p-6 overflow-hidden">
      {/* Background glow decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-xl text-center relative z-10"
      >
        {/* Glowing Central Icon */}
        <div className="relative inline-flex items-center justify-center mb-10">
          <div className="absolute inset-0 w-32 h-32 bg-amber-500/20 rounded-[2.5rem] blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 bg-[#151D30] border border-amber-500/20 rounded-[2.5rem] flex items-center justify-center text-amber-500 shadow-2xl">
            <ShieldAlert size={48} className="animate-bounce" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground leading-none">
          THIS PORTAL IS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            UNDER MAINTENANCE
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p className="text-sm md:text-base text-foreground/50 font-bold uppercase tracking-widest mt-6 max-w-md mx-auto leading-relaxed">
          Our team is performing premium optimization upgrades to enhance your live fleet telemetry and experience. We'll be back online momentarily.
        </p>

        {/* Tactical Status Indicator */}
        <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-[#151D30]/80 border border-border/60 backdrop-blur-md rounded-2xl shadow-lg">
          <Cpu size={16} className="text-amber-500 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">
            SYSTEM UPGRADE IN PROGRESS
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenanceScreen;
