import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  assetsApi, 
  AssetData, 
  CreateAssetRequest, 
  UpdateAssetRequest,
  SubdomainData,
  ProcessSubdomainRequest
} from '@/lib/api';

// Query keys
export const assetsKeys = {
  all: ['assets'] as const,
  lists: () => [...assetsKeys.all, 'list'] as const,
  list: (params: any) => [...assetsKeys.lists(), params] as const,
  details: () => [...assetsKeys.all, 'detail'] as const,
  detail: (id: number) => [...assetsKeys.details(), id] as const,
  subdomains: (assetId: number) => [...assetsKeys.all, 'subdomains', assetId] as const,
  subdomainList: (assetId: number, params: any) => [...assetsKeys.subdomains(assetId), 'list', params] as const,
  recentSubdomains: (assetId: number) => [...assetsKeys.subdomains(assetId), 'recent'] as const,
  domainSubdomains: (assetId: number, domain: string) => [...assetsKeys.subdomains(assetId), 'domain', domain] as const,
  subdomainHistory: (assetId: number, subdomainId: number) => [...assetsKeys.subdomains(assetId), 'history', subdomainId] as const,
};

// Assets Management Hooks
export const useAssets = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: assetsKeys.list(params),
    queryFn: () => assetsApi.getAssets(params),
    select: (response) => response.data,
  });
};

export const useAsset = (id: number) => {
  return useQuery({
    queryKey: assetsKeys.detail(id),
    queryFn: () => assetsApi.getAsset(id),
    select: (response) => response.data.data,
    enabled: !!id,
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAssetRequest) => assetsApi.createAsset(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      toast.success('Asset created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to create asset';
      toast.error(message);
    },
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssetRequest }) => 
      assetsApi.updateAsset(id, data),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assetsKeys.detail(id) });
      toast.success('Asset updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update asset';
      toast.error(message);
    },
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => assetsApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      toast.success('Asset deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to delete asset';
      toast.error(message);
    },
  });
};

// Subdomain Management Hooks
export const useAssetSubdomains = (assetId: number, params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: assetsKeys.subdomainList(assetId, params),
    queryFn: () => assetsApi.getAssetSubdomains(assetId, params),
    select: (response) => response.data,
    enabled: !!assetId,
  });
};

export const useRecentSubdomains = (assetId: number, limit?: number) => {
  return useQuery({
    queryKey: assetsKeys.recentSubdomains(assetId),
    queryFn: () => assetsApi.getRecentSubdomains(assetId, limit),
    select: (response) => response.data,
    enabled: !!assetId,
  });
};

export const useDomainSubdomains = (assetId: number, domain: string, params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: assetsKeys.domainSubdomains(assetId, domain),
    queryFn: () => assetsApi.getDomainSubdomains(assetId, domain, params),
    select: (response) => response.data,
    enabled: !!assetId && !!domain,
  });
};

export const useSubdomainHistory = (assetId: number, subdomainId: number, params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: assetsKeys.subdomainHistory(assetId, subdomainId),
    queryFn: () => assetsApi.getSubdomainHistory(assetId, subdomainId, params),
    select: (response) => response.data,
    enabled: !!assetId && !!subdomainId,
  });
};

export const useProcessSubdomainData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assetId, data }: { assetId: number; data: ProcessSubdomainRequest }) => 
      assetsApi.processSubdomainData(assetId, data),
    onSuccess: (response, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: assetsKeys.subdomains(assetId) });
      const { processed, skipped, errors } = response.data.stats;
      if (processed > 0) {
        toast.success(`Processed ${processed} subdomain(s)`);
      }
      if (skipped > 0) {
        toast.info(`Skipped ${skipped} subdomain(s) (5-hour rule)`);
      }
      if (errors > 0) {
        toast.warning(`${errors} subdomain(s) had errors`);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to process subdomain data';
      toast.error(message);
    },
  });
};

// Report Asset Management Hooks
export const useReportAsset = (reportId: number) => {
  return useQuery({
    queryKey: ['reports', reportId, 'asset'],
    queryFn: () => assetsApi.getReportAsset(reportId),
    select: (response) => response.data,
    enabled: !!reportId,
  });
};

export const useAssignAssetToReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ reportId, assetId }: { reportId: number; assetId: number }) => 
      assetsApi.assignAssetToReport(reportId, { asset_id: assetId }),
    onSuccess: (response, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'asset'] });
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      toast.success('Asset assigned to report successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to assign asset to report';
      toast.error(message);
    },
  });
};

export const useRemoveAssetFromReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reportId: number) => assetsApi.removeAssetFromReport(reportId),
    onSuccess: (response, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['reports', reportId, 'asset'] });
      queryClient.invalidateQueries({ queryKey: assetsKeys.lists() });
      toast.success('Asset removed from report successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to remove asset from report';
      toast.error(message);
    },
  });
};

export const useAvailableAssetsForReport = (reportId: number) => {
  return useQuery({
    queryKey: ['reports', reportId, 'available-assets'],
    queryFn: () => assetsApi.getAvailableAssetsForReport(reportId),
    select: (response) => response.data,
    enabled: !!reportId,
  });
};
