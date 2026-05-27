import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div className={`glass-card ${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-primary text-white hover:brightness-95',
    secondary: 'bg-white/10 text-foreground hover:bg-white/20',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'hover:bg-foreground/5 text-foreground',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button 
      className={`px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'border border-border text-foreground',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">{label}</label>}
    <input 
      className={`w-full bg-white/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all ${className}`}
      {...props}
    />
    {error && <p className="text-[10px] font-bold text-error uppercase tracking-tight ml-1">{error}</p>}
  </div>
);
