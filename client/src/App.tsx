import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { Login } from './pages/auth/Login';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AcademicsView } from './pages/student/AcademicsView';
import { AssignmentsView } from './pages/student/AssignmentsView';
import { PlacementsView } from './pages/student/PlacementsView';
import { CampusGptView } from './pages/student/CampusGptView';
import { AgentMarketplaceView } from './pages/student/AgentMarketplaceView';
import { EventsView } from './pages/student/EventsView';
import { ComplaintsView } from './pages/student/ComplaintsView';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentRegistryView } from './pages/admin/StudentRegistryView';
import { FacultyRegistryView } from './pages/admin/FacultyRegistryView';
import { AcademicStructureView } from './pages/admin/AcademicStructureView';
import { AdminPlacementsView } from './pages/admin/AdminPlacementsView';
import { AiMetricsView } from './pages/admin/AiMetricsView';
import { SystemSettingsView } from './pages/admin/SystemSettingsView';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyAttendanceView } from './pages/faculty/FacultyAttendanceView';
import { FacultyNoticesView } from './pages/faculty/FacultyNoticesView';
import { FacultyCourseCatalogView } from './pages/faculty/FacultyCourseCatalogView';
import { FacultyGradeAssignmentsView } from './pages/faculty/FacultyGradeAssignmentsView';
import { ToastContainer } from './components/ui/ToastContainer';
import { useToastStore } from './store/useToastStore';
import { SettingsView } from './pages/student/SettingsView';

export default function App() {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  const [currentTab, setCurrentTabState] = useState<string>(() => {
    return localStorage.getItem('campusgpt_active_tab') || 'dashboard';
  });

  const { addToast } = useToastStore();

  const setCurrentTab = (tab: string) => {
    localStorage.setItem('campusgpt_active_tab', tab);
    setCurrentTabState(tab);
  };

  // Run checkAuth ONLY ONCE on mount (empty dependency array [])
  useEffect(() => {
    document.documentElement.classList.add('dark');
    checkAuth();
  }, []);

  const handleLaunchAgent = (agentId: string) => {
    addToast('info', 'Agent Deployed', `Launching ${agentId} into CampusGPT Workspace.`);
    setCurrentTab('ai-workspace');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center space-y-3 flex-col">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Authenticating CampusGPT OS Session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <DashboardLayout currentTab={currentTab} setCurrentTab={setCurrentTab}>
        {/* Student Ecosystem */}
        {user.role === 'student' && (
          <>
            {(currentTab === 'dashboard' || !currentTab) && <StudentDashboard />}
            {currentTab === 'academics' && <AcademicsView />}
            {currentTab === 'assignments' && <AssignmentsView />}
            {currentTab === 'placements' && <PlacementsView />}
            {currentTab === 'events' && <EventsView />}
            {currentTab === 'complaints' && <ComplaintsView />}
            {currentTab === 'ai-workspace' && <CampusGptView />}
            {currentTab === 'agents' && <AgentMarketplaceView onLaunchAgent={handleLaunchAgent} />}
            {currentTab === 'settings' && <SettingsView />}
          </>
        )}

        {/* Admin Ecosystem */}
        {user.role === 'admin' && (
          <>
            {(currentTab === 'dashboard' || !currentTab) && <AdminDashboard />}
            {currentTab === 'students' && <StudentRegistryView />}
            {currentTab === 'faculty' && <FacultyRegistryView />}
            {currentTab === 'academics' && <AcademicStructureView />}
            {currentTab === 'placements' && <AdminPlacementsView />}
            {currentTab === 'ai-analytics' && <AiMetricsView />}
            {currentTab === 'settings' && <SystemSettingsView />}
          </>
        )}

        {/* Faculty Ecosystem */}
        {user.role === 'faculty' && (
          <>
            {(currentTab === 'dashboard' || !currentTab) && <FacultyDashboard />}
            {currentTab === 'academics' && <FacultyCourseCatalogView />}
            {currentTab === 'attendance' && <FacultyAttendanceView />}
            {currentTab === 'assignments' && <FacultyGradeAssignmentsView />}
            {currentTab === 'notices' && <FacultyNoticesView />}
            {currentTab === 'ai-workspace' && <CampusGptView />}
          </>
        )}

        {/* Coordinator Ecosystem */}
        {user.role === 'coordinator' && (
          <>
            {(currentTab === 'dashboard' || !currentTab || currentTab === 'events') && <EventsView />}
            {currentTab === 'ai-workspace' && <CampusGptView />}
          </>
        )}
      </DashboardLayout>
      <ToastContainer />
    </>
  );
}