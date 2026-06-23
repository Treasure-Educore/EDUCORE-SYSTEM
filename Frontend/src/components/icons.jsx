import React from "react";

function IconShell({ children, title }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img" data-title={title}>
      {children}
    </svg>
  );
}

export function DashboardIcon() {
  return (
    <IconShell title="Dashboard">
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" />
    </IconShell>
  );
}

export function StudentsIcon() {
  return (
    <IconShell title="Students">
      <path d="M7 11a4 4 0 1 0-0.001-8.001A4 4 0 0 0 7 11zm10 0a3 3 0 1 0-.001-6.001A3 3 0 0 0 17 11zM3 20c0-3.314 2.686-6 6-6s6 2.686 6 6M13 20c0-2.21 1.79-4 4-4s4 1.79 4 4" />
    </IconShell>
  );
}

export function TeachersIcon() {
  return (
    <IconShell title="Teachers">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8c0-3.866 3.134-7 7-7s7 3.134 7 7M17 7h4M19 5v4" />
    </IconShell>
  );
}

export function ClassesIcon() {
  return (
    <IconShell title="Classes">
      <path d="M4 6h16v12H4zM4 10h16M8 6v12M16 6v12" />
    </IconShell>
  );
}

export function AttendanceIcon() {
  return (
    <IconShell title="Attendance">
      <path d="M9 11l2 2 4-4M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
    </IconShell>
  );
}

export function ExamsIcon() {
  return (
    <IconShell title="Exams">
      <path d="M8 4h8v3H8zM6 7h12v13H6zM9 12h6M9 16h6" />
    </IconShell>
  );
}

export function LibraryIcon() {
  return (
    <IconShell title="Library">
      <path d="M4 19a2 2 0 0 0 2 2h14M6 3h14v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 7h8M9 11h8" />
    </IconShell>
  );
}

export function ReportsIcon() {
  return (
    <IconShell title="Reports">
      <path d="M5 19h14M7 16V9M12 16V5M17 16v-7" />
    </IconShell>
  );
}

export function SettingsIcon() {
  return (
    <IconShell title="Settings">
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.5 4a6.5 6.5 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a6.8 6.8 0 0 0-1.7-1L16 3h-4l-.3 3a6.8 6.8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a6.5 6.5 0 0 0 0 2L5.6 13.5l2 3.5 2.4-1a6.8 6.8 0 0 0 1.7 1L12 21h4l.3-3a6.8 6.8 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" />
    </IconShell>
  );
}

export function SearchIcon() {
  return (
    <IconShell title="Search">
      <path d="M10.5 4a6.5 6.5 0 1 0 4.22 11.43l4.42 4.42 1.42-1.42-4.42-4.42A6.5 6.5 0 0 0 10.5 4z" />
    </IconShell>
  );
}

export function BellIcon() {
  return (
    <IconShell title="Notifications">
      <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zM5 17h14l-1.5-2v-4a5.5 5.5 0 0 0-11 0v4z" />
    </IconShell>
  );
}

export function ChevronDownIcon() {
  return (
    <IconShell title="Chevron Down">
      <path d="M6 9l6 6 6-6" />
    </IconShell>
  );
}

export function MenuIcon() {
  return (
    <IconShell title="Menu">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </IconShell>
  );
}

export function CloseIcon() {
  return (
    <IconShell title="Close">
      <path d="M6 6l12 12M18 6L6 18" />
    </IconShell>
  );
}

export function PlusIcon() {
  return (
    <IconShell title="Add">
      <path d="M12 5v14M5 12h14" />
    </IconShell>
  );
}

export function TrendUpIcon() {
  return (
    <IconShell title="Trend Up">
      <path d="M4 16l6-6 4 4 6-8" />
    </IconShell>
  );
}

export function TrendDownIcon() {
  return (
    <IconShell title="Trend Down">
      <path d="M4 8l6 6 4-4 6 8" />
    </IconShell>
  );
}

export function UserIcon() {
  return (
    <IconShell title="User">
      <path d="M12 12a4 4 0 1 0-0.001-8.001A4 4 0 0 0 12 12zm-7 8c0-3.314 3.134-6 7-6s7 2.686 7 6" />
    </IconShell>
  );
}

export function EyeIcon() {
  return (
    <IconShell title="View">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </IconShell>
  );
}

export function EditIcon() {
  return (
    <IconShell title="Edit">
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4zM13 7l4 4" />
    </IconShell>
  );
}

export function TrashIcon() {
  return (
    <IconShell title="Delete">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </IconShell>
  );
}

export function MessageIcon() {
  return (
    <IconShell title="Messages">
      <path d="M4 5h16v11H8l-4 4V5zm3 4h10M7 12h7" />
    </IconShell>
  );
}

export function MegaphoneIcon() {
  return (
    <IconShell title="Announcements">
      <path d="M4 12l10-5v10L4 12zm10-5l6 2v6l-6 2M8 17l1 4h2l-1-4" />
    </IconShell>
  );
}

export function ChartIcon() {
  return (
    <IconShell title="Analytics">
      <path d="M5 19h14M7 16V9M12 16V5M17 16v-7" />
    </IconShell>
  );
}

export function ShieldIcon() {
  return (
    <IconShell title="Security">
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
    </IconShell>
  );
}

export function BookIcon() {
  return (
    <IconShell title="Books">
      <path d="M6 4h11a3 3 0 0 1 3 3v13H8a2 2 0 0 0-2 2V4zM8 7h10M8 11h10" />
    </IconShell>
  );
}
