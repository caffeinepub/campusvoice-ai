# Specification

## Summary
**Goal:** Build CampusVoice AI, a full-stack campus complaint management system with role-based access, AI-powered complaint handling, real-time emergency alerts, and analytics dashboards.

**Planned changes:**

### Authentication & Roles
- Username/password login with four roles: Student, Staff, HOD, Admin
- Persistent session via localStorage; auto-logout if user no longer exists in DB
- Role-based dashboard routing; sensitive complaints (ragging, harassment) visible only to Admin and relevant HOD
- Log Out and Delete Account (with confirmation and cascading deletion) in sidebar

### Complaint Registration
- Form with text description, category (34 categories), priority (High/Medium/Low), anonymous toggle, and media uploads (multiple photos, videos, voice notes)
- Auto-calculated resolution deadline (High=1 day, Medium=3 days, Low=7 days)
- Auto-generated unique Complaint ID per submission
- AI (Gemini) auto-suggests category, priority, department assignment, and resolution time estimate from description
- Image uploads trigger Gemini AI analysis to detect visible issues

### Anonymous Complaint Mode
- Toggle on complaint form to hide student identity
- Staff and HOD see a placeholder instead of student name/ID
- Admin can view true identity of anonymous complaints

### Complaint Tracking & History
- Students view all their complaints with status (Registered → In Progress → Resolved) and full history
- PDF report download for complaint history
- Staff can update complaint status for their department

### Analytics Dashboard
- Bar chart (complaints by category), pie chart (status distribution), department-wise statistics
- Admin sees system-wide analytics; HOD sees department-level analytics

### Admin Dashboard
- View and filter all complaints by department, priority, date
- User management: view all users, delete individual accounts or bulk purge by role
- Emergency log management (view and delete)
- AI predictive analysis panel

### HOD Dashboard
- View all complaints in their department
- Escalate high-priority complaints
- Department resolution statistics and staff performance monitoring
- In-app notification on new complaint submission in their department

### Notifications
- In-app notifications for HOD (new department complaints) and Admin (all new complaints)
- Email notifications to students on complaint registration, status update, and resolution (Nodemailer/SMTP)

### Emergency Complaint Button
- Pulsing red button in header for logged-in students
- Clicking plays a confirmation beep (Web Audio API) and sends real-time Socket.io alert to all Admins and the student's HOD
- Receiving Admin/HOD sees full-screen flashing red overlay with student name and location, plus audible "Whoop" siren (5 seconds via Web Audio API)
- Overlay includes Acknowledge/Dismiss button; events logged with timestamp

### Feedback & Rating
- Star/numeric rating and text feedback for resolved complaints (student-submitted)
- Ratings visible to Admin and relevant HOD in complaint detail view

### AI Chatbot
- Floating chatbot widget on student dashboard powered by Gemini
- Handles complaint guidance, status tracking help, and FAQs
- Text-to-speech (TTS) button on chatbot responses

### Backend & Database (SQLite)
- Tables: Users, Departments, Complaints, Complaint_Media, Notifications, Feedback, Emergencies
- Departments pre-seeded with UG/PG programs (CS, BCA, IT, Data Science, Biotechnology, Physics, Commerce, Arts, etc.)
- Media stored as base64 in SQLite
- Cascading deletion on user removal
- Single Express server file with Socket.io

### UI/Design
- Campus-themed design: deep teal/navy palette with warm accents (no blue-purple)
- Card-based layouts, responsive for desktop and mobile
- Framer Motion page transitions and modal animations
- Consistent status badges (Registered, In Progress, Resolved) and priority indicators (High, Medium, Low)

**User-visible outcome:** Students can register, submit and track complaints (with media, AI assistance, and anonymous mode), trigger emergency alerts, rate resolutions, and use an AI chatbot. Staff update complaints; HODs and Admins manage, filter, and analyze all complaints through dedicated dashboards with real-time notifications and PDF reporting.
