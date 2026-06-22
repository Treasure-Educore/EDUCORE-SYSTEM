const DRAFT_STORAGE_KEY = "educore.studentAdmission.drafts";

export const guardianRelationshipOptions = ["Father", "Mother", "Guardian", "Aunt", "Uncle", "Sponsor", "Other"];
export const boardingStatusOptions = ["Day Scholar", "Boarder"];
export const studentCategoryOptions = ["New Student", "Continuing Student", "Transfer Student"];
export const feeCategoryOptions = ["Day Scholar", "Boarder"];
export const yesNoOptions = ["No", "Yes"];
export const scholarshipTypes = ["Merit", "Need-based", "Sports", "Sibling", "Sponsor-funded", "Other"];
export const documentTypes = [
  { key: "birthCertificate", label: "Birth Certificate" },
  { key: "passportPhoto", label: "Passport Photo" },
  { key: "previousReportCard", label: "Previous Report Card" },
  { key: "transferLetter", label: "Transfer Letter" },
  { key: "medicalReport", label: "Medical Report" },
  { key: "parentGuardianIdCopy", label: "Parent/Guardian ID Copy" },
];

export const studentAdmissionSteps = [
  { key: "personal", label: "Personal Information", description: "Student identity and contact details." },
  { key: "guardians", label: "Parent / Guardian", description: "At least one guardian must be recorded." },
  { key: "academic", label: "Academic Information", description: "Class placement and admission details." },
  { key: "medical", label: "Medical Information", description: "Health notes and support requirements." },
  { key: "transport", label: "Transport Information", description: "School transport preferences and route." },
  { key: "documents", label: "Documents Upload", description: "Admission documents and attachments." },
  { key: "fees", label: "Fees Information", description: "Fee category and scholarship details." },
  { key: "review", label: "Review & Submit", description: "Confirm accuracy before saving." },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value, fallback = "") {
  return String(value ?? fallback).trim();
}

function normalizeChoice(value, options, fallback) {
  const candidate = normalizeText(value, fallback);
  return options.includes(candidate) ? candidate : fallback;
}

function getAcademicYearFallback(record) {
  return normalizeText(record?.academic?.academicYear || record?.academicYear || new Date().getFullYear());
}

function getYearFromAdmissionNumber(admissionNumber) {
  const match = String(admissionNumber || "").match(/ADM-(\d{4})-/i);
  return match ? match[1] : null;
}

