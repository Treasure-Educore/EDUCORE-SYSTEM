import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import {
  deleteDepartment,
  getDepartmentMembers,
  loadDepartments,
  loadStaffMembers,
  upsertDepartment,
} from "../../data/staff";

function createFormState(department = null) {
  return {
    name: department?.name || "",
    description: department?.description || "",
    headOfDepartment: department?.headOfDepartment || "",
  };
}

function ReadOnlyField({ label, value }) {
  return (
    <label className="profile-page__field">
      <span className="profile-page__label">{label}</span>
      <input className="profile-page__input" value={value || "Not available"} readOnly />
    </label>
  );
}

export default function Departments() {
  const [departments, setDepartments] = useState(() => loadDepartments());
  const [staffMembers, setStaffMembers] = useState(() => loadStaffMembers());
  const [open, setOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [form, setForm] = useState(() => createFormState());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setDepartments(loadDepartments());
    setStaffMembers(loadStaffMembers());
  }, []);

  const teacherOptions = useMemo(() => staffMembers.filter((staff) => staff.staffType === "teacher"), [staffMembers]);

  function openEditor(department = null) {
    setEditingDepartment(department);
    setForm(createFormState(department));
    setErrors({});
    setOpen(true);
  }

  function handleSubmit() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Department name is required.";
    if (!form.description.trim()) nextErrors.description = "Department description is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const saved = upsertDepartment(form, editingDepartment);
    setDepartments(loadDepartments());
    setStaffMembers(loadStaffMembers());
    setOpen(false);
    setEditingDepartment(null);
    setForm(createFormState());
    setErrors({});
    return saved;
  }

  function handleDelete(departmentId) {
    if (!window.confirm("Delete this department?")) {
      return;
    }
    deleteDepartment(departmentId);
    setDepartments(loadDepartments());
  }

  return (
    <div className="page-stack staff-page">
      <PageHeader
        title="Department Management"
        subtitle="Create departments, appoint heads of department, and inspect membership."
        action={
          <button type="button" className="primary-button" onClick={() => openEditor(null)}>
            Create Department
          </button>
        }
      />

      {departments.length === 0 ? (
        <EmptyState title="No departments available" description="Create the first department to start organising staff." />
      ) : (
        <section className="staff-page__department-grid">
          {departments.map((department) => {
            const members = getDepartmentMembers(department.name);
            const hod = staffMembers.find((staff) => staff.id === department.headOfDepartment);

            return (
              <article key={department.id} className="principal-card staff-page__department-card">
                <div className="principal-card__header">
                  <div>
                    <h3>{department.name}</h3>
                    <p>{department.description}</p>
                  </div>
                  <div className="table-actions">
                    <button type="button" className="action-btn" onClick={() => openEditor(department)}>
                      Edit
                    </button>
                    <button type="button" className="action-btn action-btn--danger" onClick={() => handleDelete(department.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="profile-grid">
                  <ReadOnlyField label="Head of Department" value={hod ? `${hod.firstName} ${hod.lastName}` : "Not assigned"} />
                  <ReadOnlyField label="Members" value={`${members.length} staff member${members.length === 1 ? "" : "s"}`} />
                </div>

                <div className="staff-page__member-list">
                  {members.length === 0 ? (
                    <p className="form-field__hint">No staff currently assigned to this department.</p>
                  ) : (
                    members.map((member) => (
                      <span key={member.id} className="principal-student-chip">
                        <strong>
                          {member.firstName} {member.lastName}
                        </strong>
                        <span>{member.primaryRole}</span>
                      </span>
                    ))
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      <Modal
        open={open}
        title={editingDepartment ? "Edit Department" : "Create Department"}
        onClose={() => {
          setOpen(false);
          setEditingDepartment(null);
          setErrors({});
        }}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSubmit}>
              Save Department
            </button>
          </div>
        }
      >
        <div className="form-grid">
          <label className="profile-page__field">
            <span className="profile-page__label">Department Name</span>
            <input
              className="profile-page__input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Mathematics"
            />
            {errors.name ? <small className="form-field__error">{errors.name}</small> : null}
          </label>

          <label className="profile-page__field">
            <span className="profile-page__label">Head of Department</span>
            <select
              className="profile-page__input"
              value={form.headOfDepartment}
              onChange={(event) => setForm((current) => ({ ...current, headOfDepartment: event.target.value }))}
            >
              <option value="">Select staff member</option>
              {teacherOptions.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.firstName} {staff.lastName} - {staff.employeeNumber}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-page__field">
            <span className="profile-page__label">Description</span>
            <textarea
              className="profile-page__input profile-page__textarea"
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Department focus and responsibilities"
            />
            {errors.description ? <small className="form-field__error">{errors.description}</small> : null}
          </label>
        </div>
      </Modal>
    </div>
  );
}
