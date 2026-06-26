import { useEffect, useState } from "react";
import { ClipboardList, Plus, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { api } from "../api/api";
import { getSchemes, createScheme } from "../services/schemesService";

export default function SchemesOfWork() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ subject: "", class: "", term: "Term 1", week: 1, themeTopic: "", competency: "", learningOutcomes: "", learningActivities: "", teachingResources: "", references: "", remarks: "", assessmentMethods: "", status: "Draft" });

  const { data: schemes = [] } = useQuery({ queryKey: ["schemes"], queryFn: () => getSchemes() });
  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => api.classes.list() });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => api.classes.list() });

  const safeSchemes = Array.isArray(schemes) ? schemes : [];
  const safeStreams = Array.isArray(streams) ? streams : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const createMutation = useMutation({
    mutationFn: () => createScheme({
      ...formData,
      streamId: selectedStreamId,
      subjectId: selectedSubjectId,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schemes"] });
      setIsModalOpen(false);
      window.alert("Scheme saved");
    },
  });

  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    if (safeStreams.length && !selectedStreamId) setSelectedStreamId(safeStreams[0].id || safeStreams[0].slug || safeStreams[0].name);
  }, [safeStreams, selectedStreamId]);

  useEffect(() => {
    if (safeSubjects.length && !selectedSubjectId) setSelectedSubjectId(safeSubjects[0].id || safeSubjects[0].name);
  }, [safeSubjects, selectedSubjectId]);

  return (
    <div className="page-stack">
      <PageHeader title="Schemes of Work" subtitle="Create and review school schemes aligned to the backend APIs." />
      <div className="card p-4">
        <div className="flex justify-end">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={16} /> New Scheme</button>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Class</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Topic</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {safeSchemes.map((scheme) => (
                <tr key={scheme.id}>
                  <td className="px-4 py-3 font-medium text-slate-800">{scheme.subject}</td>
                  <td className="px-4 py-3 text-slate-600">{scheme.class}</td>
                  <td className="px-4 py-3 text-slate-600">{scheme.themeTopic}</td>
                  <td className="px-4 py-3 text-slate-600">{scheme.status || "Draft"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create Scheme of Work</h3>
              <button onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)}>
                  {safeSubjects.map((subject) => <option key={subject.id || subject.name} value={subject.id || subject.name}>{subject.name || subject.title || subject.slug}</option>)}
                </select>
                <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedStreamId} onChange={(event) => setSelectedStreamId(event.target.value)}>
                  {safeStreams.map((stream) => <option key={stream.id || stream.slug || stream.name} value={stream.id || stream.slug || stream.name}>{stream.name || stream.title || stream.displayName || stream.slug}</option>)}
                </select>
              </div>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Topic" value={formData.themeTopic} onChange={(event) => setFormData({ ...formData, themeTopic: event.target.value })} />
              <textarea className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Learning outcomes" value={formData.learningOutcomes} onChange={(event) => setFormData({ ...formData, learningOutcomes: event.target.value })} />
              <textarea className="min-h-[100px] w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Activities" value={formData.learningActivities} onChange={(event) => setFormData({ ...formData, learningActivities: event.target.value })} />
              <div className="flex justify-end gap-2">
                <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => createMutation.mutate()}>Save</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
