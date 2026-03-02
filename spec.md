# Specification

## Summary
**Goal:** Add Admin and Staff portals to CampusVoice AI, giving each role its own login flow, dashboard, and navigation.

**Planned changes:**
- Add Admin and Staff role cards to the LandingPage alongside existing Student and HOD/Staff cards
- Create `AdminLoginFlow` component that stores `'admin'` as `pendingRole` in localStorage before triggering Internet Identity login
- Create `StaffLoginFlow` component that stores `'staff'` as `pendingRole` in localStorage before triggering Internet Identity login
- Build Admin Portal dashboard with system-wide complaint stats (total, pending, resolved, high-priority), full complaint list management (view/update status & priority for all departments), user management, emergency logs, and analytics pages
- Build Staff Portal dashboard with department-scoped complaint stats, ability to view and update complaint status for their department, and department-filtered analytics
- Update `AppSidebar` to render correct nav items for admin (Dashboard, Complaints, Analytics, User Management, Emergency Logs) and staff (Dashboard, Complaints, Analytics) roles
- Update `ProfileSetupModal` role dropdown to include `'admin'` and `'staff'` options, saved via the existing pipe-delimited encoding in `userProfileHelpers`
- Update backend to recognize `'staff'` as a valid role and permit staff to update complaint statuses for their department

**User-visible outcome:** Admins and staff members can log in via their own portal, access role-specific dashboards with relevant complaint data, and manage complaints within their scope of access.
