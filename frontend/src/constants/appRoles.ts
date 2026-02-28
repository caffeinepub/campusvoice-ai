// Campus-specific roles stored in user profile
export type CampusRole = 'student' | 'staff' | 'hod' | 'admin';

export const CAMPUS_ROLE_LABELS: Record<CampusRole, string> = {
  student: 'Student',
  staff: 'Staff',
  hod: 'Head of Department (HOD)',
  admin: 'Administrator',
};

export const CAMPUS_ROLE_COLORS: Record<CampusRole, string> = {
  student: 'bg-blue-100 text-blue-800',
  staff: 'bg-purple-100 text-purple-800',
  hod: 'bg-amber-100 text-amber-800',
  admin: 'bg-red-100 text-red-800',
};
