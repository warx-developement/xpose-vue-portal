import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi, UserProfile, ProfileUpdateRequest, PasswordChangeRequest, TwoFactorVerifyRequest } from '@/lib/api';
import { toast } from 'sonner';

// Query keys
const profileKeys = {
  all: ['profile'] as const,
  profile: () => [...profileKeys.all, 'user'] as const,
};

// Get user profile
export const useProfile = () => {
  return useQuery({
    queryKey: profileKeys.profile(),
    queryFn: async (): Promise<UserProfile> => {
      const response = await profileApi.getProfile();
      // API returns { success, user }
      return (response.data as any).user as UserProfile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('Profile updated successfully');
        queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to update profile';
      toast.error(message);
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => profileApi.changePassword(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('Password changed successfully');
      } else {
        toast.error(response.data.message || 'Failed to change password');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to change password';
      toast.error(message);
    },
  });
};

// Setup 2FA
export const useSetup2FA = () => {
  return useMutation({
    mutationFn: () => profileApi.setup2FA(),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('2FA setup initiated');
      } else {
        toast.error('Failed to setup 2FA');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to setup 2FA';
      toast.error(message);
    },
  });
};

// Verify 2FA setup
export const useVerify2FASetup = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TwoFactorVerifyRequest) => profileApi.verify2FASetup(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('2FA enabled successfully');
        queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      } else {
        toast.error(response.data.message || 'Failed to verify 2FA');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to verify 2FA';
      toast.error(message);
    },
  });
};

// Disable 2FA
export const useDisable2FA = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TwoFactorVerifyRequest) => profileApi.disable2FA(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success('2FA disabled successfully');
        queryClient.invalidateQueries({ queryKey: profileKeys.profile() });
      } else {
        toast.error(response.data.message || 'Failed to disable 2FA');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Failed to disable 2FA';
      toast.error(message);
    },
  });
};

// Companies
import { companiesApi, CompanyItem } from '@/lib/api';

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'list'],
    queryFn: async (): Promise<{ current_company: CompanyItem; available_companies: CompanyItem[] }> => {
      const res = await companiesApi.getCompanies();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
