import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

export default function Reports() {
  return (
    <div className="page-stack">
      <PageHeader title="Reports" subtitle="Summary reports, exports, and analytics can be layered in here." />
      <EmptyState title="Reports dashboard" description="Use this section for charts, downloadable exports, and school-wide performance insights." />
    </div>
  );
}
