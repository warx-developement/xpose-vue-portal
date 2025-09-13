import React from 'react';
import { useHasPermission, useMyPermissions } from '@/hooks/useRoles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield } from 'lucide-react';

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  children,
  fallback,
  showAccessDenied = true,
}) => {
  const { data: permissions, isLoading, error } = useMyPermissions();
  const hasPermission = useHasPermission(permission);

  // Show skeleton loader while checking permissions
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state if permissions failed to load
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load permissions</h3>
            <p className="text-gray-600 mb-4">There was an error loading your permissions. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showAccessDenied) {
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this feature. You need the{' '}
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">{permission}</code>{' '}
            permission.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator to request access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

interface RoleManagementGuardProps {
  children: React.ReactNode;
}

export const RoleManagementGuard: React.FC<RoleManagementGuardProps> = ({ children }) => {
  return (
    <PermissionGuard permission="team.edit_roles">
      {children}
    </PermissionGuard>
  );
};
