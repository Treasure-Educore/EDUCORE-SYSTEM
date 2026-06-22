import DashboardCard from "../components/DashboardCard";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { dashboardStats, recentActivities, studentRows } from "../data/mockData";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { role } = useAuth();
  const canAddStudents = role === "non-teaching-staff";
  const columns = [
    { key: "id", label: "Student ID", sortable: true },
    { key: "name", label: "Student", sortable: true },
    { key: "className", label: "Class", sortable: true },
    { key: "guardian", label: "Guardian", sortable: true },
    { key: "attendance", label: "Attendance", sortable: true },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        subtitle="Track school performance, attendance, and student activity from one place."
        action={
          <div className="settings-actions">
            {canAddStudents ? (
              <Link className="primary-button" to="/principal/students/registration">
                Add Student
              </Link>
            ) : null}
            <button type="button" className="primary-button">
              Download report
            </button>
          </div>
        }
      />

      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <DashboardCard key={stat.title} {...stat} />
        ))}
      </section>

      <section className="dashboard-grid">
        <DataTable
          title="Recent Students"
          description="Quick snapshot of active learners and their guardians."
          columns={columns}
          data={studentRows}
          searchPlaceholder="Search students..."
        />

        <aside className="panel-card">
          <div className="panel-card__header">
            <h3>Recent Activity</h3>
            <span>Live</span>
          </div>
          <div className="activity-list">
            {recentActivities.map((item) => (
              <article className="activity-item" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
                <span>{item.time}</span>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
