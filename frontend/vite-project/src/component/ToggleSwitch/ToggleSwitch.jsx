import "./ToggleSwitch.css";

const ToggleSwitch = ({ id, checked, onChange, label }) => {
  return (
    <label htmlFor={id} className="toggle-switch">
      {label && <span className="toggle-switch__label">{label}</span>}
      <span className="toggle-switch__control">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="toggle-switch__input"
        />
        <span className="toggle-switch__track" />
      </span>
    </label>
  );
};

export default ToggleSwitch;
