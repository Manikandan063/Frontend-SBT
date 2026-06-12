import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  School as SchoolIcon,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  Bus,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  User
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';

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

const SchoolManagement = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    address: '',
    phone: '',
    email: '',
    principalName: '',
    latitude: '',
    longitude: '',
    boardType: 'STATE',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSchoolId, setCurrentSchoolId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data.data || []);
    } catch (error) {
      console.error('[SchoolManagement] Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (isEditing) {
        if (!payload.adminPassword) {
          delete payload.adminPassword;
        }
        await api.put(`/schools/${currentSchoolId}`, payload);
      } else {
        await api.post('/schools', payload);
      }

      setIsModalOpen(false);
      resetForm();
      fetchSchools();
    } catch (error) {
      showFriendlyError(error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      schoolName: '',
      address: '',
      phone: '',
      email: '',
      principalName: '',
      latitude: '',
      longitude: '',
      boardType: 'STATE',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
    setIsEditing(false);
    setCurrentSchoolId(null);
  };

  const handleEdit = (school) => {
    setFormData({
      schoolName: school.schoolName,
      address: school.address,
      phone: school.phone,
      email: school.email,
      principalName: school.principalName || '',
      latitude: school.latitude || '',
      longitude: school.longitude || '',
      boardType: school.boardType || 'STATE',
      adminName: school.admins?.[0]?.name || '',
      adminEmail: school.admins?.[0]?.email || '',
      adminPassword: ''
    });
    setCurrentSchoolId(school.id);
    setIsEditing(true);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await api.delete(`/schools/${id}`);
        fetchSchools();
        setIsDetailsOpen(false);
      } catch (error) {
        console.error('Delete failed:', error);
        alert(error.response?.data?.message || 'Failed to delete school');
      }
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = 
      (school.schoolName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (school.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (school.principalName && school.principalName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter === 'active' && (school.status === 'active' || !school.status)) ||
      (statusFilter === 'blocked' && school.status === 'blocked');

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchools.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground uppercase">Institutions</h1>
          <p className="text-[10px] md:text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Global School Directory</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="!rounded-2xl h-14 md:h-16 !px-8 shadow-xl shadow-primary/20 w-full lg:w-auto"
        >
          <Plus size={20} />
          Register New School
        </Button>
      </div>

      {/* Filters Area */}
      <Card className="!p-4 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search institutions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-foreground/5 border-none rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:ring-1 ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 md:flex-none h-12 bg-foreground/5 border-none rounded-xl px-4 md:px-6 text-[10px] font-black uppercase outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
          <Button variant="secondary" className="!rounded-xl h-12 flex-1 md:flex-none">
            Export
          </Button>
        </div>
      </Card>

      {/* Data View */}
      <div className="space-y-4">
        {/* Mobile Card View (shown only on small screens) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <div className="py-20 text-center opacity-40">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">Syncing...</p>
            </div>
          ) : currentItems.map((school) => (
            <Card 
              key={school.id} 
              className="p-5 space-y-5"
              onClick={() => {
                setSelectedSchool(school);
                setIsDetailsOpen(true);
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <SchoolIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-tight text-sm truncate max-w-[150px]">{school.schoolName}</h4>
                    <p className="text-[10px] font-bold text-foreground/40">{school.email}</p>
                  </div>
                </div>
                <Badge variant={school.status === 'blocked' ? 'error' : 'success'}>
                  {school.status || 'Active'}
                </Badge>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                   <User size={12} className="text-foreground/20" />
                   <span className="text-[11px] font-black uppercase tracking-tight text-foreground/60">{school.admins?.[0]?.name || 'Not Assigned'}</span>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                   {expandedRow === school.id ? (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="flex items-center gap-1 bg-foreground/5 p-1 rounded-xl"
                     >
                       <Button size="sm" variant="ghost" className="h-8 w-8 !p-0" onClick={() => handleEdit(school)}>
                          <Edit2 size={14} />
                       </Button>
                       <Button size="sm" variant="ghost" className="h-8 w-8 !p-0 text-error" onClick={() => handleDelete(school.id)}>
                          <Trash2 size={14} />
                       </Button>
                       <Button size="sm" variant="ghost" className="h-8 w-8 !p-0 text-foreground/40" onClick={() => setExpandedRow(null)}>
                          <Plus size={14} className="rotate-45" />
                       </Button>
                     </motion.div>
                   ) : (
                     <Button size="sm" variant="ghost" className="h-8 w-8 !p-0 text-foreground/30 hover:text-primary" onClick={() => setExpandedRow(school.id)}>
                        <Eye size={14} />
                     </Button>
                   )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Desktop Table View (hidden on small screens) */}
        <Card className="hidden md:block !p-0 overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Institution</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Contact</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Status</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Admin Name</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Manage</th>
                </tr>
              </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center">Loading...</td></tr>
                  ) : currentItems.map((school) => (
                    <tr key={school.id} className="hover:bg-foreground/[0.01] transition-all cursor-pointer" onClick={() => { setSelectedSchool(school); setIsDetailsOpen(true); }}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><SchoolIcon size={20} /></div>
                          <span className="text-sm font-black uppercase tracking-tight">{school.schoolName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-foreground/60">{school.email}</td>
                      <td className="px-8 py-6"><Badge variant={school.status === 'blocked' ? 'error' : 'success'}>{school.status || 'Active'}</Badge></td>
                      <td className="px-8 py-6 text-xs font-black text-foreground/60">{school.admins?.[0]?.name || 'Not Assigned'}</td>
                      <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {expandedRow === school.id ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-2"
                            >
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(school)}><Edit2 size={14} /></Button>
                              <Button size="sm" variant="ghost" className="text-error" onClick={() => handleDelete(school.id)}><Trash2 size={14} /></Button>
                              <Button size="sm" variant="ghost" onClick={() => setExpandedRow(null)}><Plus size={14} className="rotate-45" /></Button>
                            </motion.div>
                          ) : (
                            <Button size="sm" variant="ghost" className="text-foreground/30 hover:text-primary transition-all" onClick={() => setExpandedRow(school.id)}><Eye size={14} /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="secondary" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="flex-1 md:flex-none">Prev</Button>
        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 hidden md:block">Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} className="flex-1 md:flex-none">Next</Button>
      </div>

      {/* Registration Modal */}
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
                <div className="p-8 border-b border-border flex justify-between items-center bg-muted/30">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/30">
                      <SchoolIcon size={28} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">
                        {isEditing ? 'Update School' : 'Register New School'}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30 mt-1">
                        School Registration Details
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-foreground/10 hover:text-error hover:bg-error/5 transition-all">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 max-h-[70vh]">
                  <form onSubmit={handleRegister} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Section 1: Institution Details */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-primary/10 pb-3">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">School Details</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">School Name</label>
                            <input 
                              required
                              value={formData.schoolName}
                              onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                              className="w-full h-14 bg-muted/50 border border-transparent focus:border-primary/30 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-4 ring-primary/5 transition-all"
                              placeholder="Enter School Name"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Board Type</label>
                              <select 
                                value={formData.boardType}
                                onChange={(e) => setFormData({...formData, boardType: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none"
                              >
                                <option value="STATE">State Board</option>
                                <option value="CBSE">CBSE</option>
                                <option value="ICSE">ICSE</option>
                                <option value="OTHER">International / Other</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Principal Name</label>
                              <input 
                                value={formData.principalName}
                                onChange={(e) => setFormData({...formData, principalName: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                placeholder="Name"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Address</label>
                            <textarea 
                              required
                              value={formData.address}
                              onChange={(e) => setFormData({...formData, address: e.target.value})}
                              className="w-full h-24 bg-muted/50 border border-transparent rounded-2xl p-6 text-sm font-bold outline-none resize-none"
                              placeholder="School Address"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Latitude</label>
                              <input 
                                type="number"
                                step="any"
                                value={formData.latitude}
                                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                placeholder="11.0005"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Longitude</label>
                              <input 
                                type="number"
                                step="any"
                                value={formData.longitude}
                                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-black uppercase outline-none"
                                placeholder="77.0286"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Contact Information */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-primary/10 pb-3">
                          <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Contact Information</h4>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">Phone Number</label>
                              <input 
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-bold outline-none"
                                placeholder="Phone Number"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">School Email</label>
                              <input 
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full h-14 bg-muted/50 border border-transparent rounded-2xl px-6 text-sm font-bold outline-none"
                                placeholder="Enter School Email"
                              />
                            </div>
                          </div>
                          
                          <div className="p-6 bg-primary/5 rounded-[2rem] space-y-6 border border-primary/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary">School Admin Details</p>
                            <div className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">School Admin Name</label>
                                <input 
                                  required={!isEditing}
                                  value={formData.adminName}
                                  onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                                  className="w-full h-14 bg-card border border-border/60 focus:border-primary/30 rounded-2xl px-6 text-sm font-black uppercase outline-none focus:ring-4 ring-primary/5 transition-all"
                                  placeholder="Enter School Admin Name"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">School Admin Email</label>
                                <input 
                                  required={!isEditing}
                                  type="email"
                                  value={formData.adminEmail}
                                  onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                                  className="w-full h-14 bg-card border border-border/60 focus:border-primary/30 rounded-2xl px-6 text-sm font-bold outline-none focus:ring-4 ring-primary/5 transition-all"
                                  placeholder="admin@school.com"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">School Admin Password</label>
                                <div className="relative">
                                  <input 
                                    required={!isEditing}
                                    type={showPassword ? "text" : "password"}
                                    value={formData.adminPassword}
                                    onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                                    className="w-full h-14 bg-card border border-border/60 focus:border-primary/30 rounded-2xl pl-6 pr-12 text-sm font-bold outline-none focus:ring-4 ring-primary/5 transition-all"
                                    placeholder={isEditing ? "Leave blank to keep current password" : "••••••••"}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-primary transition-colors"
                                  >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="p-8 border-t border-border bg-muted/30 flex gap-6">
                  <Button 
                    onClick={handleRegister}
                    disabled={submitting}
                    className="flex-1 !h-16 !rounded-2xl !bg-primary !text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                  >
                    {submitting ? 'Processing...' : (isEditing ? 'Update School' : 'Register School')}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-40 !h-16 !rounded-2xl text-xs font-black uppercase tracking-widest !bg-white border border-border"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {isDetailsOpen && selectedSchool && (
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
              className="relative w-full max-w-2xl !bg-card rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-primary/5 p-10 flex flex-col items-center text-center relative">
                 <button 
                   onClick={() => setIsDetailsOpen(false)}
                   className="absolute top-8 right-8 w-10 h-10 bg-card rounded-2xl flex items-center justify-center text-foreground/20 hover:text-error transition-all"
                 >
                   <Plus size={20} className="rotate-45" />
                 </button>
                 <div className="w-24 h-24 bg-card rounded-3xl flex items-center justify-center text-primary shadow-xl mb-6">
                    <SchoolIcon size={40} />
                 </div>
                 <h3 className="text-3xl font-black uppercase tracking-tight text-foreground">{selectedSchool.schoolName}</h3>
                 <Badge variant={selectedSchool.status === 'blocked' ? 'error' : 'success'} className="mt-4">
                    {selectedSchool.status || 'Active'}
                 </Badge>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Board</p>
                    <p className="text-sm font-black uppercase">{selectedSchool.boardType}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Principal</p>
                    <p className="text-sm font-black uppercase">{selectedSchool.principalName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">School Admin</p>
                    <p className="text-sm font-black uppercase">{selectedSchool.admins?.[0]?.name || 'Not Assigned'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Latitude</p>
                    <p className="text-sm font-black uppercase">{selectedSchool.latitude || 'N/A'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Longitude</p>
                    <p className="text-sm font-black uppercase">{selectedSchool.longitude || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-8 bg-muted rounded-[2rem] space-y-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-primary shadow-sm">
                         <Mail size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Contact Email</p>
                         <p className="text-sm font-black lowercase">{selectedSchool.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center text-primary shadow-sm">
                         <Phone size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Phone Number</p>
                         <p className="text-sm font-black">{selectedSchool.phone}</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 !h-16 !rounded-2xl !bg-slate-900 !text-white text-xs font-black uppercase tracking-widest"
                    onClick={() => handleEdit(selectedSchool)}
                  >
                    Edit Institution
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

export default SchoolManagement;
