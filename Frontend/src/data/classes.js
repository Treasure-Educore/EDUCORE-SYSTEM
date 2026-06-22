import { classRows } from "./mockData";

const STORAGE_KEY = "educore.classes";

export const classStatusOptions = ["Open", "Full", "Closed"];

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
    // Keep the UI usable even if local storage is unavailable.
  }
}

function sortClasses(rows) {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
}

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : fallback;
}

function normalizeClass(input, existingClass = null) {
  return {
    ...(existingClass || {}),
    id: String(input.id || existingClass?.id || "").trim(),
    className: String(input.className || "").trim(),
    teacher: String(input.teacher || "").trim(),
    students: toNumber(input.students),
    capacity: input.capacity === "" || input.capacity == null ? "" : toNumber(input.capacity),
    room: String(input.room || "").trim(),
    status: classStatusOptions.includes(input.status) ? input.status : "Open",
  };
}

export function loadClasses() {
  const raw = safeRead();
  if (!raw) {
    return sortClasses(clone(classRows).map((classItem) => normalizeClass(classItem, classItem)));
  }

  try {
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : clone(classRows);
    return sortClasses(source.map((classItem) => normalizeClass(classItem, classItem)));
  } catch {
    return sortClasses(clone(classRows).map((classItem) => normalizeClass(classItem, classItem)));
  }
}

export function saveClasses(classes) {
  const next = sortClasses(clone(classes));
  safeWrite(JSON.stringify(next));
  return next;
}

export function getNextClassId(classes = loadClasses()) {
  const highest = classes.reduce((max, classItem) => {
    const match = String(classItem.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 0;
    return Math.max(max, value);
  }, 0);

  return `CL-${String(highest + 1).padStart(2, "0")}`;
}

export function upsertClass(input, existingClass = null) {
  const classes = loadClasses();
  const normalized = normalizeClass(input, existingClass);

  if (!normalized.id) {
    normalized.id = getNextClassId(classes);
  }

  const duplicate = classes.find((classItem) => classItem.id === normalized.id && classItem.id !== existingClass?.id);
  if (duplicate) {
    throw new Error("A class with this code already exists.");
  }

  const index = classes.findIndex((classItem) => classItem.id === normalized.id);
  if (index >= 0) {
    classes[index] = normalized;
  } else {
    classes.push(normalized);
  }

  saveClasses(classes);
  return normalized;
}

export function deleteClass(classId) {
  const next = loadClasses().filter((classItem) => classItem.id !== classId);
  saveClasses(next);
  return next;
}
