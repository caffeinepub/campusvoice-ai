# Specification

## Summary
**Goal:** Fix the sign out functionality and ensure complaints are preserved when a user account is deleted.

**Planned changes:**
- Fix sign out logic in `AppHeader.tsx` and `AppSidebar.tsx` so that clicking sign out correctly terminates the Internet Identity session, clears app state (profile, notifications, role), and redirects to the landing page without errors.
- Update the backend account deletion logic in `backend/main.mo` to remove any cascade-delete behavior that deletes complaints when a user profile is removed, so complaints remain intact and visible to HOD/admin after the submitter's account is deleted.
- Update `DeleteAccountDialog.tsx` so that after account deletion, only profile-specific localStorage keys are cleared, while complaint metadata in `localComplaintStore` (categories, departments, media references, feedback) is preserved.

**User-visible outcome:** Users can sign out without errors and be redirected to the landing page. When a user deletes their account, all complaints they submitted remain visible and fully intact for HOD and admin roles.
