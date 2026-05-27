import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  School as SchoolIcon, 
  Users, 
  Bus, 
  MapPin, 
  Activity, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Zap,
  Bell,
  Settings,
  PlusCircle,
  Download,
  Calendar,
  ExternalLink,
  Search
} from 'lucide-react';
import { Card, Badge, Button } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';

const StatCard = ({ title, value, icon: Icon, trend, color, subText }) => (
  <Card className="p-8 relative overflow-hidden group border-none shadow-2xl bg-white">
    <div className={`absolute top-0 right-0 w-40 h-40 -mr-12 -mt-12 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-150 ${color}`} />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
          <Icon size={28} />
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 text-green-500 font-black text-[11px] bg-green-500/10 px-3 py-1.5 rounded-xl">
            <TrendingUp size={14} />
            {trend}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground/60 mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tighter text-foreground">{value}</h3>
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">{subText}</span>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] font-black text-foreground/50 uppercase tracking-widest">Real-time Sync</span>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  </Card>
);

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    busFleet: 0,
    activeAdmins: 0,
    fleetHealth: [
      { label: 'Active', val: '0%', color: 'text-primary', percentage: 0 },
      { label: 'Standby', val: '0%', color: 'text-blue-400', percentage: 0 },
      { label: 'Alerts', val: '0%', color: 'text-error', percentage: 0 },
      { label: 'Offline', val: '0%', color: 'text-slate-500', percentage: 0 }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schoolsRes, statsRes] = await Promise.all([
        api.get('/schools'),
        api.get('/dashboard/superadmin')
      ]);
      setSchools(schoolsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Platform Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
        <div className="space-y-2">
          <Badge variant="outline" className="!text-[9px] !px-4 !py-1 !border-primary/20 !text-primary">Platform Operational • V2.4.0</Badge>
          <h1 className="text-6xl font-black tracking-tighter text-foreground uppercase leading-none">Command Center</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.4em] mt-2">Enterprise Resource Management & Fleet Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 bg-white shadow-xl rounded-2xl flex items-center justify-center text-foreground/40 hover:text-primary hover:scale-105 transition-all">
            <Bell size={24} />
          </button>
        </div>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard title="Total Institutions" value={loading ? '...' : stats.totalSchools} icon={SchoolIcon} trend="+4.5" color="bg-primary" subText="Units" />
        <StatCard title="Platform Admins" value={loading ? '...' : stats.activeAdmins} icon={Users} trend="+0.8" color="bg-blue-500" subText="Active" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Real-time Growth Visualizer */}
        <Card className="lg:col-span-8 p-10 space-y-10 bg-white border-none shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Fleet Distribution</h3>
              <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Vehicle allocation across institutions</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-primary" />
                 <span className="text-[10px] font-black uppercase text-foreground/40">Registered Buses</span>
               </div>
               <select className="bg-slate-50 border-none rounded-xl px-6 h-12 text-[10px] font-black uppercase outline-none ml-4">
                 <option>All Regions</option>
               </select>
            </div>
          </div>
          
          <div className="h-[350px] w-full flex items-end justify-between gap-4 pt-12">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            ) : (stats.fleetDistribution || []).map((school, i) => {
              const maxCount = Math.max(...(stats.fleetDistribution || []).map(s => s.count), 1);
              const height = (school.count / maxCount) * 100;
              
              return (
                <div key={i} className="flex-1 group relative flex flex-col items-center h-full">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[9px] font-black px-3 py-2 rounded-lg shadow-2xl z-20 whitespace-nowrap">
                    <p className="uppercase tracking-widest">{school.name}</p>
                    <p className="text-primary mt-1">{school.count} Vehicles</p>
                  </div>
                  <div className="w-full bg-slate-50 rounded-2xl h-full flex items-end overflow-hidden relative border border-slate-100/50">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ duration: 1.5, delay: i * 0.05, ease: [0.33, 1, 0.68, 1] }}
                      className="w-full bg-primary rounded-t-xl relative shadow-[0_-8px_16px_rgba(136,176,75,0.2)]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                      <div className="absolute inset-0 shimmer opacity-20" />
                    </motion.div>
                  </div>
                  <span className="text-[9px] font-black uppercase mt-6 text-foreground/20 group-hover:text-primary transition-colors truncate w-full text-center">
                    {school.name.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Platform Growth */}
        <Card className="lg:col-span-4 p-10 space-y-10 bg-white border-none shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-all duration-1000" />
          
          <div className="relative z-10 space-y-1">
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">App Growth</h3>
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp size={14} />
              <p className="text-[10px] font-black uppercase tracking-widest">+12.4% New Users</p>
            </div>
          </div>

          {/* Smooth Growth Chart (Simulated Area Chart) */}
          <div className="relative z-10 h-40 flex items-end justify-between px-2 pt-10">
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <motion.path
                 initial={{ pathLength: 0, opacity: 0 }}
                 animate={{ pathLength: 1, opacity: 1 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 d="M0,80 Q10,75 20,60 T40,40 T60,50 T80,20 T100,10 L100,100 L0,100 Z"
                 fill="url(#growthGradient)"
                 className="opacity-20"
               />
               <motion.path
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 d="M0,80 Q10,75 20,60 T40,40 T60,50 T80,20 T100,10"
                 fill="none"
                 stroke="#88B04B"
                 strokeWidth="3"
                 strokeLinecap="round"
               />
               <defs>
                 <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#88B04B" />
                   <stop offset="100%" stopColor="transparent" />
                 </linearGradient>
               </defs>
            </svg>
            <div className="w-full flex justify-between absolute bottom-0 left-0 right-0 px-4 mb-[-24px]">
               {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => (
                 <span key={m} className="text-[8px] font-black uppercase text-foreground/20">{m}</span>
               ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8 pt-8">
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">New Units</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-3xl font-black text-foreground">14</h4>
                   <span className="text-[9px] font-bold text-success">+2</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Target Reach</p>
                <div className="flex items-baseline gap-2">
                   <h4 className="text-3xl font-black text-foreground">85%</h4>
                   <span className="text-[9px] font-bold text-success">Optimal</span>
                </div>
             </div>
          </div>

          <div className="relative z-10 space-y-6 pt-2">
            {[
              { label: 'Security Compliance', val: '99.8%', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'API Availability', val: '99.9%', icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Incident Response', val: '4m 12s', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${node.bg} ${node.color} group-hover/item:scale-110 transition-all`}>
                     <node.icon size={18} />
                   </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">{node.label}</span>
                </div>
                <span className="text-base font-black text-foreground">{node.val}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 pt-4">
             <Button className="w-full !h-16 !rounded-2xl !bg-white !text-slate-900 !text-xs !font-black !uppercase tracking-widest hover:!scale-105 transition-all">
                System Logs
                <ArrowUpRight size={18} />
             </Button>
          </div>
        </Card>
      </div>

      {/* Advanced Registry Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <Card className="lg:col-span-9 p-10 space-y-10 bg-white border-none shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Recent Deployments</h3>
                <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Live institutional registry updates</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                    <input type="text" placeholder="Search registry..." className="w-full h-12 bg-slate-50 rounded-xl pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:ring-1 ring-primary/20 transition-all" />
                 </div>
                 <Button variant="secondary" className="!h-12 !w-12 !p-0 !rounded-xl">
                    <Download size={18} />
                 </Button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a2e1a]">
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/80 rounded-l-xl">Institution Identity</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/80">Transit Node</th>
                    <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/80">Status</th>
                    <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/80 rounded-r-xl">Analytics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">Accessing Cloud Registry...</p>
                      </td>
                    </tr>
                  ) : schools.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-20 text-center text-[10px] font-bold text-foreground/20 uppercase tracking-widest">No Cloud Deployments Found</td>
                    </tr>
                  ) : (
                    schools.slice(0, 5).map((school, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-foreground/20 font-black text-xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              {school.schoolName[0]}
                            </div>
                            <div>
                              <p className="text-base font-black uppercase tracking-tight text-foreground">{school.schoolName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <div className="w-2 h-2 rounded-full bg-success/20" />
                                 <p className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">{school.address || 'Global Node'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-3">
                              <Bus size={14} className="text-primary/40" />
                              <span className="text-[11px] font-black uppercase text-foreground/60">{school.fleet || 0} Assets Linked</span>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <Badge variant="outline" className="!bg-success/5 !text-success !border-success/20 !px-4">Active Deploy</Badge>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <button className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-foreground/20 group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-transparent group-hover:shadow-primary/20">
                              <ExternalLink size={18} />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
         </Card>

         {/* Quick Command Grid */}
         <div className="lg:col-span-3 flex flex-col gap-8">
            <h3 className="text-xl font-black uppercase tracking-tight text-foreground px-2">Quick Actions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-6">
               {[
                 { label: 'Register Unit', icon: PlusCircle, path: ROUTES.SCHOOL_MANAGEMENT, color: 'bg-primary' },
                 { label: 'System Settings', icon: Settings, path: ROUTES.PLATFORM_SETTINGS, color: 'bg-slate-600' },
                 { label: 'Global Reports', icon: Download, path: ROUTES.REPORTS_ANALYTICS, color: 'bg-blue-600' },
               ].map((action, i) => (
                 <button 
                   key={i}
                   onClick={() => action.path !== '#' && navigate(action.path)}
                   className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center gap-4 group border-none"
                 >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${action.color} group-hover:rotate-12 transition-all`}>
                      <action.icon size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60 group-hover:text-foreground transition-colors">{action.label}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
