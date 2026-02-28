// Extended user profile stored in ICP backend
// We encode campus-specific fields (role, department) into the name field
// Format: "DisplayName|role:student|dept:B.Sc. - Computer Science"

import type { UserProfile } from '../backend';
import type { CampusRole } from '../constants/appRoles';

export interface ExtendedProfile {
  displayName: string;
  email: string;
  campusRole: CampusRole;
  department: string;
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
      campusRole = (part.slice(5) as CampusRole) || 'student';
    } else if (part.startsWith('dept:')) {
      department = part.slice(5);
    }
  }

  return { displayName, email: profile.email, campusRole, department };
}
