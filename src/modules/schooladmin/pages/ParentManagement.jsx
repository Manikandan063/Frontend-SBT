import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  MessageSquare,
  Settings,
  Bell,
  MoreVertical,
  CheckCircle,
  XCircle,
  Link,
  Eye,
  Edit2,
  Trash2,
  X,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';

const ParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      const response = await api.get('/parents');
      setParents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const allRows = parents.flatMap(parent => {
    if (!parent.children || parent.children.length === 0) {
      return [{
        ...parent,
        studentName: 'Not Assigned',
        rollNo: 'N/A',
        class: 'N/A',
        section: '?'
      }];
    }
    return parent.children.map(child => ({
      ...parent,
      studentName: child.studentName,
      rollNo: child.rollNo,
      class: child.class,
      section: child.section
    }));
  });

  const uniqueClasses = [...new Set(allRows.map(r => r.class))].filter(c => c && c !== 'N/A').sort();

  const flattenedData = allRows.filter(row => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      (row.parentName?.toLowerCase().includes(searchLower)) ||
      (row.mobileNumber?.includes(searchQuery)) ||
      (row.studentName?.toLowerCase().includes(searchLower)) ||
      (row.rollNo?.toLowerCase().includes(searchLower)) ||
      (row.class?.toLowerCase().includes(searchLower));
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'linked' && row.fcmToken) ||
      (statusFilter === 'unlinked' && !row.fcmToken);

    const matchesClass = 
      classFilter === 'all' || 
      row.class === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase leading-none">Parent & Student List</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-2">Manage parent contacts and student links</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="!px-4 !py-2 !border-primary/20 !text-primary !text-[10px]">Records: {flattenedData.length}</Badge>
        </div>
      </div>

      <Card className="!p-4 flex flex-col md:flex-row items-center gap-4 bg-card border-border">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name, roll no or parent name..." 
            className="w-full bg-muted border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none text-foreground"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
            <select 
              className="h-12 pl-12 pr-10 bg-muted border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted/80 transition-all appearance-none min-w-[140px] text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">App Status</option>
              <option value="linked">App Linked</option>
              <option value="unlinked">No Connection</option>
            </select>
          </div>
          <div className="relative">
            <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
            <select 
              className="h-12 pl-12 pr-10 bg-muted border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted/80 transition-all appearance-none min-w-[140px] text-foreground"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden shadow-2xl border-none bg-card">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Student Name</th>
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Class & Section</th>
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Parent Details</th>
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">App Status</th>
                <th className="text-right px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Loading List...</p>
                  </td>
                </tr>
              ) : flattenedData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center text-[10px] font-black uppercase text-foreground/20">No Records Found</td>
                </tr>
              ) : (
                flattenedData.map((row, idx) => (
                  <tr 
                    key={`${row.id}-${idx}`} 
                    className="group hover:bg-muted/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedParent(row);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground/20 font-black text-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          {row.studentName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-base font-black uppercase tracking-tight text-foreground">{row.studentName}</p>
                          <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">Roll No: {row.rollNo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <div className="px-4 py-2 bg-muted rounded-lg text-xs font-black text-foreground/60 border border-border uppercase">
                             {row.class}
                          </div>
                          <div className="px-4 py-2 bg-primary/5 rounded-lg text-xs font-black text-primary border border-primary/10 uppercase">
                             {row.section}
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <p className="text-xs font-black uppercase text-foreground/80">{row.parentName}</p>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/30 uppercase">
                          <Phone size={12} />
                          {row.mobileNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                         <Badge variant={row.fcmToken ? 'success' : 'outline'} className="!px-4">
                            {row.fcmToken ? 'Active Push' : 'No Connection'}
                         </Badge>
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-foreground/20">App Connectivity</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-foreground/10 hover:text-primary hover:bg-primary/10 transition-all">
                        <ArrowUpRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <AnimatePresence>
        {isDetailsOpen && selectedParent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsOpen(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl !bg-card rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <div className="bg-primary/5 p-8 flex flex-col md:flex-row items-center text-center md:text-left gap-8 relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                  <button 
                    onClick={() => setIsDetailsOpen(false)}
                    className="absolute top-6 right-6 w-10 h-10 bg-card rounded-2xl flex items-center justify-center text-foreground/20 hover:text-error transition-all z-20"
                  >
                    <X size={18} />
                  </button>
                  <div className="w-20 h-20 bg-card rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl relative z-10 font-black text-2xl">
                     {selectedParent.parentName?.[0]}
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">{selectedParent.parentName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mt-1">Guardian Profile • School Registry</p>
                  </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="flex items-center gap-4 p-6 bg-muted rounded-2xl">
                        <Phone className="text-primary" size={20} />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Mobile Number</p>
                           <p className="text-sm font-black">{selectedParent.mobileNumber}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 p-6 bg-muted rounded-2xl">
                        <Mail className="text-primary" size={20} />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Email Address</p>
                           <p className="text-sm font-black lowercase">{selectedParent.email}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black uppercase tracking-widest text-foreground/40 px-2">Linked Students</h4>
                     <div className="space-y-3">
                        {selectedParent.children?.map((child, i) => (
                           <div key={i} className="flex items-center justify-between p-5 border border-border rounded-2xl hover:border-primary/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <User size={18} />
                                 </div>
                                  <div>
                                    <p className="text-sm font-black uppercase text-foreground">{child.studentName}</p>
                                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-0.5">
                                      Class {child.class}-{child.section}
                                    </p>
                                  </div>
                               </div>
                              <ArrowUpRight className="text-foreground/20" size={18} />
                           </div>
                        ))}
                     </div>
                  </div>

                  <Button 
                    className="w-full !h-16 !rounded-2xl !bg-slate-900 !text-white text-xs font-black uppercase tracking-widest"
                    onClick={() => setIsDetailsOpen(false)}
                  >
                    Close Directory
                  </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParentManagement;
