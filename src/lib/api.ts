import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// API Configuration
const API_BASE_URL = 'https://demoapi.whyxpose.com/api/v2';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and company ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  const companyId = localStorage.getItem('company_uuid');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (companyId) {
    config.headers['X-Company-ID'] = companyId;
  }
  
  return config;
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect to login once
      try {
        const { logout } = useAuthStore.getState();
        logout();
      } catch {}
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.replace('/auth/login');
      }
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    company_id: number;
    company_uuid: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/auth/login', data),
  
  logout: (): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/logout'),
  
  forgotPassword: (data: ForgotPasswordRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/forgot-password', data),
  
  resetPassword: (data: ResetPasswordRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/reset-password', data),
  
  verifyEmail: (token: string): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/auth/verify-email', { token }),
};

// Dashboard API
export interface DashboardData {
  reports_count: number;
  bugs_count: number;
  critical_bugs: number;
  high_bugs: number;
  resolved_bugs: number;
  recent_activity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
  recent_reports: {
    id: number;
    name: string;
    created_by: string;
    created_at: string;
  }[];
  recent_bugs: {
    id: number;
    title: string;
    domain: string;
    severity: string;
    status: string;
    report_name: string;
    created_by: string;
    created_at: string;
  }[];
  bugs_by_severity: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Info: number;
  };
  bugs_by_status: {
    Open: number;
    Pending: number;
    Accepted: number;
    "Needs More Info": number;
    Retesting: number;
    Resolved: number;
    "Won't Fix": number;
  };
  reports_by_month: number[];
  bugs_by_month: number[];
}

export interface NotificationData {
  id: number;
  title: string;
  description: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AnalyticsData {
  bugs_trend: {
    date: string;
    count: number;
  }[];
  reports_trend: {
    date: string;
    count: number;
  }[];
  severity_distribution: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Info: number;
  };
  status_distribution: {
    Open: number;
    Pending: number;
    Accepted: number;
    "Needs More Info": number;
    Retesting: number;
    Resolved: number;
    "Won't Fix": number;
  };
  top_domains: {
    domain: string;
    count: number;
  }[];
  top_bug_types: {
    name: string;
    count: number;
  }[];
}

// Reports API
export interface ReportData {
  id: number;
  report_id: string;
  name: string;
  scope: string;
  created_by: string;
  created_at: string;
  access: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
  }[];
  bugs_count: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
    Info: number;
    total: number;
    resolved: number;
  };
}

export interface ReportDetailData extends ReportData {
  security_grade: {
    grade: string;
    description: string;
  };
  vulnerabilities_summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    resolved: number;
    fixed_percentage: number;
  };
  top_vulnerable_targets: {
    domain: string;
    count: number;
  }[];
  top_vulnerability_categories: {
    category: string;
    count: number;
  }[];
  vulnerability_chart: {
    severity: string;
    count: number;
    color: string;
  }[];
  status_chart: {
    status: string;
    count: number;
    color: string;
  }[];
  status_severity_matrix: {
    [severity: string]: {
      [status: string]: number;
    };
  };
  recent_bugs: {
    id: number;
    title: string;
    domain: string;
    severity: string;
    status: string;
    created_at: string;
  }[];
}

