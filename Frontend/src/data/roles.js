export const roles = [
  {
    key: "principal",
    label: "Principal",
    description: "Manage the entire school operations",
    href: "/login?role=principal",
  },
  {
    key: "head-teacher",
    label: "Head Teacher",
    description: "Supervise academics and school activities",
    href: "/login?role=head-teacher",
  },
  {
    key: "dos",
    label: "Director of Studies (DOS)",
    description: "Coordinate curriculum and examinations",
    href: "/login?role=dos",
  },
  {
    key: "teacher",
    label: "Teacher",
    description: "Manage classes, assessments and attendance",
    href: "/login?role=teacher",
  },
  {
    key: "non-teaching-staff",
    label: "Administrator",
    description: "Access administrative and support services",
    href: "/login?role=non-teaching-staff",
  },
  {
    key: "librarian",
    label: "Librarian",
    description: "Manage library resources and book lending",
    href: "/login?role=librarian",
  },
];

const SELECTED_ROLE_KEY = "educore.selectedRole";

export function persistSelectedRole(roleKey) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SELECTED_ROLE_KEY, roleKey);
  } catch {
    // Ignore storage failures so role selection never crashes the landing page.
  }
}

export function loadSelectedRole() {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(SELECTED_ROLE_KEY);
  } catch {
    return null;
  }
}

export function clearSelectedRole() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(SELECTED_ROLE_KEY);
  } catch {
    // Ignore storage failures so logout still completes.
  }
}
