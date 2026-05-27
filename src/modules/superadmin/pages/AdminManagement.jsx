import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Shield, 
  UserPlus, 
  Key, 
  ToggleLeft, 
  MoreVertical,
  Mail,
  Building,
  Activity,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';
import api from '../../../shared/api';

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

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schools, setSchools] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'school_admin',
    schoolId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSchoolDetailsOpen, setIsSchoolDetailsOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/auth/admins');
      setAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      schoolId: admin.schoolId || ''
    });
    setCurrentAdminId(admin.id);
    setIsEditing(true);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
    setExpandedRow(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this administrator? This action is irreversible.')) {
      try {
        await api.delete(`/auth/admins/${id}`);
        fetchAdmins();
        setIsDetailsOpen(false);
        alert('Admin account deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete admin');
      }
    }
    setExpandedRow(null);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'school_admin', schoolId: '' });
    setIsEditing(false);
    setCurrentAdminId(null);
  };

  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      (admin.school?.schoolName && admin.school.schoolName.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Admin Management</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Control Access & Manage School Administrators</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="!rounded-2xl h-14 !px-8 shadow-xl shadow-primary/20"
        >
          <UserPlus size={20} />
          Create Admin Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Shield size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Admins</p>
            <h4 className="text-2xl font-black">{admins.length}</h4>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-success/10 rounded-2xl flex items-center justify-center text-success">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Now</p>
            <h4 className="text-2xl font-black">{admins.length}</h4>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-6">
          <div className="w-14 h-14 bg-warning/10 rounded-2xl flex items-center justify-center text-warning">
            <Key size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Pending Access</p>
            <h4 className="text-2xl font-black">0</h4>
          </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, email or school..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-foreground/5 border-none rounded-xl pl-12 py-3 text-sm font-medium outline-none focus:ring-1 ring-primary/20 transition-all"
              />
            </div>
           <Badge variant="outline" className="h-10 px-4">All Schools Selected</Badge>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1a2e1a] border-b border-[#1a2e1a]">
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Administrator</th>
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Assigned School</th>
                <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Roles</th>
                <th className="text-right px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Synchronizing Security Credentials...</p>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">No matching administrative accounts found</p>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr 
                    key={admin.id} 
                    className="group hover:bg-foreground/[0.01] transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setIsDetailsOpen(true);
                    }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xs">
                          {admin.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight group-hover:text-primary transition-colors">{admin.name}</p>
                          <div className="flex items-center gap-2 text-foreground/40">
                            <Mail size={10} />
                            <span className="text-[10px] font-bold">{admin.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <Building size={14} className="text-primary/40" />
                       <p className="text-xs font-bold text-foreground/60 uppercase">{admin.school?.schoolName || 'Platform Global'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={admin.role === 'superadmin' ? 'success' : 'secondary'}>{admin.role}</Badge>
                  </td>
                  <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      {expandedRow === admin.id ? (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2"
                        >
                          <button 
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-all" 
                            title="Edit Admin"
                            onClick={() => handleEdit(admin)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            className="p-2 hover:bg-error/10 rounded-lg text-error transition-all" 
                            title="Delete Admin"
                            onClick={() => handleDelete(admin.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button 
                            className="p-2 hover:bg-foreground/5 rounded-lg text-foreground/40 transition-all"
                            onClick={() => setExpandedRow(null)}
                          >
                            <Plus size={18} className="rotate-45" />
                          </button>
                        </motion.div>
                      ) : (
                        <button 
                          onClick={() => setExpandedRow(admin.id)}
                          className="p-2 bg-foreground/5 hover:bg-primary/10 rounded-lg text-foreground/20 hover:text-primary transition-all group/eye"
                        >
                          <Eye size={18} className="group-hover/eye:scale-110 transition-transform" />
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

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-foreground/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <Card className="!p-12 space-y-10 relative overflow-hidden !bg-card border border-border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl" />
               
               <div className="relative z-10">
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground">
                    {isEditing ? 'Update Identity' : 'Create Identity'}
                  </h3>
                  <p className="text-xs font-bold text-foreground/40 uppercase tracking-[0.3em] mt-2">
                    {isEditing ? 'Modify administrative access' : 'Assign administrative access'}
                  </p>
               </div>

               <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSubmitting(true);
                    try {
                      const payload = { ...formData };
                      if (!payload.password) delete payload.password;

                      if (isEditing) {
                        await api.put(`/auth/admins/${currentAdminId}`, payload);
                        alert('Admin account updated successfully!');
                      } else {
                        await api.post('/auth/register-admin', payload);
                        alert('Admin account created successfully!');
                      }
                      
                      setIsModalOpen(false);
                      resetForm();
                      fetchAdmins();
                    } catch (error) {
                      showFriendlyError(error, 'Failed to process request');
                    } finally {
                      setSubmitting(false);
                    }
                  }} 
                  className="space-y-6 relative z-10"
               >
                  <Input 
                    label="Full Name" 
                    placeholder="Enter admin name"
                    className="!h-14"
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    placeholder="admin@school.com"
                    className="!h-14"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input 
                    label="Access Password" 
                    type="password" 
                    placeholder="Create a strong password"
                    className="!h-14"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 ml-1">Assigned School</label>
                    <select 
                      className="w-full bg-muted border border-border rounded-xl px-4 h-14 text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none text-foreground"
                      required
                      value={formData.schoolId}
                      onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    >
                      <option value="" className="bg-card text-foreground">Select an Institution</option>
                      {schools.map(school => (
                        <option key={school.id} value={school.id} className="bg-card text-foreground">
                          {school.schoolName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-4 pt-6">
                     <Button 
                        type="button" 
                        variant="secondary" 
                        className="flex-1 !h-16 !rounded-2xl !bg-muted !text-muted-foreground uppercase font-black tracking-widest text-xs"
                        onClick={() => setIsModalOpen(false)}
                        disabled={submitting}
                     >
                        Cancel
                     </Button>
                     <Button 
                        type="submit" 
                        className="flex-1 !h-16 !rounded-2xl !bg-[#A3D139] hover:!bg-[#92C44E] !text-white uppercase font-black tracking-widest text-xs shadow-xl shadow-[#A3D139]/30"
                        disabled={submitting}
                     >
                        {submitting ? 'Processing...' : isEditing ? 'Update Access' : 'Grant Access'}
                     </Button>
                  </div>
               </form>
            </Card>
          </motion.div>
        </div>
      )}
      {/* Admin Details Popup */}
      {isDetailsOpen && selectedAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-foreground/60 backdrop-blur-xl">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 40 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="w-full max-w-md"
           >
              <Card className="!p-0 overflow-hidden !bg-card border border-border shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
                 <div className="bg-primary/5 p-10 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl mb-6">
                       {selectedAdmin.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{selectedAdmin.name}</h3>
                    <Badge variant={selectedAdmin.role === 'superadmin' ? 'success' : 'secondary'} className="mt-2">{selectedAdmin.role}</Badge>
                 </div>

                 <div className="p-10 space-y-8 text-center">
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Email Address</p>
                          <p className="text-sm font-bold">{selectedAdmin.email}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Assigned School</p>
                          <p className="text-sm font-bold uppercase">{selectedAdmin.school?.schoolName || 'Global Platform Admin'}</p>
                       </div>
                    </div>

                    <Button 
                      variant="secondary" 
                      className="w-full !h-14 !rounded-xl text-xs uppercase font-black tracking-widest mt-4"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                       Close Profile
                    </Button>
                 </div>
              </Card>
           </motion.div>
        </div>
      )}

      {/* School Details Popup */}
      {isSchoolDetailsOpen && selectedSchool && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-foreground/60 backdrop-blur-xl">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, y: 40 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             className="w-full max-w-lg"
           >
              <Card className="!p-0 overflow-hidden !bg-card border border-border shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)]">
                 <div className="bg-primary/5 p-10 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary font-black text-3xl shadow-inner mb-6">
                       <Building size={40} />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{selectedSchool.schoolName}</h3>
                    <Badge variant={selectedSchool.status === 'Inactive' ? 'error' : 'success'} className="mt-2">
                       {selectedSchool.status || 'Active'}
                    </Badge>
                 </div>

                 <div className="p-10 space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Principal</p>
                          <p className="text-sm font-bold">{selectedSchool.principalName || 'Not Assigned'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Fleet Size</p>
                          <p className="text-sm font-bold">{selectedSchool.fleet || 0} Vehicles</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Contact Email</p>
                          <p className="text-sm font-bold">{selectedSchool.email}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Phone Number</p>
                          <p className="text-sm font-bold">{selectedSchool.phone}</p>
                       </div>
                       <div className="col-span-2 space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Location Address</p>
                          <p className="text-sm font-bold uppercase tracking-tight">{selectedSchool.address}</p>
                       </div>
                    </div>

                    <Button 
                      variant="secondary" 
                      className="w-full !h-14 !rounded-xl text-xs uppercase font-black tracking-widest mt-4"
                      onClick={() => setIsSchoolDetailsOpen(false)}
                    >
                       Close Details
                    </Button>
                 </div>
              </Card>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
