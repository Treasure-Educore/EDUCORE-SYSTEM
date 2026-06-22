export const teacherManagementRoles = ["non-teaching-staff", "dos", "principal", "head-teacher"];
export const teacherAssignmentRoles = ["dos", "principal", "head-teacher"];

export function canViewTeacherManagement(role) {
  return teacherManagementRoles.includes(role);
}

export function canEditTeacherBasics(role) {
  return teacherManagementRoles.includes(role);
}

export function canManageTeacherAssignments(role) {
  return teacherAssignmentRoles.includes(role);
}

export function canAssignTeacherRoles(role) {
  return teacherAssignmentRoles.includes(role);
}
