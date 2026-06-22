const STORAGE_KEY = "educore.teachers";

export const teacherLeadershipOptions = ["Class Teacher", "Head of Department"];

export const teacherSeedRows = [
  {
    id: "T-01",
    name: "Dr. Miriam K.",
    firstName: "Miriam",
    lastName: "Kato",
    subject: "Mathematics",
    subjects: ["Mathematics"],
    className: "Senior 2",
    department: "Sciences",
    primaryRole: "Teacher",
    leadershipAssignments: ["Class Teacher", "Head of Department"],
    assignedClasses: ["Senior 2"],
    hodDepartment: "Sciences",
    qualification: "MEd. Mathematics",
    contact: "+256 700 111 234",
    email: "miriam.kato@educore.ac.ug",
    address: "Kampala, Uganda",
    dateOfEmployment: "2018-02-12",
    status: "Active",
  },
  {
    id: "T-02",
    name: "John Bosco",
    firstName: "John",
    lastName: "Bosco",
    subject: "English",
    subjects: ["English"],
    className: "Primary 6",
    department: "Languages",
    primaryRole: "Teacher",
    leadershipAssignments: ["Class Teacher"],
    assignedClasses: ["Primary 6"],
    hodDepartment: "",
    qualification: "BA. English Education",
    contact: "+256 700 111 235",
    email: "john.bosco@educore.ac.ug",
    address: "Jinja, Uganda",
    dateOfEmployment: "2019-09-04",
    status: "In Class",
  },
  {
    id: "T-03",
    name: "Lydia Namara",
    firstName: "Lydia",
    lastName: "Namara",
    subject: "Biology",
    subjects: ["Biology"],
    className: "Senior 4",
    department: "Sciences",
    primaryRole: "Teacher",
    leadershipAssignments: ["Head of Department"],
    assignedClasses: [],
    hodDepartment: "Sciences",
    qualification: "BSc. Education",
    contact: "+256 700 111 236",
    email: "lydia.namara@educore.ac.ug",
    address: "Mbale, Uganda",
    dateOfEmployment: "2020-03-18",
    status: "Leave",
  },
  {
    id: "T-04",
    name: "Peter Muwonge",
    firstName: "Peter",
    lastName: "Muwonge",
    subject: "ICT",
    subjects: ["ICT"],
    className: "Senior 1",
    department: "ICT",
    primaryRole: "Teacher",
    leadershipAssignments: [],
    assignedClasses: [],
    hodDepartment: "",
    qualification: "BSc. Computer Science",
    contact: "+256 700 111 237",
    email: "peter.muwonge@educore.ac.ug",
    address: "Wakiso, Uganda",
    dateOfEmployment: "2017-06-01",
    status: "Available",
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function uniqueList(items) {
  return [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];
}

function normalizeLeadershipAssignments(input) {
  const candidates = [
    ...normalizeList(input.leadershipAssignments),
    ...normalizeList(input.additionalRoles),
  ];

  if (teacherLeadershipOptions.includes(input.primaryRole)) {
    candidates.push(input.primaryRole);
  }

  return uniqueList(candidates).filter((assignment) => teacherLeadershipOptions.includes(assignment));
}

function readStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Ignore storage errors so the UI still works.
  }
}

function removeStorage() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors so the UI still works.
  }
}

function sortTeachers(rows) {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
}

function normalizeTeacher(input, existingTeacher = null) {
  const firstName = String(input.firstName || "").trim();
  const lastName = String(input.lastName || "").trim();
  const name = String(input.name || `${firstName} ${lastName}`.trim()).trim();
  const subjects = uniqueList(normalizeList(input.subjects).length ? normalizeList(input.subjects) : normalizeList(input.subject));
  const leadershipAssignments = normalizeLeadershipAssignments(input);
  const assignedClasses = leadershipAssignments.includes("Class Teacher")
    ? uniqueList(normalizeList(input.assignedClasses).length ? normalizeList(input.assignedClasses) : normalizeList(input.className))
    : [];
  const className = assignedClasses.length ? assignedClasses.join(", ") : String(input.className || "").trim();
  const hodDepartment = leadershipAssignments.includes("Head of Department")
    ? String(input.hodDepartment || input.department || "").trim()
    : "";

  return {
    ...(existingTeacher || {}),
    id: String(input.id || existingTeacher?.id || "").trim(),
    firstName,
    lastName,
    name,
    subject: subjects.join(", "),
    subjects,
    className,
    department: String(input.department || "").trim(),
    primaryRole: "Teacher",
    leadershipAssignments,
    assignedClasses,
    hodDepartment,
    qualification: String(input.qualification || "").trim(),
    contact: String(input.contact || "").trim(),
    email: String(input.email || "").trim(),
    address: String(input.address || "").trim(),
    dateOfEmployment: String(input.dateOfEmployment || "").trim(),
    status: String(input.status || "Active").trim(),
  };
}

export function loadTeachers() {
  const raw = readStorage();
  if (!raw) {
    return sortTeachers(clone(teacherSeedRows).map((teacher) => normalizeTeacher(teacher, teacher)));
  }

  try {
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : clone(teacherSeedRows);
    return sortTeachers(source.map((teacher) => normalizeTeacher(teacher, teacher)));
  } catch {
    return sortTeachers(clone(teacherSeedRows).map((teacher) => normalizeTeacher(teacher, teacher)));
  }
}

export function saveTeachers(teachers) {
  const next = sortTeachers(clone(teachers));
  writeStorage(JSON.stringify(next));
  return next;
}

export function clearTeachers() {
  removeStorage();
}

export function getNextTeacherId(teachers = loadTeachers()) {
  const highest = teachers.reduce((max, teacher) => {
    const match = String(teacher.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `T-${String(highest + 1).padStart(2, "0")}`;
}

export function getTeacherById(teacherId) {
  return loadTeachers().find((teacher) => teacher.id === teacherId) || null;
}

export function upsertTeacher(input, existingTeacher = null) {
  const teachers = loadTeachers();
  const normalized = normalizeTeacher(input, existingTeacher);

  if (!normalized.id) {
    normalized.id = getNextTeacherId(teachers);
  }

  normalized.name = normalized.name || `${normalized.firstName} ${normalized.lastName}`.trim();

  const duplicate = teachers.find((teacher) => teacher.id === normalized.id && teacher.id !== existingTeacher?.id);
  if (duplicate) {
    throw new Error("A teacher with this ID already exists.");
  }

  const index = teachers.findIndex((teacher) => teacher.id === (existingTeacher?.id || normalized.id));
  if (index >= 0) {
    teachers[index] = normalized;
  } else {
    teachers.push(normalized);
  }

  saveTeachers(teachers);
  return normalized;
}

export function deleteTeacher(teacherId) {
  const next = loadTeachers().filter((teacher) => teacher.id !== teacherId);
  saveTeachers(next);
  return next;
}
