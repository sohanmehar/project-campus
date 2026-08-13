import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useToastStore } from './store/useToastStore';

// Layout & Auth
import { Login } from './pages/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastContainer } from './components/ui/ToastContainer';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AcademicsView } from './pages/student/AcademicsView';
import { AssignmentsView } from './pages/student/AssignmentsView';
import { PlacementsView } from './pages/student/PlacementsView';
import { CampusGptView } from './pages/student/CampusGptView';
import { AgentMarketplaceView } from './pages/student/AgentMarketplaceView';
import { EventsView } from './pages/student/EventsView';
import { ComplaintsView } from './pages/student/ComplaintsView';
import { SettingsView } from './pages/student/SettingsView';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentRegistryView } from './pages/admin/StudentRegistryView';
import { FacultyRegistryView } from './pages/admin/FacultyRegistryView';
import { AdminPlacementsView } from './pages/admin/AdminPlacementsView';
import { AiMetricsView } from './pages/admin/AiMetricsView';
import { SystemSettingsView } from './pages/admin/SystemSettingsView';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyAttendanceView } from './pages/faculty/FacultyAttendanceView';
import { FacultyNoticesView } from './pages/faculty/FacultyNoticesView';
import { FacultyCourseCatalogView } from './pages/faculty/FacultyCourseCatalogView';
import { FacultyGradeAssignmentsView } from './pages/faculty/FacultyGradeAssignmentsView';

// 1. Protected Route Wrapper (Redirects unauthenticated users to /login)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 2. Role-Based Route Guard Wrapper
const RoleGuard: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user } = useAuthStore();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// 3. Layout Bridge mapping URL path to DashboardLayout tab state
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract tab name from current URL path (e.g., /academics -> 'academics')
  const currentTab = location.pathname.split('/')[1] || 'dashboard';

  const handleSetCurrentTab = (tab: string) => {
    if (tab === 'dashboard') navigate('/dashboard');
    else navigate(`/${tab}`);
  };

  return (
    <DashboardLayout currentTab={currentTab} setCurrentTab={handleSetCurrentTab}>
      {children}
    </DashboardLayout>
  );
};

// 4. Role-Based Default Dashboard Redirect
const DefaultDashboardRedirect: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'faculty') return <FacultyDashboard />;
  if (user?.role === 'coordinator') return <EventsView />;
  return <StudentDashboard />;
};

export default function App() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { addToast } = useToastStore();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    // Only check server session if we don't already have an active authenticated user in state
    if (!isAuthenticated || !user) {
      checkAuth();
    }
  }, []);

  const handleLaunchAgent = (agentId: string) => {
    addToast('info', 'Agent Deployed', `Launching ${agentId} into CampusGPT Workspace.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center space-y-3 flex-col">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Authenticating CampusGPT OS Session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  {/* Default Central Dashboard Route */}
                  <Route path="/dashboard" element={<DefaultDashboardRedirect />} />

                  {/* Student Routes */}
                  <Route
                    path="/academics"
                    element={
                      user?.role === 'faculty' ? <FacultyCourseCatalogView /> : <AcademicsView />
                    }
                  />
                  <Route
                    path="/assignments"
                    element={
                      user?.role === 'faculty' ? <FacultyGradeAssignmentsView /> : <AssignmentsView />
                    }
                  />
                  <Route path="/placements" element={user?.role === 'admin' ? <AdminPlacementsView /> : <PlacementsView />} />
                  <Route path="/events" element={<EventsView />} />
                  <Route path="/complaints" element={<ComplaintsView />} />
                  <Route path="/ai-workspace" element={<CampusGptView />} />
                  <Route
                    path="/agents"
                    element={<AgentMarketplaceView onLaunchAgent={handleLaunchAgent} />}
                  />
                  <Route path="/settings" element={user?.role === 'admin' ? <SystemSettingsView /> : <SettingsView />} />

                  {/* Admin Specific Routes */}
                  <Route
                    path="/students"
                    element={
                      <RoleGuard allowedRoles={['admin']}>
                        <StudentRegistryView />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/faculty"
                    element={
                      <RoleGuard allowedRoles={['admin']}>
                        <FacultyRegistryView />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/ai-analytics"
                    element={
                      <RoleGuard allowedRoles={['admin']}>
                        <AiMetricsView />
                      </RoleGuard>
                    }
                  />

                  {/* Faculty Specific Routes */}
                  <Route
                    path="/attendance"
                    element={
                      <RoleGuard allowedRoles={['faculty', 'admin']}>
                        <FacultyAttendanceView />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/notices"
                    element={
                      <RoleGuard allowedRoles={['faculty', 'admin']}>
                        <FacultyNoticesView />
                      </RoleGuard>
                    }
                  />

                  {/* Fallback Catch-all Redirect */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}