import { useState, useEffect, useCallback } from 'react';
import { superAdminApiService, Company, CompanyRole, CreateCompanyRequest, UpdateCompanyRequest, CompanyDeletionError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface UseCompaniesParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface UseCompaniesReturn {
  companies: Company[];
  loading: boolean;
  error: string | null;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | null;
  fetchCompanies: (params?: UseCompaniesParams) => Promise<void>;
  refreshCompanies: () => Promise<void>;
}

export function useCompanies(initialParams?: UseCompaniesParams): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  } | null>(null);
  const [params, setParams] = useState<UseCompaniesParams>(initialParams || {});

  const { toast } = useToast();

  const fetchCompanies = useCallback(async (newParams?: UseCompaniesParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = { ...params, ...newParams };
      setParams(searchParams);
      
      const response = await superAdminApiService.getCompanies(searchParams);
      
      if (response.data.success) {
        setCompanies(response.data.data);
        setPagination(response.data.pagination);
      } else {
        throw new Error('Failed to fetch companies');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch companies';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [params, toast]);

  const refreshCompanies = useCallback(() => {
    return fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  return {
    companies,
    loading,
    error,
    pagination,
    fetchCompanies,
    refreshCompanies,
  };
}

interface UseCompanyReturn {
  company: Company | null;
  loading: boolean;
  error: string | null;
  fetchCompany: (id: number) => Promise<void>;
}

export function useCompany(): UseCompanyReturn {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCompany = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await superAdminApiService.getCompany(id);
      
      if (response.data.success) {
        setCompany(response.data.data);
      } else {
        throw new Error('Failed to fetch company');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch company';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    company,
    loading,
    error,
    fetchCompany,
  };
}

interface UseCompanyRolesReturn {
  roles: CompanyRole[];
  loading: boolean;
  error: string | null;
  fetchRoles: (companyId: number) => Promise<void>;
}

export function useCompanyRoles(): UseCompanyRolesReturn {
  const [roles, setRoles] = useState<CompanyRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRoles = useCallback(async (companyId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await superAdminApiService.getCompanyRoles(companyId);
      
      if (response.data.success) {
        setRoles(response.data.data);
      } else {
        throw new Error('Failed to fetch company roles');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch company roles';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
  };
}

interface UseCompanyActionsReturn {
  createCompany: (data: CreateCompanyRequest) => Promise<Company | null>;
  updateCompany: (id: number, data: UpdateCompanyRequest) => Promise<Company | null>;
  deactivateCompany: (id: number) => Promise<boolean>;
  deleteCompany: (id: number) => Promise<{ success: boolean; error?: CompanyDeletionError }>;
}

export function useCompanyActions(): UseCompanyActionsReturn {
  const { toast } = useToast();

  const createCompany = useCallback(async (data: CreateCompanyRequest): Promise<Company | null> => {
    try {
      const response = await superAdminApiService.createCompany(data);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Company created successfully',
        });
        return response.data.data;
      } else {
        throw new Error('Failed to create company');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create company';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateCompany = useCallback(async (id: number, data: UpdateCompanyRequest): Promise<Company | null> => {
    try {
      const response = await superAdminApiService.updateCompany(id, data);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Company updated successfully',
        });
        return response.data.data;
      } else {
        throw new Error('Failed to update company');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update company';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const deactivateCompany = useCallback(async (id: number): Promise<boolean> => {
    try {
      const response = await superAdminApiService.deactivateCompany(id);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Company deactivated successfully. Company admins must clean up all data before permanent deletion.',
        });
        return true;
      } else {
        throw new Error('Failed to deactivate company');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to deactivate company';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const deleteCompany = useCallback(async (id: number): Promise<{ success: boolean; error?: CompanyDeletionError }> => {
    try {
      const response = await superAdminApiService.deleteCompany(id);
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Company permanently deleted successfully',
        });
        return { success: true };
      } else {
        throw new Error('Failed to delete company');
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (errorData?.remaining_data) {
        // This is a CompanyDeletionError with remaining data
        toast({
          title: 'Cannot Delete Company',
          description: errorData.error,
          variant: 'destructive',
        });
        return { success: false, error: errorData };
      } else {
        const errorMessage = errorData?.message || err.message || 'Failed to delete company';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return { success: false };
      }
    }
  }, [toast]);

  return {
    createCompany,
    updateCompany,
    deactivateCompany,
    deleteCompany,
  };
}
