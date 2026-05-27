import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bus } from 'lucide-react';
import { ROUTES } from '../../config/routes';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(ROUTES.LOGIN);
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="matte-green-theme h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Background Decor */}
      <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-5%] left-[-5%] w-64 h-64 bg-accent/10 rounded-full blur-3xl" />

      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center gap-8"
      >
        <div className="w-28 h-28 bg-primary rounded-[40px] flex items-center justify-center shadow-sm relative group">
          <div className="absolute inset-0 bg-white/10 rounded-[40px] scale-110 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Bus size={56} className="text-white" strokeWidth={2} />
        </div>
        
        <div className="text-center">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-foreground text-5xl font-black tracking-tighter leading-none"
          >
            SBT
          </motion.h1>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2"
          >
            <span className="text-primary font-black tracking-[0.3em] text-[12px] uppercase">
              BY XTOWN
            </span>
          </motion.div>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-foreground/40 font-bold tracking-[0.4em] text-[9px] mt-4 uppercase"
          >
            Student Transit
          </motion.p>
        </div>
      </motion.div>

      {/* Loading Indicator */}
      <div className="absolute bottom-32 w-48 h-[3px] bg-foreground/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/2 h-full bg-primary rounded-full shadow-[0_0_10px_rgba(136,176,75,0.4)]"
        />
      </div>

      <p className="absolute bottom-12 text-foreground/20 text-[9px] font-bold tracking-[0.3em] uppercase">
        Premium Campus Safety
      </p>
    </motion.div>
  );
};

export default SplashScreen;
