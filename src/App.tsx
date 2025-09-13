import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import { ListReports } from "./pages/ListReports";
import { ViewReport } from "./pages/ViewReport";
import { EditReport } from "./pages/EditReport";
import AddReport from "./pages/AddReport";
import { BugsList } from "./pages/BugsList";
import AddBug from "./pages/AddBug";
import EditBug from "./pages/EditBug";
import ViewBug from "./pages/ViewBug";
import { GenerateReport } from "./pages/GenerateReport";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import MyTeam from "./pages/MyTeam";
import { RoleManagement } from "./pages/RoleManagement";
import Profile from "./pages/Profile";

// Layout Components
import { DashboardLayout } from "./components/layout/DashboardLayout";

// Store
import { useAuthStore } from "./stores/authStore";

// 404 Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    // Preserve intended destination to avoid loops and allow post-login redirect
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect; send unauth users to login, auth users to dashboard */}
          <Route path="/" element={
            useAuthStore.getState().isAuthenticated 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/auth/login" replace />
          } />
          
          {/* Auth Routes */}
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          
          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ListReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/reports/add" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ViewReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id/edit" element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id/bugs" element={
            <ProtectedRoute>
              <DashboardLayout>
                <BugsList />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:reportId/bugs/add" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AddBug />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:reportId/bugs/:bugId/edit" element={
            <ProtectedRoute>
              <DashboardLayout>
                <EditBug />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id/bugs/:bugId/view" element={
            <ProtectedRoute>
              <DashboardLayout>
                <ViewBug />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports/:id/generate" element={
            <ProtectedRoute>
              <DashboardLayout>
                <GenerateReport />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Placeholder routes for other navigation items */}
          <Route path="/expose-finder" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="eXpose Finder" subtitle="Discover potential security exposures" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/manage-agent" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="Manage Agent" subtitle="Configure and manage security agents" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/past-agent" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="Past Agent" subtitle="View historical agent activities" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/new-scan" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="New Scan" subtitle="Initiate new vulnerability scans" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/scan-history" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="Scan History" subtitle="View previous vulnerability scans" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/scheduled-scan" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="Scheduled Scan" subtitle="Manage scheduled vulnerability scans" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/manual-pentest" element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlaceholderPage title="Manual Pentest" subtitle="Conduct manual penetration testing" />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/my-team" element={
            <ProtectedRoute>
              <DashboardLayout>
                <MyTeam />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/role-management" element={
            <ProtectedRoute>
              <DashboardLayout>
                <RoleManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
