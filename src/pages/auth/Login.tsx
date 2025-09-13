import { Navigate } from 'react-router-dom';
import { LightLogin } from '@/components/ui/sign-in';
import { useAuthStore } from '@/stores/authStore';

export default function Login() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LightLogin />;
}