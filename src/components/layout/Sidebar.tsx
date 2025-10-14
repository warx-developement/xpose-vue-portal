import React from 'react';
import { useCanManageRoles } from '@/hooks/useRoles';
import { useAuthStore } from '@/stores/authStore';
import { FileText, Target, Users, Shield, Search, AlertTriangle, Building2, BarChart3, Settings } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isCollapsed: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive = false, isCollapsed, onClick }) => (
  <div 
    className={`flex items-center gap-3 px-4 py-2.5 rounded-md cursor-pointer transition-all duration-200 ${
      isActive 
        ? 'bg-blue-50 text-blue-600 border border-blue-100' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
    onClick={onClick}
  >
    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
      {icon}
    </div>
    {!isCollapsed && <span className="font-medium text-sm">{label}</span>}
  </div>
);

const SectionHeader: React.FC<{ title: string; isCollapsed: boolean }> = ({ title, isCollapsed }) => (
  !isCollapsed ? (
    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
      {title}
    </div>
  ) : null
);

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeItem: string;
  onNavigate: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, activeItem, onNavigate }) => {
  const canManageRoles = useCanManageRoles();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <>
      {/* Mobile Overlay - Only visible when not collapsed on mobile */}
      {!isCollapsed && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={onToggle} />
      )}
      
      {/* Mobile Sidebar - Overlay */}
      <div className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">whyXpse</span>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">V1.2</span>
            </div>
            <button 
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <SectionHeader title="HOME" isCollapsed={false} />
          <SidebarItem 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <rect x="3" y="3" width="7" height="7" fill="currentColor" opacity="0.3"/>
              <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
              <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
              <rect x="14" y="14" width="7" height="7" fill="currentColor" opacity="0.3"/>
            </svg>}
            label="Dashboard" 
            isActive={activeItem === 'dashboard'}
            isCollapsed={false}
            onClick={() => {
              onNavigate('dashboard');
              onToggle(); // Close mobile sidebar after navigation
            }}
          />

          <div className="pt-4">
            <SectionHeader title="VULNERABILITY MANAGEMENT" isCollapsed={false} />
            <SidebarItem 
              icon={<FileText className="w-5 h-5 text-gray-600" />}
              label="Security Reports" 
              isActive={activeItem === 'reports'}
              isCollapsed={false}
              onClick={() => {
                onNavigate('reports');
                onToggle(); // Close mobile sidebar after navigation
              }}
            />
            <SidebarItem 
              icon={<Target className="w-5 h-5 text-gray-600" />}
              label="Assets Management" 
              isActive={activeItem === 'assets'}
              isCollapsed={false}
              onClick={() => {
                onNavigate('assets');
                onToggle(); // Close mobile sidebar after navigation
              }}
            />
            <SidebarItem 
              icon={<Search className="w-5 h-5 text-gray-600" />}
              label="CVE Search" 
              isActive={activeItem === 'cve-search'}
              isCollapsed={false}
              onClick={() => {
                onNavigate('cve-search');
                onToggle(); // Close mobile sidebar after navigation
              }}
            />
          </div>

          <div className="pt-4">
            <SectionHeader title="USER MANAGEMENT" isCollapsed={false} />
            <SidebarItem 
              icon={<Users className="w-5 h-5 text-gray-600" />}
              label="My Team" 
              isActive={activeItem === 'my-team'}
              isCollapsed={false}
              onClick={() => {
                onNavigate('my-team');
                onToggle(); // Close mobile sidebar after navigation
              }}
            />
            {canManageRoles && (
              <SidebarItem 
                icon={<Shield className="w-5 h-5 text-gray-600" />}
                label="Role Management" 
                isActive={activeItem === 'role-management'}
                isCollapsed={false}
                onClick={() => {
                  onNavigate('role-management');
                  onToggle(); // Close mobile sidebar after navigation
                }}
              />
            )}
          </div>

          {/* SuperAdmin Sections */}
          {isSuperAdmin && (
            <div className="pt-4">
              <SectionHeader title="SUPERADMIN" isCollapsed={false} />
              <SidebarItem 
                icon={<Building2 className="w-5 h-5 text-red-600" />}
                label="Companies" 
                isActive={activeItem === 'superadmin-companies'}
                isCollapsed={false}
                onClick={() => {
                  onNavigate('superadmin-companies');
                  onToggle(); // Close mobile sidebar after navigation
                }}
              />
              <SidebarItem 
                icon={<BarChart3 className="w-5 h-5 text-red-600" />}
                label="Analytics" 
                isActive={activeItem === 'superadmin-analytics'}
                isCollapsed={false}
                onClick={() => {
                  onNavigate('superadmin-analytics');
                  onToggle(); // Close mobile sidebar after navigation
                }}
              />
              <SidebarItem 
                icon={<Settings className="w-5 h-5 text-red-600" />}
                label="System Settings" 
                isActive={activeItem === 'superadmin-settings'}
                isCollapsed={false}
                onClick={() => {
                  onNavigate('superadmin-settings');
                  onToggle(); // Close mobile sidebar after navigation
                }}
              />
            </div>
          )}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-gray-900">whyXpse</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">V1.2</span>
              </div>
            )}
            <button 
              onClick={onToggle}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-500">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <SectionHeader title="HOME" isCollapsed={isCollapsed} />
          <SidebarItem 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-500">
              <rect x="3" y="3" width="7" height="7" fill="currentColor" opacity="0.3"/>
              <rect x="14" y="3" width="7" height="7" fill="currentColor"/>
              <rect x="3" y="14" width="7" height="7" fill="currentColor"/>
              <rect x="14" y="14" width="7" height="7" fill="currentColor" opacity="0.3"/>
            </svg>}
            label="Dashboard" 
            isActive={activeItem === 'dashboard'}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('dashboard')}
          />

          <div className="pt-4">
            <SectionHeader title="VULNERABILITY MANAGEMENT" isCollapsed={isCollapsed} />
            <SidebarItem 
              icon={<FileText className="w-5 h-5 text-gray-600" />}
              label="Security Reports" 
              isActive={activeItem === 'reports'}
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('reports')}
            />
            <SidebarItem 
              icon={<Target className="w-5 h-5 text-gray-600" />}
              label="Assets Management" 
              isActive={activeItem === 'assets'}
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('assets')}
            />
            <SidebarItem 
              icon={<Search className="w-5 h-5 text-gray-600" />}
              label="CVE Search" 
              isActive={activeItem === 'cve-search'}
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('cve-search')}
            />
          </div>

          <div className="pt-4">
            <SectionHeader title="USER MANAGEMENT" isCollapsed={isCollapsed} />
            <SidebarItem 
              icon={<Users className="w-5 h-5 text-gray-600" />}
              label="My Team" 
              isActive={activeItem === 'my-team'}
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('my-team')}
            />
            {canManageRoles && (
              <SidebarItem 
                icon={<Shield className="w-5 h-5 text-gray-600" />}
                label="Role Management" 
                isActive={activeItem === 'role-management'}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('role-management')}
              />
            )}
          </div>

          {/* SuperAdmin Sections */}
          {isSuperAdmin && (
            <div className="pt-4">
              <SectionHeader title="SUPERADMIN" isCollapsed={isCollapsed} />
              <SidebarItem 
                icon={<Building2 className="w-5 h-5 text-red-600" />}
                label="Companies" 
                isActive={activeItem === 'superadmin-companies'}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('superadmin-companies')}
              />
              <SidebarItem 
                icon={<BarChart3 className="w-5 h-5 text-red-600" />}
                label="Analytics" 
                isActive={activeItem === 'superadmin-analytics'}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('superadmin-analytics')}
              />
              <SidebarItem 
                icon={<Settings className="w-5 h-5 text-red-600" />}
                label="System Settings" 
                isActive={activeItem === 'superadmin-settings'}
                isCollapsed={isCollapsed}
                onClick={() => onNavigate('superadmin-settings')}
              />
            </div>
          )}
        </nav>
      </div>
    </>
  );
};
