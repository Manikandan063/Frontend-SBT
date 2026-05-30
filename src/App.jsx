import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AnimatePresence } from 'framer-motion';
import { LanguageProvider } from './shared/context/LanguageContext';
import { ThemeProvider } from './shared/context/ThemeContext';
import { Toaster } from 'sonner';
import NotificationHandler from './NotificationHandler';
import api from './shared/api';
import MaintenanceScreen from './shared/components/MaintenanceScreen';
import LiveMap from './shared/components/LiveMap';

function App() {
  const [maintenanceActive, setMaintenanceActive] = useState(false);

  useEffect(() => {
    // If the path starts with /superadmin, do not show maintenance mode
    if (window.location.pathname.startsWith('/superadmin')) {
      return;
    }

    const checkMaintenance = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data?.status === 'success' && response.data.data.maintenanceMode) {
          setMaintenanceActive(true);
        } else {
          setMaintenanceActive(false);
        }
      } catch (error) {
        console.error('Error checking maintenance mode:', error);
      }
    };

    checkMaintenance();
    
    // Polling every 5 seconds for immediate real-time feedback
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <div className="min-h-screen select-none">
            <Toaster position="bottom-center" />
            <NotificationHandler />
            {maintenanceActive ? (
              <MaintenanceScreen />
            ) : (
              <AnimatePresence mode="wait">
                <AppRoutes />
              </AnimatePresence>
            )}
          </div>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
