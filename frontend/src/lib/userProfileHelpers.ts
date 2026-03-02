// Extended user profile stored in ICP backend
// We encode campus-specific fields (role, department) into the name field
// Format: "DisplayName|role:student|dept:B.Sc. - Computer Science"

import type { UserProfile } from '../backend';

export type CampusRole = 'student' | 'staff' | 'hod' | 'admin';

export interface ExtendedProfile {
  displayName: string;
  email: string;
  campusRole: CampusRole;
  department: string;
}

export interface UserProfileData {
  name: string;
  role: CampusRole;
  department?: string;
}

export function encodeProfile(profile: ExtendedProfile): UserProfile {
  const encoded = `${profile.displayName}|role:${profile.campusRole}|dept:${profile.department}`;
  return { name: encoded, email: profile.email };
}

export function decodeProfile(profile: UserProfile): ExtendedProfile {
  const parts = profile.name.split('|');
  const displayName = parts[0] || profile.name;

  let campusRole: CampusRole = 'student';
  let department = '';

  for (const part of parts.slice(1)) {
    if (part.startsWith('role:')) {
      const r = part.slice(5) as CampusRole;
      if (['student', 'hod', 'staff', 'admin'].includes(r)) {
        campusRole = r;
      }
    } else if (part.startsWith('dept:')) {
      department = part.slice(5);
    }
  }

  return { displayName, email: profile.email, campusRole, department };
}

/**
 * Encodes user profile data into a pipe-delimited string for storage in the backend.
 * Format: "Name|role:ROLE|dept:DEPARTMENT"
 */
export function encodeUserProfile(data: UserProfileData): string {
  return `${data.name.trim()}|role:${data.role}|dept:${data.department?.trim() || ''}`;
}

/**
 * Decodes a pipe-delimited profile name string back into structured data.
 */
export function decodeUserProfile(encodedName: string): UserProfileData {
  const parts = encodedName.split('|');
  const name = parts[0] || '';
  let role: CampusRole = 'student';
  let department: string | undefined;

  for (const part of parts.slice(1)) {
    if (part.startsWith('role:')) {
      const r = part.slice(5) as CampusRole;
      if (['student', 'hod', 'staff', 'admin'].includes(r)) {
        role = r;
      }
    } else if (part.startsWith('dept:')) {
      const d = part.slice(5);
      if (d) department = d;
    }
  }

  return { name, role, department };
}

/**
 * Extracts the display name (first part before pipe) from an encoded profile name.
 */
export function getDisplayName(encodedName: string): string {
  return encodedName.split('|')[0] || encodedName;
}

/**
 * Extracts the campus role from an encoded profile name.
 */
export function getCampusRole(encodedName: string): CampusRole {
  const parts = encodedName.split('|');
  for (const part of parts.slice(1)) {
    if (part.startsWith('role:')) {
      const r = part.slice(5) as CampusRole;
      if (['student', 'hod', 'staff', 'admin'].includes(r)) return r;
    }
  }
  return 'student';
}

/**
 * Extracts the department from an encoded profile name.
 */
export function getDepartment(encodedName: string): string | undefined {
  const parts = encodedName.split('|');
  for (const part of parts.slice(1)) {
    if (part.startsWith('dept:')) {
      const d = part.slice(5);
      if (d) return d;
    }
  }
  return undefined;
}
