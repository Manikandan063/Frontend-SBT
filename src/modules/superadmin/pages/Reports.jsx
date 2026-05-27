import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  FileText,
  ChevronRight,
  School,
  Bus,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('Overview');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [data, setData] = useState({
    metrics: [
      { label: 'Platform Efficiency', value: '94.8%', trend: '+2.4%', up: true, icon: Activity, color: 'bg-primary' },
      { label: 'Safety Compliance', value: '99.9%', trend: '+0.1%', up: true, icon: CheckCircle2, color: 'bg-blue-500' },
      { label: 'Active Fleet Usage', value: '86.2%', trend: '-1.5%', up: false, icon: Bus, color: 'bg-purple-500' },
      { label: 'Incident Rate', value: '0.04%', trend: '-0.02%', up: true, icon: AlertTriangle, color: 'bg-amber-500' }
    ],
    chartData: [24, 28, 22, 35, 30, 42, 72, 55, 60, 65, 70, 95],
    schoolPerformance: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      console.log("[Reports] Fetching platform analytics...");
      const response = await api.get('/dashboard/superadmin/report');
      const apiData = response.data?.data;
      if (apiData && apiData.metrics) {
        const metrics = apiData.metrics.map((m, i) => ({
          ...m,
          icon: [Activity, CheckCircle2, Bus, AlertTriangle][i] || Activity,
          color: ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500'][i] || 'bg-primary'
        }));

        const fallbackData = [24, 28, 22, 35, 30, 42, 72, 55, 60, 65, 70, 95];
        const extractedChartData = apiData.chartData ? apiData.chartData.map(c => c.value !== undefined ? c.value : c) : [];
        const finalChartData = extractedChartData.length > 0 && extractedChartData.some(v => v > 0) ? extractedChartData : fallbackData;

        setData({
          metrics: metrics.length > 0 ? metrics : data.metrics,
          chartData: finalChartData,
          schoolPerformance: apiData.institutionalPerformance || []
        });
      }
    } catch (error) {
      console.error('[Reports] Critical error during analytics synchronization:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Enterprise Reports</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-2">Operational Analytics & Compliance Monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-4">
             <span className="text-[10px] font-black text-foreground/30 uppercase tracking-widest">Last Backup</span>
             <span className="text-xs font-black uppercase text-primary">14 mins ago</span>
          </div>
          <Button variant="secondary" className="!rounded-xl h-14 !px-6 border-none shadow-lg">
            <Calendar size={18} />
            {dateRange}
          </Button>
          <Button className="!rounded-xl h-14 !px-8 shadow-xl shadow-primary/20">
            <Download size={18} />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* KPI Ribbons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.metrics.map((metric, i) => (
          <Card key={i} className="!p-6 group hover:scale-[1.02] transition-all border border-border shadow-xl bg-card overflow-hidden">
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${metric.color}`}>
                <metric.icon size={22} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">{metric.label}</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-2xl font-black">{metric.value}</h4>
                  <span className={`text-[10px] font-black ${metric.up ? 'text-success' : 'text-error'}`}>
                    {metric.trend}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Section */}
        <Card className="lg:col-span-8 !p-10 space-y-10 bg-card border border-border shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Active Platform Traffic</h3>
              <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Institutional data requests vs capacity</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl">
               {['Requests', 'Efficiency', 'Incidents'].map((tab) => (
                 <button 
                  key={tab}
                  onClick={() => setReportType(tab)}
                  className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${reportType === tab ? 'bg-primary text-white shadow-sm' : 'text-foreground/30 hover:text-foreground/60'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
          </div>

          <div className="h-[300px] w-full flex items-end justify-between gap-4 pt-10">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <RefreshCcw className="animate-spin text-primary/20" size={40} />
              </div>
            ) : data.chartData.map((val, i) => {
              const max = Math.max(...data.chartData, 1);
              const height = (val / max) * 100;
              return (
                <div key={i} className="flex-1 group relative flex flex-col items-center h-full">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-all bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap pointer-events-none">
                    {val}k Req
                  </div>
                  
                  {/* Simple Bar Container */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end overflow-hidden">
                    <div 
                      style={{ height: `${height}%` }}
                      className={`w-full transition-all duration-700 ease-out ${
                        height > 70 || i === data.chartData.length - 1
                          ? 'bg-primary' 
                          : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-primary/50'
                      }`}
                    />
                  </div>

                  <span className="text-[9px] font-bold uppercase mt-3 text-foreground/50 group-hover:text-foreground">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Breakdown Card */}
        <Card className="lg:col-span-4 !p-10 space-y-10 bg-card border-border border shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Fleet Integrity</h3>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <PieChartIcon size={20} />
            </div>
          </div>

          <div className="flex flex-col items-center py-4">
             <div className="w-48 h-48 rounded-full border-[12px] border-muted flex flex-col items-center justify-center relative">
                <div className="absolute inset-[-12px] rounded-full border-[12px] border-primary border-r-transparent border-b-transparent -rotate-45" />
                <span className="text-5xl font-black tracking-tighter text-foreground">98.2%</span>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mt-1">System Health</span>
             </div>
          </div>

          <div className="space-y-6">
             {loading ? (
                <div className="space-y-4">
                   {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />)}
                </div>
             ) : (
               data.metrics.map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{item.label}</span>
                    </div>
                    <span className="text-base font-black text-foreground">{item.value}</span>
                 </div>
               ))
             )}
          </div>

          <button className="w-full h-16 rounded-2xl bg-muted hover:bg-muted/80 transition-all border border-border flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground">
            Run Deep Audit
            <ChevronRight size={16} />
          </button>
        </Card>
      </div>

      {/* Institutional Performance Table */}
      <Card className="!p-0 overflow-hidden bg-card border border-border shadow-2xl">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Institutional Performance</h3>
            <p className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em] mt-1">Fleet efficiency and safety audit results</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={16} />
            <input 
              type="text" 
              placeholder="Filter by school name..." 
              className="w-full h-12 bg-muted border border-border rounded-xl pl-12 pr-4 text-[10px] font-black uppercase outline-none focus:ring-1 ring-primary/20 transition-all text-foreground" 
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">School Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-center">Safety Rating</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-center">Population</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-center">Asset Load</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.schoolPerformance.map((school, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-all cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-muted border border-border rounded-2xl flex items-center justify-center text-foreground/20 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <School size={20} />
                      </div>
                      <p className="text-base font-black uppercase tracking-tight">{school.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-black text-primary">{school.rating}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= Math.floor(school.rating) ? 'bg-primary' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-sm font-bold text-foreground/60">{school.students}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-black">{school.fleet}</span>
                      <span className="text-[8px] font-black uppercase text-foreground/20">Transit Assets</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Badge 
                      variant={school.status === 'Optimal' ? 'success' : school.status === 'Warning' ? 'warning' : 'error'}
                      className="!px-4 !py-1.5"
                    >
                      {school.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
          <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Displaying Global Enterprise Performance Data</p>
          <div className="flex items-center gap-4">
             <Button variant="secondary" className="!h-10 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !rounded-xl">Previous</Button>
             <Button variant="secondary" className="!h-10 !px-6 !text-[10px] !font-black !uppercase !tracking-widest !rounded-xl">Next Matrix</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
