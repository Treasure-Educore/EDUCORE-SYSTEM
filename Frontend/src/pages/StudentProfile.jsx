import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { getStudentProfile, upsertStudentProfile } from "../data/studentProfiles";

const sections = [
  { key: "personal", label: "Personal" },
  { key: "academic", label: "Academic" },
  { key: "guardian", label: "Parent / Guardian" },
  { key: "medical", label: "Medical" },
  { key: "attendance", label: "Attendance" },
];

function formatAttendance(value) {
  return `${Number(value).toFixed(1)}%`;
}

function Field({ label, value, readOnly = true, as = "input", rows = 4, type = "text", onChange }) {
  return (
    <label className="profile-field">
      <span className="profile-field__label">{label}</span>
      {as === "textarea" ? (
        <textarea className="profile-field__input" rows={rows} readOnly={readOnly} value={value} onChange={onChange} />
      ) : (
        <input className="profile-field__input" type={type} readOnly={readOnly} value={value} onChange={onChange} />
      )}
    </label>
  );
}

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(() => getStudentProfile(studentId));
  const [activeSection, setActiveSection] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(student);

  useEffect(() => {
    const nextStudent = getStudentProfile(studentId);
    setStudent(nextStudent);
    setDraft(nextStudent);
    setIsEditing(false);
    setActiveSection("personal");
  }, [studentId]);

  useEffect(() => {
    document.title = student ? `${student.firstName} ${student.lastName} | Student Profile` : "Student Profile";
  }, [student]);

  if (!student) {
    return (
      <div className="page-stack">
        <PageHeader
          title="Student Profile"
          subtitle="The requested student record could not be found."
          action={<button type="button" className="secondary-button" onClick={() => navigate("/students")}>Back</button>}
        />
        <section className="empty-state">
          <strong>Student not found</strong>
          <p>Check the student directory and try again.</p>
        </section>
      </div>
    );
  }

  const current = isEditing ? draft : student;

  function updateField(key, value) {
    setDraft((existing) => ({ ...existing, [key]: value }));
  }

  function handlePrint() {
    window.print();
  }

  function handleSave() {
    const saved = upsertStudentProfile(draft, student);
    setStudent(saved);
    setDraft(saved);
    setIsEditing(false);
  }

  function renderSection(key) {
    switch (key) {
      case "personal":
        return (
          <section className="profile-panel">
            <div className="profile-panel__photo">
              <div className="profile-photo" aria-hidden="true">
                {current.photoLabel}
              </div>
              <span>Student Photo</span>
            </div>
            <div className="profile-grid">
              <Field label="Admission Number" value={current.admissionNumber} readOnly={!isEditing} onChange={(event) => updateField("admissionNumber", event.target.value)} />
              <Field label="First Name" value={current.firstName} readOnly={!isEditing} onChange={(event) => updateField("firstName", event.target.value)} />
              <Field label="Last Name" value={current.lastName} readOnly={!isEditing} onChange={(event) => updateField("lastName", event.target.value)} />
              <Field label="Gender" value={current.gender} readOnly={!isEditing} onChange={(event) => updateField("gender", event.target.value)} />
              <Field label="Date of Birth" value={current.dateOfBirth} type="date" readOnly={!isEditing} onChange={(event) => updateField("dateOfBirth", event.target.value)} />
              <Field label="Nationality" value={current.nationality} readOnly={!isEditing} onChange={(event) => updateField("nationality", event.target.value)} />
              <Field label="Religion" value={current.religion} readOnly={!isEditing} onChange={(event) => updateField("religion", event.target.value)} />
            </div>
          </section>
        );
      case "academic":
        return (
          <section className="profile-panel">
            <div className="profile-grid">
              <Field label="Current Class" value={current.currentClass} readOnly={!isEditing} onChange={(event) => updateField("currentClass", event.target.value)} />
              <Field label="Stream" value={current.stream} readOnly={!isEditing} onChange={(event) => updateField("stream", event.target.value)} />
              <Field label="Admission Date" value={current.admissionDate} type="date" readOnly={!isEditing} onChange={(event) => updateField("admissionDate", event.target.value)} />
              <Field label="Academic Status" value={current.academicStatus} readOnly={!isEditing} onChange={(event) => updateField("academicStatus", event.target.value)} />
              <Field label="Previous School" value={current.previousSchool} readOnly={!isEditing} onChange={(event) => updateField("previousSchool", event.target.value)} />
            </div>
          </section>
        );
      case "guardian":
        return (
          <section className="profile-panel">
            <div className="profile-grid">
              <Field label="Parent/Guardian Name" value={current.guardianName} readOnly={!isEditing} onChange={(event) => updateField("guardianName", event.target.value)} />
              <Field label="Relationship" value={current.relationship} readOnly={!isEditing} onChange={(event) => updateField("relationship", event.target.value)} />
              <Field label="Phone Number" value={current.phoneNumber} readOnly={!isEditing} onChange={(event) => updateField("phoneNumber", event.target.value)} />
              <Field label="Alternative Contact" value={current.alternativeContact} readOnly={!isEditing} onChange={(event) => updateField("alternativeContact", event.target.value)} />
              <Field label="Email Address" value={current.emailAddress} readOnly={!isEditing} onChange={(event) => updateField("emailAddress", event.target.value)} />
              <Field label="Physical Address" value={current.physicalAddress} as="textarea" rows={3} readOnly={!isEditing} onChange={(event) => updateField("physicalAddress", event.target.value)} />
            </div>
          </section>
        );
      case "medical":
        return (
          <section className="profile-panel">
            <div className="profile-grid">
              <Field label="Blood Group" value={current.bloodGroup} readOnly={!isEditing} onChange={(event) => updateField("bloodGroup", event.target.value)} />
              <Field label="Allergies" value={current.allergies} readOnly={!isEditing} onChange={(event) => updateField("allergies", event.target.value)} />
              <Field label="Medical Conditions" value={current.medicalConditions} as="textarea" rows={3} readOnly={!isEditing} onChange={(event) => updateField("medicalConditions", event.target.value)} />
              <Field label="Emergency Contact" value={current.emergencyContact} as="textarea" rows={3} readOnly={!isEditing} onChange={(event) => updateField("emergencyContact", event.target.value)} />
            </div>
          </section>
        );
      case "attendance":
        return (
          <section className="profile-panel">
            <div className="profile-grid profile-grid--three">
              <Field label="Present Days" value={String(current.presentDays)} type="number" readOnly={!isEditing} onChange={(event) => updateField("presentDays", event.target.value)} />
              <Field label="Absent Days" value={String(current.absentDays)} type="number" readOnly={!isEditing} onChange={(event) => updateField("absentDays", event.target.value)} />
              <Field
                label="Attendance Percentage"
                value={isEditing ? String(current.attendancePercentage) : formatAttendance(current.attendancePercentage)}
                readOnly={!isEditing}
                onChange={(event) => updateField("attendancePercentage", event.target.value)}
              />
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  return (
    <div className="page-stack student-profile-page">
      <div className="student-profile__breadcrumbs" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span>/</span>
        <Link to="/students">Students</Link>
        <span>/</span>
        <span>Student Profile</span>
      </div>

      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`Student Profile - ${student.currentClass}`}
        action={
          <div className="student-profile__actions">
            <button type="button" className="secondary-button" onClick={() => navigate("/students")}>
              Back
            </button>
            <button type="button" className="secondary-button" onClick={handlePrint}>
              Print
            </button>
            {isEditing ? (
              <>
                <button type="button" className="primary-button" onClick={handleSave}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setDraft(student);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" className="primary-button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            )}
          </div>
        }
      />

      <section className="student-profile__summary">
        <article className="student-profile__summary-card">
          <strong>{student.academicStatus}</strong>
          <span>Academic Status</span>
        </article>
        <article className="student-profile__summary-card">
          <strong>{formatAttendance(student.attendancePercentage)}</strong>
          <span>Attendance</span>
        </article>
      </section>

      <section className="student-profile__tabs" role="tablist" aria-label="Student profile sections">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            role="tab"
            aria-selected={activeSection === section.key}
            className={activeSection === section.key ? "student-profile__tab is-active" : "student-profile__tab"}
            onClick={() => setActiveSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </section>

      <section className="student-profile__content" role="tabpanel">
        <div className="student-profile__section-header">
          <h3>{sections.find((section) => section.key === activeSection)?.label}</h3>
          <span>{isEditing ? "Editing enabled" : "Read-only view"}</span>
        </div>
        {renderSection(activeSection)}
      </section>
    </div>
  );
}
