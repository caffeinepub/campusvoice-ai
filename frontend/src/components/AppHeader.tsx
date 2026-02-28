import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useAppContext } from '../contexts/AppContext';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, LogOut, User, AlertTriangle, ChevronDown, Menu, X } from 'lucide-react';
import { playConfirmationBeep, playEmergencySiren } from '../lib/audioService';
import {
  addEmergency,
  addNotification,
  type EmergencyAlert,
} from '../lib/localComplaintStore';
import { CAMPUS_ROLE_COLORS, CAMPUS_ROLE_LABELS } from '../constants/appRoles';
import { formatTimestamp } from '../lib/complaintHelpers';

interface AppHeaderProps {
  onMenuToggle?: () => void;
  sidebarOpen?: boolean;
}

export default function AppHeader({ onMenuToggle, sidebarOpen }: AppHeaderProps) {
  const { clear, identity } = useInternetIdentity();
  const { extendedProfile, campusRole, notifications, unreadCount, markRead, markAllRead, setActiveEmergency, refreshNotifications } = useAppContext();
  const queryClient = useQueryClient();

  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [location, setLocation] = useState('');
  const [emergencySent, setEmergencySent] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const handleEmergency = () => {
    if (!location.trim()) return;

    const alert: EmergencyAlert = {
      id: `emg-${Date.now()}`,
      studentName: extendedProfile?.displayName || 'Unknown Student',
      studentPrincipal: identity?.getPrincipal().toString() || '',
      department: extendedProfile?.department || 'Unknown',
      location: location.trim(),
      timestamp: Date.now(),
      acknowledged: false,
    };

    addEmergency(alert);
    addNotification({
      message: `🚨 Emergency alert sent from ${location}`,
      type: 'error',
    });

    // Play confirmation beep for student
    playConfirmationBeep();

    // Simulate alert to HOD/Admin (in real app, this would be via WebSocket)
    // For demo, we trigger the overlay for the current user if they're HOD/Admin
    if (campusRole === 'hod' || campusRole === 'admin') {
      setTimeout(() => {
        setActiveEmergency(alert);
        playEmergencySiren(5);
      }, 500);
    }

    refreshNotifications();
    setEmergencySent(true);
    setTimeout(() => {
      setEmergencyOpen(false);
      setEmergencySent(false);
      setLocation('');
    }, 2000);
  };

  const recentNotifs = notifications.slice(0, 8);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border flex items-center px-4 gap-3">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 flex-1">
        <img
          src="/assets/generated/campusvoice-logo.dim_256x256.png"
          alt="CampusVoice AI"
          className="w-8 h-8 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <span className="font-display font-bold text-lg text-foreground hidden sm:block">
          CampusVoice <span className="text-primary">AI</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Emergency Button - Students only */}
        {campusRole === 'student' && (
          <Button
            variant="destructive"
            size="sm"
            className="emergency-pulse gap-1.5 font-semibold"
            onClick={() => setEmergencyOpen(true)}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Emergency</span>
          </Button>
        )}

        {/* Notification Bell - HOD & Admin */}
        {(campusRole === 'hod' || campusRole === 'admin' || campusRole === 'staff') && (
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {recentNotifs.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                recentNotifs.map((notif) => (
                  <DropdownMenuItem
                    key={notif.id}
                    className={`flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markRead(notif.id)}
                  >
                    <span className="text-sm leading-snug">{notif.message}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.timestamp).toLocaleTimeString()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 max-w-[180px]">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden sm:block text-sm font-medium truncate">
                {extendedProfile?.displayName || 'User'}
              </span>
              {campusRole && (
                <Badge
                  variant="secondary"
                  className={`hidden md:flex text-xs ${CAMPUS_ROLE_COLORS[campusRole]}`}
                >
                  {CAMPUS_ROLE_LABELS[campusRole]}
                </Badge>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2 border-b">
              <p className="font-medium text-sm truncate">{extendedProfile?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{extendedProfile?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive gap-2 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Emergency Dialog */}
      <Dialog open={emergencyOpen} onOpenChange={setEmergencyOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Emergency Alert
            </DialogTitle>
            <DialogDescription>
              This will immediately alert the HOD and Admin. Please provide your current location.
            </DialogDescription>
          </DialogHeader>

          {emergencySent ? (
            <div className="py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-semibold text-green-700">Alert Sent Successfully!</p>
              <p className="text-sm text-muted-foreground mt-1">Help is on the way.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="location">Your Current Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Block A, Room 302, 3rd Floor"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmergency()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmergencyOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleEmergency}
                  disabled={!location.trim()}
                  className="gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Send Alert
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}
