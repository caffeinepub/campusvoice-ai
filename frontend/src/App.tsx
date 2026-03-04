import React, { useEffect } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { AppProvider, useAppContext } from './contexts/AppContext';
import LandingPage from './pages/LandingPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import AppHeader from './components/AppHeader';
import AppSidebar from './components/AppSidebar';
import EmergencyAlertOverlay from './components/EmergencyAlertOverlay';
import AIChatbot from './components/AIChatbot';
import DashboardPage from './pages/DashboardPage';
import SubmitComplaintPage from './pages/SubmitComplaintPage';
import TrackComplaintsPage from './pages/TrackComplaintsPage';
import ChatbotPage from './pages/ChatbotPage';
import ComplaintsListPage from './pages/ComplaintsListPage';
import AnalyticsPage from './pages/AnalyticsPage';
import UserManagementPage from './pages/UserManagementPage';
import EmergencyLogsPage from './pages/EmergencyLogsPage';
import DepartmentManagementPage from './pages/DepartmentManagementPage';
import StudentLoginFlow from './components/StudentLoginFlow';
import HODLoginFlow from './components/HODLoginFlow';
import AdminLoginFlow from './components/AdminLoginFlow';
import StaffLoginFlow from './components/StaffLoginFlow';
import { Skeleton } from '@/components/ui/skeleton';

const PENDING_ROLE_KEY = 'campusvoice_pending_role';

type View =
  | 'dashboard'
  | 'submit'
  | 'track'
  | 'chatbot'
  | 'admin-complaints'
  | 'admin-users'
  | 'admin-emergencies'
  | 'admin-analytics'
  | 'admin-departments'
  | 'hod-complaints'
  | 'hod-analytics'
  | 'staff-complaints'
  | 'staff-analytics';

type PublicView = 'select' | 'student-login' | 'hod-login' | 'admin-login' | 'staff-login';

function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const { extendedProfile, campusRole, isProfileLoading, isProfileFetched } = useAppContext();
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [publicView, setPublicView] = React.useState<PublicView>('select');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Reset to dashboard when role changes
  useEffect(() => {
    setCurrentView('dashboard');
  }, [campusRole]);

  if (isInitializing || (identity && isProfileLoading && !isProfileFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 mx-auto" />
            <Skeleton className="h-3 w-24 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">Loading CampusVoice AI...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    if (publicView === 'student-login') {
      return <StudentLoginFlow onBack={() => setPublicView('select')} />;
    }
    if (publicView === 'hod-login') {
      return <HODLoginFlow onBack={() => setPublicView('select')} />;
    }
    if (publicView === 'admin-login') {
      return <AdminLoginFlow onBack={() => setPublicView('select')} />;
    }
    if (publicView === 'staff-login') {
      return <StaffLoginFlow onBack={() => setPublicView('select')} />;
    }
    return <LandingPage onNavigate={setPublicView} />;
  }

  // Show profile setup if authenticated but no profile yet
  const showProfileSetup = !!identity && isProfileFetched && !isProfileLoading && !extendedProfile;

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Once profile is set up, clear any pending role key
  if (extendedProfile) {
    localStorage.removeItem(PENDING_ROLE_KEY);
  }

  const renderPage = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentView} />;
      case 'submit':
        return <SubmitComplaintPage onNavigate={setCurrentView} />;
      case 'track':
        return <TrackComplaintsPage />;
      case 'chatbot':
        return <ChatbotPage />;
      case 'admin-complaints':
      case 'hod-complaints':
      case 'staff-complaints':
        return <ComplaintsListPage />;
      case 'admin-analytics':
      case 'hod-analytics':
      case 'staff-analytics':
        return <AnalyticsPage />;
      case 'admin-users':
        return <UserManagementPage />;
      case 'admin-emergencies':
        return <EmergencyLogsPage />;
      case 'admin-departments':
        return campusRole === 'admin' ? <DepartmentManagementPage /> : <DashboardPage onNavigate={setCurrentView} />;
      default:
        return <DashboardPage onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-shrink-0 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto">
          <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-30 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10 h-full overflow-y-auto">
              <AppSidebar
                currentView={currentView}
                onNavigate={setCurrentView}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6">
            {renderPage()}
          </div>

          {/* Footer */}
          <footer className="border-t border-border mt-8 py-4 px-4 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} CampusVoice AI. Built with{' '}
              <span className="text-red-500">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname || 'campusvoice-ai'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Emergency Alert Overlay for HOD/Admin/Staff */}
      {(campusRole === 'hod' || campusRole === 'admin' || campusRole === 'staff') && (
        <EmergencyAlertOverlay />
      )}

      {/* AI Chatbot for students */}
      {campusRole === 'student' && <AIChatbot />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
