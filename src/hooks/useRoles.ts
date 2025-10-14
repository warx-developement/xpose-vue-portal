import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi, RoleData, PermissionData, PermissionModule, CreateRoleRequest, UpdateRoleRequest, AssignRoleRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { createRetryConfig } from '@/lib/company-error-utils';

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: number) => [...roleKeys.details(), id] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
  userRoles: (userId: number) => [...roleKeys.all, 'user', userId] as const,
  userPermissions: (userId: number) => [...roleKeys.all, 'user-permissions', userId] as const,
  myPermissions: () => [...roleKeys.all, 'my-permissions'] as const,
};

// Get all roles
export const useRoles = () => {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      const response = await rolesApi.getRoles();
      return response.data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single role
export const useRole = (id: number) => {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await rolesApi.getRole(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Get all permissions
export const usePermissions = () => {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: async () => {
      const response = await rolesApi.getPermissions();
      const permissionsData = response.data.data || {};
      // Convert the module-based structure to the expected format
      return Object.entries(permissionsData).map(([module, permissions]) => ({
        module,
        permissions: permissions as PermissionData[]
      }));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions change less frequently
  });
};

// Get user roles
export const useUserRoles = (userId: number) => {
  return useQuery({
    queryKey: roleKeys.userRoles(userId),
    queryFn: async () => {
      const response = await rolesApi.getUserRoles(userId);
      return response.data.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get user permissions
export const useUserPermissions = (userId: number) => {
  return useQuery({
    queryKey: roleKeys.userPermissions(userId),
    queryFn: async () => {
      const response = await rolesApi.getUserPermissions(userId);
      return response.data.data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Get current user permissions
export const useMyPermissions = () => {
  return useQuery({
    queryKey: roleKeys.myPermissions(),
    queryFn: async () => {
      const response = await rolesApi.getMyPermissions();
      // The API returns permissions organized by modules, we need to flatten them
      const permissionsData = response.data.data || {};
      const flatPermissions = Object.values(permissionsData).flat();
      return flatPermissions;
    },
    staleTime: 5 * 60 * 1000,
    ...createRetryConfig(),
  });
};

// Create role mutation
export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => rolesApi.createRole(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast({
        title: "Role created successfully",
        description: `Role "${response.data.data?.name}" has been created.`,
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create role. Please try again.';
      toast({
        title: "Error creating role",
        description: message,
        variant: "destructive",
      });
    },
  });
};

// Update role mutation
export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleRequest }) => 
      rolesApi.updateRole(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      toast({
        title: "Role updated successfully",
        description: "The role has been updated.",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update role. Please try again.';
      toast({
        title: "Error updating role",
        description: message,
        variant: "destructive",
      });
    },
  });
};

// Delete role mutation
export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => rolesApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      toast({
        title: "Role deleted successfully",
        description: "The role has been deleted.",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to delete role. Please try again.';
      toast({
        title: "Error deleting role",
        description: message,
        variant: "destructive",
      });
    },
  });
};

// Assign roles to user mutation
export const useAssignUserRoles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: AssignRoleRequest }) => 
      rolesApi.assignUserRoles(userId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.userRoles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userPermissions(variables.userId) });
      toast({
        title: "Roles assigned successfully",
        description: "User roles have been updated.",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to assign roles. Please try again.';
      toast({
        title: "Error assigning roles",
        description: message,
        variant: "destructive",
      });
    },
  });
};

// Remove role from user mutation
export const useRemoveUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) => 
      rolesApi.removeUserRole(userId, roleId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.userRoles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: roleKeys.userPermissions(variables.userId) });
      toast({
        title: "Role removed successfully",
        description: "The role has been removed from the user.",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to remove role. Please try again.';
      toast({
        title: "Error removing role",
        description: message,
        variant: "destructive",
      });
    },
  });
};

// Permission check hook
export const useHasPermission = (permissionSlug: string) => {
  const { data: permissions = [], isLoading, error } = useMyPermissions();
  
  // Return false if loading, error, or permissions is not an array
  if (isLoading || error || !Array.isArray(permissions)) {
    return false;
  }
  
  return (permissions as any[]).some((permission: any) =>
    typeof permission === 'string'
      ? permission === permissionSlug
      : permission?.slug === permissionSlug
  );
};

// Role management permission check
export const useCanManageRoles = () => {
  return useHasPermission('team.edit_roles');
};
