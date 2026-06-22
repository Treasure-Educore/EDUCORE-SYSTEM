import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import FormInput from "../../components/FormInput";
import LoadingSkeleton from "../../components/LoadingSkeleton";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../context/AuthContext";
import {
  boardingStatusOptions,
  buildStudentAdmissionRecord,
  clearStudentAdmissionDraft,
  createEmptyGuardian,
  createEmptyStudentAdmission,
  documentTypes,
  feeCategoryOptions,
  getNextAdmissionNumber,
  getNextStudentNumber,
  guardianRelationshipOptions,
  loadSavedStudentAdmissionDraft,
  saveStudentAdmissionDraft,
  scholarshipTypes,
  studentAdmissionSteps,
  studentCategoryOptions,
  validateStudentAdmissionDraft,
  yesNoOptions,
  readDocumentFiles,
} from "../../data/studentAdmission";
import { getStudentProfile, loadStudentProfiles, upsertStudentProfile } from "../../data/studentProfiles";

const ADMIN_ROLE = "non-teaching-staff";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStepErrors(allErrors, stepKey) {
  if (!allErrors) return {};
  return allErrors[stepKey] || (stepKey === "guardians" ? allErrors.guardians || [] : {});
}

function countStepErrors(stepErrors) {
  if (Array.isArray(stepErrors)) {
    return stepErrors.reduce((total, item) => total + countStepErrors(item), 0);
  }

  if (!stepErrors || typeof stepErrors !== "object") {
    return stepErrors ? 1 : 0;
  }

  return Object.values(stepErrors).reduce((total, value) => total + countStepErrors(value), 0);
}

function setDeepValue(source, path, value) {
  const next = clone(source);
  let cursor = next;

  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index];
    if (cursor[key] == null || typeof cursor[key] !== "object") {
      cursor[key] = typeof path[index + 1] === "number" ? [] : {};
    }
    cursor = cursor[key];
  }

  cursor[path[path.length - 1]] = value;
  return next;
}

