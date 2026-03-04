// NOTE: The DEPARTMENTS array below is deprecated.
// Departments are now fetched dynamically from the backend via the `listDepartments` method.
// Use the `useListDepartments` hook from `hooks/useQueries.ts` to get the live department list.

export const COMPLAINT_CATEGORIES = [
  // Academic
  'Faculty Issues',
  'Internal Marks / Grading Issues',
  'Exam & Hall Ticket Issues',
  'Attendance Problems',
  'Assignment / Submission Issues',
  'Timetable Problems',
  // Infrastructure
  'Classroom Maintenance',
  'Electricity / Fan / AC Issues',
  'Water Supply Problems',
  'Washroom Maintenance',
  'WiFi / Internet Issues',
  // Facilities
  'Library Related Issues',
  'Laboratory Equipment Issues',
  'Hostel Room Maintenance',
  'Food Quality Issues',
  'Cleanliness Issues',
  'Water Problems in Hostel',
  'Mess Timing Issues',
  // Digital
  'Website Login Problems',
  'Portal Errors',
  'ID Card Issues',
  'Online Fee Payment Issues',
  // Safety & Conduct
  'Ragging Complaint',
  'Harassment Complaint',
  'Security Issues',
  'Misbehavior Complaint',
  // Administrative
  'Scholarship Issues',
  'Fee Payment Problems',
  'Refund Related Issues',
  // Transport
  'Bus Timing Issues',
  'Driver Behavior Complaint',
  'Route Problems',
  // General
  'Suggestion / Feedback',
  'Other Complaints',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export const SENSITIVE_CATEGORIES: ComplaintCategory[] = [
  'Ragging Complaint',
  'Harassment Complaint',
  'Misbehavior Complaint',
];

export const CATEGORY_GROUPS: Record<string, ComplaintCategory[]> = {
  Academic: [
    'Faculty Issues',
    'Internal Marks / Grading Issues',
    'Exam & Hall Ticket Issues',
    'Attendance Problems',
    'Assignment / Submission Issues',
    'Timetable Problems',
  ],
  Infrastructure: [
    'Classroom Maintenance',
    'Electricity / Fan / AC Issues',
    'Water Supply Problems',
    'Washroom Maintenance',
    'WiFi / Internet Issues',
  ],
  Facilities: [
    'Library Related Issues',
    'Laboratory Equipment Issues',
    'Hostel Room Maintenance',
    'Food Quality Issues',
    'Cleanliness Issues',
    'Water Problems in Hostel',
    'Mess Timing Issues',
  ],
  Digital: ['Website Login Problems', 'Portal Errors', 'ID Card Issues', 'Online Fee Payment Issues'],
  'Safety & Conduct': ['Ragging Complaint', 'Harassment Complaint', 'Security Issues', 'Misbehavior Complaint'],
  Administrative: ['Scholarship Issues', 'Fee Payment Problems', 'Refund Related Issues'],
  Transport: ['Bus Timing Issues', 'Driver Behavior Complaint', 'Route Problems'],
  General: ['Suggestion / Feedback', 'Other Complaints'],
};

/**
 * @deprecated Use `useListDepartments` hook to fetch departments from the backend.
 * Department data is now managed in the backend and queried via the `listDepartments` endpoint.
 * This static list is kept for reference only and should not be used in new code.
 */
export const DEPARTMENTS = [
  // Computer Science Faculty (UG)
  'B.Sc. - Computer Science',
  'BCA (Bachelor of Computer Applications)',
  'B.Sc. - Information Technology',
  'B.Sc. - Computer Technology',
  'B.Sc. - Data Science',
  'B.Sc. - Computer Science(AI & ML)',
  'B.Sc. - Computer Science(AI)',
  'B.Sc. - Computer Science(AI & Data Science)',
  'B.Sc. - Computer Science(Cyber Security)',
  // Computer Science Faculty (PG)
  'M.Sc. - Computer Science',
  // Life Sciences Faculty (UG)
  'B.Sc. - Biotechnology',
  'B.Sc. - Biochemistry',
  'B.Sc. - Microbiology',
  'B.Sc. - Zoology',
  'B.Sc. - Clinical Laboratory Technology',
  // Life Sciences Faculty (PG)
  'M.Sc. - Biotechnology',
  'M.Sc. - Biochemistry',
  'M.Sc. – Microbiology',
  // Physical Sciences Faculty (UG)
  'B.Sc. - Physics',
  'B.Sc. - Chemistry',
  'B.Sc. - Mathematics',
  'B.Sc. - Statistics',
  'B.Sc. - Electronics & Communication',
  'B.Sc. - Internet of Things',
  // Physical Sciences Faculty (PG)
  'M.Sc - Physics',
  'M.Sc. - Chemistry',
  'M.Sc. - Mathematics',
  // Commerce & Management Faculty (UG)
  'B.Com',
  'B.Com (CA)',
  'B.Com (PA)',
  'B.Com (IT)',
  'B.B.A.',
  // Commerce & Management Faculty (PG)
  'M.Com',
  // Arts & Applied Sciences Faculty (UG)
  'B.A. - English',
  'B.Sc. - Hotel Management & Catering Science',
  'B.Sc. - Textile and Fashion Design',
  // Arts & Applied Sciences Faculty (PG)
  'M.A., - English',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
