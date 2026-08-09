import "./RadioGroup.css";

const RadioGroup = ({ label, name, options, value, onChange }) => {
  return (
    <fieldset className="radio-group">
      <legend className="radio-group__label">{label}</legend>
      <div className="radio-group__options">
        {options.map((option) => (
          <label key={option.value} className="radio-group__option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="radio-group__input"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
