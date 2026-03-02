import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  FilePlus,
  FileSearch,
  MessageSquare,
  Users,
  BarChart3,
  AlertTriangle,
  LogOut,
  Trash2,
  Shield,
  GraduationCap,
  ClipboardList,
  Briefcase,
} from 'lucide-react';
import { CAMPUS_ROLE_COLORS, CAMPUS_ROLE_LABELS } from '../constants/appRoles';
import DeleteAccountDialog from './DeleteAccountDialog';

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
  | 'staff-complaints'
  | 'staff-analytics';

interface AppSidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onClose?: () => void;
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

export default function AppSidebar({ currentView, onNavigate, onClose }: AppSidebarProps) {
  const { extendedProfile, campusRole } = useAppContext();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  const handleLogout = async () => {
    try {
      queryClient.clear();
      await clear();
    } catch (err) {
      queryClient.clear();
    }
  };

  const navigate = (view: View) => {
    onNavigate(view);
    onClose?.();
  };

  const studentNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'submit', label: 'Submit Complaint', icon: <FilePlus className="w-4 h-4" /> },
    { id: 'track', label: 'Track Complaints', icon: <FileSearch className="w-4 h-4" /> },
    { id: 'chatbot', label: 'AI Assistant', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  const staffNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'staff-complaints', label: 'Department Complaints', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'staff-analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const hodNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'hod-complaints', label: 'Department Complaints', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'hod-analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'admin-complaints', label: 'All Complaints', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'admin-analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'admin-users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
    { id: 'admin-emergencies', label: 'Emergency Logs', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  const navItems =
    campusRole === 'admin'
      ? adminNav
      : campusRole === 'hod'
      ? hodNav
      : campusRole === 'staff'
      ? staffNav
      : studentNav;

  const roleIcon =
    campusRole === 'admin' ? (
      <Shield className="w-4 h-4" />
    ) : campusRole === 'staff' ? (
      <Briefcase className="w-4 h-4" />
    ) : (
      <GraduationCap className="w-4 h-4" />
    );

  return (
    <aside className="flex flex-col h-full bg-sidebar text-sidebar-foreground w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <img
          src="/assets/generated/campusvoice-logo.dim_256x256.png"
          alt="CampusVoice AI"
          className="w-9 h-9 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div>
          <p className="font-display font-bold text-base text-sidebar-foreground leading-tight">
            CampusVoice
          </p>
          <p className="text-xs text-sidebar-foreground/50 font-medium">AI System</p>
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary/20 flex items-center justify-center flex-shrink-0">
            {roleIcon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {extendedProfile?.displayName || 'User'}
            </p>
            {campusRole && (
              <Badge
                variant="secondary"
                className={`text-xs mt-0.5 ${CAMPUS_ROLE_COLORS[campusRole]}`}
              >
                {CAMPUS_ROLE_LABELS[campusRole]}
              </Badge>
            )}
          </div>
        </div>
        {extendedProfile?.department && (
          <p className="text-xs text-sidebar-foreground/50 mt-1.5 truncate pl-11">
            {extendedProfile.department}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`sidebar-nav-item w-full text-left ${currentView === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full text-left text-sidebar-foreground/60 hover:text-sidebar-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        <button
          onClick={() => setDeleteAccountOpen(true)}
          className="sidebar-nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        open={deleteAccountOpen}
        onOpenChange={setDeleteAccountOpen}
      />
    </aside>
  );
}