function getSequenceFromValue(value) {
  const match = String(value || "").match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function getSequenceFromAdmissionNumber(admissionNumber) {
  const match = String(admissionNumber || "").match(/ADM-\d{4}-(\d{3})/i);
  return match ? Number(match[1]) : 0;
}

function getSequenceFromStudentNumber(studentNumber) {
  const match = String(studentNumber || "").match(/STU-\d{4}-(\d{3})/i);
  return match ? Number(match[1]) : 0;
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

export function createEmptyGuardian(overrides = {}) {
  return {
    id: createId("guardian"),
    name: "",
    relationship: "Mother",
    phoneNumber: "",
    alternativePhoneNumber: "",
    emailAddress: "",
    occupation: "",
    employer: "",
    nationalId: "",
    homeAddress: "",
    emergencyContactNumber: "",
    ...overrides,
  };
}

export function createEmptyDocuments(overrides = {}) {
  return {
    birthCertificate: [],
    passportPhoto: [],
    previousReportCard: [],
    transferLetter: [],
    medicalReport: [],
    parentGuardianIdCopy: [],
    ...overrides,
  };
}

export function createEmptyStudentAdmission(record = null) {
  const admissionNumber = normalizeText(record?.admissionNumber || "");
  const studentNumber = normalizeText(record?.studentNumber || record?.id || "");
  const firstGuardian = record?.guardians?.[0] || null;
  const fallbackGuardian = firstGuardian || (record
    ? {
        name: record.guardianName || "",
        relationship: record.relationship || "Mother",
        phoneNumber: record.phoneNumber || "",
        alternativePhoneNumber: record.alternativeContact || "",
        emailAddress: record.emailAddress || "",
        occupation: record.occupation || "",
        employer: record.employer || "",
        nationalId: record.guardianNationalId || "",
        homeAddress: record.guardianHomeAddress || record.physicalAddress || record.address || "",
        emergencyContactNumber: record.emergencyContactNumber || "",
      }
    : null);
  const personal = record?.personal || {};
  const academic = record?.academic || {};
  const medical = record?.medical || {};
  const transport = record?.transport || {};
  const fees = record?.fees || {};

  return {
    id: normalizeText(record?.id || ""),
    admissionNumber,
    studentNumber,
    personal: {
      photo: personal.photo || record?.studentPhoto || "",
      firstName: normalizeText(personal.firstName || record?.firstName || ""),
      middleName: normalizeText(personal.middleName || record?.middleName || ""),
      lastName: normalizeText(personal.lastName || record?.lastName || ""),
      gender: normalizeText(personal.gender || record?.gender || ""),
      dateOfBirth: normalizeText(personal.dateOfBirth || record?.dateOfBirth || ""),
      nationality: normalizeText(personal.nationality || record?.nationality || "Ugandan"),
      religion: normalizeText(personal.religion || record?.religion || ""),
      birthCertificateNumber: normalizeText(personal.birthCertificateNumber || record?.birthCertificateNumber || ""),
      phoneNumber: normalizeText(personal.phoneNumber || record?.phoneNumber || ""),
      address: normalizeText(personal.address || record?.physicalAddress || record?.address || ""),
      city: normalizeText(personal.city || record?.city || ""),
      district: normalizeText(personal.district || record?.district || ""),
      country: normalizeText(personal.country || record?.country || "Uganda"),
    },
    guardians: Array.isArray(record?.guardians) && record.guardians.length > 0
      ? record.guardians.map((guardian) => createEmptyGuardian(guardian))
      : [createEmptyGuardian(fallbackGuardian || {})],
    academic: {
      admissionDate: normalizeText(academic.admissionDate || record?.admissionDate || ""),
      academicYear: normalizeText(academic.academicYear || record?.academicYear || getAcademicYearFallback(record)),
      className: normalizeText(academic.className || record?.currentClass || ""),
      stream: normalizeText(academic.stream || record?.stream || ""),
      previousSchool: normalizeText(academic.previousSchool || record?.previousSchool || ""),
      house: normalizeText(academic.house || record?.house || ""),
      boardingStatus: normalizeChoice(academic.boardingStatus || record?.boardingStatus, boardingStatusOptions, "Day Scholar"),
      studentCategory: normalizeChoice(academic.studentCategory || record?.studentCategory, studentCategoryOptions, "New Student"),
      status: normalizeChoice(academic.status || record?.academicStatus || "Active", ["Active", "Inactive"], "Active"),
    },
    medical: {
      bloodGroup: normalizeText(medical.bloodGroup || record?.bloodGroup || ""),
      allergies: normalizeText(medical.allergies || record?.allergies || ""),
      medicalConditions: normalizeText(medical.medicalConditions || record?.medicalConditions || ""),
      currentMedication: normalizeText(medical.currentMedication || record?.currentMedication || ""),
      specialNeeds: normalizeText(medical.specialNeeds || record?.specialNeeds || ""),
      doctorName: normalizeText(medical.doctorName || record?.doctorName || ""),
      doctorContact: normalizeText(medical.doctorContact || record?.doctorContact || ""),
      insuranceProvider: normalizeText(medical.insuranceProvider || record?.insuranceProvider || ""),
      insuranceNumber: normalizeText(medical.insuranceNumber || record?.insuranceNumber || ""),
    },
    transport: {
      usesSchoolTransport: normalizeChoice(transport.usesSchoolTransport || record?.usesSchoolTransport, yesNoOptions, "No"),
      pickupPoint: normalizeText(transport.pickupPoint || record?.pickupPoint || ""),
      route: normalizeText(transport.route || record?.route || ""),
    },
    documents: createEmptyDocuments(record?.documents || {}),
    fees: {
      feeCategory: normalizeChoice(fees.feeCategory || record?.feeCategory, feeCategoryOptions, "Day Scholar"),
      scholarship: normalizeChoice(fees.scholarship || record?.scholarship, yesNoOptions, "No"),
      scholarshipType: normalizeText(fees.scholarshipType || record?.scholarshipType || ""),
      sponsor: normalizeText(fees.sponsor || record?.sponsor || ""),
      scholarshipPercentage: normalizeText(fees.scholarshipPercentage || record?.scholarshipPercentage || ""),
      discountPercentage: normalizeText(fees.discountPercentage || record?.discountPercentage || ""),
      additionalNotes: normalizeText(fees.additionalNotes || record?.additionalNotes || ""),
    },
    confirmationAccepted: Boolean(record?.confirmationAccepted),
    _meta: {
      draftId: normalizeText(record?._meta?.draftId || createId("draft")),
    },
  };
}

export function getNextAdmissionNumber(students = [], academicYear = new Date().getFullYear()) {
  const year = String(academicYear || new Date().getFullYear());
  const highest = students.reduce((max, student) => {
    if (getYearFromAdmissionNumber(student?.admissionNumber) !== year) {
      return max;
    }
    return Math.max(max, getSequenceFromAdmissionNumber(student.admissionNumber));
  }, 0);

  return `ADM-${year}-${String(highest + 1).padStart(3, "0")}`;
}

export function getNextStudentNumber(students = [], academicYear = new Date().getFullYear()) {
  const year = String(academicYear || new Date().getFullYear());
  const highest = students.reduce((max, student) => {
    const currentYear = String(student?.studentNumber || "").includes(year) ? year : null;
    if (currentYear !== year) {
      return max;
    }
    return Math.max(max, getSequenceFromStudentNumber(student.studentNumber));
  }, 0);

  return `STU-${year}-${String(highest + 1).padStart(3, "0")}`;
}

function isDuplicateAdmissionNumber(students, admissionNumber, currentId) {
  return students.some((student) => student.id !== currentId && normalizeText(student.admissionNumber) === normalizeText(admissionNumber));
}

function isDuplicateBirthCertificateNumber(students, birthCertificateNumber, currentId) {
  const target = normalizeText(birthCertificateNumber);
  if (!target) return false;

  return students.some((student) => {
    if (student.id === currentId) return false;
    const candidate = normalizeText(student.birthCertificateNumber || student.personal?.birthCertificateNumber || "");
    return candidate && candidate === target;
  });
}

function normalizeGuardian(guardian = {}) {
  return {
    id: normalizeText(guardian.id || createId("guardian")),
    name: normalizeText(guardian.name || ""),
    relationship: normalizeChoice(guardian.relationship || "Mother", guardianRelationshipOptions, "Mother"),
    phoneNumber: normalizeText(guardian.phoneNumber || guardian.phone || ""),
    alternativePhoneNumber: normalizeText(guardian.alternativePhoneNumber || guardian.alternativePhone || ""),
    emailAddress: normalizeText(guardian.emailAddress || guardian.email || ""),
    occupation: normalizeText(guardian.occupation || ""),
    employer: normalizeText(guardian.employer || ""),
    nationalId: normalizeText(guardian.nationalId || ""),
    homeAddress: normalizeText(guardian.homeAddress || ""),
    emergencyContactNumber: normalizeText(guardian.emergencyContactNumber || guardian.emergencyContact || ""),
  };
}

function normalizeDocuments(documents = {}) {
  return createEmptyDocuments(
    documentTypes.reduce((accumulator, doc) => {
      const files = Array.isArray(documents[doc.key]) ? documents[doc.key] : [];
      accumulator[doc.key] = files.map((file) => ({
        id: normalizeText(file.id || createId("file")),
        name: normalizeText(file.name || "Untitled file"),
        type: normalizeText(file.type || ""),
        size: Number(file.size || 0),
        preview: normalizeText(file.preview || file.previewData || ""),
        uploadedAt: normalizeText(file.uploadedAt || new Date().toISOString()),
      }));
      return accumulator;
    }, {}),
  );
}

export function validateStudentAdmissionDraft(draft, students = [], currentStudentId = null) {
  const errors = {
    personal: {},
    guardians: [],
    academic: {},
    medical: {},
    transport: {},
    documents: {},
    fees: {},
    review: {},
  };

  if (!(draft?.personal?.firstName || "").trim()) errors.personal.firstName = "First name is required.";
  if (!(draft?.personal?.lastName || "").trim()) errors.personal.lastName = "Last name is required.";
  if (!(draft?.personal?.gender || "").trim()) errors.personal.gender = "Gender is required.";
  if (!(draft?.personal?.dateOfBirth || "").trim()) errors.personal.dateOfBirth = "Date of birth is required.";
  if (!(draft?.academic?.className || "").trim()) errors.academic.className = "Class is required.";
  if (!(draft?.academic?.academicYear || "").trim()) errors.academic.academicYear = "Academic year is required.";
  if (!(draft?.academic?.admissionDate || "").trim()) errors.academic.admissionDate = "Admission date is required.";

  if (!draft?.guardians?.length) {
    errors.guardians[0] = { name: "At least one guardian is required.", phoneNumber: "At least one guardian is required." };
  } else {
    draft.guardians.forEach((guardian, index) => {
      const guardianErrors = {};
      if (!normalizeText(guardian?.name || "").trim()) guardianErrors.name = "Guardian name is required.";
      if (!normalizeText(guardian?.phoneNumber || "").trim()) guardianErrors.phoneNumber = "Guardian phone is required.";
      if (Object.keys(guardianErrors).length > 0) {
        errors.guardians[index] = guardianErrors;
      }
    });
  }

  if (normalizeChoice(draft?.transport?.usesSchoolTransport, yesNoOptions, "No") === "Yes") {
    if (!normalizeText(draft?.transport?.pickupPoint || "").trim()) errors.transport.pickupPoint = "Pickup point is required.";
    if (!normalizeText(draft?.transport?.route || "").trim()) errors.transport.route = "Route is required.";
  }

  if (normalizeChoice(draft?.fees?.scholarship, yesNoOptions, "No") === "Yes") {
    if (!normalizeText(draft?.fees?.scholarshipType || "").trim()) errors.fees.scholarshipType = "Scholarship type is required.";
    if (!normalizeText(draft?.fees?.sponsor || "").trim()) errors.fees.sponsor = "Sponsor is required.";
    if (!normalizeText(draft?.fees?.scholarshipPercentage || "").trim()) errors.fees.scholarshipPercentage = "Scholarship percentage is required.";
  }

  const admissionNumber = normalizeText(draft?.admissionNumber || "");
  if (admissionNumber && isDuplicateAdmissionNumber(students, admissionNumber, currentStudentId)) {
    errors.personal.admissionNumber = "Admission number must be unique.";
  }

  const birthCertificateNumber = normalizeText(draft?.personal?.birthCertificateNumber || "");
  if (birthCertificateNumber && isDuplicateBirthCertificateNumber(students, birthCertificateNumber, currentStudentId)) {
    errors.personal.birthCertificateNumber = "Birth certificate number must be unique.";
  }

  if (!draft?.confirmationAccepted) {
    errors.review.confirmationAccepted = "Please confirm the information is accurate.";
  }

  return errors;
}

export function buildStudentAdmissionRecord(draft, students = [], currentStudent = null) {
  const normalizedDraft = createEmptyStudentAdmission(draft);
  const academicYear = normalizedDraft.academic.academicYear || new Date().getFullYear();

  const admissionNumber = normalizedDraft.admissionNumber || currentStudent?.admissionNumber || getNextAdmissionNumber(students, academicYear);
  const studentNumber = normalizedDraft.studentNumber || currentStudent?.studentNumber || getNextStudentNumber(students, academicYear);
  const guardians = (normalizedDraft.guardians.length > 0 ? normalizedDraft.guardians : [createEmptyGuardian()]).map(normalizeGuardian);
  const primaryGuardian = guardians[0] || createEmptyGuardian();
  const photoLabel = `${normalizedDraft.personal.firstName?.[0] || ""}${normalizedDraft.personal.lastName?.[0] || ""}`.toUpperCase() || currentStudent?.photoLabel || "ST";

  const record = {
    ...(currentStudent || {}),
    id: normalizeText(currentStudent?.id || draft?.id || studentNumber || createId("student")),
    admissionNumber,
    studentNumber,
    photoLabel,
    studentPhoto: normalizedDraft.personal.photo || currentStudent?.studentPhoto || "",
    firstName: normalizedDraft.personal.firstName,
    middleName: normalizedDraft.personal.middleName,
    lastName: normalizedDraft.personal.lastName,
    gender: normalizedDraft.personal.gender,
    dateOfBirth: normalizedDraft.personal.dateOfBirth,
    nationality: normalizedDraft.personal.nationality,
    religion: normalizedDraft.personal.religion,
    birthCertificateNumber: normalizedDraft.personal.birthCertificateNumber,
    phoneNumber: normalizedDraft.personal.phoneNumber,
    physicalAddress: normalizedDraft.personal.address,
    address: normalizedDraft.personal.address,
    city: normalizedDraft.personal.city,
    district: normalizedDraft.personal.district,
    country: normalizedDraft.personal.country,
    guardianName: primaryGuardian.name,
    relationship: primaryGuardian.relationship,
    alternativeContact: primaryGuardian.alternativePhoneNumber,
    emailAddress: primaryGuardian.emailAddress,
    occupation: primaryGuardian.occupation,
    employer: primaryGuardian.employer,
    guardianNationalId: primaryGuardian.nationalId,
    guardianHomeAddress: primaryGuardian.homeAddress,
    emergencyContactNumber: primaryGuardian.emergencyContactNumber,
    guardians,
    admissionDate: normalizedDraft.academic.admissionDate,
    academicYear: normalizedDraft.academic.academicYear,
    currentClass: normalizedDraft.academic.className,
    stream: normalizedDraft.academic.stream,
    previousSchool: normalizedDraft.academic.previousSchool,
    house: normalizedDraft.academic.house,
    boardingStatus: normalizedDraft.academic.boardingStatus,
    studentCategory: normalizedDraft.academic.studentCategory,
    academicStatus: normalizedDraft.academic.status,
    academic: clone(normalizedDraft.academic),
    medical: clone(normalizedDraft.medical),
    transport: clone(normalizedDraft.transport),
    documents: normalizeDocuments(normalizedDraft.documents),
    fees: clone(normalizedDraft.fees),
    confirmationAccepted: Boolean(normalizedDraft.confirmationAccepted),
  };

  return record;
}

export function loadSavedStudentAdmissionDraft(draftKey = "new") {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.[draftKey] || null;
  } catch {
    return null;
  }
}

export function saveStudentAdmissionDraft(draftKey, draft) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[draftKey] = clone(draft);
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Keep the form usable even if draft storage is unavailable.
  }
}

export function clearStudentAdmissionDraft(draftKey) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[draftKey];
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Ignore draft cleanup failures.
  }
}

export async function readDocumentFiles(files = [], onProgress = () => {}) {
  const nextFiles = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress(index, 10);
    const isImage = String(file.type || "").startsWith("image/");
    const preview = isImage ? await toDataUrl(file) : "";
    nextFiles.push({
      id: createId("file"),
      name: file.name,
      type: file.type,
      size: file.size,
      preview,
      uploadedAt: new Date().toISOString(),
    });
    onProgress(index, 100);
  }

  return nextFiles;
}
