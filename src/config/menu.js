import { 
  LayoutDashboard, 
  School, 
  Users, 
  Settings, 
  BarChart3,
  UserCheck,
  Bus,
  MapPin,
  Navigation,
  ArrowLeftRight,
  Bell,
  ClipboardList,
  Activity,
  GraduationCap,
  Route,
  Map
} from 'lucide-react';
import { ROUTES } from './routes';

export const SUPERADMIN_MENU = [
  { label: 'Dashboard', path: ROUTES.SUPERADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Schools', path: ROUTES.SCHOOL_MANAGEMENT, icon: School },
  { label: 'Reports', path: ROUTES.REPORTS_ANALYTICS, icon: BarChart3 },
  { label: 'Settings', path: ROUTES.PLATFORM_SETTINGS, icon: Settings },
];

export const SCHOOLADMIN_MENU = [
  { label: 'Dashboard', path: ROUTES.SCHOOLADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Students', path: ROUTES.STUDENT_MANAGEMENT, icon: GraduationCap },
  { label: 'Parents', path: ROUTES.PARENT_MANAGEMENT, icon: Users },
  { label: 'Buses', path: ROUTES.BUS_MANAGEMENT, icon: Bus },
  { label: 'Drivers', path: ROUTES.DRIVER_MANAGEMENT, icon: UserCheck },
  { label: 'Routes', path: ROUTES.ROUTE_MANAGEMENT, icon: Route },
  { label: 'Live Tracking', path: ROUTES.LIVE_TRACKING, icon: Map },
  { label: 'Transfers', path: ROUTES.TRANSFER_MANAGEMENT, icon: ArrowLeftRight },
  { label: 'Notifications', path: ROUTES.NOTIFICATION_MANAGEMENT, icon: Bell },
  { label: 'Reports', path: ROUTES.SCHOOL_REPORTS, icon: ClipboardList },
  { label: 'Settings', path: ROUTES.SCHOOLADMIN_SETTINGS, icon: Settings },
];
