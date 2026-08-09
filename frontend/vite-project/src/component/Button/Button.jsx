import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
