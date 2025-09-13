import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, reportsApi, pdfApi, PDFData } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await dashboardApi.getDashboard();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await dashboardApi.getNotifications();
      return response.data.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => dashboardApi.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => dashboardApi.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    },
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await dashboardApi.getAnalytics();
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Reports hooks
export const useReports = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['reports', page, limit],
    queryFn: async () => {
      const response = await reportsApi.getReports({ page, limit });
      return {
        reports: response.data.data,
        pagination: response.data.pagination
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useReport = (id: number) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const response = await reportsApi.getReport(id);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: any) => reportsApi.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Report created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => reportsApi.updateReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => reportsApi.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast({
        title: "Success",
        description: "Report deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      });
    },
  });
};

// PDF Hooks
export const useReportPDFs = (reportId: number) => {
  return useQuery({
    queryKey: ['report-pdfs', reportId],
    queryFn: async () => {
      const response = await pdfApi.getReportPDFs(reportId);
      return response.data.data;
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGeneratePDF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportId, data }: { 
      reportId: number; 
      data: { template?: string; include_comments?: boolean; include_attachments?: boolean; } 
    }) => {
      const response = await pdfApi.generatePDF(reportId, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report-pdfs', variables.reportId] });
      toast({
        title: "PDF Generation Started",
        description: "Your report PDF is being generated. You'll be notified when it's ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate PDF",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePDF = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reportId, pdfId }: { reportId: number; pdfId: number }) => {
      const response = await pdfApi.deletePDF(reportId, pdfId);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report-pdfs', variables.reportId] });
      toast({
        title: "PDF Deleted",
        description: "The PDF has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete PDF",
        variant: "destructive",
      });
    },
  });
};