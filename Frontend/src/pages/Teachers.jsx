import { useMemo, useState } from "react";
import EmptyState from "../components/EmptyState";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import PageHeader from "../components/PageHeader";
import DataTable from "../components/DataTable";
import { useAuth } from "../context/AuthContext";
import { deleteTeacher, loadTeachers, teacherLeadershipOptions, upsertTeacher } from "../data/teachers";
import { canManageTeacherAssignments, canViewTeacherManagement } from "../data/teacherPermissions";

const initialFormState = {
  id: "",
  firstName: "",
  lastName: "",
  subjects: "",
  primaryRole: "Teacher",
  leadershipAssignments: [],
  assignedClasses: "",
  hodDepartment: "",
  className: "",
  department: "",
  qualification: "",
  contact: "",
  email: "",
  address: "",
  dateOfEmployment: "",
  status: "Available",
};

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLeadershipAssignments(teacher) {
  const assignments = Array.isArray(teacher?.leadershipAssignments) ? teacher.leadershipAssignments : [];
  return teacherLeadershipOptions.filter((role) => assignments.includes(role));
}

function hasLeadershipAssignment(source, role) {
  return source.leadershipAssignments.includes(role);
}

function formatTeacherLeadership(teacher) {
  const assignments = getLeadershipAssignments(teacher);
  return assignments.length ? `Teacher + ${assignments.join(" + ")}` : "Teacher only";
}

function createFormState(teacher) {
  if (!teacher) {
    return { ...initialFormState, leadershipAssignments: [] };
  }

  const leadershipAssignments = getLeadershipAssignments(teacher);

  return {
    id: teacher.id || "",
    firstName: teacher.firstName || "",
    lastName: teacher.lastName || "",
    subjects: teacher.subjects?.join(", ") || teacher.subject || "",
    primaryRole: teacher.primaryRole || "Teacher",
    leadershipAssignments,
    assignedClasses: teacher.assignedClasses?.join(", ") || (leadershipAssignments.includes("Class Teacher") ? teacher.className || "" : ""),
    hodDepartment: teacher.hodDepartment || (leadershipAssignments.includes("Head of Department") ? teacher.department || "" : ""),
    className: teacher.className || "",
    department: teacher.department || "",
    qualification: teacher.qualification || "",
    contact: teacher.contact || "",
    email: teacher.email || "",
    address: teacher.address || "",
    dateOfEmployment: teacher.dateOfEmployment || "",
    status: teacher.status || "Available",
  };
}

