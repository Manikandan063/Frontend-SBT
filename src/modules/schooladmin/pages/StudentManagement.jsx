import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Users,
  Bus as BusIcon, 
  MapPin, 
  MoreVertical,
  Edit2,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  X,
  Save,
  GraduationCap,
  Eye,
  ArrowUpRight,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { getStudentImageUrl, handleImageError } from '../../../shared/utils/imageUtils';

const showFriendlyError = (error, fallbackMessage = 'Operation failed. Please try again.') => {
  console.error('Operation failed:', error);
  const rawMessage = error.response?.data?.message;
  let displayMessage = fallbackMessage;

  if (rawMessage) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (Array.isArray(parsed)) {
        displayMessage = parsed.map(err => {
          const field = err.path ? err.path.join('.') : 'Field';
          return `${field}: ${err.message}`;
        }).join('\n');
      } else if (parsed && typeof parsed === 'object') {
        displayMessage = parsed.message || JSON.stringify(parsed);
      } else {
        displayMessage = rawMessage;
      }
    } catch (e) {
      displayMessage = rawMessage;
    }
  } else {
    const validationErrors = error.response?.data?.errors;
    if (Array.isArray(validationErrors)) {
      displayMessage = validationErrors.map(err => err.message).join('\n');
    }
  }

  alert(`Validation Error:\n${displayMessage}`);
};

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [filterBus, setFilterBus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    rollNo: '',
    class: '',
    section: '',
    pickupPoint: '',
    currentBusId: '',
    gender: 'Male',
    address: '',
    pickupLat: '',
    pickupLng: '',
    parent: {
      parentName: '',
      email: '',
      mobileNumber: '',
      address: ''
    }
  });

  const [expandedRow, setExpandedRow] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, busesRes] = await Promise.all([
        api.get('/students'),
        api.get('/bus')
      ]);
      setStudents(studentsRes.data.data || []);
      setBuses(busesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      student.studentName?.toLowerCase().includes(query) ||
      student.rollNo?.toLowerCase().includes(query) ||
      student.class?.toLowerCase().includes(query) ||
      student.bus?.busNumber?.toLowerCase().includes(query)
    );

    const matchesClass = filterClass === 'all' || student.class === filterClass;
    const matchesBus = filterBus === 'all' || student.currentBusId === filterBus;

    return matchesSearch && matchesClass && matchesBus;
  });

  // Unique classes for the filter dropdown
  const classes = [...new Set(students.map(s => s.class))].filter(Boolean).sort();

  const handleEdit = (student) => {
    setIsEditing(true);
    setEditingId(student.id);
    setPhotoFile(null);
    setPhotoPreview(student.profilePhoto ? getStudentImageUrl(student.profilePhoto, student.studentName) : null);
    setFormData({
      studentName: student.studentName || '',
      rollNo: student.rollNo || '',
      class: student.class || '',
      section: student.section || '',
      pickupPoint: student.pickupPoint || '',
      currentBusId: student.currentBusId || '',
      gender: student.gender || 'Male',
      address: student.address || '',
      pickupLat: student.pickupLat || '',
      pickupLng: student.pickupLng || '',
      parent: {
        parentName: student.parent?.parentName || '',
        email: student.parent?.email || '',
        mobileNumber: student.parent?.mobileNumber || '',
        address: student.parent?.address || student.address || ''
      }
    });
    setIsModalOpen(true);
    setExpandedRow(null);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let studentId = editingId;
      if (isEditing) {
        await api.patch(`/students/${editingId}`, formData);
      } else {
        const response = await api.post('/students', formData);
        studentId = response.data?.data?.student?.id;
      }

      if (photoFile && studentId) {
        const photoFormData = new FormData();
        photoFormData.append('photo', photoFile);
        await api.post(`/students/${studentId}/upload-photo`, photoFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setIsModalOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      showFriendlyError(error, 'Failed to process student record. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData({
      studentName: '', rollNo: '', class: '', section: '', pickupPoint: '', currentBusId: '',
      gender: 'Male', address: '', pickupLat: '', pickupLng: '',
      parent: { parentName: '', email: '', mobileNumber: '', address: '' }
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this student from the registry?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchData();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase">Student List</h1>
            <Badge variant="outline" className="h-8 px-4 !rounded-xl border-primary/20 text-primary font-black text-[10px] uppercase">
              {filteredStudents.length} {searchQuery ? 'Found' : 'Total'}
            </Badge>
          </div>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Student Enrollment & Bus Assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <Card className="lg:col-span-3 !p-4 flex flex-col md:flex-row items-center gap-4 border-none shadow-xl bg-card">
            <div className="flex-1 w-full relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/20" size={20} />
               <input 
                 type="text" 
                 placeholder="Search by name, admission ID, or class..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-muted border-none rounded-2xl pl-14 pr-6 py-4 text-sm font-bold uppercase tracking-tight outline-none focus:ring-2 ring-primary/20 transition-all text-foreground"
               />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative">
                  <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                  <select 
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="h-14 pl-12 pr-6 bg-muted border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted/80 transition-all appearance-none min-w-[120px] text-foreground"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(c => (
                      <option key={c} value={c}>Class {c}</option>
                    ))}
                  </select>
               </div>
               <div className="relative">
                  <BusIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
                  <select 
                    value={filterBus}
                    onChange={(e) => setFilterBus(e.target.value)}
                    className="h-14 pl-12 pr-6 bg-muted border-none rounded-2xl text-xs font-black uppercase tracking-widest outline-none cursor-pointer hover:bg-muted/80 transition-all appearance-none min-w-[140px] text-foreground"
                  >
                    <option value="all">All Routes</option>
                    {buses.map(bus => (
                      <option key={bus.id} value={bus.id}>Bus {bus.busNumber}</option>
                    ))}
                  </select>
               </div>
            </div>
         </Card>
         <div className="flex items-center justify-center">
            <Button 
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="w-full !rounded-2xl h-14 !px-8 shadow-xl shadow-primary/10 !bg-primary hover:scale-[1.02] transition-all"
            >
              <Plus size={20} />
              New Admission
            </Button>
         </div>
      </div>

      <Card className="!p-0 overflow-hidden border-none shadow-2xl bg-card">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                <th className="text-left px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Student Details</th>
                <th className="text-left px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Class & Section</th>
                <th className="text-left px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Bus Details</th>
                <th className="text-left px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Status</th>
                <th className="text-right px-10 py-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Accessing Cloud Registry...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20 italic">No matches found for "{searchQuery}"</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                   <tr 
                     key={student.id} 
                     className="group hover:bg-muted/30 transition-all cursor-pointer"
                     onClick={() => {
                        setSelectedStudent(student);
                        setIsDetailsOpen(true);
                     }}
                   >
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center text-foreground/20 group-hover:bg-primary/10 group-hover:text-primary transition-all overflow-hidden shrink-0 border border-primary/5">
                            {student.profilePhoto ? (
                              <img 
                                src={getStudentImageUrl(student.profilePhoto, student.studentName)} 
                                alt={student.studentName} 
                                className="w-full h-full object-cover" 
                                onError={(e) => handleImageError(e, student.studentName)}
                              />
                            ) : (
                              <User size={28} />
                            )}
                          </div>
                         <div>
                           <p className="text-base font-black uppercase tracking-tight text-foreground">{student.studentName}</p>
                           <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">{student.rollNo}</p>
                         </div>
                       </div>
                     </td>
                   <td className="px-10 py-8">
                     <div className="space-y-1.5">
                        <p className="text-sm font-black uppercase tracking-tight text-foreground/70">Class {student.class}</p>
                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">Section {student.section}</p>
                     </div>
                   </td>
                   <td className="px-10 py-8">
                     <div className="space-y-3">
                        <div className="flex items-center gap-2.5 text-primary">
                           <BusIcon size={14} />
                           <span className="text-xs font-black uppercase tracking-tight">
                             {student.bus?.busNumber || 'Fleet Pending'}
                           </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-foreground/30">
                           <MapPin size={12} />
                           <span className="text-[10px] font-bold uppercase truncate max-w-[150px] tracking-widest">
                             {student.pickupPoint || 'Unmapped Node'}
                           </span>
                        </div>
                     </div>
                   </td>

                   <td className="px-10 py-8">
                     <Badge variant={student.status === 'active' ? 'success' : 'error'} className="!px-4 !py-1 !rounded-xl">
                       {student.status || 'active'}
                     </Badge>
                   </td>
                   <td className="px-10 py-8 text-right" onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-end gap-2">
                       {expandedRow === student.id ? (
                         <motion.div 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           className="flex items-center gap-2"
                         >
                           <button 
                             onClick={() => handleEdit(student)}
                             className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl shadow-transparent hover:shadow-primary/20"
                           >
                             <Edit2 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDelete(student.id)}
                             className="w-12 h-12 bg-error/10 text-error rounded-2xl flex items-center justify-center hover:bg-error hover:text-white transition-all shadow-xl shadow-transparent hover:shadow-error/20"
                           >
                             <Trash2 size={18} />
                           </button>
                           <button 
                             onClick={() => setExpandedRow(null)}
                             className="w-12 h-12 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center border border-border"
                           >
                             <X size={18} />
                           </button>
                         </motion.div>
                       ) : (
                         <button 
                           onClick={() => setExpandedRow(student.id)}
                           className="w-12 h-12 bg-muted text-foreground/20 hover:text-primary hover:bg-primary/10 rounded-2xl transition-all flex items-center justify-center"
                         >
                           <Eye size={20} />
                         </button>
                       )}
                     </div>
                   </td>
                 </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl !bg-card rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="flex flex-col h-full">
                {/* Modal Header */}
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                      <GraduationCap size={28} />
                    </div>
                    <div className="flex-1 relative z-10">
                      <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">
                        {isEditing ? 'Update Admission' : 'New Student Admission'}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mt-1">
                        {isEditing ? 'Modify existing record' : 'Institutional Enrollment Registry'}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-foreground/10 hover:text-error hover:bg-error/5 transition-all shadow-sm">
                    <X size={24} />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleEnroll} className="p-10 space-y-10">
                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-h-[65vh]">
                   <div className="space-y-8">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Column 1: Identity */}
                        <div className="space-y-8">
                           <div className="flex items-center gap-4 border-b border-primary/10 pb-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                 <User size={20} />
                              </div>
                              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Identity</h3>
                           </div>
                           <div className="space-y-6">
                              {/* Student Profile Photo Upload */}
                              <div className="flex flex-col items-center justify-center p-4 bg-muted/30 rounded-2xl border border-dashed border-primary/20 space-y-4">
                                <div className="relative group">
                                  <div className="w-24 h-24 rounded-2xl bg-card border border-border overflow-hidden flex items-center justify-center relative shadow-md">
                                    {photoPreview ? (
                                      <img 
                                        src={photoPreview} 
                                        alt="Preview" 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User size={40} className="text-foreground/20" />
                                    )}
                                  </div>
                                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-all">
                                    <Camera size={16} />
                                    <input 
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          setPhotoFile(file);
                                          setPhotoPreview(URL.createObjectURL(file));
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Student Profile Photo</span>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Student Name</label>
                                 <input 
                                    required
                                    value={formData.studentName}
                                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-primary/30 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-4 ring-primary/5 transition-all text-foreground"
                                    placeholder="Enter Name"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Roll Number</label>
                                 <input 
                                    required
                                    value={formData.rollNo}
                                    onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-primary/30 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-4 ring-primary/5 transition-all text-foreground"
                                    placeholder="E.G. 101"
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Class</label>
                                    <input 
                                       required
                                       value={formData.class}
                                       onChange={(e) => setFormData({...formData, class: e.target.value})}
                                       className="w-full h-15 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                       placeholder="Class"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Section</label>
                                    <input 
                                       required
                                       value={formData.section}
                                       onChange={(e) => setFormData({...formData, section: e.target.value})}
                                       className="w-full h-15 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                       placeholder="Sec"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Column 2: Transit */}
                        <div className="space-y-8">
                           <div className="flex items-center gap-4 border-b border-blue-500/10 pb-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                 <BusIcon size={20} />
                              </div>
                              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-500">Logistics</h3>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Assign Bus</label>
                                 <select 
                                    value={formData.currentBusId}
                                    onChange={(e) => setFormData({...formData, currentBusId: e.target.value})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-blue-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none"
                                 >
                                    <option value="">Select Bus</option>
                                    {buses.map(bus => (
                                      <option key={bus.id} value={bus.id}>Bus {bus.busNumber}</option>
                                    ))}
                                 </select>
                              </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Pickup Point</label>
                                 <div className="relative">
                                    <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" />
                                    <input 
                                       value={formData.pickupPoint}
                                       onChange={(e) => setFormData({...formData, pickupPoint: e.target.value})}
                                       className="w-full h-15 bg-muted/50 border border-transparent focus:border-blue-500/30 rounded-2xl pl-14 pr-6 text-sm font-black uppercase outline-none"
                                       placeholder="Stop Name"
                                    />
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Latitude</label>
                                    <input 
                                       type="number"
                                       step="any"
                                       value={formData.pickupLat}
                                       onChange={(e) => setFormData({...formData, pickupLat: e.target.value})}
                                       className="w-full h-15 bg-muted/50 border border-transparent focus:border-blue-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                       placeholder="11.0005"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Longitude</label>
                                    <input 
                                       type="number"
                                       step="any"
                                       value={formData.pickupLng}
                                       onChange={(e) => setFormData({...formData, pickupLng: e.target.value})}
                                       className="w-full h-15 bg-muted/50 border border-transparent focus:border-blue-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                       placeholder="77.0286"
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Column 3: Parent */}
                        <div className="space-y-8">
                           <div className="flex items-center gap-4 border-b border-emerald-500/10 pb-4">
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                 <Users size={20} />
                              </div>
                              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500">Guardian</h3>
                           </div>
                           <div className="space-y-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Parent Name</label>
                                 <input 
                                    required
                                    value={formData.parent.parentName}
                                    onChange={(e) => setFormData({...formData, parent: {...formData.parent, parentName: e.target.value}})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-emerald-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                    placeholder="Parent Name"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Mobile</label>
                                 <input 
                                    required
                                    value={formData.parent.mobileNumber}
                                    onChange={(e) => setFormData({...formData, parent: {...formData.parent, mobileNumber: e.target.value}})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-emerald-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                    placeholder="Phone"
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Email Address</label>
                                 <input 
                                    required
                                    type="email"
                                    value={formData.parent.email}
                                    onChange={(e) => setFormData({...formData, parent: {...formData.parent, email: e.target.value}})}
                                    className="w-full h-15 bg-muted/50 border border-transparent focus:border-emerald-500/30 rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                    placeholder="email@example.com"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                   </div>
                </div>

                  <div className="flex gap-6 pt-10 border-t border-border">
                    <Button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 !h-16 !rounded-2xl !bg-primary !text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    >
                      {submitting ? 'Processing...' : (isEditing ? 'Update Record' : 'Complete Admission')}
                      <Save size={18} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="flex-1 !h-16 !rounded-2xl text-xs font-black uppercase tracking-widest !bg-muted !text-muted-foreground hover:!bg-error/10 hover:!text-error transition-all"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details View Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedStudent && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
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
              className="relative w-full max-w-2xl !bg-card rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden"
            >
               <div className="bg-primary/5 p-8 flex flex-col md:flex-row items-center text-center md:text-left gap-8 relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                  <button 
                    onClick={() => setIsDetailsOpen(false)}
                    className="absolute top-6 right-6 w-10 h-10 bg-card rounded-2xl flex items-center justify-center text-foreground/20 hover:text-error transition-all z-20"
                  >
                    <X size={18} />
                  </button>
                  <div className="w-20 h-20 bg-card rounded-[1.5rem] flex items-center justify-center text-primary shadow-xl relative z-10 overflow-hidden border border-primary/5">
                     {selectedStudent.profilePhoto ? (
                       <img 
                         src={getStudentImageUrl(selectedStudent.profilePhoto, selectedStudent.studentName)} 
                         alt={selectedStudent.studentName} 
                         className="w-full h-full object-cover" 
                         onError={(e) => handleImageError(e, selectedStudent.studentName)}
                       />
                     ) : (
                       <User size={32} />
                     )}
                  </div>
                  <div className="flex-1 relative z-10">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">{selectedStudent.studentName}</h3>
                    <Badge variant={selectedStudent.status === 'active' ? 'success' : 'error'} className="mt-2 !px-4 !py-1 !rounded-lg">
                       {selectedStudent.status || 'active'}
                    </Badge>
                  </div>
               </div>

               <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Roll Number</p>
                        <p className="text-base font-black text-foreground">{selectedStudent.rollNo}</p>
                     </div>
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Academic Node</p>
                        <p className="text-base font-black text-foreground">Class {selectedStudent.class} • Sec {selectedStudent.section}</p>
                     </div>
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Transit Bus</p>
                        <p className="text-base font-black text-primary uppercase">Bus {selectedStudent.bus?.busNumber || 'Pending'}</p>
                     </div>
                     <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Stopping Point</p>
                        <p className="text-base font-bold text-foreground/70 uppercase truncate">{selectedStudent.pickupPoint || 'Unmapped'}</p>
                     </div>
                  </div>



                  <div className="flex gap-4">
                    <Button 
                      className="flex-1 !h-16 !rounded-2xl !bg-slate-900 !text-white text-xs font-black uppercase tracking-widest"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        window.location.href = `/schooladmin/tracking?student=${selectedStudent.id}`;
                      }}
                    >
                      Track Now
                      <ArrowUpRight size={18} />
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="flex-1 !h-16 !rounded-2xl text-xs font-black uppercase tracking-widest !bg-muted !text-muted-foreground"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentManagement;
