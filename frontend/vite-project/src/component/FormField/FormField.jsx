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
        className="form-field__input"
      />
    </div>
  );
};

export default FormField;