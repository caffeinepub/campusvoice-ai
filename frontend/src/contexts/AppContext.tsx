import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { decodeProfile, type ExtendedProfile } from '../lib/userProfileHelpers';
import type { CampusRole } from '../constants/appRoles';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
  getEmergencies,
  type EmergencyAlert,
} from '../lib/localComplaintStore';

interface AppContextValue {
  extendedProfile: ExtendedProfile | null;
  campusRole: CampusRole | null;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  isProfileFetched: boolean;
  notifications: Notification[];
  unreadCount: number;
  emergencies: EmergencyAlert[];
  activeEmergency: EmergencyAlert | null;
  setActiveEmergency: (alert: EmergencyAlert | null) => void;
  refreshNotifications: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyAlert | null>(null);

  const isAuthenticated = !!identity;

  const extendedProfile = userProfile ? decodeProfile(userProfile) : null;
  const campusRole = extendedProfile?.campusRole || null;

  // Track the last seen emergency id to avoid re-triggering on the same alert
  const lastSeenEmergencyIdRef = useRef<string | null>(null);

  const refreshNotifications = useCallback(() => {
    setNotifications(getNotifications());
    const allEmergencies = getEmergencies();
    setEmergencies(allEmergencies);

    // Auto-surface the latest unacknowledged emergency for HOD and Admin
    // We use a ref to campusRole to avoid stale closure issues
    return allEmergencies;
  }, []);

  // Separate effect that reacts to emergencies + campusRole changes
  useEffect(() => {
    if (campusRole !== 'hod' && campusRole !== 'admin') return;

    const allEmergencies = getEmergencies();
    const latestUnacked = allEmergencies.find((e) => !e.acknowledged);

    if (latestUnacked && latestUnacked.id !== lastSeenEmergencyIdRef.current) {
      lastSeenEmergencyIdRef.current = latestUnacked.id;
      setActiveEmergency(latestUnacked);
    }
  }, [emergencies, campusRole]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(() => {
      refreshNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markRead = useCallback((id: string) => {
    markNotificationRead(id);
    refreshNotifications();
  }, [refreshNotifications]);

  const markAllRead = useCallback(() => {
    markAllNotificationsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        extendedProfile,
        campusRole,
        isAuthenticated,
        isProfileLoading: isLoading,
        isProfileFetched: isFetched,
        notifications,
        unreadCount,
        emergencies,
        activeEmergency,
        setActiveEmergency,
        refreshNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
