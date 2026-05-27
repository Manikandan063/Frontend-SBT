import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNavbar from './BottomNavbar';
import { ROUTES } from '../../config/routes';

const ParentLayout = () => {
  const location = useLocation();
  
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === ROUTES.DASHBOARD) return 'home';
    if (path === ROUTES.TRIPS) return 'trips';
    if (path === ROUTES.NOTIFICATIONS) return 'alerts';
    if (path === ROUTES.PROFILE) return 'profile';
    return null;
  };

  const activeTab = getActiveTab();
  const showNavbar = activeTab !== null;

  return (
    <div className="matte-green-theme min-h-screen">
      <motion.div
        className="min-h-screen bg-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.div>
      {showNavbar && <BottomNavbar activeTab={activeTab} />}
    </div>
  );
};

export default ParentLayout;
