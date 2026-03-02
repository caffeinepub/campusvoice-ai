import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { decodeUserProfile, getDisplayName, getCampusRole, getDepartment } from '../lib/userProfileHelpers';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
  getEmergencies,
  type EmergencyAlert,
} from '../lib/localComplaintStore';

export type CampusRole = 'student' | 'hod' | 'staff' | 'admin';

export interface ExtendedProfile {
  displayName: string;
  email: string;
  campusRole: CampusRole;
  department: string;
}

interface AppContextValue {
  // Profile
  extendedProfile: ExtendedProfile | null;
  campusRole: CampusRole | null;
  userProfile: { name: string; email: string } | null;
  isAuthenticated: boolean;
  isProfileLoading: boolean;
  isProfileFetched: boolean;
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  // Emergencies
  emergencies: EmergencyAlert[];
  activeEmergency: EmergencyAlert | null;
  setActiveEmergency: (alert: EmergencyAlert | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { identity } = useInternetIdentity();
  const { data: profileData, isLoading, isFetched } = useGetCallerUserProfile();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyAlert[]>([]);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyAlert | null>(null);
  const lastSeenEmergencyIdRef = useRef<string | null>(null);

  const isAuthenticated = !!identity;

  // Derive extended profile from backend profile data
  const extendedProfile: ExtendedProfile | null = profileData
    ? {
        displayName: getDisplayName(profileData.name),
        email: profileData.email,
        campusRole: getCampusRole(profileData.name),
        department: getDepartment(profileData.name) || '',
      }
    : null;

  const campusRole: CampusRole | null = extendedProfile?.campusRole ?? null;

  // Simple userProfile for components that just need name/email
  const userProfile = profileData
    ? { name: getDisplayName(profileData.name), email: profileData.email }
    : null;

  const refreshNotifications = useCallback(() => {
    setNotifications(getNotifications());
    const allEmergencies = getEmergencies();
    setEmergencies(allEmergencies);
  }, []);

  // Auto-surface latest unacknowledged emergency for HOD, Admin, Staff
  useEffect(() => {
    if (campusRole !== 'hod' && campusRole !== 'admin' && campusRole !== 'staff') return;

    const allEmergencies = getEmergencies();
    const latestUnacked = allEmergencies.find((e) => !e.acknowledged);

    if (latestUnacked && latestUnacked.id !== lastSeenEmergencyIdRef.current) {
      lastSeenEmergencyIdRef.current = latestUnacked.id;
      setActiveEmergency(latestUnacked);
    }
  }, [emergencies, campusRole]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 5000);
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
        userProfile,
        isAuthenticated,
        isProfileLoading: isLoading,
        isProfileFetched: isFetched,
        notifications,
        unreadCount,
        refreshNotifications,
        markRead,
        markAllRead,
        emergencies,
        activeEmergency,
        setActiveEmergency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