export interface ReportsResponse {
  data: ReportData[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// Bug Types
export interface BugData {
  id: number;
  bug_id: string;
  title: string;
  domain: string;
  description: string;
  poc: string;
  fix: string;
  severity: {
    label: string;
    color: string;
    value: number;
  };
  status: {
    label: string;
    color: string;
    value: number;
  };
  type: {
    id: number;
    name: string;
  };
  created_by: string;
  created_at: string;
  updated_at: string;
  use_cvss: boolean;
  cvss: any;
  comments?: BugComment[];
  attachments?: BugAttachment[];
}

export interface BugComment {
  id: number;
  comment: string;
  user_name: string;
  avatar: string | null;
  is_const: boolean;
  created_at: string;
  attachments?: CommentAttachment[];
}

export interface BugAttachment {
  id: number;
  image_url: string;
  filename?: string;
  size?: number;
  type?: string;
  created_at?: string;
}

export interface CommentAttachment {
  id: number;
  image_url: string;
  filename?: string;
  size?: number;
  type?: string;
  created_at?: string;
}

export interface DraftAttachment {
  id: string | number;
  image_url: string;
  filename: string;
  size: number;
  type: string;
  created_at: string;
  is_draft: true;
}

export interface BugType {
  id: number;
  name: string;
  description: string;
}

export interface BugsResponse {
  data: BugData[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export const dashboardApi = {
  getDashboard: (): Promise<AxiosResponse<ApiResponse<DashboardData>>> =>
    api.get('/dashboard'),
  
  getNotifications: (): Promise<AxiosResponse<ApiResponse<NotificationData[]>>> =>
    api.get('/dashboard/notifications'),
  
  markNotificationRead: (id: number): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/dashboard/notifications/${id}/read`),
  
  markAllNotificationsRead: (): Promise<AxiosResponse<ApiResponse>> =>
    api.put('/dashboard/notifications/read-all'),
  
  getAnalytics: (): Promise<AxiosResponse<ApiResponse<AnalyticsData>>> =>
    api.get('/dashboard/analytics'),
};

export const reportsApi = {
  getReports: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<AxiosResponse<ReportsResponse>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.sort_order) searchParams.append('sort_order', params.sort_order);
    return api.get(`/reports?${searchParams.toString()}`);
  },
  
  getReport: (id: number): Promise<AxiosResponse<ApiResponse<ReportDetailData>>> =>
    api.get(`/reports/${id}`),
  
  createReport: (data: {
    name: string;
    scope: string;
    access: number[];
  }): Promise<AxiosResponse<ApiResponse<{ id: number; report_id: string }>>> =>
    api.post('/reports/create', data),
  
  updateReport: (id: number, data: {
    name?: string;
    scope?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/reports/${id}`, data),
  
  deleteReport: (id: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/reports/${id}`),

  addUserAccess: (reportId: number, userId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/reports/${reportId}/access`, { user_id: userId }),

  removeUserAccess: (reportId: number, userId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/reports/${reportId}/access/${userId}`),
};

// Users API
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  company_name?: string;
  created_at: string;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
}

export const usersApi = {
  getUsers: (): Promise<AxiosResponse<UsersResponse>> =>
    api.get('/roles/admins'),
};

// Company User Management API
export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id: number;
  created_at: string;
  is_2fa_enabled: boolean;
  is_active: boolean;
}

export interface CompanyUsersResponse {
  success: boolean;
  data: CompanyUser[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  }
}

export const companyUsersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: 'active' | 'inactive' | 'all'; }): Promise<AxiosResponse<CompanyUsersResponse>> =>
    api.get('/company/users', { params }),
  invite: (data: { name: string; email: string; role_ids?: number[] }): Promise<AxiosResponse<ApiResponse<{ user_id: number; invite_token: string }>>> =>
    api.post('/company/users/invite', data),
  remove: (userId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/company/users/${userId}/remove`),
  activate: (userId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/company/users/${userId}/activate`),
  deactivate: (userId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/company/users/${userId}/deactivate`),
};

// Roles API
export interface RoleData {
  id: number;
  name: string;
  description?: string;
  company_id: number;
  is_system_role: number;
  is_admin_role: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  permission_count?: number;
  permissions?: PermissionData[];
}

export interface PermissionData {
  id: number;
  slug: string;
  name: string;
  description: string;
  module: string;
  is_active?: number;
}

export interface PermissionModule {
  module: string;
  permissions: PermissionData[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleRequest {
  role_ids: number[];
  roles?: number[];
}

export const rolesApi = {
  // Role Management
  getRoles: (): Promise<AxiosResponse<ApiResponse<RoleData[]>>> => api.get('/roles'),
  getRole: (id: number): Promise<AxiosResponse<ApiResponse<RoleData>>> => api.get(`/roles/${id}`),
  createRole: (data: CreateRoleRequest): Promise<AxiosResponse<ApiResponse<RoleData>>> => 
    api.post('/roles/create', data),
  updateRole: (id: number, data: UpdateRoleRequest): Promise<AxiosResponse<ApiResponse>> => 
    api.put(`/roles/${id}/update`, data),
  deleteRole: (id: number): Promise<AxiosResponse<ApiResponse>> => 
    api.delete(`/roles/${id}/delete`),
  
  // Permissions
  getPermissions: (): Promise<AxiosResponse<ApiResponse<PermissionModule[]>>> => 
    api.get('/roles/permissions'),
  getPermissionsByModule: (module: string): Promise<AxiosResponse<ApiResponse<PermissionData[]>>> => 
    api.get(`/roles/permissions/${module}`),
  
  // User Role Management
  getUserRoles: (userId: number): Promise<AxiosResponse<ApiResponse<RoleData[]>>> => 
    api.get(`/roles/user/${userId}`),
  assignUserRoles: (userId: number, data: AssignRoleRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post(`/roles/user/${userId}/assign`, data),
  removeUserRole: (userId: number, roleId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/roles/user/${userId}/role/${roleId}/remove`),
  getUserPermissions: (userId: number): Promise<AxiosResponse<ApiResponse<PermissionData[]>>> =>
    api.get(`/roles/user/${userId}/permissions`),
  
  // Current User Permissions
  getMyPermissions: (): Promise<AxiosResponse<ApiResponse<PermissionData[]>>> =>
    api.get('/roles/my-permissions'),
};

// PDF Generation API
export interface PDFData {
  id: number;
  start_date: string;
  end_date: string;
  file_url: string;
  file_size: number;
  status: string;
  created_at: string;
  updated_at: string;
  download_url: string;
}

export interface PDFListResponse {
  success: boolean;
  data: PDFData[];
}

export const pdfApi = {
  getReportPDFs: (reportId: number): Promise<AxiosResponse<PDFListResponse>> =>
    api.get(`/reports/${reportId}/pdf`),
  
  generatePDF: (reportId: number, data: {
    template?: string;
    include_comments?: boolean;
    include_attachments?: boolean;
  }): Promise<AxiosResponse<ApiResponse<{ pdf_id: number; status: string }>>> =>
    api.post(`/reports/${reportId}/pdf/generate`, data),
  
  getPDFStatus: (reportId: number, pdfId: number): Promise<AxiosResponse<ApiResponse<{
    id: number;
    status: string;
    progress: number;
    created_at: string;
  }>>> =>
    api.get(`/reports/${reportId}/pdf/${pdfId}/status`),
  
  downloadPDF: (reportId: number, pdfId: number): Promise<AxiosResponse<Blob>> =>
    api.get(`/reports/${reportId}/pdf/${pdfId}/download`, {
      responseType: 'blob'
    }),
  
  deletePDF: (reportId: number, pdfId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/reports/${reportId}/pdf/${pdfId}`),
};

// Companies API
export interface CompanyItem {
  id: number;
  name: string;
  domain: string;
  address: string;
  uuid: string;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  is_active: number;
  contact_email: string;
  contact_phone: string;
  joined_at: string;
}

export interface CompaniesResponse {
  success: boolean;
  data: {
    current_company: CompanyItem;
    available_companies: CompanyItem[];
  };
}

export const companiesApi = {
  getCompanies: (): Promise<AxiosResponse<CompaniesResponse>> =>
    api.get('/auth/companies'),
};

// Bugs API
export const bugsApi = {
  getBugs: (reportId: number, params?: {
    page?: number;
    limit?: number;
    severity?: string;
    status?: string;
    search?: string;
  }): Promise<AxiosResponse<BugsResponse>> =>
    api.get(`/reports/${reportId}/bugs`, { params }),
  
  getBug: (bugId: number): Promise<AxiosResponse<ApiResponse<BugData>>> =>
    api.get(`/bugs/${bugId}`),
  
  getBugTimeline: (bugId: number): Promise<AxiosResponse<ApiResponse<Array<{
    time: string;
    actor: string;
    title: string;
    type: string;
    meta?: any;
  }>>>> =>
    api.get(`/bugs/${bugId}/timeline`),
  
  createBug: (reportId: number, data: {
    title: string;
    domain: string;
    description: string;
    poc: string;
    fix: string;
    severity: number;
    type: number;
    use_cvss?: number;
    cvss_vector?: string;
    cvss_score?: number;
    cvss_severity?: string;
    attachment_ids?: number[];
  }): Promise<AxiosResponse<ApiResponse<{ id: number; bug_id: string }>>> =>
    api.post(`/reports/${reportId}/bugs/create`, data),
  
  updateBug: (bugId: number, data: {
    title?: string;
    domain?: string;
    description?: string;
    poc?: string;
    fix?: string;
    type?: number;
    use_cvss?: number;
    cvss_vector?: string;
    cvss_score?: number;
    cvss_severity?: string;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/bugs/${bugId}`, data),

  deleteBug: (bugId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/bugs/${bugId}`),

  updateBugStatus: (bugId: number, data: {
    severity?: number;
    status?: number;
  }): Promise<AxiosResponse<ApiResponse>> =>
    api.put(`/bugs/${bugId}/status`, data),
  
  addBugAttachment: (bugId: number, file: File): Promise<AxiosResponse<ApiResponse<BugAttachment>>> => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/bugs/${bugId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteBugAttachment: (bugId: number, attachmentId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/bugs/${bugId}/attachments/${attachmentId}`),
  
  getBugTypes: (): Promise<AxiosResponse<ApiResponse<BugType[]>>> =>
    api.get('/bugs/types'),
  
  getCVSSOptions: (): Promise<AxiosResponse<ApiResponse<any>>> =>
    api.get('/bugs/cvss-options'),

  // Comments API
  getBugComments: (bugId: number): Promise<AxiosResponse<{ success: boolean; data: BugComment[] }>> =>
    api.get(`/bugs/${bugId}/comments`),
  
  createComment: (bugId: number, comment: string, attachment_ids?: number[]): Promise<AxiosResponse<{ success: boolean; data: { id: number }; message: string }>> =>
    api.post(`/bugs/${bugId}/comments/create`, { comment, attachment_ids }),
  
  updateComment: (commentId: number, comment: string): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.put(`/comments/${commentId}`, { comment }),
  
  addCommentAttachment: (commentId: number, file: File): Promise<AxiosResponse<ApiResponse<CommentAttachment>>> => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/comments/${commentId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  deleteCommentAttachment: (commentId: number, attachmentId: number): Promise<AxiosResponse<ApiResponse>> =>
    api.delete(`/comments/${commentId}/attachments/${attachmentId}`),

  deleteComment: (commentId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete(`/comments/${commentId}`),
};

// Draft Attachments API
export const draftAttachmentsApi = {
  // Upload draft attachment for bugs
  uploadDraftAttachment: (reportId: number, file: File): Promise<AxiosResponse<ApiResponse<DraftAttachment>>> => {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('report_id', reportId.toString());
    return api.post('/attachments/draft', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Upload draft attachment for comments
  uploadCommentDraftAttachment: (reportId: number, file: File): Promise<AxiosResponse<ApiResponse<DraftAttachment>>> => {
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('report_id', reportId.toString());
    return api.post('/comments/attachments/draft', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Cleanup orphaned draft attachments (Superadmin only)
  cleanupDraftAttachments: (): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.post('/attachments/cleanup'),
};

// User Profile API
export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  company_id: number;
  company_name: string;
  avatar: string | null;
  is_2fa_enabled: boolean;
  is_email_verified: boolean;
  permissions: string[];
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  data: {
    secret_key: string;
    issuer: string;
    account_name: string;
    message: string;
  };
}

export interface TwoFactorVerifyRequest {
  otp: string;
}

export const profileApi = {
  // Get current user profile
  getProfile: (): Promise<AxiosResponse<ApiResponse<UserProfile>>> =>
    api.get('/user/profile'),
  
  // Update user profile
  updateProfile: (data: ProfileUpdateRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.put('/user/profile', data),
  
  // Change password
  changePassword: (data: PasswordChangeRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/user/change-password', data),
  
  // Setup 2FA
  setup2FA: (): Promise<AxiosResponse<TwoFactorSetupResponse>> =>
    api.post('/user/setup-2fa'),
  
  // Verify 2FA setup
  verify2FASetup: (data: TwoFactorVerifyRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/user/verify-2fa-setup', data),
  
  // Disable 2FA
  disable2FA: (data: TwoFactorVerifyRequest): Promise<AxiosResponse<ApiResponse>> =>
    api.post('/user/disable-2fa', data),
};