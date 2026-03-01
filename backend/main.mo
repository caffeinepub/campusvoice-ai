import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Int "mo:core/Int";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Option "mo:core/Option";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

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

  let complaints = Map.empty<Text, Complaint>();

  // Authentication system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    email : Text;
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

  /// Admin-only: view every complaint in the system.
  public query ({ caller }) func getAllComplaints() : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all complaints");
    };
    complaints.values().toArray();
  };

  /// Authenticated users only: submit a new complaint on behalf of themselves.
  /// The studentId is taken from the caller principal, not a parameter, so a
  /// user cannot file a complaint under someone else's identity.
  public shared ({ caller }) func createComplaint(
    id : Text,
    description : Text,
    priority : Priority,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create complaints");
    };
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

  /// Admins can update any complaint status; a student can only update their own.
  public shared ({ caller }) func updateComplaintStatus(id : Text, newStatus : ComplaintStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to update complaints");
    };
    switch (complaints.get(id)) {
      case (null) { Runtime.trap("Complaint not found") };
      case (?complaint) {
        // Non-admins may only touch their own complaints.
        if (complaint.studentId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot update another user's complaint");
        };
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

  /// Authenticated users can fetch a complaint they own; admins can fetch any.
  public query ({ caller }) func getComplaintById(id : Text) : async Complaint {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to view complaints");
    };
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

  /// Returns all complaints belonging to the caller.
  /// Admins may pass any principal; regular users may only query themselves.
  public query ({ caller }) func getComplaintsByStudent(student : Principal) : async [Complaint] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to view complaints");
    };
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

  /// Admin-only: filter complaints by status.
  public query ({ caller }) func getComplaintsByStatus(status : ComplaintStatus) : async [Complaint] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter complaints by status");
    };
    complaints.values().toArray().filter(func(c : Complaint) : Bool { c.status == status });
  };
};
