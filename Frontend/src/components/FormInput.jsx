export default function FormInput({ label, error, hint, ...props }) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      <input className={error ? "is-invalid" : ""} {...props} />
      {hint ? <small className="form-field__hint">{hint}</small> : null}
      {error ? <small className="form-field__error">{error}</small> : null}
    </label>
  );
}
