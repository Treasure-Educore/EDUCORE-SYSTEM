import {
  AttendanceIcon,
  BookIcon,
  ChartIcon,
  ClassesIcon,
  DashboardIcon,
  ExamsIcon,
  LibraryIcon,
  MegaphoneIcon,
  MessageIcon,
  ReportsIcon,
  SettingsIcon,
  ShieldIcon,
  StudentsIcon,
  TeachersIcon,
  UserIcon,
} from "../components/icons";

export const principalNavigation = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    items: [
      { key: "overview", label: "Overview", path: "/principal/overview", icon: DashboardIcon },
      { key: "notifications", label: "Notifications", path: "/principal/notifications", icon: MessageIcon },
      { key: "quick-statistics", label: "Quick Statistics", path: "/principal/quick-statistics", icon: ChartIcon },
    ],
  },
  {
    key: "staff-management",
    label: "Staff Management",
    icon: TeachersIcon,
    items: [
      { key: "staff", label: "Staff List", path: "/principal/staff", icon: TeachersIcon },
      { key: "new-staff", label: "Register Staff", path: "/principal/staff/new", icon: UserIcon },
      { key: "departments", label: "Departments", path: "/principal/departments", icon: ShieldIcon },
    ],
  },
  {
    key: "students",
    label: "Students",
    icon: StudentsIcon,
    items: [
      { key: "list", label: "Student List", path: "/principal/students/list", icon: StudentsIcon },
      { key: "profiles", label: "Student Profiles", path: "/principal/students/profiles", icon: UserIcon },
      { key: "promotions", label: "Promotions and Transfers", path: "/principal/students/promotions", icon: ShieldIcon },
    ],
  },
  {
    key: "teachers",
    label: "Teachers",
    icon: TeachersIcon,
    items: [
      { key: "list", label: "Teacher List", path: "/principal/teachers/list", icon: TeachersIcon },
      { key: "profiles", label: "Teacher Profiles", path: "/principal/teachers/profiles", icon: UserIcon },
      { key: "departments", label: "Departments", path: "/principal/teachers/departments", icon: ShieldIcon },
    ],
  },
  {
    key: "academics",
    label: "Academics",
    icon: ClassesIcon,
    items: [
      { key: "subjects", label: "Subjects", path: "/principal/academics/subjects", icon: BookIcon },
      { key: "classes", label: "Classes", path: "/principal/academics/classes", icon: ClassesIcon },
      { key: "timetable", label: "Timetable", path: "/principal/academics/timetable", icon: ChartIcon },
      { key: "examinations", label: "Examinations", path: "/principal/academics/examinations", icon: ExamsIcon },
      { key: "results", label: "Results", path: "/principal/academics/results", icon: ChartIcon },
    ],
  },
  {
    key: "attendance",
    label: "Attendance",
    icon: AttendanceIcon,
    items: [
      { key: "student", label: "Student Attendance", path: "/principal/attendance/student", icon: AttendanceIcon },
      { key: "staff", label: "Staff Attendance", path: "/principal/attendance/staff", icon: AttendanceIcon },
      { key: "reports", label: "Attendance Reports", path: "/principal/attendance/reports", icon: ReportsIcon },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: ReportsIcon,
    items: [
      { key: "academic", label: "Academic Reports", path: "/principal/reports/academic", icon: ChartIcon },
      { key: "attendance", label: "Attendance Reports", path: "/principal/reports/attendance", icon: AttendanceIcon },
      { key: "general", label: "General School Reports", path: "/principal/reports/general", icon: ReportsIcon },
    ],
  },
  {
    key: "library",
    label: "Library",
    icon: LibraryIcon,
    items: [
      { key: "books", label: "Books", path: "/principal/library/books", icon: BookIcon },
      { key: "borrowing", label: "Borrowing Records", path: "/principal/library/borrowing", icon: LibraryIcon },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    icon: MegaphoneIcon,
    items: [
      { key: "announcements", label: "Announcements", path: "/principal/communication/announcements", icon: MegaphoneIcon },
      { key: "messages", label: "Messages", path: "/principal/communication/messages", icon: MessageIcon },
    ],
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
    items: [
      { key: "school", label: "School Information", path: "/principal/settings/school", icon: SettingsIcon },
      { key: "users", label: "User Management", path: "/principal/settings/users", icon: ShieldIcon },
      { key: "system", label: "System Configuration", path: "/principal/settings/system", icon: SettingsIcon },
    ],
  },
];

export const principalRouteEntries = principalNavigation.flatMap((group) =>
  group.items.map((item) => ({
    path: item.path.replace("/principal/", ""),
    label: item.label,
    section: group.label,
    icon: item.icon,
  })),
);

export const principalDashboardShortcuts = [
  { label: "Add Teacher", path: "/principal/teachers/profiles", icon: TeachersIcon },
  { label: "Create Announcement", path: "/principal/communication/announcements", icon: MegaphoneIcon },
  { label: "Generate Report", path: "/principal/reports/general", icon: ChartIcon },
];
