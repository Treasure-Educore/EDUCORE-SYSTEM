const STORAGE_KEY = "educore.students.profiles";

const seedStudentProfiles = [
  {
    id: "ST-1001",
    photoLabel: "AN",
    admissionNumber: "ADM-2022-001",
    firstName: "Amina",
    lastName: "Nankya",
    gender: "Female",
    dateOfBirth: "2012-03-18",
    nationality: "Ugandan",
    religion: "Christian",
    currentClass: "Primary 6",
    stream: "North Wing",
    admissionDate: "2022-01-10",
    academicStatus: "Active",
    previousSchool: "Little Stars Primary School",
    guardianName: "Sarah N.",
    relationship: "Mother",
    phoneNumber: "+256 700 111 101",
    alternativeContact: "+256 755 111 101",
    emailAddress: "amina.guardian@example.com",
    physicalAddress: "Kampala, Uganda",
    bloodGroup: "O+",
    allergies: "Peanuts",
    medicalConditions: "Mild asthma",
    emergencyContact: "Sarah N. - +256 700 111 101",
    presentDays: 178,
    absentDays: 4,
    attendancePercentage: 97.8,
  },
  {
    id: "ST-1002",
    photoLabel: "BO",
    admissionNumber: "ADM-2021-014",
    firstName: "Brian",
    lastName: "Okello",
    gender: "Male",
    dateOfBirth: "2011-09-04",
    nationality: "Ugandan",
    religion: "Muslim",
    currentClass: "Primary 5",
    stream: "West Wing",
    admissionDate: "2021-02-14",
    academicStatus: "Active",
    previousSchool: "Bright Future Nursery & P/S",
    guardianName: "Joseph O.",
    relationship: "Father",
    phoneNumber: "+256 700 111 102",
    alternativeContact: "+256 755 111 102",
    emailAddress: "brian.guardian@example.com",
    physicalAddress: "Jinja, Uganda",
    bloodGroup: "A+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Joseph O. - +256 700 111 102",
    presentDays: 184,
    absentDays: 6,
    attendancePercentage: 96.8,
  },
  {
    id: "ST-1003",
    photoLabel: "CA",
    admissionNumber: "ADM-2020-022",
    firstName: "Catherine",
    lastName: "Atim",
    gender: "Female",
    dateOfBirth: "2010-11-20",
    nationality: "Ugandan",
    religion: "Christian",
    currentClass: "Primary 7",
    stream: "South Wing",
    admissionDate: "2020-01-20",
    academicStatus: "At Risk",
    previousSchool: "Starlight Primary School",
    guardianName: "Grace A.",
    relationship: "Aunt",
    phoneNumber: "+256 700 111 103",
    alternativeContact: "+256 755 111 103",
    emailAddress: "catherine.guardian@example.com",
    physicalAddress: "Mukono, Uganda",
    bloodGroup: "B+",
    allergies: "Dust",
    medicalConditions: "Frequent migraines",
    emergencyContact: "Grace A. - +256 700 111 103",
    presentDays: 162,
    absentDays: 20,
    attendancePercentage: 89.0,
  },
  {
    id: "ST-1004",
    photoLabel: "DS",
    admissionNumber: "ADM-2019-033",
    firstName: "Daniel",
    lastName: "Ssemanda",
    gender: "Male",
    dateOfBirth: "2009-06-09",
    nationality: "Ugandan",
    religion: "Christian",
    currentClass: "S.2",
    stream: "Blue Stream",
    admissionDate: "2019-02-03",
    academicStatus: "Active",
    previousSchool: "Green Valley Primary School",
    guardianName: "Moses S.",
    relationship: "Uncle",
    phoneNumber: "+256 700 111 104",
    alternativeContact: "+256 755 111 104",
    emailAddress: "daniel.guardian@example.com",
    physicalAddress: "Entebbe, Uganda",
    bloodGroup: "AB+",
    allergies: "None",
    medicalConditions: "None",
    emergencyContact: "Moses S. - +256 700 111 104",
    presentDays: 180,
    absentDays: 5,
    attendancePercentage: 97.3,
  },
  {
    id: "ST-1005",
    photoLabel: "EN",
    admissionNumber: "ADM-2018-040",
    firstName: "Esther",
    lastName: "Nakato",
    gender: "Female",
    dateOfBirth: "2007-01-14",
    nationality: "Ugandan",
    religion: "Christian",
    currentClass: "S.4",
    stream: "Gold Stream",
    admissionDate: "2018-01-15",
    academicStatus: "Active",
    previousSchool: "Mosaic Junior School",
    guardianName: "Martha N.",
    relationship: "Mother",
    phoneNumber: "+256 700 111 105",
    alternativeContact: "+256 755 111 105",
    emailAddress: "esther.guardian@example.com",
    physicalAddress: "Masaka, Uganda",
    bloodGroup: "O-",
    allergies: "Penicillin",
    medicalConditions: "None",
    emergencyContact: "Martha N. - +256 700 111 105",
    presentDays: 186,
    absentDays: 2,
    attendancePercentage: 99.0,
  },
  {
    id: "ST-1006",
    photoLabel: "FW",
    admissionNumber: "ADM-2023-008",
    firstName: "Farid",
    lastName: "Waiswa",
    gender: "Male",
    dateOfBirth: "2013-08-30",
    nationality: "Ugandan",
    religion: "Muslim",
    currentClass: "Primary 4",
    stream: "Green Wing",
    admissionDate: "2023-01-11",
    academicStatus: "Inactive",
    previousSchool: "Little Acorns Nursery School",
    guardianName: "Aisha W.",
    relationship: "Mother",
    phoneNumber: "+256 700 111 106",
    alternativeContact: "+256 755 111 106",
    emailAddress: "farid.guardian@example.com",
    physicalAddress: "Wakiso, Uganda",
    bloodGroup: "A-",
    allergies: "Pollen",
    medicalConditions: "None",
    emergencyContact: "Aisha W. - +256 700 111 106",
    presentDays: 140,
    absentDays: 44,
    attendancePercentage: 76.1,
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeRead() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function safeWrite(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Keep the UI usable even when browser storage is unavailable.
  }
}

function splitName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function hasField(source, key) {
  return Object.prototype.hasOwnProperty.call(source || {}, key);
}

function readField(source, key, fallback = "") {
  return hasField(source, key) ? source[key] : fallback;
}

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "ST";
}

