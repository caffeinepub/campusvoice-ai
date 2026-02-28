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

export const DEPARTMENTS = [
  // Computer Science & IT
  'B.Sc. - Computer Science',
  'BCA (Bachelor of Computer Applications)',
  'B.Sc. - Information Technology',
  'B.Sc. - Computer Technology',
  'B.Sc. - Data Science',
  'B.Sc. - Computer Science (AI & ML)',
  'B.Sc. - Computer Science (AI)',
  'B.Sc. - Computer Science (AI & Data Science)',
  'B.Sc. - Computer Science (Cyber Security)',
  'M.Sc. - Computer Science',
  // Life Sciences
  'B.Sc. - Biotechnology',
  'B.Sc. - Biochemistry',
  'B.Sc. - Microbiology',
  'B.Sc. - Zoology',
  'B.Sc. - Clinical Laboratory Technology',
  'M.Sc. - Biotechnology',
  'M.Sc. - Biochemistry',
  'M.Sc. - Microbiology',
  // Physical Sciences
  'B.Sc. - Physics',
  'B.Sc. - Chemistry',
  'B.Sc. - Mathematics',
  'B.Sc. - Statistics',
  'B.Sc. - Electronics & Communication',
  'B.Sc. - Internet of Things',
  'M.Sc. - Physics',
  'M.Sc. - Chemistry',
  'M.Sc. - Mathematics',
  // Commerce & Management
  'B.Com',
  'B.Com (CA)',
  'B.Com (PA)',
  'B.Com (IT)',
  'B.B.A.',
  'M.Com',
  // Arts & Humanities
  'B.A. - English',
  'B.Sc. - Hotel Management & Catering Science',
  'B.Sc. - Textile and Fashion Design',
  'M.A. - English',
] as const;

export type Department = (typeof DEPARTMENTS)[number];
