import { ReactNode, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Settings, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useDashboard';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PlaceholderPage } from '../../pages/PlaceholderPage';

interface DashboardLayoutProps {
  children?: ReactNode;
}

// Define page titles and subtitles
const pageConfig = {
  dashboard: { title: "Security Dashboard", subtitle: "Monitor security assessments and vulnerabilities" },
  reports: { title: "Security Reports", subtitle: "View and manage all security reports" },
  assets: { title: "Assets Management", subtitle: "Manage security assets and domains" },
  "expose-finder": { title: "eXpose Finder", subtitle: "Discover potential security exposures" },
  "manage-agent": { title: "Manage Agent", subtitle: "Configure and manage security agents" },
  "past-agent": { title: "Past Agent", subtitle: "View historical agent activities" },
  "new-scan": { title: "New Scan", subtitle: "Initiate new vulnerability scans" },
  "scan-history": { title: "Scan History", subtitle: "View previous vulnerability scans" },
  "scheduled-scan": { title: "Scheduled Scan", subtitle: "Manage scheduled vulnerability scans" },
  "manual-pentest": { title: "Manual Pentest", subtitle: "Conduct manual penetration testing" },
  "my-team": { title: "My Team", subtitle: "Manage team members and permissions" },
  "role-management": { title: "Role Management", subtitle: "Manage user roles and permissions" }
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: notifications } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  const unreadCount = (notifications as any)?.unread_count || 0;
  const userInitials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // Determine active item based on current path
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.startsWith('/reports')) return 'reports';
    if (path.startsWith('/assets')) return 'assets';
    if (path === '/expose-finder') return 'expose-finder';
    if (path === '/manage-agent') return 'manage-agent';
    if (path === '/past-agent') return 'past-agent';
    if (path === '/new-scan') return 'new-scan';
    if (path === '/scan-history') return 'scan-history';
    if (path === '/scheduled-scan') return 'scheduled-scan';
    if (path === '/manual-pentest') return 'manual-pentest';
    if (path === '/my-team') return 'my-team';
    if (path === '/role-management') return 'role-management';
    return 'dashboard';
  };

  const activeItem = getActiveItem();

  const handleNavigate = (item: string) => {
    const routeMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'reports': '/reports',
      'assets': '/assets',
      'expose-finder': '/expose-finder',
      'manage-agent': '/manage-agent',
      'past-agent': '/past-agent',
      'new-scan': '/new-scan',
      'scan-history': '/scan-history',
      'scheduled-scan': '/scheduled-scan',
      'manual-pentest': '/manual-pentest',
      'my-team': '/my-team',
      'role-management': '/role-management'
    };
    
    const route = routeMap[item];
    if (route) {
      navigate(route);
    }
  };

  const currentPageConfig = pageConfig[activeItem as keyof typeof pageConfig] || pageConfig.dashboard;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
        activeItem={activeItem}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 px-6 py-4">
          <div className="w-full">
            {children || <Outlet />}
          </div>
        </div>
        <Footer />
      </div>

    </div>
  );
}