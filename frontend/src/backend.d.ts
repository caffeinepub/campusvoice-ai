import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    name: string;
    email: string;
}
export interface Complaint {
    id: string;
    status: ComplaintStatus;
    studentId: Principal;
    createdAt: Time;
    description: string;
    priority: Priority;
}
export enum ComplaintStatus {
    resolved = "resolved",
    inProgress = "inProgress",
    registered = "registered"
}
export enum Priority {
    low = "low",
    high = "high",
    medium = "medium"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Authenticated users only: submit a new complaint on behalf of themselves.
     * / The studentId is taken from the caller principal, not a parameter, so a
     * / user cannot file a complaint under someone else's identity.
     */
    createComplaint(id: string, description: string, priority: Priority): Promise<void>;
    deleteAccount(): Promise<string>;
    /**
     * / Admin-only: view every complaint in the system.
     */
    getAllComplaints(): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Authenticated users can fetch a complaint they own; admins can fetch any.
     */
    getComplaintById(id: string): Promise<Complaint>;
    /**
     * / Admin-only: filter complaints by status.
     */
    getComplaintsByStatus(status: ComplaintStatus): Promise<Array<Complaint>>;
    /**
     * / Returns all complaints belonging to the caller.
     * / Admins may pass any principal; regular users may only query themselves.
     */
    getComplaintsByStudent(student: Principal): Promise<Array<Complaint>>;
    /**
     * / Sort complaints by status and creation time, not just time.
     */
    getSortedComplaints(): Promise<Array<Complaint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Admins, HODs, and staff (all authenticated #user and #admin role holders)
     * / can update complaint statuses for complaints in their department.
     * / Guests are excluded. Only authenticated users (#user) and admins (#admin)
     * / are permitted, as the access control module supports #admin, #user, #guest.
     */
    updateDepartmentComplaintStatus(id: string, newStatus: ComplaintStatus): Promise<void>;
}
