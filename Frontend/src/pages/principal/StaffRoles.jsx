import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { getStaffMemberById, primaryRoleOptions, secondaryRoleOptions, upsertStaffMember } from "../../data/staff";
import { canAssignTeacherRoles } from "../../data/teacherPermissions";

function ReadOnlyField({ label, value }) {
  return (
    <label className="profile-page__field">
      <span className="profile-page__label">{label}</span>
      <input className="profile-page__input" value={value || "Not available"} readOnly />
    </label>
  );
}

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function StaffRoles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [staffMember, setStaffMember] = useState(() => getStaffMemberById(id));
  const [open, setOpen] = useState(false);
  const [primaryRole, setPrimaryRole] = useState(staffMember?.primaryRole || "Teacher");
  const [additionalRoles, setAdditionalRoles] = useState(staffMember?.additionalRoles || []);
  const [assignedClasses, setAssignedClasses] = useState(staffMember?.assignedClasses?.join(", ") || "");
  const [error, setError] = useState("");

  useEffect(() => {
    const nextStaff = getStaffMemberById(id);
    setStaffMember(nextStaff);
    setPrimaryRole(nextStaff?.primaryRole || "Teacher");
    setAdditionalRoles(nextStaff?.additionalRoles || []);
    setAssignedClasses(nextStaff?.assignedClasses?.join(", ") || "");
    setError("");
  }, [id]);

  const roleChoices = useMemo(() => primaryRoleOptions, []);
  const canEditRoles = canAssignTeacherRoles(role);

  if (!staffMember) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Role Assignment"
          subtitle="The requested staff member could not be found."
          action={
            <Link to="/principal/staff" className="secondary-button">
              Back to Staff List
            </Link>
          }
        />
        <EmptyState title="Staff record not found" description="Open a valid staff profile and try again." />
      </div>
    );
  }

  if (!canEditRoles) {
    return (
      <div className="page-stack">
        <EmptyState
          title="Access denied"
          description="Only DOS, principals, and head teachers can assign class teacher or HOD roles."
        />
      </div>
    );
  }

  function handleToggleRole(role) {
    setAdditionalRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role],
    );
  }

  function handleSave() {
    setError("");
    const parsedClasses = parseList(assignedClasses);
    if ((primaryRole === "Class Teacher" || additionalRoles.includes("Class Teacher")) && parsedClasses.length === 0) {
      setError("Assign at least one class when Class Teacher is selected.");
      return;
    }

    try {
      const saved = upsertStaffMember(
        {
          ...staffMember,
          primaryRole,
          additionalRoles,
          assignedClasses: parsedClasses,
          classAssigned: parsedClasses[0] || "",
        },
        staffMember,
      );

      setStaffMember(saved);
      setOpen(false);
      navigate(`/principal/staff/${saved.id}`, {
        replace: true,
        state: { flash: "Staff roles updated successfully." },
      });
    } catch (saveError) {
      setError(saveError.message || "Unable to update roles.");
    }
  }

  const secondaryChoices = secondaryRoleOptions.filter((role) => role !== primaryRole);

  return (
    <div className="page-stack student-profile-page">
      <div className="student-profile__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/principal/staff">Staff</Link>
        <span>/</span>
        <span>Assign Roles</span>
      </div>

      <PageHeader
        title={`${staffMember.firstName} ${staffMember.lastName} - Roles`}
        subtitle="Assign a primary role and any supporting roles for this staff member."
        action={
          <div className="student-profile__actions">
            <Link to={`/principal/staff/${staffMember.id}`} className="secondary-button">
              Back
            </Link>
            <button type="button" className="primary-button" onClick={() => setOpen(true)}>
              Edit Roles
            </button>
          </div>
        }
      />

      <section className="student-profile__summary">
        <article className="student-profile__summary-card">
          <strong>{staffMember.primaryRole}</strong>
          <span>Primary Role</span>
        </article>
        <article className="student-profile__summary-card">
          <strong>{staffMember.additionalRoles?.length || 0}</strong>
          <span>Additional Roles</span>
        </article>
        <article className="student-profile__summary-card">
          <strong>{staffMember.assignedClasses?.length || 0}</strong>
          <span>Assigned Classes</span>
        </article>
      </section>

      <section className="student-profile__content">
        <div className="profile-grid">
          <ReadOnlyField label="Employee Number" value={staffMember.employeeNumber} />
          <ReadOnlyField label="Name" value={`${staffMember.firstName} ${staffMember.lastName}`} />
          <ReadOnlyField label="Department" value={staffMember.department} />
          <ReadOnlyField label="Staff Type" value={staffMember.staffType} />
          <ReadOnlyField label="Current Primary Role" value={staffMember.primaryRole} />
          <ReadOnlyField label="Secondary Roles" value={staffMember.additionalRoles?.join(", ") || "None"} />
          <ReadOnlyField label="Assigned Classes" value={staffMember.assignedClasses?.join(", ") || "None"} />
        </div>
      </section>

      <Modal
        open={open}
        title="Role Assignment"
        onClose={() => {
          setOpen(false);
          setError("");
        }}
        footer={
          <div className="settings-actions">
            <button type="button" className="secondary-button" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleSave}>
              Save Roles
            </button>
          </div>
        }
      >
        <div className="form-grid">
          <label className="profile-page__field">
            <span className="profile-page__label">Primary Role</span>
            <select className="profile-page__input" value={primaryRole} onChange={(event) => setPrimaryRole(event.target.value)}>
              {roleChoices.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-page__field">
            <span className="profile-page__label">Assigned Classes</span>
            <textarea
              className="profile-page__input profile-page__textarea"
              rows={3}
              value={assignedClasses}
              onChange={(event) => setAssignedClasses(event.target.value)}
              placeholder="Grade 6A, Grade 7B"
            />
          </label>
        </div>

        <div className="staff-roles__options">
          {secondaryChoices.map((role) => (
            <label key={role} className="staff-roles__option">
              <input type="checkbox" checked={additionalRoles.includes(role)} onChange={() => handleToggleRole(role)} />
              <span>{role}</span>
            </label>
          ))}
        </div>

        {error ? <div className="staff-form__notice staff-form__notice--error">{error}</div> : null}
      </Modal>
    </div>
  );
}
