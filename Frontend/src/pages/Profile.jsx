import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/PageHeader";
import { useAuth } from "../context/AuthContext";

const roleAssignments = {
  principal: "Principal Office",
  "head-teacher": "Academic Leadership",
  dos: "Curriculum and Examinations",
  teacher: "Teaching Staff",
  "non-teaching-staff": "Administrator",
  librarian: "Library Services",
};

function formatRole(role) {
  if (!role) return "Role not assigned";
  return role
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getInitials(name) {
  return String(name || "U")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U";
}

function ProfileField({ label, value, readOnly, onChange, type = "text" }) {
  return (
    <label className="profile-page__field">
      <span className="profile-page__label">{label}</span>
      <input className="profile-page__input" type={type} value={value} readOnly={readOnly} onChange={onChange} />
    </label>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const initialProfile = useMemo(() => {
    const displayName = user?.displayName || user?.fullName || user?.username || "User";
    return {
      name: displayName,
      role: formatRole(user?.role),
      email: user?.email || "",
      phone: user?.phone || "",
      assignment: user?.assignment || roleAssignments[user?.role] || "",
      avatarUrl: user?.photoUrl || "",
    };
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialProfile);

  useEffect(() => {
    if (!isEditing) {
      setDraft(initialProfile);
    }
  }, [initialProfile, isEditing]);

  function handleChange(field) {
    return (event) => setDraft((current) => ({ ...current, [field]: event.target.value }));
  }

  function handleSave() {
    updateUser?.({
      username: draft.name.trim() || user?.username,
      email: draft.email.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      assignment: draft.assignment.trim() || undefined,
      photoUrl: draft.avatarUrl.trim() || undefined,
      displayName: draft.name.trim() || user?.displayName || user?.username,
    });
    setIsEditing(false);
  }

  const displayName = draft.name || user?.username || "User";
  const avatarText = getInitials(displayName);
  const avatarUrl = draft.avatarUrl.trim();

  return (
    <div className="page-stack profile-page">
      <PageHeader
        title="Profile"
        subtitle="Review and update the signed-in user's account details."
        action={
          <div className="profile-page__actions">
            {isEditing ? (
              <>
                <button type="button" className="secondary-button" onClick={() => {
                  setDraft(initialProfile);
                  setIsEditing(false);
                }}>
                  Cancel
                </button>
                <button type="button" className="primary-button" onClick={handleSave}>
                  Save Profile
                </button>
              </>
            ) : (
              <button type="button" className="primary-button" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        }
      />

      <section className="profile-page__summary">
        <article className="profile-page__avatar-card data-card">
          <div className="profile-page__avatar">
            {avatarUrl ? <img src={avatarUrl} alt={`${displayName} avatar`} /> : <span>{avatarText}</span>}
          </div>
          <div>
            <strong>{displayName}</strong>
            <p>{formatRole(user?.role)}</p>
          </div>
        </article>

        <article className="profile-page__summary-card">
          <span>Email</span>
          <strong>{user?.email || "Not available"}</strong>
        </article>

        <article className="profile-page__summary-card">
          <span>Phone</span>
          <strong>{user?.phone || "Not available"}</strong>
        </article>
      </section>

      <section className="data-card profile-page__card">
        <div className="data-card__header">
          <div>
            <h3>Account Details</h3>
            <p>These values are connected to the current authentication session.</p>
          </div>
        </div>

        <div className="form-grid profile-page__grid">
          <ProfileField label="Name" value={draft.name} readOnly={!isEditing} onChange={handleChange("name")} />
          <ProfileField label="Role" value={draft.role} readOnly />
          <ProfileField label="Email" value={draft.email} readOnly={!isEditing} onChange={handleChange("email")} />
          <ProfileField label="Phone Number" value={draft.phone} readOnly={!isEditing} onChange={handleChange("phone")} />
          <ProfileField label="Department / Class Assignment" value={draft.assignment} readOnly={!isEditing} onChange={handleChange("assignment")} />
          <ProfileField label="Avatar / Photo URL" value={draft.avatarUrl} readOnly={!isEditing} onChange={handleChange("avatarUrl")} />
        </div>
      </section>
    </div>
  );
}
