import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import { deleteStaffMember, getStaffMemberById, toggleStaffStatus } from "../../data/staff";
import { canAssignTeacherRoles } from "../../data/teacherPermissions";

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "S";
}

function ReadOnlyField({ label, value }) {
  return (
    <label className="profile-page__field">
      <span className="profile-page__label">{label}</span>
      <input className="profile-page__input" value={value || "Not available"} readOnly />
    </label>
  );
}

export default function StaffDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [staffMember, setStaffMember] = useState(() => getStaffMemberById(id));

  useEffect(() => {
    setStaffMember(getStaffMemberById(id));
  }, [id]);

  function refresh() {
    setStaffMember(getStaffMemberById(id));
  }

  function handlePrint() {
    window.print();
  }

  function handleToggleStatus() {
    toggleStaffStatus(id);
    refresh();
  }

  function handleDelete() {
    if (!window.confirm("Delete this staff record?")) {
      return;
    }
    deleteStaffMember(id);
    navigate("/principal/staff", { replace: true, state: { flash: "Staff record deleted." } });
  }

  const canEditAssignments = canAssignTeacherRoles(role);

  if (!staffMember) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Staff Profile"
          subtitle="The requested staff member could not be found."
          action={
            <Link to="/principal/staff" className="secondary-button">
              Back to Staff List
            </Link>
          }
        />
        <EmptyState title="Staff record not found" description="Use the staff directory to open an available record." />
      </div>
    );
  }

  const flash = location.state?.flash;

  return (
    <div className="page-stack student-profile-page">
      <div className="student-profile__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/principal/staff">Staff</Link>
        <span>/</span>
        <span>Staff Profile</span>
      </div>

      <PageHeader
        title={`${staffMember.firstName} ${staffMember.lastName}`}
        subtitle={`Employee ${staffMember.employeeNumber} • ${staffMember.primaryRole}`}
        action={
          <div className="student-profile__actions">
            <button type="button" className="secondary-button" onClick={() => navigate("/principal/staff")}>
              Back
            </button>
            <button type="button" className="secondary-button" onClick={handlePrint}>
              Print
            </button>
            <Link to={`/principal/staff/${staffMember.id}/edit`} className="primary-button">
              Edit
            </Link>
            {canEditAssignments ? (
              <Link to={`/principal/staff/${staffMember.id}/roles`} className="secondary-button">
                Assign Role
              </Link>
            ) : null}
            <button type="button" className="secondary-button" onClick={handleToggleStatus}>
              {staffMember.status === "active" ? "Deactivate" : "Activate"}
            </button>
            <button type="button" className="secondary-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        }
      />

      {flash ? <div className="staff-form__notice staff-form__notice--success">{flash}</div> : null}

      <section className="student-profile__summary">
        <article className="student-profile__summary-card">
          <strong>{staffMember.status}</strong>
          <span>Status</span>
        </article>
        <article className="student-profile__summary-card">
          <strong>{staffMember.department || "Unassigned"}</strong>
          <span>Department</span>
        </article>
        <article className="student-profile__summary-card">
          <strong>{staffMember.staffType === "teacher" ? "Teaching Staff" : "Administrator"}</strong>
          <span>Staff Type</span>
        </article>
      </section>

      <section className="student-profile__content">
        <div className="profile-panel__photo">
          <div className="profile-photo" aria-hidden="true">
            {staffMember.profilePhoto ? <img src={staffMember.profilePhoto} alt={`${staffMember.firstName} ${staffMember.lastName}`} /> : getInitials(staffMember.firstName, staffMember.lastName)}
          </div>
          <span>Profile Photo</span>
        </div>

        <div className="profile-grid">
          <ReadOnlyField label="Employee Number" value={staffMember.employeeNumber} />
          <ReadOnlyField label="First Name" value={staffMember.firstName} />
          <ReadOnlyField label="Last Name" value={staffMember.lastName} />
          <ReadOnlyField label="Gender" value={staffMember.gender} />
          <ReadOnlyField label="Date of Birth" value={staffMember.dateOfBirth} />
          <ReadOnlyField label="National ID" value={staffMember.nationalId} />
          <ReadOnlyField label="Phone Number" value={staffMember.phoneNumber} />
          <ReadOnlyField label="Email" value={staffMember.email} />
          <ReadOnlyField label="Address" value={staffMember.address} />
          <ReadOnlyField label="Date of Employment" value={staffMember.dateOfEmployment} />
        </div>

        <div className="profile-grid">
          <ReadOnlyField label="Primary Role" value={staffMember.primaryRole} />
          <ReadOnlyField label="Additional Roles" value={staffMember.additionalRoles?.join(", ") || "None"} />
          <ReadOnlyField label="Department" value={staffMember.department} />
          <ReadOnlyField label="Qualification" value={staffMember.qualification} />
          <ReadOnlyField label="Class Assigned" value={staffMember.classAssigned || "Not assigned"} />
          <ReadOnlyField label="Status" value={staffMember.status} />
        </div>

        {staffMember.staffType === "teacher" ? (
          <div className="profile-grid">
            <ReadOnlyField label="Subjects Taught" value={staffMember.subjectsTaught?.join(", ") || "Not available"} />
            <ReadOnlyField label="Assigned Classes" value={staffMember.assignedClasses?.join(", ") || "Not assigned"} />
          </div>
        ) : (
          <div className="profile-grid">
            <ReadOnlyField label="Position" value={staffMember.position} />
            <ReadOnlyField label="Staff Category" value="Administrator" />
          </div>
        )}
      </section>
    </div>
  );
}
