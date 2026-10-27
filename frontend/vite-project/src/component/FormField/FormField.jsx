import "./FormField.css";

const FormField = ({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  optional = false,
  required = false,
  disabled = false, // NEW
  maxLength,
  inputMode,
  error = "",
}) => {
  return (
    <div className="form-field">
      <label htmlFor={id} className="form-field__label">
        {label}
        {optional && (
          <span className="form-field__optional">
            Optional
          </span>
        )}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}   // NEW
        maxLength={maxLength}
        inputMode={inputMode}
        aria-invalid={error ? "true" : undefined}
        className="form-field__input"
      />
      {error && <p className="form-field__error" role="alert">{error}</p>}
    </div>
  );
};

export default FormField;