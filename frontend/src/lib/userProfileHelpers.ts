// Extended user profile stored in ICP backend
// We encode campus-specific fields (role, department, departmentId) into the name field
// Format: "DisplayName|role:student|dept:B.Sc. - Computer Science|deptId:12345"

import type { UserProfile } from '../backend';

export type CampusRole = 'student' | 'staff' | 'hod' | 'admin';

export interface ExtendedProfile {
  displayName: string;
  email: string;
  campusRole: CampusRole;
  department: string;
  departmentId?: bigint;
}

export interface UserProfileData {
  name: string;
  role: CampusRole;
  department?: string;
  departmentId?: bigint;
}

export function encodeProfile(profile: ExtendedProfile): UserProfile {
  let encoded = `${profile.displayName}|role:${profile.campusRole}|dept:${profile.department}`;
  if (profile.departmentId !== undefined) {
    encoded += `|deptId:${profile.departmentId.toString()}`;
  }
  return { name: encoded, email: profile.email, departmentId: profile.departmentId };
}

export function decodeProfile(profile: UserProfile): ExtendedProfile {
  const parts = profile.name.split('|');
  const displayName = parts[0] || profile.name;

  let campusRole: CampusRole = 'student';
  let department = '';
  let departmentId: bigint | undefined = profile.departmentId;

  for (const part of parts.slice(1)) {
    if (part.startsWith('role:')) {
      const r = part.slice(5) as CampusRole;
      if (['student', 'hod', 'staff', 'admin'].includes(r)) {
        campusRole = r;
      }
    } else if (part.startsWith('dept:')) {
      department = part.slice(5);
    } else if (part.startsWith('deptId:')) {
      const idStr = part.slice(7);
      if (idStr) {
        try {
          departmentId = BigInt(idStr);
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  return { displayName, email: profile.email, campusRole, department, departmentId };
}

/**
 * Encodes user profile data into a pipe-delimited string for storage in the backend.
 * Format: "Name|role:ROLE|dept:DEPARTMENT|deptId:ID"
 */
export function encodeUserProfile(data: UserProfileData): string {
  let encoded = `${data.name.trim()}|role:${data.role}|dept:${data.department?.trim() || ''}`;
  if (data.departmentId !== undefined) {
    encoded += `|deptId:${data.departmentId.toString()}`;
  }
  return encoded;
}

/**
 * Decodes a pipe-delimited profile name string back into structured data.
 */
export function decodeUserProfile(encodedName: string): UserProfileData {
  const parts = encodedName.split('|');
  const name = parts[0] || '';
  let role: CampusRole = 'student';
  let department: string | undefined;
  let departmentId: bigint | undefined;

  for (const part of parts.slice(1)) {
    if (part.startsWith('role:')) {
      const r = part.slice(5) as CampusRole;
      if (['student', 'hod', 'staff', 'admin'].includes(r)) {
        role = r;
      }
    } else if (part.startsWith('dept:')) {
      const d = part.slice(5);
      if (d) department = d;
    } else if (part.startsWith('deptId:')) {
      const idStr = part.slice(7);
      if (idStr) {
        try {
          departmentId = BigInt(idStr);
        } catch {
          // ignore parse errors
        }
      }
    }
  }

  return { name, role, department, departmentId };
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

/**
 * Extracts the departmentId from an encoded profile name.
 */
export function getDepartmentId(encodedName: string): bigint | undefined {
  const parts = encodedName.split('|');
  for (const part of parts.slice(1)) {
    if (part.startsWith('deptId:')) {
      const idStr = part.slice(7);
      if (idStr) {
        try {
          return BigInt(idStr);
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}
