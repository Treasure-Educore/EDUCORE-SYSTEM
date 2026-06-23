const STAFF_STORAGE_KEY = "educore.staff.members";
const DEPARTMENTS_STORAGE_KEY = "educore.staff.departments";

export const staffTypeLabels = {
  teacher: "Teacher",
  "non-teaching": "Administrator",
};

export const primaryRoleOptions = [
  "Teacher",
  "Class Teacher",
  "Head of Department",
  "Deputy Head Teacher",
  "Director of Studies",
  "Games Teacher",
  "Accountant",
  "Librarian",
  "Secretary",
  "Nurse",
  "ICT Administrator",
];

export const secondaryRoleOptions = [
  "Class Teacher",
  "Head of Department",
  "Deputy Head Teacher",
  "Director of Studies",
  "Games Teacher",
  "Accountant",
  "Librarian",
  "Secretary",
  "Nurse",
  "ICT Administrator",
];

export const teacherDepartments = ["Mathematics", "Sciences", "Languages", "Humanities", "ICT", "Administration"];

export const nonTeachingPositions = [
  "Secretary",
  "Accountant",
  "Librarian",
  "Nurse",
  "Storekeeper",
  "Security Officer",
  "Cleaner",
  "Driver",
  "ICT Officer",
];

const seedDepartments = [
  { id: "DEP-MATH", name: "Mathematics", headOfDepartment: "EMP001", description: "Mathematics and numeracy programmes" },
  { id: "DEP-SCI", name: "Sciences", headOfDepartment: "EMP002", description: "Biology, Chemistry, and Physics" },
  { id: "DEP-LANG", name: "Languages", headOfDepartment: "EMP003", description: "English, Literature, and communication" },
  { id: "DEP-HUM", name: "Humanities", headOfDepartment: "EMP004", description: "History, Geography, and social studies" },
  { id: "DEP-ICT", name: "ICT", headOfDepartment: "EMP005", description: "Digital learning and systems support" },
  { id: "DEP-ADM", name: "Administration", headOfDepartment: "EMP006", description: "Records, finance, and operations" },
];

const seedStaff = [
  {
    id: "EMP001",
    employeeNumber: "EMP001",
    firstName: "John",
    lastName: "Doe",
    gender: "Male",
    dateOfBirth: "1985-04-12",
    nationalId: "CM123456789",
    phoneNumber: "+256 700 200 101",
    email: "john.doe@educore.ac.ug",
    address: "Kampala, Uganda",
    dateOfEmployment: "2018-01-10",
    profilePhoto: "",
    staffType: "teacher",
    subjectsTaught: ["Mathematics", "Physics"],
    department: "Sciences",
    qualification: "BSc. Education",
    classAssigned: "Grade 6A",
    assignedClasses: ["Grade 6A"],
    primaryRole: "Teacher",
    additionalRoles: ["Class Teacher", "Head of Department"],
    status: "active",
  },
  {
    id: "EMP002",
    employeeNumber: "EMP002",
    firstName: "Grace",
    lastName: "Nabwire",
    gender: "Female",
    dateOfBirth: "1989-08-24",
    nationalId: "CM987654321",
    phoneNumber: "+256 700 200 102",
    email: "grace.nabwire@educore.ac.ug",
    address: "Jinja, Uganda",
    dateOfEmployment: "2020-02-03",
    profilePhoto: "",
    staffType: "teacher",
    subjectsTaught: ["Biology", "Chemistry"],
    department: "Sciences",
    qualification: "MSc. Biology Education",
    classAssigned: "Grade 7B",
    assignedClasses: ["Grade 7B"],
    primaryRole: "Teacher",
    additionalRoles: ["Head of Department"],
    status: "active",
  },
  {
    id: "EMP003",
    employeeNumber: "EMP003",
    firstName: "Samuel",
    lastName: "Kato",
    gender: "Male",
    dateOfBirth: "1990-01-18",
    nationalId: "CM112233445",
    phoneNumber: "+256 700 200 103",
    email: "samuel.kato@educore.ac.ug",
    address: "Masaka, Uganda",
    dateOfEmployment: "2019-06-14",
    profilePhoto: "",
    staffType: "teacher",
    subjectsTaught: ["English", "Literature"],
    department: "Languages",
    qualification: "BA. English Education",
    classAssigned: "Grade 5A",
    assignedClasses: ["Grade 5A", "Grade 5B"],
    primaryRole: "Teacher",
    additionalRoles: ["Class Teacher"],
    status: "active",
  },
  {
    id: "EMP004",
    employeeNumber: "EMP004",
    firstName: "Helen",
    lastName: "Achieng",
    gender: "Female",
    dateOfBirth: "1987-10-09",
    nationalId: "CM556677889",
    phoneNumber: "+256 700 200 104",
    email: "helen.achieng@educore.ac.ug",
    address: "Mbale, Uganda",
    dateOfEmployment: "2021-03-21",
    profilePhoto: "",
    staffType: "non-teaching",
    position: "Secretary",
    department: "Administration",
    qualification: "Diploma in Secretarial Studies",
    primaryRole: "Secretary",
    additionalRoles: [],
    status: "active",
  },
  {
    id: "EMP005",
    employeeNumber: "EMP005",
    firstName: "Peter",
    lastName: "Mubiru",
    gender: "Male",
    dateOfBirth: "1982-12-30",
    nationalId: "CM667788990",
    phoneNumber: "+256 700 200 105",
    email: "peter.mubiru@educore.ac.ug",
    address: "Wakiso, Uganda",
    dateOfEmployment: "2017-09-11",
    profilePhoto: "",
    staffType: "teacher",
    subjectsTaught: ["ICT"],
    department: "ICT",
    qualification: "BSc. Computer Science",
    classAssigned: "",
    assignedClasses: [],
    primaryRole: "ICT Administrator",
    additionalRoles: ["Class Teacher"],
    status: "inactive",
  },
  {
    id: "EMP006",
    employeeNumber: "EMP006",
    firstName: "Martha",
    lastName: "Nabirye",
    gender: "Female",
    dateOfBirth: "1992-07-07",
    nationalId: "CM123123123",
    phoneNumber: "+256 700 200 106",
    email: "martha.nabirye@educore.ac.ug",
    address: "Mukono, Uganda",
    dateOfEmployment: "2022-05-02",
    profilePhoto: "",
    staffType: "non-teaching",
    position: "Accountant",
    department: "Administration",
    qualification: "CPA",
    primaryRole: "Accountant",
    additionalRoles: [],
    status: "active",
  },
];

