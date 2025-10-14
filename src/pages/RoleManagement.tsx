import React, { useState } from 'react';
import { RoleList } from '@/components/roles/RoleList';
import { RoleForm } from '@/components/roles/RoleForm';
import { RoleManagementGuard } from '@/components/auth/PermissionGuard';
import { RoleData } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'list' | 'create' | 'edit';

export const RoleManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRole, setSelectedRole] = useState<RoleData | undefined>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleCreateRole = () => {
    setIsTransitioning(true);
    setSelectedRole(undefined);
    setViewMode('create');
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleEditRole = (role: RoleData) => {
    setIsTransitioning(true);
    setSelectedRole(role);
    setViewMode('edit');
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleBackToList = () => {
    setIsTransitioning(true);
    setViewMode('list');
    setSelectedRole(undefined);
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleSuccess = () => {
    setIsTransitioning(true);
    setViewMode('list');
    setSelectedRole(undefined);
    setTimeout(() => setIsTransitioning(false), 100);
  };

  return (
    <RoleManagementGuard>
      <div className="p-6 space-y-6">
        {isTransitioning ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'list' && (
              <RoleList 
                onCreateRole={handleCreateRole}
                onEditRole={handleEditRole}
              />
            )}
            
            {viewMode === 'create' && (
              <RoleForm 
                onCancel={handleBackToList}
                onSuccess={handleSuccess}
              />
            )}
            
            {viewMode === 'edit' && selectedRole && (
              <RoleForm 
                role={selectedRole}
                onCancel={handleBackToList}
                onSuccess={handleSuccess}
              />
            )}
          </>
        )}
      </div>
    </RoleManagementGuard>
  );
};
