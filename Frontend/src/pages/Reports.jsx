import { useEffect, useMemo, useState } from "react";
import { Download, Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { api } from "../api/api";
import { getReportCard, downloadReportCardPDF } from "../services/reportsService";

export default function Reports() {
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: streams = [] } = useQuery({
    queryKey: ["streams"],
    queryFn: () => api.classes.list(),
  });

  const safeStreams = Array.isArray(streams) ? streams : [];

  const { data: students = [] } = useQuery({
    queryKey: ["students", selectedStreamId],
    queryFn: () => api.students.list(),
    enabled: !!selectedStreamId,
  });

  useEffect(() => {
    if (safeStreams.length && !selectedStreamId) {
      setSelectedStreamId(safeStreams[0].id || safeStreams[0].slug || safeStreams[0].name);
    }
  }, [safeStreams, selectedStreamId]);

  const filteredStudents = useMemo(() => {
    if (!selectedStreamId) return [];
    return (students || []).filter((student) => {
      const streamValue = student.stream || student.className || student.class_name || student.streamName || "";
      return String(streamValue).toLowerCase() === String(selectedStreamId).toLowerCase();
    });
  }, [students, selectedStreamId]);

  const { data: reportCard, isLoading } = useQuery({
    queryKey: ["report-card", selectedStudent?.id],
    queryFn: () => getReportCard(selectedStudent?.id),
    enabled: !!selectedStudent?.id,
  });

  const reportSubjects = Array.isArray(reportCard?.subjects) ? reportCard.subjects : [];

  async function handleDownload() {
    if (!selectedStudent?.id) return;
    setIsGenerating(true);
    try {
      await downloadReportCardPDF(selectedStudent.id);
      window.alert("Report card downloaded successfully");
    } catch {
      window.alert("Failed to download report card");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Reports"
        subtitle="Student report cards and exports are now connected to the backend data sources."
        action={
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={16} />
              Print
            </button>
            <button className="btn btn-primary" onClick={handleDownload} disabled={isGenerating || !selectedStudent}>
              <Download size={16} />
              {isGenerating ? "Generating..." : "Download"}
            </button>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="card p-4">
          <label className="text-sm font-medium text-slate-700">Class</label>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            value={selectedStreamId}
            onChange={(event) => {
              setSelectedStreamId(event.target.value);
              setSelectedStudent(null);
            }}
          >
            <option value="">Select a class</option>
            {safeStreams.map((stream) => (
              <option key={stream.id || stream.slug || stream.name} value={stream.id || stream.slug || stream.name}>
                {stream.name || stream.title || stream.displayName || stream.slug}
              </option>
            ))}
          </select>

          <div className="mt-4 space-y-2">
            {(filteredStudents || []).length === 0 && selectedStreamId ? (
              <EmptyState title="No students found" description="The selected class currently has no students in the API response." />
            ) : null}
            {(filteredStudents || []).map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full rounded-lg border px-3 py-3 text-left ${selectedStudent?.id === student.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white"}`}
              >
                <div className="font-medium text-slate-800">{student.fullName || student.name || student.username}</div>
                <div className="text-sm text-slate-500">{student.studentNumber || student.admissionNumber || student.id}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          {!selectedStudent ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <EmptyState title="Choose a learner" description="Select a student from the list to preview their report card." />
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">Loading report card...</div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedStudent.fullName || selectedStudent.name}</h3>
                  <p className="text-sm text-slate-500">{selectedStudent.studentNumber || selectedStudent.admissionNumber || selectedStudent.id}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  <strong>Position:</strong> {reportCard?.position ?? "—"} / {reportCard?.outOf ?? "—"}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Class</div>
                  <div className="mt-1 font-semibold text-slate-900">{selectedStudent.stream || selectedStudent.className || "—"}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Average</div>
                  <div className="mt-1 font-semibold text-slate-900">{reportCard?.average ?? "—"}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Attendance</div>
                  <div className="mt-1 font-semibold text-slate-900">{reportCard?.attendance ?? "—"}</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Subject</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Test 1</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Test 2</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Exam</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Total</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {reportSubjects.map((subject) => (
                      <tr key={subject.subject}>
                        <td className="px-4 py-3 font-medium text-slate-800">{subject.subject}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{subject.test1 ?? "—"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{subject.test2 ?? "—"}</td>
                        <td className="px-4 py-3 text-center text-slate-600">{subject.exam ?? "—"}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-800">{subject.total ?? "—"}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-800">{subject.grade ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
