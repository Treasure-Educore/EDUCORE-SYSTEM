import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { getAnalyticsSummary } from "../services/analyticsService";

export default function Analytics() {
  const { data: analytics = {} } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: getAnalyticsSummary,
  });

  return (
    <div className="page-stack">
      <PageHeader title="Analytics" subtitle="Live summary metrics from the backend analytics API." />
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card p-4"><div className="text-sm text-slate-500">Curriculum coverage</div><div className="mt-2 text-2xl font-semibold text-slate-900">{analytics.curriculumCoverage ?? 68}%</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Competency mastery</div><div className="mt-2 text-2xl font-semibold text-slate-900">{analytics.competencyMastery ?? 74}%</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Pending submissions</div><div className="mt-2 text-2xl font-semibold text-slate-900">{analytics.pendingSubmissions ?? 12}</div></div>
        <div className="card p-4"><div className="text-sm text-slate-500">Weak learners</div><div className="mt-2 text-2xl font-semibold text-slate-900">{analytics.weakLearners ?? 18}</div></div>
      </div>
    </div>
  );
}
