import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, SuperAdminLoginRequest } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

export const useSuperAdminLogin = () => {
  const navigate = useNavigate();
  const { setAuth, setLoading } = useAuthStore();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SuperAdminLoginRequest) => superAdminApi.login(data),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (response) => {
      const { token, user } = response.data;
      setAuth(token, user);
      
      toast({
        title: "SuperAdmin Login Successful!",
        description: `Welcome back, ${user.name}`,
      });
      
      navigate('/superadmin/dashboard');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'SuperAdmin login failed. Please try again.';
      toast({
        title: "SuperAdmin Login Failed",
        description: message,
        variant: "destructive",
      });
      setLoading(false);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};
