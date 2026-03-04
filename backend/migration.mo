import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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

  type UserProfile = {
    name : Text;
    email : Text;
    departmentId : ?Nat;
  };

  type OldActor = {
    complaints : Map.Map<Text, Complaint>;
    departments : Map.Map<Nat, Department>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type NewActor = OldActor;

  public func run(_old : OldActor) : NewActor {
    // Reset departments to predefined initial list on upgrade
    let departments = Map.empty<Nat, Department>();

    let initialDepartments = [
      // Computer Science Faculty (UG)
      (1, { id = 1; name = "B.Sc. - Computer Science"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (2, { id = 2; name = "BCA (Bachelor of Computer Applications)"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (3, { id = 3; name = "B.Sc. - Information Technology"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (4, { id = 4; name = "B.Sc. - Computer Technology"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (5, { id = 5; name = "B.Sc. - Data Science"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (6, { id = 6; name = "B.Sc. - Computer Science(AI & ML)"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (7, { id = 7; name = "B.Sc. - Computer Science(AI)"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (8, { id = 8; name = "B.Sc. - Computer Science(AI & Data Science)"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),
      (9, { id = 9; name = "B.Sc. - Computer Science(Cyber Security)"; description = "Computer Science Faculty – UG"; headOfDepartment = null }),

      // Computer Science Faculty (PG)
      (10, { id = 10; name = "M.Sc. - Computer Science"; description = "Computer Science Faculty – PG"; headOfDepartment = null }),

      // Life Sciences Faculty (UG)
      (11, { id = 11; name = "B.Sc. - Biotechnology"; description = "Life Sciences Faculty – UG"; headOfDepartment = null }),
      (12, { id = 12; name = "B.Sc. - Biochemistry"; description = "Life Sciences Faculty – UG"; headOfDepartment = null }),
      (13, { id = 13; name = "B.Sc. - Microbiology"; description = "Life Sciences Faculty – UG"; headOfDepartment = null }),
      (14, { id = 14; name = "B.Sc. - Zoology"; description = "Life Sciences Faculty – UG"; headOfDepartment = null }),
      (15, { id = 15; name = "B.Sc. - Clinical Laboratory Technology"; description = "Life Sciences Faculty – UG"; headOfDepartment = null }),

      // Life Sciences Faculty (PG)
      (16, { id = 16; name = "M.Sc. - Biotechnology"; description = "Life Sciences Faculty – PG"; headOfDepartment = null }),
      (17, { id = 17; name = "M.Sc. - Biochemistry"; description = "Life Sciences Faculty – PG"; headOfDepartment = null }),
      (18, { id = 18; name = "M.Sc. – Microbiology"; description = "Life Sciences Faculty – PG"; headOfDepartment = null }),

      // Physical Sciences Faculty (UG)
      (19, { id = 19; name = "B.Sc. - Physics"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),
      (20, { id = 20; name = "B.Sc. - Chemistry"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),
      (21, { id = 21; name = "B.Sc. - Mathematics"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),
      (22, { id = 22; name = "B.Sc. - Statistics"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),
      (23, { id = 23; name = "B.Sc. - Electronics & Communication"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),
      (24, { id = 24; name = "B.Sc. - Internet of Things"; description = "Physical Sciences Faculty – UG"; headOfDepartment = null }),

      // Physical Sciences Faculty (PG)
      (25, { id = 25; name = "M.Sc - Physics"; description = "Physical Sciences Faculty – PG"; headOfDepartment = null }),
      (26, { id = 26; name = "M.Sc. - Chemistry"; description = "Physical Sciences Faculty – PG"; headOfDepartment = null }),
      (27, { id = 27; name = "M.Sc. - Mathematics"; description = "Physical Sciences Faculty – PG"; headOfDepartment = null }),

      // Commerce & Management Faculty (UG)
      (28, { id = 28; name = "B.Com"; description = "Commerce & Management Faculty – UG"; headOfDepartment = null }),
      (29, { id = 29; name = "B.Com (CA)"; description = "Commerce & Management Faculty – UG"; headOfDepartment = null }),
      (30, { id = 30; name = "B.Com (PA)"; description = "Commerce & Management Faculty – UG"; headOfDepartment = null }),
      (31, { id = 31; name = "B.Com (IT)"; description = "Commerce & Management Faculty – UG"; headOfDepartment = null }),
      (32, { id = 32; name = "B.B.A."; description = "Commerce & Management Faculty – UG"; headOfDepartment = null }),

      // Commerce & Management Faculty (PG)
      (33, { id = 33; name = "M.Com"; description = "Commerce & Management Faculty – PG"; headOfDepartment = null }),

      // Arts & Applied Sciences Faculty (UG)
      (34, { id = 34; name = "B.A. - English"; description = "Arts & Applied Sciences Faculty – UG"; headOfDepartment = null }),
      (35, { id = 35; name = "B.Sc. - Hotel Management & Catering Science"; description = "Arts & Applied Sciences Faculty – UG"; headOfDepartment = null }),
      (36, { id = 36; name = "B.Sc. - Textile and Fashion Design"; description = "Arts & Applied Sciences Faculty – UG"; headOfDepartment = null }),

      // Arts & Applied Sciences Faculty (PG)
      (37, { id = 37; name = "M.A., - English"; description = "Arts & Applied Sciences Faculty – PG"; headOfDepartment = null })
    ];

    for ((id, department) in initialDepartments.values()) {
      departments.add(id, department);
    };

    {
      complaints = _old.complaints;
      departments;
      userProfiles = _old.userProfiles;
    };
  };
};