function safeRead(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures so the mock UI keeps working.
  }
}

function safeRemove(key) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures so the mock UI keeps working.
  }
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return [];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortByEmployeeNumber(left, right) {
  return left.employeeNumber.localeCompare(right.employeeNumber, undefined, { numeric: true, sensitivity: "base" });
}

export function loadDepartments() {
  const raw = safeRead(DEPARTMENTS_STORAGE_KEY);
  if (!raw) {
    return clone(seedDepartments);
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : clone(seedDepartments);
  } catch {
    return clone(seedDepartments);
  }
}

export function saveDepartments(departments) {
  safeWrite(DEPARTMENTS_STORAGE_KEY, JSON.stringify(departments));
}

export function clearDepartments() {
  safeRemove(DEPARTMENTS_STORAGE_KEY);
}

export function loadStaffMembers() {
  const raw = safeRead(STAFF_STORAGE_KEY);
  if (!raw) {
    return clone(seedStaff).sort(sortByEmployeeNumber);
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.sort(sortByEmployeeNumber) : clone(seedStaff).sort(sortByEmployeeNumber);
  } catch {
    return clone(seedStaff).sort(sortByEmployeeNumber);
  }
}

export function saveStaffMembers(staffMembers) {
  const next = clone(staffMembers).sort(sortByEmployeeNumber);
  safeWrite(STAFF_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearStaffMembers() {
  safeRemove(STAFF_STORAGE_KEY);
}

export function getStaffMemberById(staffId) {
  return loadStaffMembers().find((staff) => staff.id === staffId) || null;
}

export function getNextEmployeeNumber(staffMembers = loadStaffMembers()) {
  const highest = staffMembers.reduce((max, staff) => {
    const match = String(staff.employeeNumber || staff.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `EMP${String(highest + 1).padStart(3, "0")}`;
}

export function getStaffType(staff) {
  if (staff?.staffType) return staff.staffType;
  if (staff?.position) return "non-teaching";
  return "teacher";
}

export function normalizeStaffRecord(input, existingStaff = null, staffMembers = loadStaffMembers()) {
  const roleList = normalizeList(input.additionalRoles);
  const staffType = input.staffType || getStaffType(existingStaff) || "teacher";
  const currentEmployeeNumber = existingStaff?.employeeNumber || existingStaff?.id || getNextEmployeeNumber(staffMembers);
  const nextStaff = {
    ...(existingStaff || {}),
    id: existingStaff?.id || currentEmployeeNumber,
    employeeNumber: existingStaff?.employeeNumber || currentEmployeeNumber,
    firstName: String(input.firstName || "").trim(),
    lastName: String(input.lastName || "").trim(),
    gender: String(input.gender || "").trim(),
    dateOfBirth: input.dateOfBirth || "",
    nationalId: String(input.nationalId || "").trim(),
    phoneNumber: String(input.phoneNumber || "").trim(),
    email: String(input.email || "").trim(),
    address: String(input.address || "").trim(),
    dateOfEmployment: input.dateOfEmployment || "",
    profilePhoto: String(input.profilePhoto || "").trim(),
    staffType,
    subjectsTaught: normalizeList(input.subjectsTaught),
    department: String(input.department || "").trim(),
    qualification: String(input.qualification || "").trim(),
    classAssigned: String(input.classAssigned || "").trim(),
    assignedClasses: normalizeList(input.assignedClasses),
    position: String(input.position || "").trim(),
    primaryRole: String(input.primaryRole || (staffType === "teacher" ? "Teacher" : "Secretary")).trim(),
    additionalRoles: roleList,
    status: String(input.status || "active").trim().toLowerCase() === "inactive" ? "inactive" : "active",
  };

  if (nextStaff.staffType === "teacher") {
    nextStaff.position = "";
  } else {
    nextStaff.subjectsTaught = [];
    nextStaff.classAssigned = "";
    nextStaff.assignedClasses = [];
  }

  if (!nextStaff.classAssigned && nextStaff.assignedClasses.length) {
    nextStaff.classAssigned = nextStaff.assignedClasses[0];
  }

  return nextStaff;
}

function ensureUniqueClassTeacherAssignments(nextStaff, staffMembers, existingId = null) {
  const classTeacherRequested =
    nextStaff.primaryRole === "Class Teacher" || nextStaff.additionalRoles.includes("Class Teacher") || nextStaff.assignedClasses.length > 0;

  if (!classTeacherRequested || nextStaff.staffType !== "teacher") {
    return;
  }

  const duplicateClasses = nextStaff.assignedClasses.filter((className) =>
    staffMembers.some((staff) => {
      if (staff.id === existingId) return false;
      const isClassTeacher =
        staff.primaryRole === "Class Teacher" || normalizeList(staff.additionalRoles).includes("Class Teacher") || normalizeList(staff.assignedClasses).length > 0;
      return isClassTeacher && normalizeList(staff.assignedClasses).includes(className);
    }),
  );

  if (duplicateClasses.length > 0) {
    throw new Error(`Class teacher already assigned for: ${duplicateClasses.join(", ")}.`);
  }
}

export function upsertStaffMember(input, existingStaff = null) {
  const staffMembers = loadStaffMembers();
  const normalized = normalizeStaffRecord(input, existingStaff, staffMembers);
  ensureUniqueClassTeacherAssignments(normalized, staffMembers, existingStaff?.id || null);

  const index = staffMembers.findIndex((staff) => staff.id === normalized.id);
  if (index >= 0) {
    staffMembers[index] = normalized;
  } else {
    staffMembers.push(normalized);
  }

  saveStaffMembers(staffMembers);
  return normalized;
}

export function deleteStaffMember(staffId) {
  const next = loadStaffMembers().filter((staff) => staff.id !== staffId);
  saveStaffMembers(next);
  return next;
}

export function toggleStaffStatus(staffId) {
  const staffMembers = loadStaffMembers();
  const next = staffMembers.map((staff) =>
    staff.id === staffId
      ? {
          ...staff,
          status: staff.status === "active" ? "inactive" : "active",
        }
      : staff,
  );
  saveStaffMembers(next);
  return next.find((staff) => staff.id === staffId) || null;
}

export function getDepartmentMembers(departmentName) {
  return loadStaffMembers().filter((staff) => staff.department === departmentName);
}

export function upsertDepartment(input, existingDepartment = null) {
  const departments = loadDepartments();
  const normalized = {
    ...(existingDepartment || {}),
    id: existingDepartment?.id || `DEP-${String(input.name || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 8) || "NEW"}`,
    name: String(input.name || "").trim(),
    headOfDepartment: String(input.headOfDepartment || "").trim(),
    description: String(input.description || "").trim(),
  };

  const index = departments.findIndex((department) => department.id === normalized.id);
  if (index >= 0) {
    departments[index] = normalized;
  } else {
    departments.push(normalized);
  }

  saveDepartments(departments);
  return normalized;
}

export function deleteDepartment(departmentId) {
  const next = loadDepartments().filter((department) => department.id !== departmentId);
  saveDepartments(next);
  return next;
}

export function clearStaffStore() {
  clearStaffMembers();
  clearDepartments();
}
