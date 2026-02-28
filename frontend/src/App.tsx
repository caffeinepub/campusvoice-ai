import React, { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

type View =
  | 'dashboard'
  | 'submit'
  | 'track'
  | 'chatbot'
  | 'admin-complaints'
  | 'admin-users'
  | 'admin-emergencies'
  | 'admin-analytics'
  | 'hod-complaints'
  | 'hod-analytics'
  | 'staff-complaints';

function AppShell() {
  const { identity, isInitializing } = useInternetIdentity();
  const { extendedProfile, campusRole, isProfileLoading, isProfileFetched } = useAppContext();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    return <LandingPage />;
  }

  // Show profile setup if authenticated but no profile yet
  const showProfileSetup = !!identity && isProfileFetched && !isProfileLoading && !extendedProfile;

  if (showProfileSetup) {
    return <ProfileSetupModal open={true} />;
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
        return <AnalyticsPage />;
      case 'admin-users':
        return <UserManagementPage />;
      case 'admin-emergencies':
        return <EmergencyLogsPage />;
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

      {/* Global overlays */}
      <EmergencyAlertOverlay />

      {/* AI Chatbot - only for students */}
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