function toNumber(value, fallback = 0) {
  const normalized = typeof value === "string" ? value.replace(/[$,%\s,]/g, "") : value;
  const next = Number(normalized);
  return Number.isFinite(next) && next >= 0 ? next : fallback;
}

function sortStudents(rows) {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
}

function normalizeChoice(value, options, fallback) {
  const candidate = String(value ?? fallback).trim();
  return options.includes(candidate) ? candidate : fallback;
}

function normalizeGuardian(guardian = {}) {
  return {
    id: String(guardian.id || "").trim(),
    name: String(guardian.name || guardian.fullName || "").trim(),
    relationship: normalizeChoice(guardian.relationship, ["Father", "Mother", "Guardian", "Aunt", "Uncle", "Sponsor", "Other"], "Mother"),
    phoneNumber: String(guardian.phoneNumber || guardian.phone || "").trim(),
    alternativePhoneNumber: String(guardian.alternativePhoneNumber || guardian.alternativePhone || "").trim(),
    emailAddress: String(guardian.emailAddress || guardian.email || "").trim(),
    occupation: String(guardian.occupation || "").trim(),
    employer: String(guardian.employer || "").trim(),
    nationalId: String(guardian.nationalId || "").trim(),
    homeAddress: String(guardian.homeAddress || guardian.address || "").trim(),
    emergencyContactNumber: String(guardian.emergencyContactNumber || guardian.emergencyContact || "").trim(),
  };
}

function normalizeDocuments(documents = {}) {
  const keys = ["birthCertificate", "passportPhoto", "previousReportCard", "transferLetter", "medicalReport", "parentGuardianIdCopy"];
  return keys.reduce((accumulator, key) => {
    const files = Array.isArray(documents[key]) ? documents[key] : [];
    accumulator[key] = files.map((file) => ({
      id: String(file.id || "").trim(),
      name: String(file.name || "Untitled file").trim(),
      type: String(file.type || "").trim(),
      size: Number(file.size || 0),
      preview: String(file.preview || file.previewData || "").trim(),
      uploadedAt: String(file.uploadedAt || "").trim(),
    }));
    return accumulator;
  }, {});
}

