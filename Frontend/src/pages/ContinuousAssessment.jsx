import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { api } from "../api/api";
import { getCARecords, bulkSubmit } from "../services/assessmentsService";

export default function ContinuousAssessment() {
  const queryClient = useQueryClient();
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [rows, setRows] = useState([]);

  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => api.classes.list() });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => api.classes.list() });
  const { data: terms = [] } = useQuery({ queryKey: ["terms"], queryFn: () => api.classes.list() });

  const safeStreams = Array.isArray(streams) ? streams : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeTerms = Array.isArray(terms) ? terms : [];

  useEffect(() => {
    if (safeStreams.length && !selectedStreamId) setSelectedStreamId(safeStreams[0].id || safeStreams[0].slug || safeStreams[0].name);
  }, [safeStreams, selectedStreamId]);

  useEffect(() => {
    if (safeSubjects.length && !selectedSubjectId) setSelectedSubjectId(safeSubjects[0].id || safeSubjects[0].name);
  }, [safeSubjects, selectedSubjectId]);

  useEffect(() => {
    if (safeTerms.length && !selectedTermId) setSelectedTermId(safeTerms[0].id || safeTerms[0].name);
  }, [safeTerms, selectedTermId]);

  const { data: apiRows = [] } = useQuery({
    queryKey: ["ca-records", selectedStreamId, selectedSubjectId, selectedTermId],
    queryFn: () => getCARecords({ streamId: selectedStreamId, subjectId: selectedSubjectId, termId: selectedTermId }),
    enabled: !!(selectedStreamId && selectedSubjectId && selectedTermId),
  });

  useEffect(() => {
    setRows((apiRows || []).map((row) => ({
      studentId: row.studentId,
      studentNumber: row.studentNumber,
      name: row.name,
      test1: row.activity1 ?? "",
      test2: row.activity2 ?? "",
      exam: row.project ?? "",
      grade: row.grade ?? "Basic",
    })));
  }, [apiRows]);

  const mutation = useMutation({
    mutationFn: () => bulkSubmit({
      streamId: selectedStreamId,
      subjectId: selectedSubjectId,
      termId: selectedTermId,
      records: rows.map((row) => ({ studentId: row.studentId, activity1: row.test1, activity2: row.test2, project: row.exam }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ca-records"] });
      window.alert("Continuous assessment submitted");
    },
  });

  return (
    <div className="page-stack">
      <PageHeader title="Continuous Assessment" subtitle="Capture learner assessment data and submit it to the backend." />
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedStreamId} onChange={(event) => setSelectedStreamId(event.target.value)}>
            {safeStreams.map((stream) => <option key={stream.id || stream.slug || stream.name} value={stream.id || stream.slug || stream.name}>{stream.name || stream.title || stream.displayName || stream.slug}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)}>
            {safeSubjects.map((subject) => <option key={subject.id || subject.name} value={subject.id || subject.name}>{subject.name || subject.title || subject.slug}</option>)}
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedTermId} onChange={(event) => setSelectedTermId(event.target.value)}>
            {safeTerms.map((term) => <option key={term.id || term.name} value={term.id || term.name}>{term.name || term.title || term.slug}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-3 text-left">Learner</th>
                <th className="px-3 py-3 text-center">Test 1</th>
                <th className="px-3 py-3 text-center">Test 2</th>
                <th className="px-3 py-3 text-center">Exam</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row.studentId}>
                  <td className="px-3 py-3 font-medium text-slate-800">{row.name}</td>
                  <td className="px-3 py-3 text-center"><input className="w-20 rounded border border-slate-300 px-2 py-1" value={row.test1} onChange={(event) => setRows((current) => current.map((item) => item.studentId === row.studentId ? { ...item, test1: event.target.value } : item))} /></td>
                  <td className="px-3 py-3 text-center"><input className="w-20 rounded border border-slate-300 px-2 py-1" value={row.test2} onChange={(event) => setRows((current) => current.map((item) => item.studentId === row.studentId ? { ...item, test2: event.target.value } : item))} /></td>
                  <td className="px-3 py-3 text-center"><input className="w-20 rounded border border-slate-300 px-2 py-1" value={row.exam} onChange={(event) => setRows((current) => current.map((item) => item.studentId === row.studentId ? { ...item, exam: event.target.value } : item))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={() => mutation.mutate()}>Submit assessment</button>
        </div>
      </div>
    </div>
  );
}
