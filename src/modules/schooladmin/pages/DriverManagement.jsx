import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  CreditCard, 
  ShieldCheck, 
  MoreVertical,
  Edit2,
  Trash2,
  Bus,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../../../shared/components/ui';

import api from '../../../shared/api';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/bus');
      const buses = response.data.data || [];
      
      // Filter out buses without driver names and map to driver objects
      const mappedDrivers = buses
        .filter(bus => bus.driverName)
        .map(bus => ({
          id: bus.id,
          name: bus.driverName,
          empId: `DRV-${bus.busNumber}`,
          phone: bus.driverMobileNumber || 'N/A',
          license: 'Verified',
          bus: bus.busNumber,
          regNo: bus.busRegisterNumber,
          status: bus.trackingStatus === 'ACTIVE' ? 'Driving' : 'Offline'
        }));
      
      setDrivers(mappedDrivers);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">Driver List</h1>
          <p className="text-sm font-bold text-foreground/40 uppercase tracking-[0.3em] mt-1">Manage school bus drivers and details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Loading...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">No drivers added yet</p>
          </div>
        ) : (
          drivers.map((driver) => (
            <Card key={driver.id} className="p-8 space-y-6 group">
              <div className="flex justify-between items-start">
                 <div className="relative">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                       <User size={32} />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${driver.status === 'Driving' ? 'bg-success' : 'bg-slate-400'}`}>
                       <CheckCircle2 size={10} className="text-white" />
                    </div>
                 </div>
                 <Badge variant={driver.status === 'Driving' ? 'success' : 'outline'}>{driver.status}</Badge>
              </div>

              <div>
                 <h4 className="text-xl font-black tracking-tight text-foreground uppercase leading-none">{driver.name}</h4>
                 <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-2">ID: {driver.empId}</p>
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                 <div className="flex items-center gap-3">
                    <Phone size={14} className="text-primary/40" />
                    <span className="text-xs font-bold text-foreground/60">{driver.phone}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <ShieldCheck size={14} className="text-primary/40" />
                    <span className="text-xs font-bold text-foreground/60 uppercase">Reg No: {driver.regNo}</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <Bus size={14} className="text-primary/40" />
                    <span className="text-xs font-black uppercase text-primary">Bus No {driver.bus}</span>
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
