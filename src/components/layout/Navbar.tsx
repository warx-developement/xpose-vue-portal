import React from 'react';
import { Bell, LogOut, Settings, User as UserIcon, Building2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/useDashboard';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCompanies } from '@/hooks/useProfile';

export const Navbar: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const logoutMutation = useLogout();
  const { data: notifications } = useNotifications();
  const { data: companiesData } = useCompanies();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items: Array<any> = (notifications as any)?.notifications || [];
  const unreadCount = (notifications as any)?.unread_count ?? items.filter((n: any) => !n.is_read).length;
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U';

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4"></div>
        
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => markAllRead.mutate()}>
                    Mark all read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {items && items.length > 0 ? (
                items.slice(0, 8).map((n: any) => (
                  <DropdownMenuItem key={n.id} className="flex items-start gap-2" onClick={() => !n.is_read && markRead.mutate(n.id)}>
                    <div className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? 'bg-gray-300' : 'bg-green-500'}`} />
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-gray-500">{n.description}</div>
                      <div className="text-[10px] text-gray-400">{new Date(n.create_at || n.created_at).toLocaleString()}</div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="px-3 py-6 text-sm text-gray-500">No notifications</div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-8 w-8 rounded-full overflow-hidden">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {user?.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Company Switcher */}
              {companiesData && companiesData.available_companies.length > 0 && (
                <div className="px-2 py-1 text-xs font-medium text-gray-500">Switch Company</div>
              )}
              {companiesData?.available_companies.map((company) => {
                const isActive = company.uuid === localStorage.getItem('company_uuid');
                return (
                  <DropdownMenuItem key={company.uuid} onClick={() => {
                    localStorage.setItem('company_uuid', company.uuid);
                    // Force complete page refresh to ensure all data is reloaded with new company context
                    window.location.href = '/dashboard';
                  }} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> {company.name}
                    </span>
                    {isActive && <Check className="h-4 w-4 text-green-600" />}
                  </DropdownMenuItem>
                );
              })}
              {companiesData && companiesData.available_companies.length > 0 && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600 focus:text-red-700">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