function normalizeStudentProfile(input, existingStudent = null) {
  const {
    feesBalance: _feesBalance,
    paymentStatus: _paymentStatus,
    paymentHistorySummary: _paymentHistorySummary,
    ...baseExistingStudent
  } = existingStudent || {};
  const fromName = splitName(input.name);
  const personal = input.personal || {};
  const academic = input.academic || {};
  const medical = input.medical || {};
  const transport = input.transport || {};
  const fees = input.fees || {};
  const documents = input.documents || {};
  const guardiansInput = Array.isArray(input.guardians) ? input.guardians : [];
  const guardians = guardiansInput.length > 0
    ? guardiansInput.map((guardian) => normalizeGuardian(guardian))
    : [normalizeGuardian({
      id: input.guardianId,
      name: hasField(input, "guardianName") ? input.guardianName : readField(input, "guardian", existingStudent?.guardianName || ""),
      relationship: input.relationship || existingStudent?.relationship || "Mother",
      phoneNumber: input.phoneNumber || existingStudent?.phoneNumber || "",
      alternativePhoneNumber: input.alternativeContact || existingStudent?.alternativeContact || "",
      emailAddress: input.emailAddress || existingStudent?.emailAddress || "",
      occupation: input.occupation || existingStudent?.occupation || "",
      employer: input.employer || existingStudent?.employer || "",
      nationalId: input.guardianNationalId || existingStudent?.guardianNationalId || "",
      homeAddress: input.guardianHomeAddress || existingStudent?.guardianHomeAddress || "",
      emergencyContactNumber: input.emergencyContactNumber || existingStudent?.emergencyContactNumber || "",
    })];
  const primaryGuardian = guardians[0];
  const firstName = String(personal.firstName || (hasField(input, "firstName") ? input.firstName : fromName.firstName || existingStudent?.firstName || "")).trim();
  const middleName = String(personal.middleName || input.middleName || existingStudent?.middleName || "").trim();
  const lastName = String(personal.lastName || (hasField(input, "lastName") ? input.lastName : fromName.lastName || existingStudent?.lastName || "")).trim();
  const currentClass = String(academic.className || (hasField(input, "currentClass") ? input.currentClass : readField(input, "className", existingStudent?.currentClass || ""))).trim();
  const guardianName = String(primaryGuardian?.name || (hasField(input, "guardianName") ? input.guardianName : readField(input, "guardian", existingStudent?.guardianName || ""))).trim();
  const academicStatus = String(academic.status || hasField(input, "academicStatus") ? input.academicStatus : readField(input, "status", existingStudent?.academicStatus || "Active")).trim();
  const presentDays = toNumber(readField(input, "presentDays", existingStudent?.presentDays || 0), existingStudent?.presentDays || 0);
  const absentDays = toNumber(readField(input, "absentDays", existingStudent?.absentDays || 0), existingStudent?.absentDays || 0);
  const attendancePercentage = toNumber(
    hasField(input, "attendancePercentage") ? input.attendancePercentage : readField(input, "attendance", existingStudent?.attendancePercentage || 0),
    existingStudent?.attendancePercentage || 0,
  );
  const admissionNumber = String(input.admissionNumber || existingStudent?.admissionNumber || "").trim();
  const studentNumber = String(input.studentNumber || existingStudent?.studentNumber || existingStudent?.id || "").trim();
  const transportUses = normalizeChoice(transport.usesSchoolTransport || input.usesSchoolTransport || existingStudent?.usesSchoolTransport || "No", ["No", "Yes"], "No");
  const scholarship = normalizeChoice(fees.scholarship || input.scholarship || existingStudent?.scholarship || "No", ["No", "Yes"], "No");

  return {
    ...baseExistingStudent,
    id: String(readField(input, "id", existingStudent?.id || "")).trim(),
    studentNumber,
    admissionNumber,
    photoLabel: String(readField(input, "photoLabel", existingStudent?.photoLabel || getInitials(firstName, lastName))).trim(),
    studentPhoto: String(personal.photo || input.studentPhoto || existingStudent?.studentPhoto || "").trim(),
    firstName,
    middleName,
    lastName,
    gender: String(readField(input, "gender", existingStudent?.gender || "")).trim(),
    dateOfBirth: String(readField(input, "dateOfBirth", existingStudent?.dateOfBirth || "")).trim(),
    nationality: String(readField(input, "nationality", existingStudent?.nationality || "Ugandan")).trim(),
    religion: String(readField(input, "religion", existingStudent?.religion || "")).trim(),
    birthCertificateNumber: String(personal.birthCertificateNumber || input.birthCertificateNumber || existingStudent?.birthCertificateNumber || "").trim(),
    phoneNumber: String(personal.phoneNumber || readField(input, "phoneNumber", existingStudent?.phoneNumber || "")).trim(),
    physicalAddress: String(personal.address || readField(input, "physicalAddress", existingStudent?.physicalAddress || "")).trim(),
    address: String(personal.address || input.address || existingStudent?.address || "").trim(),
    city: String(personal.city || input.city || existingStudent?.city || "").trim(),
    district: String(personal.district || input.district || existingStudent?.district || "").trim(),
    country: String(personal.country || input.country || existingStudent?.country || "Uganda").trim(),
    currentClass,
    stream: String(academic.stream || readField(input, "stream", existingStudent?.stream || "")).trim(),
    admissionDate: String(academic.admissionDate || readField(input, "admissionDate", existingStudent?.admissionDate || "")).trim(),
    academicYear: String(academic.academicYear || input.academicYear || existingStudent?.academicYear || new Date().getFullYear()).trim(),
    academicStatus,
    previousSchool: String(academic.previousSchool || readField(input, "previousSchool", existingStudent?.previousSchool || "")).trim(),
    house: String(academic.house || input.house || existingStudent?.house || "").trim(),
    boardingStatus: normalizeChoice(academic.boardingStatus || input.boardingStatus || existingStudent?.boardingStatus || "Day Scholar", ["Day Scholar", "Boarder"], "Day Scholar"),
    studentCategory: normalizeChoice(academic.studentCategory || input.studentCategory || existingStudent?.studentCategory || "New Student", ["New Student", "Continuing Student", "Transfer Student"], "New Student"),
    guardianName,
    relationship: String(primaryGuardian?.relationship || readField(input, "relationship", existingStudent?.relationship || "")).trim(),
    alternativeContact: String(primaryGuardian?.alternativePhoneNumber || readField(input, "alternativeContact", existingStudent?.alternativeContact || "")).trim(),
    emailAddress: String(primaryGuardian?.emailAddress || readField(input, "emailAddress", existingStudent?.emailAddress || "")).trim(),
    occupation: String(primaryGuardian?.occupation || input.occupation || existingStudent?.occupation || "").trim(),
    employer: String(primaryGuardian?.employer || input.employer || existingStudent?.employer || "").trim(),
    guardianNationalId: String(primaryGuardian?.nationalId || input.guardianNationalId || existingStudent?.guardianNationalId || "").trim(),
    guardianHomeAddress: String(primaryGuardian?.homeAddress || input.guardianHomeAddress || existingStudent?.guardianHomeAddress || "").trim(),
    emergencyContactNumber: String(primaryGuardian?.emergencyContactNumber || input.emergencyContactNumber || existingStudent?.emergencyContactNumber || "").trim(),
    bloodGroup: String(medical.bloodGroup || readField(input, "bloodGroup", existingStudent?.bloodGroup || "")).trim(),
    allergies: String(medical.allergies || readField(input, "allergies", existingStudent?.allergies || "None")).trim(),
    medicalConditions: String(medical.medicalConditions || readField(input, "medicalConditions", existingStudent?.medicalConditions || "None")).trim(),
    currentMedication: String(medical.currentMedication || input.currentMedication || existingStudent?.currentMedication || "").trim(),
    specialNeeds: String(medical.specialNeeds || input.specialNeeds || existingStudent?.specialNeeds || "").trim(),
    doctorName: String(medical.doctorName || input.doctorName || existingStudent?.doctorName || "").trim(),
    doctorContact: String(medical.doctorContact || input.doctorContact || existingStudent?.doctorContact || "").trim(),
    insuranceProvider: String(medical.insuranceProvider || input.insuranceProvider || existingStudent?.insuranceProvider || "").trim(),
    insuranceNumber: String(medical.insuranceNumber || input.insuranceNumber || existingStudent?.insuranceNumber || "").trim(),
    usesSchoolTransport: transportUses,
    pickupPoint: String(transport.pickupPoint || input.pickupPoint || existingStudent?.pickupPoint || "").trim(),
    route: String(transport.route || input.route || existingStudent?.route || "").trim(),
    feeCategory: String(fees.feeCategory || input.feeCategory || existingStudent?.feeCategory || "Day Scholar").trim(),
    scholarship,
    scholarshipType: String(fees.scholarshipType || input.scholarshipType || existingStudent?.scholarshipType || "").trim(),
    sponsor: String(fees.sponsor || input.sponsor || existingStudent?.sponsor || "").trim(),
    scholarshipPercentage: String(fees.scholarshipPercentage || input.scholarshipPercentage || existingStudent?.scholarshipPercentage || "").trim(),
    discountPercentage: String(fees.discountPercentage || input.discountPercentage || existingStudent?.discountPercentage || "").trim(),
    additionalNotes: String(fees.additionalNotes || input.additionalNotes || existingStudent?.additionalNotes || "").trim(),
    guardians,
    academic,
    medical,
    transport: {
      usesSchoolTransport: transportUses,
      pickupPoint: String(transport.pickupPoint || input.pickupPoint || existingStudent?.pickupPoint || "").trim(),
      route: String(transport.route || input.route || existingStudent?.route || "").trim(),
    },
    documents: normalizeDocuments(documents),
    fees: {
      feeCategory: String(fees.feeCategory || input.feeCategory || existingStudent?.feeCategory || "Day Scholar").trim(),
      scholarship,
      scholarshipType: String(fees.scholarshipType || input.scholarshipType || existingStudent?.scholarshipType || "").trim(),
      sponsor: String(fees.sponsor || input.sponsor || existingStudent?.sponsor || "").trim(),
      scholarshipPercentage: String(fees.scholarshipPercentage || input.scholarshipPercentage || existingStudent?.scholarshipPercentage || "").trim(),
      discountPercentage: String(fees.discountPercentage || input.discountPercentage || existingStudent?.discountPercentage || "").trim(),
      additionalNotes: String(fees.additionalNotes || input.additionalNotes || existingStudent?.additionalNotes || "").trim(),
    },
    confirmationAccepted: Boolean(readField(input, "confirmationAccepted", existingStudent?.confirmationAccepted || false)),
    presentDays,
    absentDays,
    attendancePercentage,
  };
}

