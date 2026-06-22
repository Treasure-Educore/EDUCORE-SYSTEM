export const dashboardStats = [
  {
    title: "Total Students",
    value: "2,480",
    trend: "+12.4%",
    trendDirection: "up",
    subtitle: "from last month",
    accent: "blue",
    icon: "students",
  },
  {
    title: "Total Teachers",
    value: "148",
    trend: "+4.1%",
    trendDirection: "up",
    subtitle: "from last month",
    accent: "emerald",
    icon: "teachers",
  },
  {
    title: "Attendance Rate",
    value: "96.2%",
    trend: "-0.8%",
    trendDirection: "down",
    subtitle: "week-over-week",
    accent: "violet",
    icon: "attendance",
  },
];

export const studentRows = [
  { id: "ST-1001", name: "Amina Nankya", className: "Primary 6", guardian: "Sarah N.", status: "Active", attendance: "98%" },
  { id: "ST-1002", name: "Brian Okello", className: "Primary 5", guardian: "Joseph O.", status: "Active", attendance: "95%" },
  { id: "ST-1003", name: "Catherine Atim", className: "Primary 7", guardian: "Grace A.", status: "At Risk", attendance: "89%" },
  { id: "ST-1004", name: "Daniel Ssemanda", className: "S.2", guardian: "Moses S.", status: "Active", attendance: "97%" },
  { id: "ST-1005", name: "Esther Nakato", className: "S.4", guardian: "Martha N.", status: "Active", attendance: "99%" },
  { id: "ST-1006", name: "Farid Waiswa", className: "Primary 4", guardian: "Aisha W.", status: "Inactive", attendance: "76%" },
];

export const teacherRows = [
  { id: "T-01", name: "Dr. Miriam K.", subject: "Mathematics", className: "Senior 2", contact: "+256 700 111 234", status: "Available" },
  { id: "T-02", name: "John Bosco", subject: "English", className: "Primary 6", contact: "+256 700 111 235", status: "In Class" },
  { id: "T-03", name: "Lydia Namara", subject: "Biology", className: "Senior 4", contact: "+256 700 111 236", status: "Leave" },
  { id: "T-04", name: "Peter Muwonge", subject: "ICT", className: "Senior 1", contact: "+256 700 111 237", status: "Available" },
];

export const classRows = [
  { id: "P-4", className: "Primary 4", teacher: "Peter M.", students: 64, room: "Block A-4", status: "Open" },
  { id: "P-6", className: "Primary 6", teacher: "Amina K.", students: 58, room: "Block B-1", status: "Open" },
  { id: "S-2", className: "Senior 2", teacher: "Miriam K.", students: 42, room: "Block C-2", status: "Open" },
  { id: "S-4", className: "Senior 4", teacher: "Lydia N.", students: 36, room: "Block C-4", status: "Full" },
];

export const libraryRows = [
  { id: "BK-120", title: "Advanced Mathematics", category: "Textbook", copies: 18, issued: 11, status: "Available" },
  { id: "BK-121", title: "English Literature", category: "Textbook", copies: 12, issued: 12, status: "Low Stock" },
  { id: "BK-122", title: "Science Workbook", category: "Workbook", copies: 26, issued: 5, status: "Available" },
];

export const recentActivities = [
  { title: "Attendance review completed", detail: "Brian Okello's attendance summary was updated.", time: "10 mins ago" },
  { title: "Exam results published", detail: "Senior 4 mid-term scores are now available.", time: "45 mins ago" },
  { title: "New student enrolled", detail: "Amina's guardian completed the admission form.", time: "2 hours ago" },
  { title: "Library book issued", detail: "English Literature checked out to Class P6.", time: "3 hours ago" },
];
