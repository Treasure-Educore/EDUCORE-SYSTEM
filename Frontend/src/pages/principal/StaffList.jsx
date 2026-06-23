import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  deleteStaffMember,
  loadDepartments,
  loadStaffMembers,
  toggleStaffStatus,
} from "../../data/staff";
import { canAssignTeacherRoles } from "../../data/teacherPermissions";

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "S";
}

export default function StaffList() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [staff, setStaff] = useState(() => loadStaffMembers());
  const [departments] = useState(() => loadDepartments());
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const departmentOptions = useMemo(() => ["all", ...new Set(departments.map((department) => department.name))], [departments]);

  const filteredStaff = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return staff.filter((member) => {
      const matchesQuery = !normalized
        || [member.employeeNumber, member.firstName, member.lastName, member.department, member.primaryRole, member.email, member.phoneNumber]
          .some((value) => String(value || "").toLowerCase().includes(normalized));
      const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
      const matchesType = typeFilter === "all" || member.staffType === typeFilter;
      const matchesStatus = statusFilter === "all" || member.status === statusFilter;
      return matchesQuery && matchesDepartment && matchesType && matchesStatus;
    });
  }, [departmentFilter, query, staff, statusFilter, typeFilter]);

  const activeCount = staff.filter((member) => member.status === "active").length;
  const teacherCount = staff.filter((member) => member.staffType === "teacher").length;
  const nonTeachingCount = staff.filter((member) => member.staffType === "non-teaching").length;
  const canEditAssignments = canAssignTeacherRoles(role);

  function refresh(nextStaff = loadStaffMembers()) {
    setStaff(nextStaff);
  }

  function handleToggleStatus(staffId) {
    const updated = toggleStaffStatus(staffId);
    if (updated) {
      refresh();
    }
  }

  function handleDelete(staffId) {
    if (!window.confirm("Delete this staff record?")) {
      return;
    }
    refresh(deleteStaffMember(staffId));
  }

  return (
    <div className="page-stack staff-page">
      <PageHeader
        title="Staff Management"
        subtitle="Register teachers and administrators, manage status, and keep department assignments organised."
        action={
          <Link to="/principal/staff/new" className="primary-button">
            Register Staff
          </Link>
        }
      />

      <section className="stats-grid staff-page__stats">
        <article className="stat-card">
          <strong className="stat-card__value">{staff.length}</strong>
          <p className="stat-card__title">Total Staff</p>
          <span className="stat-card__subtitle">All active records</span>
        </article>
        <article className="stat-card card--emerald">
          <strong className="stat-card__value">{teacherCount}</strong>
          <p className="stat-card__title">Teachers</p>
          <span className="stat-card__subtitle">Teaching staff</span>
        </article>
        <article className="stat-card card--gold">
          <strong className="stat-card__value">{nonTeachingCount}</strong>
          <p className="stat-card__title">Administrators</p>
          <span className="stat-card__subtitle">Administrative support</span>
        </article>
        <article className="stat-card card--violet">
          <strong className="stat-card__value">{activeCount}</strong>
          <p className="stat-card__title">Active Accounts</p>
          <span className="stat-card__subtitle">Ready for duty</span>
        </article>
      </section>

      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h3>Staff Directory</h3>
            <p>Search, filter, edit, activate, deactivate, and manage assignments.</p>
          </div>
          <label className="table-search staff-page__search">
            <span>Search</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, role, or employee number..." />
          </label>
        </div>

        <div className="staff-page__filters">
          <label className="profile-page__field">
            <span className="profile-page__label">Department</span>
            <select className="profile-page__input" value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department === "all" ? "All departments" : department}
                </option>
              ))}
            </select>
          </label>

          <label className="profile-page__field">
            <span className="profile-page__label">Staff Type</span>
            <select className="profile-page__input" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
              <option value="all">All staff types</option>
              <option value="teacher">Teachers</option>
              <option value="non-teaching">Administrator</option>
            </select>
          </label>

          <label className="profile-page__field">
            <span className="profile-page__label">Status</span>
            <select className="profile-page__input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {filteredStaff.length === 0 ? (
          <EmptyState title="No staff records found" description="Adjust the filters or register a new staff member." />
        ) : (
          <div className="table-wrap">
            <table className="data-table staff-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Employee Number</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Primary Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((member) => (
                  <tr key={member.id}>
                    <td data-label="Photo">
                      <div className="staff-avatar">
                        {member.profilePhoto ? (
                          <img src={member.profilePhoto} alt={`${member.firstName} ${member.lastName}`} />
                        ) : (
                          <span>{getInitials(member.firstName, member.lastName)}</span>
                        )}
                      </div>
                    </td>
                    <td data-label="Employee Number">{member.employeeNumber}</td>
                    <td data-label="Name">
                      <strong>
                        {member.firstName} {member.lastName}
                      </strong>
                    </td>
                    <td data-label="Department">{member.department || "Unassigned"}</td>
                    <td data-label="Primary Role">{member.primaryRole}</td>
                    <td data-label="Status">
                      <span className={member.status === "active" ? "status-pill is-active" : "status-pill is-inactive"}>
                        {member.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="table-actions staff-page__actions">
                        <button type="button" className="action-btn" onClick={() => navigate(`/principal/staff/${member.id}`)}>
                          View
                        </button>
                        <button type="button" className="action-btn" onClick={() => navigate(`/principal/staff/${member.id}/edit`)}>
                          Edit
                        </button>
                        {canEditAssignments ? (
                          <button type="button" className="action-btn" onClick={() => navigate(`/principal/staff/${member.id}/roles`)}>
                            Assign Role
                          </button>
                        ) : null}
                        <button type="button" className="action-btn" onClick={() => handleToggleStatus(member.id)}>
                          {member.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                        <button type="button" className="action-btn action-btn--danger" onClick={() => handleDelete(member.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