export default function Teachers() {
  const { role } = useAuth();
  const canViewTeachers = canViewTeacherManagement(role);
  const canManageAssignments = canManageTeacherAssignments(role);
  const [teachers, setTeachers] = useState(() => loadTeachers());
  const [editorOpen, setEditorOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Teacher", sortable: true },
    {
      key: "subjects",
      label: "Subjects",
      sortable: true,
      render: (teacher) => teacher.subjects?.join(", ") || teacher.subject || "Not assigned",
    },
    {
      key: "leadershipAssignments",
      label: "Leadership",
      sortable: true,
      render: (teacher) => formatTeacherLeadership(teacher),
    },
    {
      key: "assignedClasses",
      label: "Classes",
      sortable: true,
      render: (teacher) => teacher.assignedClasses?.join(", ") || "None",
    },
    { key: "status", label: "Status", sortable: true },
  ];

  const teacherCount = useMemo(() => teachers.length, [teachers]);

  function refresh(nextTeachers = loadTeachers()) {
    setTeachers(nextTeachers);
  }

  function openEditor(teacher = null) {
    setSelected(teacher);
    setDraft(createFormState(teacher));
    setErrors({});
    setMessage("");
    setEditorOpen(true);
  }

  function validate(nextDraft) {
    const nextErrors = {};
    if (!nextDraft.id.trim()) nextErrors.id = "Teacher ID is required.";
    if (!nextDraft.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!nextDraft.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!nextDraft.subjects.trim()) nextErrors.subjects = "Enter at least one subject.";
    if (!nextDraft.department.trim()) nextErrors.department = "Department is required.";
    if (!nextDraft.contact.trim()) nextErrors.contact = "Phone number is required.";
    if (!nextDraft.email.trim()) nextErrors.email = "Email is required.";
    if (!nextDraft.dateOfEmployment.trim()) nextErrors.dateOfEmployment = "Employment date is required.";
    if (hasLeadershipAssignment(nextDraft, "Class Teacher") && !nextDraft.assignedClasses.trim()) {
      nextErrors.assignedClasses = "Assign at least one class for a class teacher.";
    }
    if (hasLeadershipAssignment(nextDraft, "Head of Department") && !nextDraft.hodDepartment.trim()) {
      nextErrors.hodDepartment = "Select the department this teacher leads.";
    }
    return nextErrors;
  }

  function updateLeadershipAssignment(role, checked) {
    setDraft((current) => {
      const leadershipAssignments = checked
        ? [...new Set([...current.leadershipAssignments, role])]
        : current.leadershipAssignments.filter((assignment) => assignment !== role);

      return {
        ...current,
        leadershipAssignments,
        assignedClasses: leadershipAssignments.includes("Class Teacher") ? current.assignedClasses : "",
        hodDepartment: leadershipAssignments.includes("Head of Department") ? current.hodDepartment : "",
      };
    });
  }

  function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const subjects = parseList(draft.subjects);
      const assignedClasses = hasLeadershipAssignment(draft, "Class Teacher") ? parseList(draft.assignedClasses) : [];
      const saved = upsertTeacher(
        {
          ...draft,
          primaryRole: "Teacher",
          subjects,
          subject: subjects.join(", "),
          assignedClasses,
          className: assignedClasses.length ? assignedClasses.join(", ") : draft.className,
          hodDepartment: hasLeadershipAssignment(draft, "Head of Department") ? draft.hodDepartment : "",
          name: `${draft.firstName} ${draft.lastName}`.trim(),
        },
        selected,
      );
      setMessage("Teacher saved successfully.");
      refresh(loadTeachers());
      setEditorOpen(false);
      setSelected(null);
      setDraft(initialFormState);
      return saved;
    } catch (error) {
      setErrors({ form: error.message || "Unable to save teacher." });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(teacher) {
    if (!window.confirm("Delete this teacher record?")) {
      return;
    }
    refresh(deleteTeacher(teacher.id));
  }

  if (!canViewTeachers) {
    return (
      <div className="page-stack">
        <EmptyState
          title="Access denied"
          description="Only administrators, DOS, principals, and head teachers can access teacher management."
        />
      </div>
    );
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Teachers"
        subtitle="Manage teacher records, assignments, and availability in a familiar student-style flow."
        action={
          <button type="button" className="primary-button" onClick={() => openEditor(null)}>
            Add Teacher
          </button>
        }
      />

      <section className="stats-grid">
        <article className="stat-card card--blue">
          <strong className="stat-card__value">{teacherCount}</strong>
          <p className="stat-card__title">Total Teachers</p>
          <span className="stat-card__subtitle">Staff directory</span>
        </article>
      </section>

      {message ? <div className="staff-form__notice staff-form__notice--success">{message}</div> : null}

      <DataTable
        title="Teacher List"
        description="Modern staff management with search, sorting, row actions, and modal editing."
        columns={columns}
        data={teachers}
        searchPlaceholder="Search teachers..."
        onEdit={(row) => openEditor(row)}
        onDelete={(row) => handleDelete(row)}
      />

      <Modal
        open={editorOpen}
        title={selected ? `Edit ${selected.name}` : "Add Teacher"}
        onClose={() => setEditorOpen(false)}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setEditorOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Teacher"}
            </button>
          </div>
        }
      >
        {errors.form ? <div className="staff-form__notice staff-form__notice--error">{errors.form}</div> : null}
        <div className="form-grid">
          <FormInput label="Teacher ID" value={draft.id} onChange={(event) => setDraft((current) => ({ ...current, id: event.target.value }))} error={errors.id} placeholder="T-05" />
          <FormInput label="First Name" value={draft.firstName} onChange={(event) => setDraft((current) => ({ ...current, firstName: event.target.value }))} error={errors.firstName} />
          <FormInput label="Last Name" value={draft.lastName} onChange={(event) => setDraft((current) => ({ ...current, lastName: event.target.value }))} error={errors.lastName} />
          <FormInput
            label="Subjects"
            value={draft.subjects}
            onChange={(event) => setDraft((current) => ({ ...current, subjects: event.target.value }))}
            error={errors.subjects}
            hint="Use commas to separate multiple subjects."
            placeholder="English, Literature"
          />
          <FormInput label="Department" value={draft.department} onChange={(event) => setDraft((current) => ({ ...current, department: event.target.value }))} error={errors.department} />
          {canManageAssignments ? (
            <>
              <label className="form-field">
                <span className="form-field__label">Primary Role</span>
                <input value="Teacher" readOnly />
                <small className="form-field__hint">Leadership titles are assigned separately below.</small>
              </label>
              <div className="form-field form-field--wide teacher-leadership">
                <span className="form-field__label">Leadership Titles</span>
                <div className="teacher-leadership__options">
                  <label className="teacher-leadership__option">
                    <input
                      type="checkbox"
                      checked={draft.leadershipAssignments.length === 0}
                      onChange={() => setDraft((current) => ({ ...current, leadershipAssignments: [], assignedClasses: "", hodDepartment: "" }))}
                    />
                    <span>None</span>
                  </label>
                  {teacherLeadershipOptions.map((role) => (
                    <label className="teacher-leadership__option" key={role}>
                      <input
                        type="checkbox"
                        checked={hasLeadershipAssignment(draft, role)}
                        onChange={(event) => updateLeadershipAssignment(role, event.target.checked)}
                      />
                      <span>{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          ) : null}
          {canManageAssignments && hasLeadershipAssignment(draft, "Class Teacher") ? (
            <FormInput
              label="Assigned Classes"
              value={draft.assignedClasses}
              onChange={(event) => setDraft((current) => ({ ...current, assignedClasses: event.target.value }))}
              error={errors.assignedClasses}
              hint="Use commas to assign more than one class."
              placeholder="Primary 6"
            />
          ) : null}
          {canManageAssignments && hasLeadershipAssignment(draft, "Head of Department") ? (
            <FormInput
              label="HOD Department"
              value={draft.hodDepartment}
              onChange={(event) => setDraft((current) => ({ ...current, hodDepartment: event.target.value }))}
              error={errors.hodDepartment}
              placeholder="Languages"
            />
          ) : null}
          <FormInput label="Qualification" value={draft.qualification} onChange={(event) => setDraft((current) => ({ ...current, qualification: event.target.value }))} />
          <FormInput label="Phone Number" value={draft.contact} onChange={(event) => setDraft((current) => ({ ...current, contact: event.target.value }))} error={errors.contact} />
          <FormInput label="Email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} error={errors.email} />
          <FormInput label="Address" value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} />
          <FormInput label="Date of Employment" type="date" value={draft.dateOfEmployment} onChange={(event) => setDraft((current) => ({ ...current, dateOfEmployment: event.target.value }))} error={errors.dateOfEmployment} />
          <label className="form-field">
            <span className="form-field__label">Status</span>
            <select className="profile-page__input" value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}>
              <option value="Available">Available</option>
              <option value="In Class">In Class</option>
              <option value="Leave">Leave</option>
              <option value="Active">Active</option>
            </select>
          </label>
        </div>
      </Modal>
    </div>
  );
}