function studentProfileToRow(student) {
  return {
    id: student.id,
    name: `${student.firstName} ${student.lastName}`.trim(),
    className: student.currentClass,
    guardian: student.guardianName,
    status: student.academicStatus,
    attendance: `${Number(student.attendancePercentage || 0).toFixed(0)}%`,
  };
}

export const studentProfiles = seedStudentProfiles;

export function loadStudentProfiles() {
  const raw = safeRead();
  if (!raw) {
    return sortStudents(clone(seedStudentProfiles).map((student) => normalizeStudentProfile(student, student)));
  }

  try {
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : clone(seedStudentProfiles);
    return sortStudents(source.map((student) => normalizeStudentProfile(student, student)));
  } catch {
    return sortStudents(clone(seedStudentProfiles).map((student) => normalizeStudentProfile(student, student)));
  }
}

export function saveStudentProfiles(students) {
  const next = sortStudents(clone(students).map((student) => normalizeStudentProfile(student, student)));
  safeWrite(JSON.stringify(next));
  return next;
}

export function loadStudents() {
  return loadStudentProfiles().map(studentProfileToRow);
}

export function getNextStudentId(students = loadStudentProfiles()) {
  const highest = students.reduce((max, student) => {
    const match = String(student.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 1000);

  return `ST-${String(highest + 1).padStart(4, "0")}`;
}

export function getStudentProfile(studentId) {
  return loadStudentProfiles().find((student) => student.id === studentId) || null;
}

export function upsertStudentProfile(input, existingStudent = null) {
  const students = loadStudentProfiles();
  const normalized = normalizeStudentProfile(input, existingStudent);

  if (!normalized.id) {
    normalized.id = getNextStudentId(students);
  }

  const duplicate = students.find((student) => student.id === normalized.id && student.id !== existingStudent?.id);
  if (duplicate) {
    throw new Error("A student with this ID already exists.");
  }

  const index = students.findIndex((student) => student.id === (existingStudent?.id || normalized.id));
  if (index >= 0) {
    students[index] = normalized;
  } else {
    students.push(normalized);
  }

  saveStudentProfiles(students);
  return normalized;
}

export function deleteStudentProfile(studentId) {
  const next = loadStudentProfiles().filter((student) => student.id !== studentId);
  saveStudentProfiles(next);
  return next.map(studentProfileToRow);
}
