import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Option "mo:core/Option";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

// Use migration logic specified in migration module
(with migration = Migration.run)
actor {
  type ComplaintStatus = { #registered; #inProgress; #resolved };
  type Priority = { #high; #medium; #low };
  type Complaint = {
    id : Text;
    studentId : Principal;
    description : Text;
    status : ComplaintStatus;
    priority : Priority;
    createdAt : Time.Time;
  };
  type Department = {
    id : Nat;
    name : Text;
    description : Text;
    headOfDepartment : ?Principal;
  };
  let complaints = Map.empty<Text, Complaint>();
  let departments = Map.empty<Nat, Department>();

  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
    departmentId : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // ── Profile endpoints ────────────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Admin-only: lists profiles of other users filtered by department
  public query ({ caller }) func findUsersByDepartmentId(departmentId : ?Nat) : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list users by department");
    };

    let usersArray = userProfiles.toArray();
    let users = usersArray.map(func((_, userProfile)) { userProfile });

    let matchingUsers = users.filter(
      func(user : UserProfile) : Bool {
        user.departmentId == departmentId;
      }
    );

    matchingUsers;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func deleteAccount() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete accounts");
    };
    switch (userProfiles.get(caller)) {
      case (null) {
        "Account already deleted or never existed";
      };
      case (?_) {
        userProfiles.remove(caller);
        "Account deleted successfully";
      };
    };
  };

  // ── Complaint endpoints ──────────────────────────────────────────────────────

  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all complaints");
    };
    complaints.values().toArray();
  };

  public query ({ caller }) func getComplaintsByDepartment() : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get complaints by department");
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        let complaintsArray = complaints.values().toArray();
        let userComplaints = complaintsArray.filter(
          func(complaint : Complaint) : Bool {
            switch (userProfiles.get(complaint.studentId)) {
              case (null) { false };
              case (?userProfile) {
                userProfile.departmentId == profile.departmentId;
              };
            };
          }
        );
        userComplaints;
      };
    };
  };

  public shared ({ caller }) func createComplaint(
    id : Text,
    description : Text,
    priority : Priority,
  ) : async () {
    validateAuthenticatedUser(caller);

    switch (complaints.get(id)) {
      case (?_) { Runtime.trap("Complaint already exists") };
      case (null) {
        let complaint : Complaint = {
          id;
          studentId = caller;
          description;
          status = #registered;
          priority;
          createdAt = Time.now();
        };
        complaints.add(id, complaint);
      };
    };
  };

  // Admin-only: updating complaint status is an administrative action
  public shared ({ caller }) func updateDepartmentComplaintStatus(id : Text, newStatus : ComplaintStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update complaint status");
    };

    switch (complaints.get(id)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) {
        let updatedComplaint : Complaint = {
          id = complaint.id;
          studentId = complaint.studentId;
          description = complaint.description;
          status = newStatus;
          priority = complaint.priority;
          createdAt = complaint.createdAt;
        };
        complaints.add(id, updatedComplaint);
      };
    };
  };

  public query ({ caller }) func getComplaintById(id : Text) : async Complaint {
    validateAuthenticatedUser(caller);

    switch (complaints.get(id)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) {
        if (complaint.studentId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot view another user's complaint");
        };
        complaint;
      };
    };
  };

  public query ({ caller }) func getComplaintsByStudent(student : Principal) : async [Complaint] {
    validateAuthenticatedUser(caller);

    if (caller != student and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view another user's complaints");
    };
    let result = List.empty<Complaint>();
    for ((_, complaint) in complaints.entries()) {
      if (complaint.studentId == student) {
        result.add(complaint);
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getComplaintsByStatus(status : ComplaintStatus) : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter complaints by status");
    };
    complaints.values().toArray().filter(func(c : Complaint) : Bool { c.status == status });
  };

  public query ({ caller }) func getSortedComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view sorted complaints");
    };
    let complaintsArray = complaints.values().toArray();

    let compareStatusThenTime = func(a : Complaint, b : Complaint) : Order.Order {
      let statusOrder = func(s : ComplaintStatus) : Int {
        switch (s) {
          case (#registered) { 1 };
          case (#inProgress) { 2 };
          case (#resolved) { 3 };
        };
      };

      let aStatusOrder = statusOrder(a.status);
      let bStatusOrder = statusOrder(b.status);

      if (aStatusOrder < bStatusOrder) {
        #less;
      } else if (aStatusOrder > bStatusOrder) {
        #greater;
      } else {
        Int.compare(a.createdAt, b.createdAt);
      };
    };

    complaintsArray.sort(compareStatusThenTime);
  };

  // ── Department endpoints ─────────────────────────────────────────────────────

  public shared ({ caller }) func createDepartment(
    id : Nat,
    name : Text,
    description : Text,
    headOfDepartment : ?Principal,
  ) : async () {
    validateAdminOnly(caller);

    let department : Department = {
      id;
      name;
      description;
      headOfDepartment;
    };
    departments.add(id, department);
  };

  public shared ({ caller }) func updateDepartment(
    id : Nat,
    name : Text,
    description : Text,
    headOfDepartment : ?Principal,
  ) : async () {
    validateAdminOnly(caller);

    switch (departments.get(id)) {
      case (null) { Runtime.trap("Department not found") };
      case (?_) {
        let updatedDepartment : Department = {
          id;
          name;
          description;
          headOfDepartment;
        };
        departments.add(id, updatedDepartment);
      };
    };
  };

  public shared ({ caller }) func deleteDepartment(id : Nat) : async () {
    validateAdminOnly(caller);

    switch (departments.get(id)) {
      case (null) { Runtime.trap("Department not found") };
      case (?_) {
        departments.remove(id);
      };
    };
  };

  // Authenticated users (students, staff, HOD) need to list departments for profile setup
  public query ({ caller }) func listDepartments() : async [Department] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can list departments");
    };
    departments.values().toArray();
  };

  // Authenticated users need to fetch a department for profile setup
  public query ({ caller }) func getDepartment(id : Nat) : async Department {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get a department");
    };
    switch (departments.get(id)) {
      case (null) { Runtime.trap("Department not found") };
      case (?department) { department };
    };
  };

  public query ({ caller }) func getDepartmentCount() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can get department count");
    };
    departments.size();
  };

  // Admin-only: exposes principal identifiers of HODs
  public query ({ caller }) func getDepartmentsByHeadOfDepartment(head : Principal) : async [Department] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can query departments by head");
    };
    let departmentsArray = departments.values().toArray();
    let departmentsByHead = departmentsArray.filter(
      func(department : Department) : Bool {
        switch (department.headOfDepartment) {
          case (null) { false };
          case (?hod) { hod == head };
        };
      }
    );
    departmentsByHead;
  };

  // Private helper functions
  func validateAdminOnly(caller : Principal) {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  func validateAuthenticatedUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can perform this action");
    };
  };
};
