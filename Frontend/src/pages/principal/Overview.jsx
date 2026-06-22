import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PrincipalChartCard from "../../components/principal/PrincipalChartCard";
import PrincipalStatCard from "../../components/principal/PrincipalStatCard";
import { useAuth } from "../../context/AuthContext";
import {
  principalActivities,
  principalAnnouncements,
  principalAttendance,
  principalEnrollment,
  principalPerformance,
  principalRecentStudents,
  principalStats,
} from "../../data/principalDashboard";
import { principalDashboardShortcuts } from "../../data/principalNavigation";

export default function Overview() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 650);

    return () => window.clearTimeout(timer);
  }, []);

  if (error) {
    return (
      <div className="principal-page">
        <EmptyState title="Unable to load principal overview" description={error} />
      </div>
    );
  }

  return (
    <div className="principal-page">
      <section className="principal-hero">
        <div>
          <p className="principal-hero__eyebrow">Principal Super Administration</p>
          <h2>School-wide operations at a glance</h2>
          <p className="principal-hero__copy">
            Monitor every department, every report, and every key metric from one central command center.
          </p>
        </div>
        <div className="principal-hero__panel">
          <strong>System status</strong>
          <span>All core modules are operational</span>
        </div>
      </section>

      <section className="principal-stat-grid">
        {loading ? <LoadingSkeleton rows={2} columns={3} /> : principalStats.map((stat) => <PrincipalStatCard key={stat.title} {...stat} />)}
      </section>

      <section className="principal-grid">
        <article className="principal-card">
          <div className="principal-card__header">
            <div>
              <h3>Recent Activity</h3>
              <p>Latest school movements and updates.</p>
            </div>
          </div>

          <div className="principal-activity-list">
            {principalActivities.map((activity) => (
              <div className="principal-activity-item" key={activity.title}>
                <strong>{activity.title}</strong>
                <p>{activity.detail}</p>
                <span>{activity.time}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="principal-card">
          <div className="principal-card__header">
            <div>
              <h3>Latest Announcements</h3>
              <p>Communication broadcast across the school.</p>
            </div>
          </div>

          <div className="principal-announcement-list">
            {principalAnnouncements.map((announcement) => (
              <div className="principal-announcement-item" key={announcement.title}>
                <strong>{announcement.title}</strong>
                <p>{announcement.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="principal-actions">
        {principalDashboardShortcuts.filter((action) => !action.accessRoles || action.accessRoles.includes(role)).map((action) => (
          <Link key={action.label} to={action.path} className="principal-action-card">
            <span className="principal-action-card__icon" aria-hidden="true">
              <action.icon />
            </span>
            <strong>{action.label}</strong>
            <span>Open workspace</span>
          </Link>
        ))}
      </section>

      <section className="principal-analytics">
        <PrincipalChartCard title="Student Enrollment Trends" subtitle="Year-over-year enrollment growth" type="line" data={principalEnrollment} />
        <PrincipalChartCard title="Attendance Trends" subtitle="Weekly attendance stability" type="bar" data={principalAttendance} />
        <PrincipalChartCard title="Academic Performance Summary" subtitle="High-level results distribution" type="donut" data={principalPerformance} />
      </section>

      {!loading ? (
        <article className="principal-card">
          <div className="principal-card__header">
            <div>
              <h3>Recently Registered Students</h3>
              <p>Fresh admissions to the school register.</p>
            </div>
          </div>

          <div className="principal-student-strip">
            {principalRecentStudents.map((student) => (
              <div className="principal-student-chip" key={student.id}>
                <strong>{student.name}</strong>
                <span>{student.id}</span>
                <small>{student.className}</small>
              </div>
            ))}
          </div>
        </article>
      ) : null}
    </div>
  );
}
