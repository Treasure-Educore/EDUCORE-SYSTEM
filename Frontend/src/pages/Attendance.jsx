import PageHeader from "../components/PageHeader";
import LoadingSkeleton from "../components/LoadingSkeleton";

export default function Attendance() {
  return (
    <div className="page-stack">
      <PageHeader title="Attendance" subtitle="Attendance analytics and daily registers can render here." />
      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h3>Attendance Register</h3>
            <p>Designed for live check-in, filtering, and quick validation feedback.</p>
          </div>
        </div>
        <LoadingSkeleton rows={5} columns={4} />
      </section>
    </div>
  );
}
