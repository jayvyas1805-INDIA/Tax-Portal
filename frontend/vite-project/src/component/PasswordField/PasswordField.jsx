import { useState } from "react";
import "./PasswordField.css";

const PasswordField = ({ id, label, name, value, onChange, placeholder }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="password-field">
      <label htmlFor={id} className="password-field__label">
        {label}
      </label>
      <div className="password-field__input-wrap">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="password-field__input"
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
