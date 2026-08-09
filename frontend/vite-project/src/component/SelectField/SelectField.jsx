import "./SelectField.css";

const SelectField = ({
  id,
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  optional = false,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="select-field">
      <label htmlFor={id} className="select-field__label">
        {label}
        {optional && (
          <span className="select-field__optional">
            Optional
          </span>
        )}
      </label>

      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="select-field__input"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;