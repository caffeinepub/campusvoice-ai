import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Department {
    id: bigint;
    headOfDepartment?: Principal;
    name: string;
    description: string;
}
export type Time = bigint;
export interface Complaint {
    id: string;
    status: ComplaintStatus;
    studentId: Principal;
    createdAt: Time;
    description: string;
    priority: Priority;
}
export interface UserProfile {
    name: string;
    email: string;
    departmentId?: bigint;
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
    createComplaint(id: string, description: string, priority: Priority): Promise<void>;
    createDepartment(id: bigint, name: string, description: string, headOfDepartment: Principal | null): Promise<void>;
    deleteAccount(): Promise<string>;
    deleteDepartment(id: bigint): Promise<void>;
    findUsersByDepartmentId(departmentId: bigint | null): Promise<Array<UserProfile>>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintById(id: string): Promise<Complaint>;
    getComplaintsByDepartment(): Promise<Array<Complaint>>;
    getComplaintsByStatus(status: ComplaintStatus): Promise<Array<Complaint>>;
    getComplaintsByStudent(student: Principal): Promise<Array<Complaint>>;
    getDepartment(id: bigint): Promise<Department>;
    getDepartmentCount(): Promise<bigint>;
    getDepartmentsByHeadOfDepartment(head: Principal): Promise<Array<Department>>;
    getSortedComplaints(): Promise<Array<Complaint>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDepartments(): Promise<Array<Department>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateDepartment(id: bigint, name: string, description: string, headOfDepartment: Principal | null): Promise<void>;
    updateDepartmentComplaintStatus(id: string, newStatus: ComplaintStatus): Promise<void>;
}
