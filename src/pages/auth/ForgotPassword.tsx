import { Navigate } from 'react-router-dom';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuthStore } from '@/stores/authStore';

export default function ForgotPassword() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ForgotPasswordForm />;
}