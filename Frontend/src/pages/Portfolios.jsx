import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { api } from "../api/api";
import { getPortfolios } from "../services/portfoliosService";

export default function Portfolios() {
  const [selectedStudent, setSelectedStudent] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: () => api.students.list(),
  });

  const safeStudents = Array.isArray(students) ? students : [];

  useEffect(() => {
    if (safeStudents.length && !selectedStudent) {
      setSelectedStudent(safeStudents[0].studentNumber || safeStudents[0].id);
    }
  }, [safeStudents, selectedStudent]);

  const { data: portfolios = [] } = useQuery({
    queryKey: ["portfolios", selectedStudent],
    queryFn: () => getPortfolios({ studentNumber: selectedStudent }),
    enabled: !!selectedStudent,
  });

  return (
    <div className="page-stack">
      <PageHeader title="Learner Portfolios" subtitle="Browse learner evidence and portfolio items from the backend." />
      <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <div className="card p-4">
          <h3 className="font-semibold text-slate-900">Learners</h3>
          <div className="mt-3 space-y-2">
            {safeStudents.map((student) => (
              <button
                key={student.id}
                className={`w-full rounded-lg border px-3 py-3 text-left ${selectedStudent === (student.studentNumber || student.id) ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}
                onClick={() => setSelectedStudent(student.studentNumber || student.id)}
              >
                <div className="font-medium text-slate-800">{student.fullName || student.name}</div>
                <div className="text-sm text-slate-500">{student.studentNumber || student.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          {(portfolios || []).length === 0 ? (
            <EmptyState title="No portfolio items" description="There are no portfolio records returned for the selected learner yet." />
          ) : (
            <div className="space-y-3">
              {(portfolios || []).map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="font-semibold text-slate-900">{item.title || item.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{item.description || item.notes || "Portfolio evidence"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
