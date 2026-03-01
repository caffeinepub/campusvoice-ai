# Specification

## Summary
**Goal:** Add a permanent account deletion feature to CampusVoice AI, allowing authenticated users to irreversibly delete their own account.

**Planned changes:**
- Add a `deleteAccount` backend function that verifies the caller's identity, removes their profile from canister state, and returns a success/error result
- Add a "Delete Account" button in the user profile menu or settings area in the frontend
- Clicking the button opens a confirmation dialog (using existing Shadcn UI alert-dialog) warning that the action is permanent and cannot be undone
- On confirmation, call the backend `deleteAccount` function, clear all user-related localStorage keys, log the user out via Internet Identity, and redirect to the landing page
- If the backend call fails, display an error message and abort deletion

**User-visible outcome:** Users can permanently delete their own account from the profile/settings area. After confirming the action in a warning dialog, their account is removed, they are logged out, and redirected to the landing page.
