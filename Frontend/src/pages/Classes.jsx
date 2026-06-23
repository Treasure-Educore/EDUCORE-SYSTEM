import { useState } from "react";
import DataTable from "../components/DataTable";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import { classStatusOptions, deleteClass, getNextClassId, loadClasses, upsertClass } from "../data/classes";

const emptyDraft = {
  id: "",
  className: "",
  teacher: "",
  students: "",
  capacity: "",
  room: "",
  status: "Open",
};

export default function Classes() {
  const [classes, setClasses] = useState(() => loadClasses());
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});

  const columns = [
    { key: "id", label: "Code", sortable: true },
    { key: "className", label: "Class", sortable: true },
    { key: "teacher", label: "Teacher", sortable: true },
    { key: "students", label: "Students", sortable: true },
    { key: "room", label: "Room", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  function refresh(nextClasses = loadClasses()) {
    setClasses(nextClasses);
  }

  function openEditor(classItem = null) {
    setSelected(classItem);
    setDraft({
      id: classItem?.id || getNextClassId(),
      className: classItem?.className || "",
      teacher: classItem?.teacher || "",
      students: classItem?.students ?? "",
      capacity: classItem?.capacity ?? "",
      room: classItem?.room || "",
      status: classItem?.status || "Open",
    });
    setErrors({});
    setEditorOpen(true);
  }

  function validate(nextDraft) {
    const nextErrors = {};
    const studentCount = Number(nextDraft.students);
    if (!nextDraft.id.trim()) nextErrors.id = "Class code is required.";
    if (!nextDraft.className.trim()) nextErrors.className = "Class name is required.";
    if (!nextDraft.teacher.trim()) nextErrors.teacher = "Class teacher is required.";
    if (nextDraft.students === "" || !Number.isFinite(studentCount) || studentCount < 0) nextErrors.students = "Enter a valid student count.";
    if (!nextDraft.room.trim()) nextErrors.room = "Room is required.";
    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      upsertClass(draft, selected);
      refresh();
      setEditorOpen(false);
      setSelected(null);
      setDraft(emptyDraft);
    } catch (error) {
      setErrors({ form: error.message || "Unable to save class." });
    }
  }

  function handleDelete(classItem) {
    if (!window.confirm("Delete this class record?")) {
      return;
    }

    refresh(deleteClass(classItem.id));
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Classes"
        subtitle="Track class allocation, rooms, and enrollment capacity."
      />
      <DataTable
        title="Class Overview"
        description="Responsive class register with action controls."
        columns={columns}
        data={classes}
        searchPlaceholder="Search classes..."
        onEdit={(row) => openEditor(row)}
        onDelete={(row) => handleDelete(row)}
      />

      <Modal
        open={editorOpen}
        title={selected ? `Edit ${selected.className}` : "Add Class"}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setEditorOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              Save Class
            </button>
          </div>
        }
      >
        {errors.form ? <div className="staff-form__notice staff-form__notice--error">{errors.form}</div> : null}
        <div className="form-grid">
          <FormInput label="Class Code" value={draft.id} onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} error={errors.id} />
          <FormInput label="Class Name" value={draft.className} onChange={(event) => setDraft((current) => ({ ...current, className: event.target.value }))} error={errors.className} />
          <FormInput label="Teacher" value={draft.teacher} onChange={(event) => setDraft((current) => ({ ...current, teacher: event.target.value }))} error={errors.teacher} />
          <FormInput label="Students" type="number" min="0" value={draft.students} onChange={(event) => setDraft((current) => ({ ...current, students: event.target.value }))} error={errors.students} />
          <FormInput label="Capacity" type="number" min="0" value={draft.capacity} onChange={(event) => setDraft((current) => ({ ...current, capacity: event.target.value }))} />
          <FormInput label="Room" value={draft.room} onChange={(event) => setDraft((current) => ({ ...current, room: event.target.value }))} error={errors.room} />
          <label className="form-field">
            <span className="form-field__label">Status</span>
            <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              {classStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
