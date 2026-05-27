import React from 'react';
import { motion } from 'framer-motion';
import { Map } from 'lucide-react';

const Header = ({ title, subtitle, compact = false, onAssistantClick = () => {}, ambientMode = null, alwaysNormal = false }) => {
  // Extract parent's first name
  const name = typeof title === 'string' && title.includes(',') ? title.split(',')[1]?.trim() : title;

  const getHeaderBusAnimation = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeValue = hours * 60 + minutes; // absolute minutes since midnight

    const morningStart = 7 * 60;          // 7:00 AM
    // const morningEnd = 9 * 60 + 30;       // 9:30 AM
    const morningEnd = 10 * 60; // 10:00 AM
    const eveningStart = 15 * 60 + 15;    // 3:15 PM (15:15)
    const eveningEnd = 17 * 60 + 45;      // 5:45 PM (17:45)

    if (timeValue >= morningStart && timeValue <= morningEnd) {
      return 'morning'; // Come and pickup student
    } else if (timeValue >= eveningStart && timeValue <= eveningEnd) {
      return 'evening'; // School bus drop student
    }
    return 'normal';
  };

  const animState = alwaysNormal ? 'normal' : getHeaderBusAnimation();

  if (compact) {
    return (
      <div className="relative pt-6 pb-5 px-6 bg-[#FAFBF6] border-b border-slate-100 flex items-center justify-between select-none shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-[2.5px] bg-[#88B04B] rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#88B04B] leading-none">
              {subtitle}
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#2B2D2F] uppercase leading-none">
            {title}
          </h1>
        </div>

        {/* Floating compact map button */}
        <motion.button
          onClick={onAssistantClick}
          whileTap={{ scale: 0.95 }}
          animate={
            ambientMode === 'ready'
              ? { scale: [1, 1.06, 0.94, 1.06, 1], x: [0, -1, 1, -1, 0] }
              : ambientMode === 'nearing'
                ? { scale: [1, 1.03, 1] }
                : {}
          }
          transition={
            ambientMode === 'ready'
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : ambientMode === 'nearing'
                ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                : {}
          }
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border active:scale-95 transition-all shrink-0 relative
            ${ambientMode === 'ready'
              ? 'bg-amber-50 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
              : ambientMode === 'nearing'
                ? 'bg-emerald-50 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'bg-white border-slate-100'
            }`}
        >
          {ambientMode === 'ready' && (
            <span className="absolute inset-0 rounded-xl bg-amber-400/20 animate-ping" />
          )}
          {ambientMode === 'nearing' && (
            <span className="absolute inset-0 rounded-xl bg-emerald-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          )}
          <Map size={16} className={`stroke-[2.2] transition-colors ${
            ambientMode === 'ready'
              ? 'text-amber-600'
              : ambientMode === 'nearing'
                ? 'text-emerald-600'
                : 'text-[#88B04B]'
          }`} />
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative pt-10 pb-20 px-6 bg-[#FAFBF6] overflow-hidden flex flex-col justify-between select-none">


      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-[3px] bg-[#88B04B] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#88B04B] leading-none">
              {subtitle}
            </span>
          </div>

          <h1 className="text-[34px] font-black tracking-tight text-[#2B2D2F] uppercase leading-none">
            HI <span className="text-[#88B04B]">{name}</span>
          </h1>
        </div>

        {/* Floating rounded map button */}
        <motion.button
          onClick={onAssistantClick}
          whileTap={{ scale: 0.95 }}
          animate={
            ambientMode === 'ready'
              ? { scale: [1, 1.05, 0.95, 1.05, 1], x: [0, -1, 1, -1, 0] }
              : ambientMode === 'nearing'
                ? { scale: [1, 1.02, 1] }
                : {}
          }
          transition={
            ambientMode === 'ready'
              ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
              : ambientMode === 'nearing'
                ? { repeat: Infinity, duration: 2.2, ease: "easeInOut" }
                : {}
          }
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.06)] border active:scale-95 transition-all shrink-0 relative
            ${ambientMode === 'ready'
              ? 'bg-amber-50 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)]'
              : ambientMode === 'nearing'
                ? 'bg-emerald-50 border-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.4)]'
                : 'bg-white border-slate-100/50'
            }`}
        >
          {ambientMode === 'ready' && (
            <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
          )}
          {ambientMode === 'nearing' && (
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          )}
          <Map size={22} className={`stroke-[2.2] transition-colors ${
            ambientMode === 'ready'
              ? 'text-amber-600'
              : ambientMode === 'nearing'
                ? 'text-emerald-600'
                : 'text-[#88B04B]'
          }`} />
        </motion.button>
      </div>

      {/* Illustrative 3D Green Hill Landscape SVG */}
      <div className="absolute bottom-0 inset-x-0 h-[100px] w-full pointer-events-none select-none">
        <svg className="w-full h-full" viewBox="0 0 375 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="hill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A2C765" />
              <stop offset="100%" stopColor="#88B04B" />
            </linearGradient>
          </defs>

          {/* Background Hill (slight contrast) */}
          <path d="M -20,100 L -20,68 C 100,48 280,72 395,78 L 395,100 Z" fill="#98BE5C" className="opacity-40" />

          {/* Foreground Main Curved Hill */}
          <path d="M -20,100 L -20,72 C 100,42 275,52 395,74 L 395,100 Z" fill="url(#hill-gradient)" />

          {/* Road White Lane Dash Line along the hill curve */}
          <path 
            d="M -20,74 C 100,44 275,54 395,76" 
            fill="none" 
            stroke="#FAFBF6" 
            strokeWidth="1.5" 
            strokeDasharray="4 3" 
            className="opacity-60" 
          />

          {/* Cute 3D Trees on the hill */}
          {/* Tree 1: Left */}
          <g transform="translate(30, 48)">
            <rect x="-1" y="8" width="2" height="12" fill="#755139" />
            <circle cx="0" cy="8" r="8" fill="#7FA442" />
            <circle cx="-3" cy="6" r="5" fill="#8BB34C" />
          </g>

          {/* Tree 2: Center Left */}
          <g transform="translate(68, 42)">
            <rect x="-0.75" y="6" width="1.5" height="10" fill="#755139" />
            <circle cx="0" cy="6" r="6" fill="#7FA442" />
            <circle cx="-2" cy="4" r="4.5" fill="#8BB34C" />
          </g>

          {/* Tree 3: Center */}
          <g transform="translate(165, 38)">
            <rect x="-1" y="8" width="2" height="12" fill="#755139" />
            <circle cx="0" cy="8" r="8.5" fill="#7FA442" />
            <circle cx="-3.5" cy="5.5" r="6" fill="#8BB34C" />
          </g>

          {/* Tree 4: Right */}
          <g transform="translate(330, 52)">
            <rect x="-1" y="7" width="2" height="11" fill="#755139" />
            <circle cx="0" cy="7" r="7.5" fill="#7FA442" />
            <circle cx="-2.5" cy="5" r="5" fill="#8BB34C" />
          </g>

          {/* Tree 5: Far Right */}
          <g transform="translate(360, 46)">
            <rect x="-0.75" y="6" width="1.5" height="9" fill="#755139" />
            <circle cx="0" cy="6" r="6" fill="#7FA442" />
            <circle cx="-2" cy="4" r="4.5" fill="#8BB34C" />
          </g>

          {/* Animated/Responsive Yellow School Bus driving up the hill */}
          {animState === 'morning' && (
            <g transform="translate(230, 44) rotate(4)">
              <style>{`
                @keyframes morning-bus-timeline {
                  0% { transform: translate(-240px, 30px) rotate(-12deg); }
                  25% { transform: translate(0px, 0px) rotate(4deg); }
                  75% { transform: translate(0px, 0px) rotate(4deg); }
                  100% { transform: translate(180px, 34px) rotate(12deg); }
                }
                @keyframes morning-parent-timeline {
                  0%, 25% { transform: translate(110px, 4px); opacity: 0; }
                  26% { opacity: 1; }
                  40% { transform: translate(65px, 4px); }
                  65% { transform: translate(65px, 4px); }
                  80% { transform: translate(120px, 4px); opacity: 1; }
                  85%, 100% { transform: translate(120px, 4px); opacity: 0; }
                }
                @keyframes morning-student-timeline {
                  0%, 25% { transform: translate(100px, 4px) scaleX(-1); opacity: 0; }
                  26% { opacity: 1; }
                  40% { transform: translate(55px, 4px) scaleX(-1); }
                  42% { transform: translate(55px, 4px) scaleX(-1); }
                  60% { transform: translate(24px, 4px) scaleX(-1); opacity: 1; }
                  65%, 100% { transform: translate(24px, 4px) scaleX(-1); opacity: 0; }
                }
                @keyframes morning-bus-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-0.8px); }
                }
                @keyframes parent-leg-swing {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(18deg); }
                }
                @keyframes parent-arm-wave {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(-35deg); }
                }
                @keyframes leg-swing {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(20deg); }
                }
                .morning-bus-group {
                  animation: morning-bus-timeline 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }
                .morning-bus-body {
                  animation: morning-bus-bounce 0.5s infinite ease-in-out;
                }
                .parent-morning {
                  animation: morning-parent-timeline 8s infinite linear;
                }
                .student-running {
                  animation: morning-student-timeline 8s infinite linear;
                }
                .parent-left-leg {
                  transform-origin: 1.5px 9.5px;
                  animation: parent-leg-swing 0.3s infinite ease-in-out;
                }
                .parent-right-leg {
                  transform-origin: 3px 9.5px;
                  animation: parent-leg-swing 0.3s infinite ease-in-out reverse;
                }
                .waving-arm {
                  transform-origin: 4.5px 1px;
                  animation: parent-arm-wave 0.4s infinite ease-in-out;
                }
                .left-leg {
                  transform-origin: 1px 9.5px;
                  animation: leg-swing 0.2s infinite ease-in-out;
                }
                .right-leg {
                  transform-origin: 2.5px 9.5px;
                  animation: leg-swing 0.2s infinite ease-in-out reverse;
                }
              `}</style>
              
              {/* Coordinated Bus Group */}
              <g className="morning-bus-group">
                <g className="morning-bus-body">
                  {/* Bus Yellow Main Shell */}
                  <rect x="0" y="2" width="26" height="14" rx="3" fill="#F8BC1C" />
                  {/* Bus Back Bumper */}
                  <rect x="-1" y="11" width="2" height="4" rx="0.5" fill="#3D4042" />
                  {/* Bus Glass Windows */}
                  <rect x="2" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="8" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="14" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  {/* Door open (drawn as transparent/open entrance) */}
                  <rect x="20" y="4" width="4.5" height="10" rx="0.5" fill="#1E293B" />
                  {/* Black Stripe */}
                  <rect x="0" y="10" width="20" height="1" fill="#3D4042" />
                </g>
                {/* Wheels */}
                <circle cx="6" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="6" cy="16" r="1.2" fill="#FAFBF6" />
                <circle cx="17" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="17" cy="16" r="1.2" fill="#FAFBF6" />
              </g>

              {/* Parent waving goodbye */}
              <g className="parent-morning">
                {/* Body */}
                <rect x="0" y="0" width="4.5" height="9.5" rx="1.5" fill="#E76F51" />
                {/* Head */}
                <circle cx="2.25" cy="-3" r="2.2" fill="#FDBA74" />
                {/* Waving Arm */}
                <path d="M 4.5 1 L 7 -2" stroke="#E76F51" strokeWidth="1.2" strokeLinecap="round" className="waving-arm" />
                {/* Legs */}
                <line x1="1.5" y1="9.5" x2="0.75" y2="14" stroke="#1E293B" strokeWidth="1" className="parent-left-leg" />
                <line x1="3" y1="9.5" x2="3.75" y2="14" stroke="#1E293B" strokeWidth="1" className="parent-right-leg" />
              </g>

              {/* Synchronized Running Student */}
              <g className="student-running">
                {/* Red Backpack */}
                <rect x="-2" y="3.5" width="2.2" height="4" rx="0.6" fill="#EF4444" />
                {/* Body */}
                <rect x="0" y="3" width="3.5" height="6.5" rx="1.2" fill="#3B82F6" />
                {/* Head */}
                <circle cx="1.75" cy="0.75" r="1.8" fill="#FDBA74" />
                {/* Moving Legs */}
                <line x1="1" y1="9.5" x2="0.25" y2="13" stroke="#1E293B" strokeWidth="0.8" className="left-leg" />
                <line x1="2.5" y1="9.5" x2="3.25" y2="13" stroke="#1E293B" strokeWidth="0.8" className="right-leg" />
              </g>
            </g>
          )}

          {animState === 'evening' && (
            <g transform="translate(230, 44) rotate(4)">
              <style>{`
                @keyframes evening-bus-timeline {
                  0% { transform: translate(-240px, 30px) rotate(-12deg); }
                  25% { transform: translate(0px, 0px) rotate(4deg); }
                  75% { transform: translate(0px, 0px) rotate(4deg); }
                  100% { transform: translate(180px, 34px) rotate(12deg); }
                }
                @keyframes evening-parent-timeline {
                  0%, 25% { transform: translate(110px, 4px); opacity: 0; }
                  26% { opacity: 1; }
                  35% { transform: translate(65px, 4px); }
                  52% { transform: translate(65px, 4px); }
                  75% { transform: translate(115px, 4px); opacity: 1; }
                  80%, 100% { transform: translate(115px, 4px); opacity: 0; }
                }
                @keyframes evening-student-timeline {
                  0%, 30% { transform: translate(24px, 4px); opacity: 0; }
                  31% { opacity: 1; }
                  45% { transform: translate(55px, 4px); }
                  52% { transform: translate(55px, 4px); }
                  75% { transform: translate(105px, 4px); opacity: 1; }
                  80%, 100% { transform: translate(105px, 4px); opacity: 0; }
                }
                @keyframes evening-bus-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-0.8px); }
                }
                @keyframes parent-leg-swing {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(18deg); }
                }
                @keyframes leg-swing {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(20deg); }
                }
                .evening-bus-group {
                  animation: evening-bus-timeline 8s infinite cubic-bezier(0.4, 0, 0.2, 1);
                }
                .evening-bus-body {
                  animation: evening-bus-bounce 0.5s infinite ease-in-out;
                }
                .parent-evening {
                  animation: evening-parent-timeline 8s infinite linear;
                }
                .student-walking-away {
                  animation: evening-student-timeline 8s infinite linear;
                }
                .parent-left-leg {
                  transform-origin: 1.5px 9.5px;
                  animation: parent-leg-swing 0.3s infinite ease-in-out;
                }
                .parent-right-leg {
                  transform-origin: 3px 9.5px;
                  animation: parent-leg-swing 0.3s infinite ease-in-out reverse;
                }
                .left-leg {
                  transform-origin: 1px 9.5px;
                  animation: leg-swing 0.2s infinite ease-in-out;
                }
                .right-leg {
                  transform-origin: 2.5px 9.5px;
                  animation: leg-swing 0.2s infinite ease-in-out reverse;
                }
              `}</style>
              
              {/* Coordinated Bus Group */}
              <g className="evening-bus-group">
                <g className="evening-bus-body">
                  {/* Bus Yellow Main Shell */}
                  <rect x="0" y="2" width="26" height="14" rx="3" fill="#F8BC1C" />
                  {/* Bus Back Bumper */}
                  <rect x="-1" y="11" width="2" height="4" rx="0.5" fill="#3D4042" />
                  {/* Bus Glass Windows */}
                  <rect x="2" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="8" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="14" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  {/* Door open (drawn as transparent/open entrance) */}
                  <rect x="20" y="4" width="4.5" height="10" rx="0.5" fill="#1E293B" />
                  {/* Black Stripe */}
                  <rect x="0" y="10" width="20" height="1" fill="#3D4042" />
                </g>
                {/* Wheels */}
                <circle cx="6" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="6" cy="16" r="1.2" fill="#FAFBF6" />
                <circle cx="17" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="17" cy="16" r="1.2" fill="#FAFBF6" />
              </g>

              {/* Parent waiting to pick up student */}
              <g className="parent-evening">
                {/* Body */}
                <rect x="0" y="0" width="4.5" height="9.5" rx="1.5" fill="#E76F51" />
                {/* Head */}
                <circle cx="2.25" cy="-3" r="2.2" fill="#FDBA74" />
                {/* Legs */}
                <line x1="1.5" y1="9.5" x2="0.75" y2="14" stroke="#1E293B" strokeWidth="1" className="parent-left-leg" />
                <line x1="3" y1="9.5" x2="3.75" y2="14" stroke="#1E293B" strokeWidth="1" className="parent-right-leg" />
              </g>

              {/* Synchronized Walking Student (Holding hand & leaving together) */}
              <g className="student-walking-away">
                {/* Red Backpack */}
                <rect x="-2" y="3.5" width="2.2" height="4" rx="0.6" fill="#EF4444" />
                {/* Body */}
                <rect x="0" y="3" width="3.5" height="6.5" rx="1.2" fill="#3B82F6" />
                {/* Head */}
                <circle cx="1.75" cy="0.75" r="1.8" fill="#FDBA74" />
                {/* Moving Legs */}
                <line x1="1" y1="9.5" x2="0.25" y2="13" stroke="#1E293B" strokeWidth="0.8" className="left-leg" />
                <line x1="2.5" y1="9.5" x2="3.25" y2="13" stroke="#1E293B" strokeWidth="0.8" className="right-leg" />
              </g>
            </g>
          )}

          {animState === 'normal' && (
            <g>
              <style>{`
                @keyframes normal-bus-entry {
                  0% { transform: translate(-100px, 60px) rotate(-6deg); }
                  30% { transform: translate(100px, 40px) rotate(0deg); }
                  100% { transform: translate(230px, 44px) rotate(4deg); }
                }
                @keyframes bus-bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-0.8px); }
                }
                .normal-bus-group {
                  animation: normal-bus-entry 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .yellow-bus-body {
                  animation: bus-bounce 0.5s infinite linear;
                }
              `}</style>
              <g className="normal-bus-group">
                <g className="yellow-bus-body">
                  {/* Bus Yellow Main Shell */}
                  <rect x="0" y="2" width="26" height="14" rx="3" fill="#F8BC1C" />
                  {/* Bus Back Bumper */}
                  <rect x="-1" y="11" width="2" height="4" rx="0.5" fill="#3D4042" />
                  {/* Bus Glass Windows */}
                  <rect x="2" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="8" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="14" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  <rect x="20" y="4" width="4.5" height="5" rx="0.5" fill="#2E4A62" />
                  {/* Black Stripe */}
                  <rect x="0" y="10" width="26" height="1" fill="#3D4042" />
                </g>
                {/* Wheels */}
                <circle cx="6" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="6" cy="16" r="1.2" fill="#FAFBF6" />
                <circle cx="20" cy="16" r="3" fill="#2B2B2B" />
                <circle cx="20" cy="16" r="1.2" fill="#FAFBF6" />
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default Header;
