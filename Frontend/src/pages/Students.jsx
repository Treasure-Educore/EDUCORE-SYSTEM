import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import FormInput from "../components/FormInput";
import { deleteStudentProfile, getNextStudentId, getStudentProfile, loadStudents, upsertStudentProfile } from "../data/studentProfiles";

const emptyDraft = {
  name: "",
  id: "",
  className: "",
  guardian: "",
  status: "Active",
};

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(() => loadStudents());
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Student", sortable: true },
    { key: "className", label: "Class", sortable: true },
    { key: "guardian", label: "Guardian", sortable: true },
    { key: "status", label: "Status", sortable: true },
  ];

  function refresh(nextStudents = loadStudents()) {
    setStudents(nextStudents);
  }

  function openEditor(row) {
    if (!row) {
      return;
    }

    setSelected(row || null);
    setDraft({
      name: row?.name || "",
      id: row?.id || getNextStudentId(),
      className: row?.className || "",
      guardian: row?.guardian || "",
      status: row?.status || "Active",
    });
    setErrors({});
    setEditorOpen(true);
  }

  function validate(nextDraft) {
    const nextErrors = {};
    if (!nextDraft.name.trim()) nextErrors.name = "Student name is required.";
    if (!nextDraft.id.trim()) nextErrors.id = "Student ID is required.";
    if (!nextDraft.className.trim()) nextErrors.className = "Class is required.";
    if (!nextDraft.guardian.trim()) nextErrors.guardian = "Guardian name is required.";
    if (!nextDraft.status.trim()) nextErrors.status = "Status is required.";
    return nextErrors;
  }

  function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      upsertStudentProfile(draft, selected ? getStudentProfile(selected.id) : null);
      refresh();
      setEditorOpen(false);
      setSelected(null);
      setDraft(emptyDraft);
    } catch (error) {
      setErrors({ form: error.message || "Unable to save student." });
    }
  }

  function handleDelete(row) {
    if (!window.confirm("Delete this student record?")) {
      return;
    }

    refresh(deleteStudentProfile(row.id));
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Students"
        subtitle="Manage learner records, guardians, and attendance in a clean responsive table."
      />

      <DataTable
        title="Student Directory"
        description="Search, sort, paginate, and perform row actions without leaving the page."
        columns={columns}
        data={students}
        searchPlaceholder="Search students..."
        onView={(row) => navigate(`/students/${row.id}`)}
        onEdit={(row) => openEditor(row)}
        onDelete={(row) => handleDelete(row)}
      />

      <Modal
        open={editorOpen}
        title={selected ? `Edit ${selected.name}` : "Add Student"}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setEditorOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              Save Student
            </button>
          </div>
        }
      >
        {errors.form ? <div className="staff-form__notice staff-form__notice--error">{errors.form}</div> : null}
        <div className="form-grid">
          <FormInput
            label="Student Name"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            placeholder="Enter full name"
            error={errors.name}
          />
          <FormInput
            label="Student ID"
            value={draft.id}
            onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))}
            placeholder="ST-0000"
            error={errors.id}
          />
          <FormInput
            label="Class"
            value={draft.className}
            onChange={(event) => setDraft((current) => ({ ...current, className: event.target.value }))}
            placeholder="Primary 6"
            error={errors.className}
          />
          <FormInput
            label="Guardian"
            value={draft.guardian}
            onChange={(event) => setDraft((current) => ({ ...current, guardian: event.target.value }))}
            placeholder="Guardian name"
            error={errors.guardian}
          />
          <label className="form-field">
            <span className="form-field__label">Status</span>
            <select className={errors.status ? "is-invalid" : ""} value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              <option value="Active">Active</option>
              <option value="At Risk">At Risk</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
            {errors.status ? <small className="form-field__error">{errors.status}</small> : null}
          </label>
        </div>
      </Modal>
    </div>
  );
}
