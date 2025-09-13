import { Navigate } from 'react-router-dom';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuthStore } from '@/stores/authStore';

export default function ResetPassword() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ResetPasswordForm />;
}