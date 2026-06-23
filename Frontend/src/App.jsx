import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import PrincipalLayout from "./layouts/PrincipalLayout";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Library from "./pages/Library";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RequireAuth from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Overview from "./pages/principal/Overview";
import ModulePage from "./pages/principal/ModulePage";
import StaffList from "./pages/principal/StaffList";
import StaffForm from "./pages/principal/StaffForm";
import StaffDetail from "./pages/principal/StaffDetail";
import StaffRoles from "./pages/principal/StaffRoles";
import Departments from "./pages/principal/Departments";
import StudentForm from "./pages/principal/StudentForm";
import StudentProfile from "./pages/StudentProfile";
import { principalModulePages } from "./data/principalModules";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>
        <Route path="/principal" element={<PrincipalLayout />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<Overview />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/new" element={<StaffForm mode="create" />} />
          <Route path="staff/:id" element={<StaffDetail />} />
          <Route path="staff/:id/edit" element={<StaffForm mode="edit" />} />
          <Route path="staff/:id/roles" element={<StaffRoles />} />
          <Route path="departments" element={<Departments />} />
          <Route path="students/registration" element={<StudentForm mode="create" />} />
          <Route path="students/registration/:studentId/edit" element={<StudentForm mode="edit" />} />
          {principalModulePages.filter((page) => page.path !== "students/registration").map((page) => (
            <Route key={page.path} path={page.path} element={<ModulePage meta={page} />} />
          ))}
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="students/:studentId" element={<StudentProfile />} />
          <Route path="students" element={<Students />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="classes" element={<Classes />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="exams" element={<Exams />} />
          <Route path="library" element={<Library />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
