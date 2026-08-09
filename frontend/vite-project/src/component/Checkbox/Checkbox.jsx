import "./Checkbox.css";

const Checkbox = ({ id, name, checked, onChange, children }) => {
  return (
    <label htmlFor={id} className="checkbox">
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="checkbox__input"
      />
      <span className="checkbox__label">{children}</span>
    </label>
  );
};

export default Checkbox;
