import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { SUPERADMIN_MENU, SCHOOLADMIN_MENU } from '../config/menu';

// Layouts
import ParentLayout from '../shared/components/ParentLayout';
import AdminLayout from '../shared/components/AdminLayout';

// Parent PWA Modules (Lazy Loaded)
const SplashScreen = lazy(() => import('../modules/auth/SplashScreen'));
const LoginPage = lazy(() => import('../modules/auth/LoginPage'));
const ParentDashboard = lazy(() => import('../modules/parent/ParentDashboard'));
const LiveTracking = lazy(() => import('../modules/tracking/LiveTracking'));
const NotificationsPage = lazy(() => import('../modules/notification/NotificationsPage'));
const MyTrips = lazy(() => import('../modules/trip/MyTrips'));
const BusInfo = lazy(() => import('../modules/parent/BusInfo'));
const ProfilePage = lazy(() => import('../modules/parent/ProfilePage'));
const SettingsPage = lazy(() => import('../modules/parent/SettingsPage'));
const DriverSimulation = lazy(() => import('../modules/tracking/DriverSimulation'));

// SuperAdmin Modules
import SuperAdminLogin from '../modules/superadmin/pages/SuperAdminLogin';
import SuperAdminDashboard from '../modules/superadmin/pages/SuperAdminDashboard';
import SchoolManagement from '../modules/superadmin/pages/SchoolManagement';
import Reports from '../modules/superadmin/pages/Reports';
import Settings from '../modules/superadmin/pages/Settings';

// School Admin Modules
import SchoolAdminLogin from '../modules/schooladmin/pages/SchoolAdminLogin';
import SchoolAdminDashboard from '../modules/schooladmin/pages/SchoolAdminDashboard';
import StudentManagement from '../modules/schooladmin/pages/StudentManagement';
import BusManagement from '../modules/schooladmin/pages/BusManagement';
import SchoolLiveTracking from '../modules/schooladmin/pages/LiveTracking';
import ParentManagement from '../modules/schooladmin/pages/ParentManagement';
import DriverManagement from '../modules/schooladmin/pages/DriverManagement';
import RouteManagement from '../modules/schooladmin/pages/RouteManagement';
import TransferManagement from '../modules/schooladmin/pages/TransferManagement';
import NotificationManagement from '../modules/schooladmin/pages/NotificationManagement';
import ReportManagement from '../modules/schooladmin/pages/ReportManagement';
import SchoolAdminSettings from '../modules/schooladmin/pages/Settings';

// Placeholder for remaining pages
const Placeholder = ({ title }) => (
  <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-4">
    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
       <span className="font-black text-2xl">?</span>
    </div>
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
      <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest mt-2">This module is under tactical development</p>
    </div>
  </div>
);

const FallbackLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<FallbackLoader />}>
      <Routes>
      {/* 1. Parent PWA Routes */}
      <Route path={ROUTES.SPLASH} element={<SplashScreen />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route element={<ParentLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<ParentDashboard />} />
        <Route path={ROUTES.TRACKING} element={<LiveTracking />} />
        <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
        <Route path={ROUTES.TRIPS} element={<MyTrips />} />
        <Route path={ROUTES.BUS_INFO} element={<BusInfo />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
      </Route>
      <Route path={ROUTES.DRIVER_SIMULATION} element={<DriverSimulation />} />

      {/* 2. SuperAdmin Module */}
      <Route path={ROUTES.SUPERADMIN_LOGIN} element={<SuperAdminLogin />} />
      <Route element={<AdminLayout menuItems={SUPERADMIN_MENU} role="Super Admin" />}>
        <Route path={ROUTES.SUPERADMIN_DASHBOARD} element={<SuperAdminDashboard />} />
        <Route path={ROUTES.SCHOOL_MANAGEMENT} element={<SchoolManagement />} />
        <Route path={ROUTES.PLATFORM_SETTINGS} element={<Settings />} />
        <Route path={ROUTES.REPORTS_ANALYTICS} element={<Reports />} />
      </Route>

      {/* 3. School Admin Module */}
      <Route path={ROUTES.SCHOOLADMIN_LOGIN} element={<SchoolAdminLogin />} />
      <Route element={<AdminLayout menuItems={SCHOOLADMIN_MENU} role="School Admin" />}>
        <Route path={ROUTES.SCHOOLADMIN_DASHBOARD} element={<SchoolAdminDashboard />} />
        <Route path={ROUTES.STUDENT_MANAGEMENT} element={<StudentManagement />} />
        <Route path={ROUTES.BUS_MANAGEMENT} element={<BusManagement />} />
        <Route path={ROUTES.LIVE_TRACKING} element={<SchoolLiveTracking />} />
        <Route path={ROUTES.PARENT_MANAGEMENT} element={<ParentManagement />} />
        <Route path={ROUTES.DRIVER_MANAGEMENT} element={<DriverManagement />} />
        <Route path={ROUTES.ROUTE_MANAGEMENT} element={<RouteManagement />} />
        <Route path={ROUTES.TRANSFER_MANAGEMENT} element={<TransferManagement />} />
        <Route path={ROUTES.NOTIFICATION_MANAGEMENT} element={<NotificationManagement />} />
        <Route path={ROUTES.SCHOOL_REPORTS} element={<ReportManagement />} />
        <Route path={ROUTES.SCHOOLADMIN_SETTINGS} element={<SchoolAdminSettings />} />
      </Route>

      {/* Catch all - Redirect to splash or login */}
      <Route path="*" element={<Navigate to={ROUTES.SPLASH} replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
