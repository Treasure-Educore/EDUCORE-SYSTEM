import { libraryRows } from "./mockData";

const STORAGE_KEY = "educore.library";

export const libraryStatusOptions = ["Available", "Low Stock", "Checked Out", "Unavailable"];

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

function toNumber(value, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) && next >= 0 ? next : fallback;
}

function sortLibraryItems(rows) {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true, sensitivity: "base" }));
}

function normalizeLibraryItem(input, existingItem = null) {
  return {
    ...(existingItem || {}),
    id: String(input.id || existingItem?.id || "").trim(),
    title: String(input.title || "").trim(),
    category: String(input.category || "").trim(),
    copies: toNumber(input.copies, existingItem?.copies || 0),
    issued: toNumber(input.issued, existingItem?.issued || 0),
    status: libraryStatusOptions.includes(input.status) ? input.status : "Available",
  };
}

export function loadLibraryItems() {
  const raw = safeRead();
  if (!raw) {
    return sortLibraryItems(clone(libraryRows).map((item) => normalizeLibraryItem(item, item)));
  }

  try {
    const parsed = JSON.parse(raw);
    const source = Array.isArray(parsed) ? parsed : clone(libraryRows);
    return sortLibraryItems(source.map((item) => normalizeLibraryItem(item, item)));
  } catch {
    return sortLibraryItems(clone(libraryRows).map((item) => normalizeLibraryItem(item, item)));
  }
}

export function saveLibraryItems(items) {
  const next = sortLibraryItems(clone(items).map((item) => normalizeLibraryItem(item, item)));
  safeWrite(JSON.stringify(next));
  return next;
}

export function getNextBookId(items = loadLibraryItems()) {
  const highest = items.reduce((max, item) => {
    const match = String(item.id || "").match(/(\d+)$/);
    const value = match ? Number(match[1]) : 100;
    return Math.max(max, value);
  }, 100);

  return `BK-${highest + 1}`;
}

export function upsertLibraryItem(input, existingItem = null) {
  const items = loadLibraryItems();
  const normalized = normalizeLibraryItem(input, existingItem);

  if (!normalized.id) {
    normalized.id = getNextBookId(items);
  }

  const duplicate = items.find((item) => item.id === normalized.id && item.id !== existingItem?.id);
  if (duplicate) {
    throw new Error("A book with this ID already exists.");
  }

  const index = items.findIndex((item) => item.id === (existingItem?.id || normalized.id));
  if (index >= 0) {
    items[index] = normalized;
  } else {
    items.push(normalized);
  }

  saveLibraryItems(items);
  return normalized;
}

export function deleteLibraryItem(itemId) {
  const next = loadLibraryItems().filter((item) => item.id !== itemId);
  saveLibraryItems(next);
  return next;
}
