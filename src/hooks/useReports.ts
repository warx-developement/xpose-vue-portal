import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi, ReportData, ReportDetailData, User } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Get reports list with search, pagination, and sorting
export const useReports = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}) => {
  return useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      const response = await reportsApi.getReports(params);
      return {
        reports: response.data.data,
        pagination: response.data.pagination,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get single report details
export const useReport = (reportId: number) => {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const response = await reportsApi.getReport(reportId);
      return response.data.data;
    },
    enabled: !!reportId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Create new report
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; scope: string; userAccess: User[] }) => {
      const response = await reportsApi.createReport({
        name: data.name,
        scope: data.scope,
        access: data.userAccess.map(user => user.id),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Success',
        description: 'Report created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create report',
        variant: 'destructive',
      });
    },
  });
};

// Update report
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { name?: string; scope?: string } }) => {
      const response = await reportsApi.updateReport(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
      toast({
        title: 'Success',
        description: 'Report updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update report',
        variant: 'destructive',
      });
    },
  });
};

// Delete report
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await reportsApi.deleteReport(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Success',
        description: 'Report deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete report',
        variant: 'destructive',
      });
    },
  });
};

// Add user access to report
export const useAddUserAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, userId }: { reportId: number; userId: number }) => {
      const response = await reportsApi.addUserAccess(reportId, userId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Success',
        description: 'User access added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add user access',
        variant: 'destructive',
      });
    },
  });
};

// Remove user access from report
export const useRemoveUserAccess = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, userId }: { reportId: number; userId: number }) => {
      const response = await reportsApi.removeUserAccess(reportId, userId);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: 'Success',
        description: 'User access removed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove user access',
        variant: 'destructive',
      });
    },
  });
};