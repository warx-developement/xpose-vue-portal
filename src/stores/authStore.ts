import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id?: number;
  company_name?: string;
  is_2fa_enabled?: boolean;
  is_email_verified?: boolean;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  companyId: number | null;
  companyUuid: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, user: User) => void;
  setCompanyId: (companyId: number) => void;
  setCompanyUuid: (companyUuid: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      companyId: null,
      companyUuid: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (token: string, user: User) => {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
        
        // Only set company data for regular users, not superadmin
        if (user.role !== 'superadmin' && user.company_name) {
          localStorage.setItem('company_uuid', user.company_name);
        }
        
        set({
          token,
          user,
          companyId: user.company_id || null,
          companyUuid: user.company_name || null,
          isAuthenticated: true,
        });
      },

      setCompanyId: (companyId: number) => {
        localStorage.setItem('company_id', companyId.toString());
        set({ companyId });
      },

      setCompanyUuid: (companyUuid: string) => {
        localStorage.setItem('company_uuid', companyUuid);
        set({ companyUuid });
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('company_id');
        localStorage.removeItem('company_uuid');
        
        set({
          user: null,
          token: null,
          companyId: null,
          companyUuid: null,
          isAuthenticated: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        companyId: state.companyId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);