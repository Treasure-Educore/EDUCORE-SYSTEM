import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  getNextEmployeeNumber,
  getStaffMemberById,
  loadDepartments,
  nonTeachingPositions,
  secondaryRoleOptions,
  teacherDepartments,
  upsertStaffMember,
} from "../../data/staff";
import FormInput from "../../components/FormInput";
import { canManageTeacherAssignments } from "../../data/teacherPermissions";

const teacherPrimaryRoles = ["Teacher", "Class Teacher", "Head of Department", "Deputy Head Teacher", "Director of Studies", "Games Teacher"];
const administrativePrimaryRoles = ["Accountant", "Librarian", "Secretary", "Nurse", "ICT Administrator"];

function parseList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createFormState(staff) {
  return {
    staffType: staff?.staffType || "teacher",
    firstName: staff?.firstName || "",
    lastName: staff?.lastName || "",
    gender: staff?.gender || "",
    dateOfBirth: staff?.dateOfBirth || "",
    nationalId: staff?.nationalId || "",
    phoneNumber: staff?.phoneNumber || "",
    email: staff?.email || "",
    address: staff?.address || "",
    dateOfEmployment: staff?.dateOfEmployment || "",
    profilePhoto: staff?.profilePhoto || "",
    status: staff?.status || "active",
    subjectsTaught: staff?.subjectsTaught?.join(", ") || "",
    department: staff?.department || "",
    qualification: staff?.qualification || "",
    classAssigned: staff?.classAssigned || "",
    position: staff?.position || "",
    primaryRole: staff?.primaryRole || (staff?.staffType === "non-teaching" ? "Secretary" : "Teacher"),
    additionalRoles: staff?.additionalRoles?.join(", ") || "",
  };
}

function SectionField({ label, children, hint }) {
  return (
    <label className="profile-page__field">
      <span className="profile-page__label">{label}</span>
      {children}
      {hint ? <small className="form-field__hint">{hint}</small> : null}
    </label>
  );
}

function TextAreaField(props) {
  return <textarea className="profile-page__input profile-page__textarea" {...props} />;
}

function SelectField(props) {
  return <select className="profile-page__input" {...props} />;
}

