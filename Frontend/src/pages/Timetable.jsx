import { useEffect, useState } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { api } from "../api/api";
import { getTimetableSlots, createTimetableSlot, updateTimetableSlot, deleteTimetableSlot, getTimetablePeriods } from "../services/timetableService";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [1, 2, 3, 4, 5, 6, 7, 8];

export default function Timetable() {
  const queryClient = useQueryClient();
  const [selectedStreamId, setSelectedStreamId] = useState("");
  const [selectedStreamName, setSelectedStreamName] = useState("");
  const [editing, setEditing] = useState(null);
  const [subject, setSubject] = useState("");
  const [teacher, setTeacher] = useState("");

  const { data: streams = [] } = useQuery({ queryKey: ["streams"], queryFn: () => api.classes.list() });
  const { data: periodsData = [] } = useQuery({ queryKey: ["timetable-periods"], queryFn: getTimetablePeriods });
  const { data: slots = [] } = useQuery({ queryKey: ["timetable-slots", selectedStreamId], queryFn: () => getTimetableSlots({ streamId: selectedStreamId }), enabled: !!selectedStreamId });
  const { data: subjects = [] } = useQuery({ queryKey: ["subjects"], queryFn: () => api.classes.list() });
  const { data: staff = [] } = useQuery({ queryKey: ["staff"], queryFn: () => api.teachers.list() });

  const safeStreams = Array.isArray(streams) ? streams : [];
  const safePeriods = Array.isArray(periodsData) ? periodsData : [];
  const safeSlots = Array.isArray(slots) ? slots : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];
  const safeStaff = Array.isArray(staff) ? staff : [];

  useEffect(() => {
    if (safeStreams.length && !selectedStreamId) {
      const first = safeStreams[0];
      setSelectedStreamId(first.id || first.slug || first.name);
      setSelectedStreamName(first.name || first.title || first.displayName || first.slug || "");
    }
  }, [safeStreams, selectedStreamId]);

  function openEditor(day, period) {
    const existing = safeSlots.find((slot) => slot.day === day && slot.period === period);
    setEditing({ day, period });
    setSubject(existing?.subject || "");
    setTeacher(existing?.teacher || "");
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const existing = safeSlots.find((slot) => slot.day === editing.day && slot.period === editing.period);
      const period = safePeriods.find((item) => item.number === editing.period);
      if (existing) {
        if (!subject && !teacher) {
          await deleteTimetableSlot(existing.id);
          return;
        }
        await updateTimetableSlot(existing.id, { subjectId: subject, teacherId: teacher });
        return;
      }
      await createTimetableSlot({ day: editing.day, periodId: period?.id || "", streamId: selectedStreamId, subjectId: subject, teacherId: teacher });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timetable-slots"] });
      setEditing(null);
      window.alert("Timetable updated");
    },
  });

  return (
    <div className="page-stack">
      <PageHeader title="Timetable" subtitle="Manage period assignments and view the weekly timetable." />
      <div className="card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar size={18} />
            <span className="font-semibold">{selectedStreamName || "Select a class"}</span>
          </div>
          <select className="rounded-md border border-slate-300 px-3 py-2" value={selectedStreamId} onChange={(event) => {
            const stream = streams.find((item) => (item.id || item.slug || item.name) === event.target.value);
            setSelectedStreamId(event.target.value);
            setSelectedStreamName(stream?.name || stream?.title || stream?.displayName || stream?.slug || "");
          }}>
            {safeStreams.map((stream) => <option key={stream.id || stream.slug || stream.name} value={stream.id || stream.slug || stream.name}>{stream.name || stream.title || stream.displayName || stream.slug}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Day</th>
                {periods.map((period) => <th key={period} className="px-4 py-3 text-center font-semibold text-slate-700">{period}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {days.map((day) => (
                <tr key={day}>
                  <td className="px-4 py-3 font-medium text-slate-700">{day}</td>
                  {periods.map((period) => {
                    const slot = safeSlots.find((item) => item.day === day && item.period === period);
                    return (
                      <td key={`${day}-${period}`} className="px-2 py-2 align-top">
                        <button className="w-full rounded-lg border border-slate-200 px-3 py-3 text-left text-sm hover:border-emerald-400" onClick={() => openEditor(day, period)}>
                          {slot ? `${slot.subject || "Subject"} • ${slot.teacher || "Teacher"}` : "Tap to add"}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Edit period</h3>
            <button className="text-slate-400" onClick={() => setEditing(null)}>Close</button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select className="rounded-md border border-slate-300 px-3 py-2" value={subject} onChange={(event) => setSubject(event.target.value)}>
              {safeSubjects.map((item) => <option key={item.id || item.name} value={item.id || item.name}>{item.name || item.title || item.slug}</option>)}
            </select>
            <select className="rounded-md border border-slate-300 px-3 py-2" value={teacher} onChange={(event) => setTeacher(event.target.value)}>
              {safeStaff.map((item) => <option key={item.id || item.user?.id} value={item.id || item.user?.id}>{item.fullName || item.name || item.username}</option>)}
            </select>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => saveMutation.mutate()}>Save</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
