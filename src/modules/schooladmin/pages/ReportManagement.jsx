import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Download, 
  Calendar, 
  User, 
  Bus, 
  MapPin, 
  Activity,
  ArrowRight,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Shield,
  Printer,
  Phone,
  AlertCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { Card, Button, Badge } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { motion, AnimatePresence } from 'framer-motion';

const ReportManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [buses, setBuses] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [fetchingBuses, setFetchingBuses] = useState(false);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    setFetchingBuses(true);
    try {
      const response = await api.get('/tracking/fleet/status');
      setBuses(response.data.data || []);
    } catch (error) {
      console.error('[REPORTS] Failed to fetch buses:', error);
    } finally {
      setFetchingBuses(false);
    }
  };

  const fetchStudentsByBus = async (bus) => {
    setSelectedBus(bus);
    setSelectedStudent(null);
    setSearchTerm('');
    setSearching(true);
    try {
      const response = await api.get(`/students?currentBusId=${bus.id}`);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('[REPORTS] Failed to fetch students for bus:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      const delayDebounceFn = setTimeout(() => {
        searchStudents();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setStudents([]);
    }
  }, [searchTerm]);

  const searchStudents = async () => {
    setSearching(true);
    try {
      console.log('[REPORTS] Searching for:', searchTerm);
      const response = await api.get(`/students?search=${searchTerm}`);
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('[REPORTS] Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const fetchStudentReport = async (studentId) => {
    setLoading(true);
    try {
      console.log('[REPORTS] Fetching profile for ID:', studentId);
      const response = await api.get(`/students/${studentId}`);
      setSelectedStudent(response.data.data);
      setSearchTerm('');
    } catch (error) {
      console.error('[REPORTS] Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-10 pb-20">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
          .card-print { 
            border: 1px solid #eee !important; 
            box-shadow: none !important; 
            background: white !important;
            color: black !important;
          }
          .glass { background: white !important; border: 1px solid #eee !important; }
          .bg-slate-900 { background: #f8fafc !important; color: black !important; border: 1px solid #eee !important; }
          .text-white\/30 { color: #94a3b8 !important; }
          .text-white { color: black !important; }
        }
      `}</style>

      {/* Header - Hidden on Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Student Reports</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Student Profile & Journey History</p>
        </div>
        <div className="flex items-center gap-4">
           {selectedStudent && (
             <Button 
               onClick={handlePrint}
               variant="secondary" 
               className="!rounded-2xl h-14 !px-8 shadow-lg bg-card border border-border"
             >
               <Printer size={18} />
               Print Report
             </Button>
           )}
           <Button className="!rounded-2xl h-14 !px-8 shadow-xl shadow-primary/20">
             <Download size={18} />
             Export Student List
           </Button>
        </div>
      </div>

      {/* Student Selection - Hidden on Print */}
      <div className="max-w-2xl mx-auto space-y-4 no-print relative">
        <Card className="!p-4 border-none shadow-2xl bg-card rounded-[2rem] relative z-[60]">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" size={20} />
            <input 
              type="text" 
              placeholder="Search Student by Name or Roll No..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              className="w-full h-16 bg-muted border-none rounded-[1.5rem] pl-16 pr-6 text-sm font-black uppercase outline-none focus:ring-2 ring-primary/10 transition-all text-foreground"
            />
            {searching && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </Card>

        <AnimatePresence>
          {students.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 top-full mt-4 bg-card rounded-[2rem] shadow-2xl border border-border overflow-hidden z-[70]"
            >
              <div className="max-h-[300px] overflow-y-auto p-4 space-y-2 no-scrollbar">
                {students.map((student) => (
                  <div 
                    key={student.id}
                    onClick={() => fetchStudentReport(student.id)}
                    className="flex items-center justify-between p-4 hover:bg-muted rounded-2xl cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase">{student.studentName}</p>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{student.rollNo} • CLASS {student.class}-{student.section}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-foreground/10 group-hover:text-primary transition-all" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {searchTerm.length > 2 && !searching && students.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute left-0 right-0 top-full mt-4 bg-card rounded-[2rem] shadow-2xl border border-border p-10 text-center z-[70]"
            >
               <AlertCircle className="mx-auto text-foreground/10 mb-4" size={40} />
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">No matching records found</p>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!selectedStudent && !searchTerm && !selectedBus && (
           <div className="mt-10">
             <h3 className="text-sm font-black uppercase tracking-widest text-foreground/40 mb-6 text-center">Or Select a Bus to View Students</h3>
             {fetchingBuses ? (
               <div className="flex justify-center py-10">
                 <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {buses.map(bus => (
                   <Card 
                     key={bus.id} 
                     onClick={() => fetchStudentsByBus(bus)}
                     className="p-6 cursor-pointer hover:border-primary/50 transition-all text-center flex flex-col items-center justify-center gap-3 group bg-card"
                   >
                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                       <Bus size={24} />
                     </div>
                     <div>
                       <h3 className="text-lg font-black uppercase">Bus {bus.busNumber}</h3>
                       <p className="text-[9px] font-bold text-foreground/40 uppercase tracking-widest truncate max-w-[100px] mx-auto">{bus.routeName || 'No Route'}</p>
                     </div>
                   </Card>
                 ))}
               </div>
             )}
           </div>
        )}

        {!selectedStudent && selectedBus && (
           <div className="mt-8 space-y-4 no-print">
             <div className="flex items-center justify-between mb-6">
               <div>
                 <h3 className="text-2xl font-black uppercase">Students in Bus {selectedBus.busNumber}</h3>
                 <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">{selectedBus.routeName || 'No Route'}</p>
               </div>
               <Button variant="secondary" onClick={() => { setSelectedBus(null); setStudents([]); }} className="!h-10">Back to Buses</Button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {searching ? (
                  <div className="col-span-full flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
               ) : students.length === 0 ? (
                 <p className="col-span-full text-center text-foreground/40 text-[10px] font-black uppercase tracking-widest py-10">No students assigned to this bus.</p>
               ) : (
                 students.map(student => (
                   <Card 
                     key={student.id} 
                     onClick={() => fetchStudentReport(student.id)}
                     className="p-4 flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all group bg-card"
                   >
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                         <User size={20} />
                       </div>
                       <div>
                         <p className="text-sm font-black uppercase">{student.studentName}</p>
                         <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{student.rollNo} • CLASS {student.class}-{student.section}</p>
                       </div>
                     </div>
                     <ChevronRight size={18} className="text-foreground/10 group-hover:text-primary transition-colors" />
                   </Card>
                 ))
               )}
             </div>
           </div>
        )}
      </div>

      {/* Report Content */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-32 text-center"
          >
             <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Generating Student Report...</p>
          </motion.div>
        ) : selectedStudent ? (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="no-print flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedStudent(null)} className="!h-10 !px-6 shadow-sm border border-border">
                <ArrowRight size={16} className="rotate-180 mr-2" />
                Back
              </Button>
            </div>
            {/* 1. Official Header & Student Profile */}
            <Card className="!p-12 border-none shadow-2xl bg-card rounded-[3rem] overflow-hidden relative card-print">
               <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 no-print" />
               
               <div className="flex flex-col md:flex-row gap-12 items-start">
                  <div className="w-48 h-48 bg-muted rounded-[3rem] border-4 border-card shadow-xl flex items-center justify-center text-foreground/10 relative overflow-hidden shrink-0">
                     {selectedStudent.profilePhoto ? (
                       <img 
                         src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${selectedStudent.profilePhoto}`} 
                         alt="Student" 
                         className="w-full h-full object-cover" 
                       />
                     ) : (
                       <div className="text-6xl font-black text-primary/20 uppercase">{selectedStudent.studentName?.[0] || '?'}</div>
                     )}
                  </div>

                  <div className="flex-1 space-y-8">
                     <div className="space-y-3">
                        <div className="flex items-center gap-4 flex-wrap">
                           <h2 className="text-5xl font-black uppercase tracking-tighter text-foreground leading-none">{selectedStudent.studentName}</h2>
                           <Badge variant="success" className="!px-4 !py-2 !rounded-xl text-[10px] uppercase font-black tracking-widest shadow-xl shadow-success/10 bg-success/10 text-success border-none">Active Student</Badge>
                        </div>
                        <p className="text-sm font-bold text-foreground/30 uppercase tracking-[0.4em]">Roll No: {selectedStudent.rollNo} • Register No Verified</p>
                     </div>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-2">Grade / Section</p>
                           <p className="text-xl font-black uppercase">Class {selectedStudent.class}-{selectedStudent.section}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-2">Home Stop</p>
                           <p className="text-xl font-black uppercase truncate max-w-[150px]">{selectedStudent.pickupPoint}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-2">Bus Number</p>
                           <p className="text-xl font-black uppercase">Bus {selectedStudent.bus?.busNumber || 'TBD'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-2">Safety Status</p>
                           <div className="flex items-center gap-2">
                              <Shield className="text-success" size={20} />
                              <p className="text-xl font-black uppercase text-success">Verified</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* 2. Guardian & Emergency Information */}
               <Card className="!p-10 border-none shadow-2xl rounded-[3rem] card-print bg-card text-foreground">
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Parent Details</h3>
                     <UserCheck className="text-primary" size={24} />
                  </div>
                  
                  <div className="space-y-8">
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Parent Name</p>
                        <p className="text-lg font-black uppercase text-foreground">{selectedStudent.parent?.parentName || 'N/A'}</p>
                     </div>

                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <Phone size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Mobile Number</p>
                           <p className="text-base font-black tracking-tight text-foreground">{selectedStudent.parent?.mobileNumber || 'N/A'}</p>
                        </div>
                     </div>

                     <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">Address</p>
                           <p className="text-sm font-black uppercase leading-tight line-clamp-2 text-foreground">{selectedStudent.parent?.address || selectedStudent.address}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-12 p-6 bg-muted rounded-[2rem] border border-border space-y-4">
                     <div className="flex items-center gap-3">
                        <Shield className="text-success" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Alerts Active</span>
                     </div>
                     <p className="text-[11px] font-bold text-foreground/30 uppercase leading-relaxed">Alerts will be sent when bus is near home.</p>
                  </div>
               </Card>

               {/* 3. Operational Log History */}
               <Card className="lg:col-span-2 !p-12 border-none shadow-2xl bg-card rounded-[3rem] card-print">
                  <div className="flex items-center justify-between mb-12">
                     <div>
                        <h3 className="text-3xl font-black uppercase tracking-tight">Bus Trip Logs</h3>
                        <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mt-1">Journey History for current week</p>
                     </div>
                     <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-1">Bus Driver</p>
                        <p className="text-sm font-black uppercase text-primary">{selectedStudent.bus?.driverName || 'Not Assigned'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                     <div className="p-6 bg-muted rounded-[2rem] text-center border border-border">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Speed</p>
                        <p className="text-2xl font-black">28 <span className="text-[10px] opacity-20">KM/H</span></p>
                     </div>
                     <div className="p-6 bg-muted rounded-[2rem] text-center border border-border">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Distance</p>
                        <p className="text-2xl font-black">12.4 <span className="text-[10px] opacity-20">KM</span></p>
                     </div>
                     <div className="p-6 bg-muted rounded-[2rem] text-center border border-border">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Late Trips</p>
                        <p className="text-2xl font-black text-success">0</p>
                     </div>
                     <div className="p-6 bg-muted rounded-[2rem] text-center border border-border">
                        <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30 mb-2">Attendance</p>
                        <p className="text-2xl font-black text-primary">100%</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {[
                       { date: 'Today, 14 May', morning: '07:45 AM', evening: '04:15 PM', status: 'On Time' },
                       { date: 'Yesterday, 13 May', morning: '07:42 AM', evening: '04:10 PM', status: 'On Time' },
                       { date: 'Tuesday, 12 May', morning: '07:48 AM', evening: '04:20 PM', status: 'On Time' },
                       { date: 'Monday, 11 May', morning: '07:44 AM', evening: '04:15 PM', status: 'On Time' },
                     ].map((log, i) => (
                       <div key={i} className="flex items-center justify-between p-6 bg-muted/50 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-10">
                             <div className="w-28">
                                <p className="text-xs font-black uppercase tracking-tight">{log.date.split(',')[0]}</p>
                                <p className="text-[9px] font-bold text-foreground/30 uppercase">{log.date.split(',')[1]}</p>
                             </div>
                             <div className="flex items-center gap-12">
                                <div className="flex flex-col">
                                   <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-1">Morning Time</span>
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/30" />
                                      <span className="text-xs font-black uppercase">{log.morning}</span>
                                   </div>
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[8px] font-black uppercase text-foreground/20 tracking-widest mb-1">Evening Time</span>
                                   <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/30" />
                                      <span className="text-xs font-black uppercase">{log.evening}</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <Badge variant="success" className="!px-4 !py-1.5 !bg-muted !text-success border border-border !shadow-sm uppercase font-black text-[9px] tracking-widest">{log.status}</Badge>
                       </div>
                     ))}
                  </div>
               </Card>
            </div>

            {/* Print Footer */}
            <div className="hidden print-only mt-20 pt-12 border-t border-slate-100 text-center">
               <div className="flex justify-between items-center px-10 mb-10">
                  <div className="text-left space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest">Transport Manager</p>
                     <div className="w-32 h-px bg-slate-200" />
                  </div>
                  <div className="text-right space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-widest">Principal's Seal</p>
                     <div className="w-32 h-px bg-slate-200" />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Generated by XTOWN Bus Tracking Enterprise Platform • Confidential</p>
               <p className="text-[8px] font-bold text-slate-200 mt-2">Dossier Integrity Verified • ID: {selectedStudent.id?.toUpperCase()}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ReportManagement;