export default function StaffForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [departments] = useState(() => loadDepartments());
  const [staffMember, setStaffMember] = useState(() => (mode === "edit" ? getStaffMemberById(id) : null));
  const [form, setForm] = useState(() => createFormState(mode === "edit" ? getStaffMemberById(id) : null));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const nextStaff = mode === "edit" ? getStaffMemberById(id) : null;
    setStaffMember(nextStaff);
    setForm(createFormState(nextStaff));
    setErrors({});
    setMessage("");
  }, [id, mode]);

  const employeeNumber = useMemo(() => {
    return staffMember?.employeeNumber || getNextEmployeeNumber();
  }, [staffMember]);

  const canManageAssignments = canManageTeacherAssignments(role);
  const availablePrimaryRoles = form.staffType === "teacher" ? teacherPrimaryRoles : administrativePrimaryRoles;
  const secondaryRoleChoices = secondaryRoleOptions.filter((role) => role !== form.primaryRole);
  const departmentOptions = departments.length > 0 ? departments.map((department) => department.name) : teacherDepartments;

  function updateField(field) {
    return (event) => {
      const value = event.target.value;
      setForm((current) => {
        const next = { ...current, [field]: value };

        if (field === "staffType") {
          next.primaryRole = value === "teacher" ? "Teacher" : "Secretary";
          next.subjectsTaught = value === "teacher" ? current.subjectsTaught : "";
          next.classAssigned = value === "teacher" ? current.classAssigned : "";
          next.position = value === "non-teaching" ? current.position : "";
        }

        return next;
      });
    };
  }

  function validate(nextForm) {
    const nextErrors = {};

    if (!nextForm.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!nextForm.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!nextForm.gender.trim()) nextErrors.gender = "Gender is required.";
    if (!nextForm.dateOfBirth.trim()) nextErrors.dateOfBirth = "Date of birth is required.";
    if (!nextForm.nationalId.trim()) nextErrors.nationalId = "National ID is required.";
    if (!nextForm.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!nextForm.email.trim()) nextErrors.email = "Email is required.";
    if (!nextForm.address.trim()) nextErrors.address = "Address is required.";
    if (!nextForm.dateOfEmployment.trim()) nextErrors.dateOfEmployment = "Employment date is required.";
    if (!nextForm.department.trim()) nextErrors.department = "Department is required.";
    if (!nextForm.primaryRole.trim()) nextErrors.primaryRole = "Primary role is required.";

    if (nextForm.staffType === "teacher" && !nextForm.subjectsTaught.trim()) {
      nextErrors.subjectsTaught = "Enter at least one subject taught.";
    }

    if (nextForm.staffType === "non-teaching" && !nextForm.position.trim()) {
      nextErrors.position = "Position is required for administrators.";
    }

    const parsedRoles = parseList(nextForm.additionalRoles);
    const parsedClasses = parseList(nextForm.classAssigned);
    if ((nextForm.primaryRole === "Class Teacher" || parsedRoles.includes("Class Teacher")) && parsedClasses.length === 0) {
      nextErrors.classAssigned = "Assign at least one class for a class teacher.";
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        subjectsTaught: parseList(form.subjectsTaught),
        additionalRoles: parseList(form.additionalRoles),
        assignedClasses: parseList(form.classAssigned),
      };

      const saved = upsertStaffMember(payload, staffMember);
      setMessage("Staff profile saved successfully.");
      navigate(`/principal/staff/${saved.id}`, {
        replace: true,
        state: { flash: "Staff profile saved successfully." },
      });
    } catch (error) {
      setErrors({ form: error.message || "Unable to save staff profile." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "edit" && !staffMember) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Staff Record"
          subtitle="The requested staff member could not be found."
          action={
            <Link to="/principal/staff" className="secondary-button">
              Back to Staff List
            </Link>
          }
        />
        <EmptyState title="Staff record not found" description="Check the staff directory and try again." />
      </div>
    );
  }

  return (
    <form className="page-stack staff-form" onSubmit={handleSubmit}>
      <PageHeader
        title={mode === "edit" ? "Edit Staff Member" : "Register Staff"}
        subtitle="Create and maintain teacher and administrator records."
        action={
          <div className="student-profile__actions">
            <Link to="/principal/staff" className="secondary-button">
              Cancel
            </Link>
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Staff"}
            </button>
          </div>
        }
      />

      {message ? <div className="staff-form__notice staff-form__notice--success">{message}</div> : null}
      {errors.form ? <div className="staff-form__notice staff-form__notice--error">{errors.form}</div> : null}

      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h3>Common Details</h3>
            <p>Fields shared by all staff records.</p>
          </div>
          <span className="auth-role-pill">Employee No: {employeeNumber}</span>
        </div>

        <div className="form-grid">
          <FormInput label="First Name" value={form.firstName} onChange={updateField("firstName")} error={errors.firstName} />
          <FormInput label="Last Name" value={form.lastName} onChange={updateField("lastName")} error={errors.lastName} />
          <SectionField label="Gender">
            <SelectField value={form.gender} onChange={updateField("gender")}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </SelectField>
          </SectionField>
          <FormInput label="Date of Birth" type="date" value={form.dateOfBirth} onChange={updateField("dateOfBirth")} error={errors.dateOfBirth} />
          <FormInput label="National ID" value={form.nationalId} onChange={updateField("nationalId")} error={errors.nationalId} />
          <FormInput label="Phone Number" value={form.phoneNumber} onChange={updateField("phoneNumber")} error={errors.phoneNumber} />
          <FormInput label="Email" value={form.email} onChange={updateField("email")} error={errors.email} />
          <FormInput label="Address" value={form.address} onChange={updateField("address")} error={errors.address} />
          <FormInput label="Date of Employment" type="date" value={form.dateOfEmployment} onChange={updateField("dateOfEmployment")} error={errors.dateOfEmployment} />
          <SectionField label="Profile Photo URL" hint="Optional image link for staff profile cards.">
            <input className="profile-page__input" value={form.profilePhoto} onChange={updateField("profilePhoto")} placeholder="https://..." />
          </SectionField>
          <SectionField label="Status">
            <SelectField value={form.status} onChange={updateField("status")}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </SelectField>
          </SectionField>
          <SectionField label="Staff Type">
            <SelectField value={form.staffType} onChange={updateField("staffType")}>
              <option value="teacher">Teacher</option>
              <option value="non-teaching">Administrator</option>
            </SelectField>
          </SectionField>
        </div>
      </section>

      {canManageAssignments ? (
        <section className="data-card">
          <div className="data-card__header">
            <div>
              <h3>Role Assignment</h3>
              <p>Assign a primary role and any supporting roles.</p>
            </div>
          </div>

          <div className="form-grid">
            <SectionField label="Primary Role">
              <SelectField value={form.primaryRole} onChange={updateField("primaryRole")}>
                <option value="">Select role</option>
                {availablePrimaryRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </SelectField>
              {errors.primaryRole ? <small className="form-field__error">{errors.primaryRole}</small> : null}
            </SectionField>

            <SectionField label="Additional Roles" hint="Use commas to separate multiple roles.">
              <TextAreaField value={form.additionalRoles} onChange={updateField("additionalRoles")} rows={3} placeholder={secondaryRoleChoices.join(", ")} />
            </SectionField>
          </div>
        </section>
      ) : null}

      {form.staffType === "teacher" ? (
        <section className="data-card">
          <div className="data-card__header">
            <div>
              <h3>Teacher Information</h3>
              <p>Teaching assignments and academic profile.</p>
            </div>
          </div>

          <div className="form-grid">
            <SectionField label="Subjects Taught" hint="Comma-separated subjects.">
              <TextAreaField value={form.subjectsTaught} onChange={updateField("subjectsTaught")} rows={3} placeholder="Mathematics, Physics" />
              {errors.subjectsTaught ? <small className="form-field__error">{errors.subjectsTaught}</small> : null}
            </SectionField>

            <SectionField label="Department">
              <SelectField value={form.department} onChange={updateField("department")}>
                <option value="">Select department</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </SelectField>
              {errors.department ? <small className="form-field__error">{errors.department}</small> : null}
            </SectionField>

            <FormInput label="Qualification" value={form.qualification} onChange={updateField("qualification")} />
            {canManageAssignments ? (
              <FormInput
                label="Class Assigned"
                value={form.classAssigned}
                onChange={updateField("classAssigned")}
                error={errors.classAssigned}
                hint="Optional, but required if Class Teacher is selected."
              />
            ) : null}
          </div>
        </section>
      ) : (
        <section className="data-card">
          <div className="data-card__header">
            <div>
              <h3>Administrator Information</h3>
              <p>Department and support role details.</p>
            </div>
          </div>

          <div className="form-grid">
            <SectionField label="Position">
              <SelectField value={form.position} onChange={updateField("position")}>
                <option value="">Select position</option>
                {nonTeachingPositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </SelectField>
              {errors.position ? <small className="form-field__error">{errors.position}</small> : null}
            </SectionField>

            <SectionField label="Department">
              <SelectField value={form.department} onChange={updateField("department")}>
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.name}>
                    {department.name}
                  </option>
                ))}
              </SelectField>
              {errors.department ? <small className="form-field__error">{errors.department}</small> : null}
            </SectionField>

            <FormInput label="Qualification" value={form.qualification} onChange={updateField("qualification")} />
          </div>
        </section>
      )}
    </form>
  );
}
