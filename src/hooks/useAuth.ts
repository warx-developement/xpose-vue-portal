import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response) => {
      // Check if this is a 2FA response
      if (response.data && 'requires_2fa' in response.data) {
        // Don't treat 2FA as success, just return the data
        setLoading(false);
        return;
      }
      
      // Normal login success
      const { token, user } = response.data as any;
      setAuth(token, user);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.name}`,
      });
      
      navigate('/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    },
    onSettled: (data, error) => {
      // Only set loading to false if it's not a 2FA response
      if (!data || !data.data || !('requires_2fa' in data.data)) {
        setLoading(false);
      }
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear(); // Clear all cached data
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      navigate('/auth/login');
    },
    onError: () => {
      // Even if the API call fails, we should still log out locally
      logout();
      queryClient.clear();
      navigate('/auth/login');
    },
  });
};

export const useForgotPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "Please check your email for reset instructions.",
      });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};

export const useResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. Please login with your new password.",
      });
      
      navigate('/auth/login');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
};
