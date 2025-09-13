import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, companyUsersApi, rolesApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.getUsers();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Company users list
export const useCompanyUsers = (params?: { page?: number; limit?: number; search?: string; status?: 'active' | 'inactive' | 'all'; }) => {
  return useQuery({
    queryKey: ['company-users', params],
    queryFn: async () => {
      const response = await companyUsersApi.list(params);
      return response.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useInviteCompanyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; role_ids?: number[] }) => companyUsersApi.invite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({ title: 'Success', description: 'Invitation sent' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to invite user', variant: 'destructive' }),
  });
};

export const useRemoveCompanyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => companyUsersApi.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({ title: 'Removed', description: 'User removed from company' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to remove user', variant: 'destructive' }),
  });
};

export const useToggleCompanyUserActive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, active }: { userId: number; active: boolean }) => active ? companyUsersApi.deactivate(userId) : companyUsersApi.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({ title: 'Success', description: 'User status updated' });
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' }),
  });
};

// Roles hooks
export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await rolesApi.getRoles();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

export const useAssignUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
      rolesApi.assignUserRoles(userId, { role_ids: [roleId], roles: [roleId] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-users'] });
      toast({ title: 'Role assigned', description: 'User role updated' });
    },
    onError: (error: any) => {
      const serverMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to assign role';
      toast({ title: 'Error', description: serverMessage, variant: 'destructive' });
    },
  });
};

