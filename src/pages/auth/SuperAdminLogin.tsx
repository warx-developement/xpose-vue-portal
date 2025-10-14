import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { useSuperAdminLogin } from '@/hooks/useSuperAdminAuth';

export default function SuperAdminLogin() {
  const superAdminLogin = useSuperAdminLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            SuperAdmin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access the system administration panel
          </p>
        </div>
        
        <LoginForm 
          onSubmit={superAdminLogin.mutate}
          isLoading={superAdminLogin.isPending}
        />
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Regular user?{' '}
            <a href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