function WizardStepper({ steps, activeIndex, errors, onChangeStep }) {
  return (
    <ol className="student-form__stepper" aria-label="Student admission steps">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex && countStepErrors(getStepErrors(errors, step.key)) === 0;
        const stepErrors = getStepErrors(errors, step.key);
        const errorCount = countStepErrors(stepErrors);

        return (
          <li key={step.key} className={isActive ? "student-form__step is-active" : "student-form__step"}>
            <button type="button" className="student-form__step-button" onClick={() => onChangeStep(index)}>
              <span className="student-form__step-index">{isComplete ? "✓" : index + 1}</span>
              <span className="student-form__step-copy">
                <strong>{step.label}</strong>
                <small>{step.description}</small>
              </span>
              {errorCount > 0 ? <span className="student-form__step-badge">{errorCount}</span> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function SectionField({ label, children, hint, error, wide = false }) {
  return (
    <label className={wide ? "profile-page__field form-field--wide" : "profile-page__field"}>
      <span className="profile-page__label">{label}</span>
      {children}
      {hint ? <small className="form-field__hint">{hint}</small> : null}
      {error ? <small className="form-field__error">{error}</small> : null}
    </label>
  );
}

function SelectField({ value, onChange, children, error, wide = false }) {
  return (
    <label className={wide ? "profile-page__field form-field--wide" : "profile-page__field"}>
      <span className="profile-page__label">{children?.props?.labelText || children?.props?.children || "Select"}</span>
      <select className={error ? "profile-page__input is-invalid" : "profile-page__input"} value={value} onChange={onChange}>
        {children}
      </select>
      {error ? <small className="form-field__error">{error}</small> : null}
    </label>
  );
}

function StepCard({ title, description, children, className = "" }) {
  return (
    <section className={`student-form__card data-card ${className}`.trim()}>
      <div className="data-card__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function GuardianCard({ guardian, index, errors, onChange, onRemove, canRemove }) {
  return (
    <article className="student-form__guardian-card">
      <div className="student-form__guardian-header">
        <strong>Guardian {index + 1}</strong>
        {canRemove ? (
          <button type="button" className="student-form__text-button" onClick={onRemove}>
            Remove
          </button>
        ) : (
          <span className="student-form__muted">Primary guardian</span>
        )}
      </div>
      <div className="form-grid">
        <FormInput label="Guardian Full Name" value={guardian.name} onChange={(event) => onChange("name", event.target.value)} error={errors?.name} />
        <label className="profile-page__field">
          <span className="profile-page__label">Relationship</span>
          <select className={errors?.relationship ? "profile-page__input is-invalid" : "profile-page__input"} value={guardian.relationship} onChange={(event) => onChange("relationship", event.target.value)}>
            {guardianRelationshipOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors?.relationship ? <small className="form-field__error">{errors.relationship}</small> : null}
        </label>
        <FormInput label="Phone Number" value={guardian.phoneNumber} onChange={(event) => onChange("phoneNumber", event.target.value)} error={errors?.phoneNumber} />
        <FormInput label="Alternative Phone Number" value={guardian.alternativePhoneNumber} onChange={(event) => onChange("alternativePhoneNumber", event.target.value)} />
        <FormInput label="Email Address" value={guardian.emailAddress} onChange={(event) => onChange("emailAddress", event.target.value)} />
        <FormInput label="Occupation" value={guardian.occupation} onChange={(event) => onChange("occupation", event.target.value)} />
        <FormInput label="Employer" value={guardian.employer} onChange={(event) => onChange("employer", event.target.value)} />
        <FormInput label="National ID" value={guardian.nationalId} onChange={(event) => onChange("nationalId", event.target.value)} />
        <FormInput label="Home Address" value={guardian.homeAddress} onChange={(event) => onChange("homeAddress", event.target.value)} />
        <FormInput label="Emergency Contact Number" value={guardian.emergencyContactNumber} onChange={(event) => onChange("emergencyContactNumber", event.target.value)} />
      </div>
    </article>
  );
}

function FileEntryCard({ file, onRemove }) {
  const isImage = file.type?.startsWith("image/") && file.preview;

  return (
    <article className="student-form__file-card">
      <div className="student-form__file-preview">
        {isImage ? <img src={file.preview} alt={file.name} /> : <span>{file.name.slice(0, 2).toUpperCase()}</span>}
      </div>
      <div className="student-form__file-copy">
        <strong>{file.name}</strong>
        <small>{Math.round((file.size || 0) / 1024)} KB</small>
        <div className="student-form__progress" aria-hidden="true">
          <span style={{ width: "100%" }} />
        </div>
      </div>
      <button type="button" className="student-form__text-button" onClick={onRemove}>
        Remove
      </button>
    </article>
  );
}

function FileUploadGroup({ label, files, onUpload, onRemove, note }) {
  return (
    <section className="student-form__upload-group">
      <div className="student-form__upload-header">
        <div>
          <strong>{label}</strong>
          {note ? <p>{note}</p> : null}
        </div>
        <span>{files.length} file(s)</span>
      </div>

      <label className="student-form__dropzone">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          onChange={(event) => {
            const selectedFiles = Array.from(event.target.files || []);
            if (selectedFiles.length > 0) {
              onUpload(selectedFiles);
            }
            event.target.value = "";
          }}
        />
        <strong>Choose files</strong>
        <span>Multiple uploads supported</span>
      </label>

      {files.length > 0 ? (
        <div className="student-form__file-list">
          {files.map((file, index) => (
            <FileEntryCard key={file.id || `${label}-${index}`} file={file} onRemove={() => onRemove(index)} />
          ))}
        </div>
      ) : (
        <p className="student-form__muted">No files uploaded yet.</p>
      )}
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="student-form__summary-row">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

function SummaryGroup({ title, children }) {
  return (
    <section className="student-form__summary-group">
      <h4>{title}</h4>
      <div>{children}</div>
    </section>
  );
}

function listSelectedFiles(documents) {
  return Object.entries(documents || {}).flatMap(([group, files]) =>
    (files || []).map((file) => ({ group, ...file })),
  );
}

export default function StudentForm({ mode = "create" }) {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { role } = useAuth();
  const canManageStudents = role === ADMIN_ROLE;
  const isEditMode = mode === "edit";

  const existingStudent = useMemo(() => (isEditMode ? getStudentProfile(studentId) : null), [isEditMode, studentId]);
  const draftKey = existingStudent?.id || studentId || "new";

  const [draft, setDraft] = useState(() => createEmptyStudentAdmission(existingStudent));
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errors, setErrors] = useState({
    personal: {},
    guardians: [],
    academic: {},
    medical: {},
    transport: {},
    documents: {},
    fees: {},
    review: {},
  });
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    if (!canManageStudents) {
      return;
    }

    if (isEditMode && !existingStudent) {
      return;
    }

    const savedDraft = loadSavedStudentAdmissionDraft(draftKey);
    const baseRecord = savedDraft || existingStudent || null;
    const nextDraft = createEmptyStudentAdmission(baseRecord);
    const students = loadStudentProfiles();

    if (!nextDraft.admissionNumber) {
      nextDraft.admissionNumber = getNextAdmissionNumber(students, nextDraft.academic.academicYear);
    }

    if (!nextDraft.studentNumber) {
      nextDraft.studentNumber = getNextStudentNumber(students, nextDraft.academic.academicYear);
    }

    setDraft(nextDraft);
    setNotice(savedDraft ? { type: "success", message: "A saved draft was restored for this registration." } : null);
  }, [canManageStudents, draftKey, existingStudent, isEditMode]);

  useEffect(() => {
    document.title = isEditMode ? "Edit Student Registration | EDUCORE" : "Student Registration | EDUCORE";
  }, [isEditMode]);

  if (!canManageStudents) {
    return (
      <div className="principal-page">
        <EmptyState
          title="Access denied"
          description="Only administrators can create or edit student registrations."
        />
      </div>
    );
  }

  if (isEditMode && !existingStudent) {
    return (
      <div className="principal-page">
        <PageHeader
          title="Edit Student Registration"
          subtitle="The requested student record could not be found."
          action={
            <Link className="secondary-button" to="/principal/students/list">
              Back to Student List
            </Link>
          }
        />
        <EmptyState title="Student not found" description="Check the student directory and try again." />
      </div>
    );
  }

  function updateField(path, value) {
    setDraft((current) => setDeepValue(current, path, value));
  }

  function updateGuardian(index, field, value) {
    setDraft((current) => {
      const next = clone(current);
      next.guardians[index] = { ...next.guardians[index], [field]: value };
      return next;
    });
  }

  function addGuardian() {
    setDraft((current) => ({ ...current, guardians: [...current.guardians, createEmptyGuardian()] }));
  }

  function removeGuardian(index) {
    setDraft((current) => {
      if (current.guardians.length === 1) return current;
      const next = clone(current);
      next.guardians.splice(index, 1);
      return next;
    });
  }

  async function uploadDocument(groupKey, files) {
    setNotice(null);
    const uploaded = await readDocumentFiles(files);
    setDraft((current) => {
      const next = clone(current);
      next.documents[groupKey] = [...next.documents[groupKey], ...uploaded];
      return next;
    });
  }

  function removeDocument(groupKey, index) {
    setDraft((current) => {
      const next = clone(current);
      next.documents[groupKey].splice(index, 1);
      return next;
    });
  }

  function validateCurrentStep(stepKey) {
    const nextErrors = validateStudentAdmissionDraft(draft, loadStudentProfiles(), existingStudent?.id);
    setErrors(nextErrors);
    return countStepErrors(getStepErrors(nextErrors, stepKey)) === 0;
  }

  function handleNext() {
    const stepKey = studentAdmissionSteps[activeStepIndex].key;
    if (!validateCurrentStep(stepKey)) {
      return;
    }

    setActiveStepIndex((current) => Math.min(current + 1, studentAdmissionSteps.length - 1));
  }

  function handleBack() {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }

  function handleSaveDraft() {
    setSavingDraft(true);
    try {
      saveStudentAdmissionDraft(draftKey, draft);
      setNotice({ type: "success", message: "Draft saved locally. You can return later and continue." });
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Unable to save the draft." });
    } finally {
      setSavingDraft(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateStudentAdmissionDraft(draft, loadStudentProfiles(), existingStudent?.id);
    setErrors(nextErrors);

    if (countStepErrors(nextErrors) > 0) {
      const firstInvalidIndex = studentAdmissionSteps.findIndex((step) => countStepErrors(getStepErrors(nextErrors, step.key)) > 0);
      if (firstInvalidIndex >= 0) {
        setActiveStepIndex(firstInvalidIndex);
      }
      setNotice({ type: "error", message: "Please fix the highlighted fields before submitting." });
      return;
    }

    setSubmitting(true);
    try {
      const students = loadStudentProfiles();
      const record = buildStudentAdmissionRecord(draft, students, existingStudent);
      const saved = upsertStudentProfile(record, existingStudent);
      clearStudentAdmissionDraft(draftKey);
      setNotice({ type: "success", message: "Student registration submitted successfully." });
      navigate(`/students/${saved.id}`, { replace: true, state: { flash: "Student registration submitted successfully." } });
    } catch (error) {
      setNotice({ type: "error", message: error.message || "Unable to save the registration." });
    } finally {
      setSubmitting(false);
    }
  }

  const activeStep = studentAdmissionSteps[activeStepIndex];
  const stepErrors = getStepErrors(errors, activeStep.key);
  const isLastStep = activeStepIndex === studentAdmissionSteps.length - 1;

  return (
    <form className="principal-page student-form" onSubmit={handleSubmit}>
      <PageHeader
        title={isEditMode ? "Edit Student Registration" : "Student Registration"}
        subtitle="A multi-step admission wizard for student identity, guardian records, academic placement, medical needs, transport, documents, and fees."
        action={
          <div className="student-form__top-actions">
            <Link className="secondary-button" to="/principal/students/list">
              Back to Student List
            </Link>
            <button type="button" className="secondary-button" onClick={handleSaveDraft} disabled={savingDraft}>
              {savingDraft ? "Saving Draft..." : "Save Draft"}
            </button>
          </div>
        }
      />

      {notice ? <div className={notice.type === "error" ? "staff-form__notice staff-form__notice--error" : "staff-form__notice staff-form__notice--success"}>{notice.message}</div> : null}

      <section className="student-form__hero data-card">
        <div>
          <p className="student-form__eyebrow">Admission Summary</p>
          <h2>{draft.personal.firstName || "New Student"} {draft.personal.lastName || ""}</h2>
          <p>Admission number and student number are generated automatically and kept unique.</p>
        </div>
        <div className="student-form__hero-meta">
          <div>
            <span>Admission Number</span>
            <strong>{draft.admissionNumber || "Auto-generated"}</strong>
          </div>
          <div>
            <span>Student Number</span>
            <strong>{draft.studentNumber || "Auto-generated"}</strong>
          </div>
          <div>
            <span>Current Step</span>
            <strong>{activeStep.label}</strong>
          </div>
        </div>
      </section>

      <WizardStepper steps={studentAdmissionSteps} activeIndex={activeStepIndex} errors={errors} onChangeStep={setActiveStepIndex} />

      <section className="student-form__workspace">
        {activeStep.key === "personal" ? (
          <StepCard title="Personal Information" description="Capture the student's core identity and address details.">
            <div className="student-form__photo-row">
              <div className="student-form__photo-card">
                <div className="profile-photo" aria-hidden="true">
                  {draft.personal.photo ? <img src={draft.personal.photo} alt="Student portrait preview" /> : `${draft.personal.firstName?.[0] || ""}${draft.personal.lastName?.[0] || ""}`.toUpperCase() || "ST"}
                </div>
                <span>Student Photo</span>
              </div>

              <label className="student-form__upload-button">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const image = await readDocumentFiles([file]);
                    updateField(["personal", "photo"], image[0]?.preview || "");
                    event.target.value = "";
                  }}
                />
                Upload Photo
              </label>
            </div>

            <div className="form-grid">
              <FormInput label="First Name" value={draft.personal.firstName} onChange={(event) => updateField(["personal", "firstName"], event.target.value)} error={stepErrors.firstName} />
              <FormInput label="Middle Name" value={draft.personal.middleName} onChange={(event) => updateField(["personal", "middleName"], event.target.value)} />
              <FormInput label="Last Name" value={draft.personal.lastName} onChange={(event) => updateField(["personal", "lastName"], event.target.value)} error={stepErrors.lastName} />
              <label className="profile-page__field">
                <span className="profile-page__label">Gender</span>
                <select className={stepErrors.gender ? "profile-page__input is-invalid" : "profile-page__input"} value={draft.personal.gender} onChange={(event) => updateField(["personal", "gender"], event.target.value)}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {stepErrors.gender ? <small className="form-field__error">{stepErrors.gender}</small> : null}
              </label>
              <FormInput label="Date of Birth" type="date" value={draft.personal.dateOfBirth} onChange={(event) => updateField(["personal", "dateOfBirth"], event.target.value)} error={stepErrors.dateOfBirth} />
              <FormInput label="Nationality" value={draft.personal.nationality} onChange={(event) => updateField(["personal", "nationality"], event.target.value)} />
              <FormInput label="Religion" value={draft.personal.religion} onChange={(event) => updateField(["personal", "religion"], event.target.value)} />
              <FormInput label="Birth Certificate Number / National ID" value={draft.personal.birthCertificateNumber} onChange={(event) => updateField(["personal", "birthCertificateNumber"], event.target.value)} error={stepErrors.birthCertificateNumber} />
              <FormInput label="Admission Number" value={draft.admissionNumber} readOnly />
              <FormInput label="Student Number" value={draft.studentNumber} readOnly />
              <FormInput label="Phone Number" value={draft.personal.phoneNumber} onChange={(event) => updateField(["personal", "phoneNumber"], event.target.value)} />
              <FormInput label="Current Address" value={draft.personal.address} onChange={(event) => updateField(["personal", "address"], event.target.value)} />
              <FormInput label="City" value={draft.personal.city} onChange={(event) => updateField(["personal", "city"], event.target.value)} />
              <FormInput label="District" value={draft.personal.district} onChange={(event) => updateField(["personal", "district"], event.target.value)} />
              <FormInput label="Country" value={draft.personal.country} onChange={(event) => updateField(["personal", "country"], event.target.value)} />
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "guardians" ? (
          <StepCard title="Parent / Guardian Information" description="At least one guardian is required for each student.">
            <div className="student-form__guardians">
              {draft.guardians.map((guardian, index) => (
                <GuardianCard
                  key={guardian.id || index}
                  guardian={guardian}
                  index={index}
                  errors={stepErrors[index]}
                  canRemove={draft.guardians.length > 1}
                  onChange={(field, value) => updateGuardian(index, field, value)}
                  onRemove={() => removeGuardian(index)}
                />
              ))}
            </div>
            <button type="button" className="secondary-button" onClick={addGuardian}>
              + Add Another Guardian
            </button>
          </StepCard>
        ) : null}

        {activeStep.key === "academic" ? (
          <StepCard title="Academic Information" description="Record the admission date, class placement, and current school status.">
            <div className="form-grid">
              <FormInput label="Admission Date" type="date" value={draft.academic.admissionDate} onChange={(event) => updateField(["academic", "admissionDate"], event.target.value)} error={stepErrors.admissionDate} />
              <FormInput label="Academic Year" value={draft.academic.academicYear} onChange={(event) => updateField(["academic", "academicYear"], event.target.value)} error={stepErrors.academicYear} />
              <FormInput label="Class" value={draft.academic.className} onChange={(event) => updateField(["academic", "className"], event.target.value)} error={stepErrors.className} />
              <FormInput label="Stream" value={draft.academic.stream} onChange={(event) => updateField(["academic", "stream"], event.target.value)} />
              <FormInput label="Previous School" value={draft.academic.previousSchool} onChange={(event) => updateField(["academic", "previousSchool"], event.target.value)} />
              <FormInput label="House" value={draft.academic.house} onChange={(event) => updateField(["academic", "house"], event.target.value)} />
              <label className="profile-page__field">
                <span className="profile-page__label">Boarding Status</span>
                <select className="profile-page__input" value={draft.academic.boardingStatus} onChange={(event) => updateField(["academic", "boardingStatus"], event.target.value)}>
                  {boardingStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="profile-page__field">
                <span className="profile-page__label">Student Category</span>
                <select className="profile-page__input" value={draft.academic.studentCategory} onChange={(event) => updateField(["academic", "studentCategory"], event.target.value)}>
                  {studentCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="profile-page__field">
                <span className="profile-page__label">Status</span>
                <select className="profile-page__input" value={draft.academic.status} onChange={(event) => updateField(["academic", "status"], event.target.value)}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "medical" ? (
          <StepCard title="Medical Information" description="Add health-related notes, all of which are optional.">
            <div className="form-grid">
              <FormInput label="Blood Group" value={draft.medical.bloodGroup} onChange={(event) => updateField(["medical", "bloodGroup"], event.target.value)} />
              <FormInput label="Allergies" value={draft.medical.allergies} onChange={(event) => updateField(["medical", "allergies"], event.target.value)} />
              <FormInput label="Medical Conditions" value={draft.medical.medicalConditions} onChange={(event) => updateField(["medical", "medicalConditions"], event.target.value)} />
              <FormInput label="Current Medication" value={draft.medical.currentMedication} onChange={(event) => updateField(["medical", "currentMedication"], event.target.value)} />
              <FormInput label="Special Needs" value={draft.medical.specialNeeds} onChange={(event) => updateField(["medical", "specialNeeds"], event.target.value)} />
              <FormInput label="Doctor Name" value={draft.medical.doctorName} onChange={(event) => updateField(["medical", "doctorName"], event.target.value)} />
              <FormInput label="Doctor Contact" value={draft.medical.doctorContact} onChange={(event) => updateField(["medical", "doctorContact"], event.target.value)} />
              <FormInput label="Medical Insurance Provider" value={draft.medical.insuranceProvider} onChange={(event) => updateField(["medical", "insuranceProvider"], event.target.value)} />
              <FormInput label="Insurance Number" value={draft.medical.insuranceNumber} onChange={(event) => updateField(["medical", "insuranceNumber"], event.target.value)} />
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "transport" ? (
          <StepCard title="Transport Information" description="Record whether the student uses school transport and the route details if applicable.">
            <div className="form-grid">
              <label className="profile-page__field">
                <span className="profile-page__label">Uses School Transport?</span>
                <select className="profile-page__input" value={draft.transport.usesSchoolTransport} onChange={(event) => updateField(["transport", "usesSchoolTransport"], event.target.value)}>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {draft.transport.usesSchoolTransport === "Yes" ? (
                <>
                  <FormInput label="Pickup Point" value={draft.transport.pickupPoint} onChange={(event) => updateField(["transport", "pickupPoint"], event.target.value)} error={stepErrors.pickupPoint} />
                  <FormInput label="Route" value={draft.transport.route} onChange={(event) => updateField(["transport", "route"], event.target.value)} error={stepErrors.route} />
                </>
              ) : (
                <div className="student-form__empty-note">
                  Transport fields remain hidden until transport is enabled.
                </div>
              )}
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "documents" ? (
          <StepCard title="Documents Upload" description="Upload admission documents. Multiple files are supported for each category.">
            <div className="student-form__documents">
              {documentTypes.map((docType) => (
                <FileUploadGroup
                  key={docType.key}
                  label={docType.label}
                  files={draft.documents[docType.key] || []}
                  note="PDF, DOC, DOCX, and image uploads are supported."
                  onUpload={(files) => uploadDocument(docType.key, files)}
                  onRemove={(index) => removeDocument(docType.key, index)}
                />
              ))}
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "fees" ? (
          <StepCard title="Fees Information" description="Capture the fee category, discount, and scholarship information.">
            <div className="form-grid">
              <label className="profile-page__field">
                <span className="profile-page__label">Fee Category</span>
                <select className="profile-page__input" value={draft.fees.feeCategory} onChange={(event) => updateField(["fees", "feeCategory"], event.target.value)}>
                  {feeCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="profile-page__field">
                <span className="profile-page__label">Scholarship?</span>
                <select className="profile-page__input" value={draft.fees.scholarship} onChange={(event) => updateField(["fees", "scholarship"], event.target.value)}>
                  {yesNoOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              {draft.fees.scholarship === "Yes" ? (
                <>
                  <label className="profile-page__field">
                    <span className="profile-page__label">Scholarship Type</span>
                    <select className="profile-page__input" value={draft.fees.scholarshipType} onChange={(event) => updateField(["fees", "scholarshipType"], event.target.value)}>
                      <option value="">Select scholarship type</option>
                      {scholarshipTypes.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <FormInput label="Sponsor" value={draft.fees.sponsor} onChange={(event) => updateField(["fees", "sponsor"], event.target.value)} error={stepErrors.sponsor} />
                  <FormInput label="Scholarship Percentage" type="number" value={draft.fees.scholarshipPercentage} onChange={(event) => updateField(["fees", "scholarshipPercentage"], event.target.value)} error={stepErrors.scholarshipPercentage} />
                </>
              ) : null}

              <FormInput label="Discount Percentage" type="number" value={draft.fees.discountPercentage} onChange={(event) => updateField(["fees", "discountPercentage"], event.target.value)} />
              <FormInput label="Additional Notes" value={draft.fees.additionalNotes} onChange={(event) => updateField(["fees", "additionalNotes"], event.target.value)} />
            </div>
          </StepCard>
        ) : null}

        {activeStep.key === "review" ? (
          <StepCard title="Review & Submit" description="Confirm that all entered information is accurate before saving the admission record.">
            <div className="student-form__summary">
              <SummaryGroup title="Personal Information">
                <SummaryRow label="Name" value={`${draft.personal.firstName} ${draft.personal.middleName} ${draft.personal.lastName}`.replace(/\s+/g, " ").trim()} />
                <SummaryRow label="Gender" value={draft.personal.gender} />
                <SummaryRow label="Date of Birth" value={draft.personal.dateOfBirth} />
                <SummaryRow label="Birth Certificate / National ID" value={draft.personal.birthCertificateNumber} />
                <SummaryRow label="Address" value={[draft.personal.address, draft.personal.city, draft.personal.district, draft.personal.country].filter(Boolean).join(", ")} />
              </SummaryGroup>

              <SummaryGroup title="Guardians">
                {draft.guardians.map((guardian, index) => (
                  <div key={guardian.id || index} className="student-form__summary-stack">
                    <SummaryRow label={`Guardian ${index + 1}`} value={guardian.name} />
                    <SummaryRow label="Relationship" value={guardian.relationship} />
                    <SummaryRow label="Phone" value={guardian.phoneNumber} />
                  </div>
                ))}
              </SummaryGroup>

              <SummaryGroup title="Academic">
                <SummaryRow label="Academic Year" value={draft.academic.academicYear} />
                <SummaryRow label="Class" value={draft.academic.className} />
                <SummaryRow label="Stream" value={draft.academic.stream} />
                <SummaryRow label="Boarding Status" value={draft.academic.boardingStatus} />
                <SummaryRow label="Student Category" value={draft.academic.studentCategory} />
              </SummaryGroup>

              <SummaryGroup title="Medical / Transport / Fees">
                <SummaryRow label="Blood Group" value={draft.medical.bloodGroup} />
                <SummaryRow label="Uses Transport" value={draft.transport.usesSchoolTransport} />
                <SummaryRow label="Fee Category" value={draft.fees.feeCategory} />
                <SummaryRow label="Scholarship" value={draft.fees.scholarship} />
              </SummaryGroup>

              <SummaryGroup title="Documents">
                <SummaryRow label="Total Files" value={String(listSelectedFiles(draft.documents).length)} />
                <SummaryRow label="Document Types" value={documentTypes.filter((doc) => (draft.documents[doc.key] || []).length > 0).map((doc) => doc.label).join(", ")} />
              </SummaryGroup>
            </div>

            <label className="student-form__confirmation">
              <input
                type="checkbox"
                checked={draft.confirmationAccepted}
                onChange={(event) => updateField(["confirmationAccepted"], event.target.checked)}
              />
              <span>I confirm that all information provided is accurate.</span>
            </label>
            {stepErrors.confirmationAccepted ? <small className="form-field__error">{stepErrors.confirmationAccepted}</small> : null}
          </StepCard>
        ) : null}
      </section>

      <section className="student-form__footer">
        <div className="student-form__footer-left">
          <button type="button" className="secondary-button" onClick={handleBack} disabled={activeStepIndex === 0}>
            Back
          </button>
          {!isLastStep ? (
            <button type="button" className="primary-button" onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>
        <button type="button" className="secondary-button" onClick={handleSaveDraft} disabled={savingDraft}>
          {savingDraft ? "Saving Draft..." : "Save Draft"}
        </button>
      </section>
    </form>
  );
}
