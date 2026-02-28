// Local storage layer for campus-specific complaint metadata
// (category, department, anonymous flag, media, feedback)
// The ICP backend stores core complaint data; this extends it locally.

export interface LocalComplaintMeta {
  id: string;
  category: string;
  department: string;
  isAnonymous: boolean;
  studentName: string;
  studentPrincipal: string;
  mediaItems: MediaItem[];
  feedback?: FeedbackData;
  aiEstimatedDays?: number;
  aiReasoning?: string;
  createdAt: number;
}

export interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'audio';
  name: string;
  dataUrl: string;
  size: number;
}

export interface FeedbackData {
  rating: number;
  comment: string;
  submittedAt: number;
}

const STORAGE_KEY = 'campusvoice_complaint_meta';

export function getAllLocalMeta(): Record<string, LocalComplaintMeta> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LocalComplaintMeta>) : {};
  } catch {
    return {};
  }
}

export function getLocalMeta(complaintId: string): LocalComplaintMeta | null {
  const all = getAllLocalMeta();
  return all[complaintId] || null;
}

export function saveLocalMeta(meta: LocalComplaintMeta): void {
  const all = getAllLocalMeta();
  all[meta.id] = meta;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updateLocalMeta(complaintId: string, updates: Partial<LocalComplaintMeta>): void {
  const all = getAllLocalMeta();
  if (all[complaintId]) {
    all[complaintId] = { ...all[complaintId], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

export function deleteLocalMeta(complaintId: string): void {
  const all = getAllLocalMeta();
  delete all[complaintId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// Emergency alerts stored locally for HOD/Admin
const EMERGENCY_KEY = 'campusvoice_emergencies';

export interface EmergencyAlert {
  id: string;
  studentName: string;
  studentPrincipal: string;
  department: string;
  location: string;
  timestamp: number;
  acknowledged: boolean;
}

export function getEmergencies(): EmergencyAlert[] {
  try {
    const raw = localStorage.getItem(EMERGENCY_KEY);
    return raw ? (JSON.parse(raw) as EmergencyAlert[]) : [];
  } catch {
    return [];
  }
}

export function addEmergency(alert: EmergencyAlert): void {
  const alerts = getEmergencies();
  alerts.unshift(alert);
  // Keep only last 50
  localStorage.setItem(EMERGENCY_KEY, JSON.stringify(alerts.slice(0, 50)));
}

export function acknowledgeEmergency(id: string): void {
  const alerts = getEmergencies();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx !== -1) {
    alerts[idx].acknowledged = true;
    localStorage.setItem(EMERGENCY_KEY, JSON.stringify(alerts));
  }
}

export function clearEmergencies(): void {
  localStorage.removeItem(EMERGENCY_KEY);
}

// Notifications
const NOTIF_KEY = 'campusvoice_notifications';

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
  complaintId?: string;
}

export function getNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    return raw ? (JSON.parse(raw) as Notification[]) : [];
  } catch {
    return [];
  }
}

export function addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  const notifs = getNotifications();
  notifs.unshift({
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
    read: false,
  });
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs.slice(0, 100)));
}

export function markNotificationRead(id: string): void {
  const notifs = getNotifications();
  const idx = notifs.findIndex((n) => n.id === id);
  if (idx !== -1) {
    notifs[idx].read = true;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
  }
}

export function markAllNotificationsRead(): void {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }));
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export function clearNotifications(): void {
  localStorage.removeItem(NOTIF_KEY);
}
