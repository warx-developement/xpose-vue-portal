import React from 'react';
import { useCanManageRoles } from '@/hooks/useRoles';

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

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
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
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20M16 13H8M16 17H8M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>}
            label="Reports" 
            isActive={activeItem === 'reports'}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('reports')}
          />
          <SidebarItem 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>}
            label="Assets" 
            isActive={activeItem === 'assets'}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('assets')}
          />
        </div>

        <div className="pt-4">
          <SectionHeader title="USER MANAGEMENT" isCollapsed={isCollapsed} />
          <SidebarItem 
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>}
            label="My team" 
            isActive={activeItem === 'my-team'}
            isCollapsed={isCollapsed}
            onClick={() => onNavigate('my-team')}
          />
          {canManageRoles && (
            <SidebarItem 
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-600">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>}
              label="Role Management" 
              isActive={activeItem === 'role-management'}
              isCollapsed={isCollapsed}
              onClick={() => onNavigate('role-management')}
            />
          )}
        </div>
      </nav>
    </div>
  );
};
