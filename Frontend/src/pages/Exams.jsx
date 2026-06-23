import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

export default function Exams() {
  return (
    <div className="page-stack">
      <PageHeader title="Exams" subtitle="Create results, schedules, and performance summaries." />
      <EmptyState title="Exam workspace ready" description="This area is prepared for results tables, grading forms, and report cards." />
    </div>
  );
}
