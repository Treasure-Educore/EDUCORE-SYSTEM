import { useState } from "react";
import PageHeader from "../components/PageHeader";
import FormInput from "../components/FormInput";

export default function Settings() {
  const [form, setForm] = useState({
    schoolName: "Educore Academy",
    email: "admin@educore.ac.ug",
    phone: "+256 700 000 000",
    address: "Kampala, Uganda",
  });

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  return (
    <div className="page-stack">
      <PageHeader title="Settings" subtitle="Configure school identity, notifications, and account preferences." />

      <section className="data-card">
        <div className="data-card__header">
          <div>
            <h3>Organization Profile</h3>
            <p>Modern form layout with clear labels, spacing, and validation-ready states.</p>
          </div>
        </div>

        <div className="form-grid">
          <FormInput label="School Name" value={form.schoolName} onChange={updateField("schoolName")} />
          <FormInput label="Admin Email" value={form.email} onChange={updateField("email")} />
          <FormInput label="Phone Number" value={form.phone} onChange={updateField("phone")} />
          <FormInput label="Address" value={form.address} onChange={updateField("address")} />
        </div>

        <div className="settings-actions">
          <button type="button" className="secondary-button">Cancel</button>
          <button type="button" className="primary-button">Save settings</button>
        </div>
      </section>
    </div>
  );
}
