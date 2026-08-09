import LoggedInNavbar from "../../../component/LoggedInNavbar/LoggedInNavbar";
import Button from "../../../component/Button/Button";
import "./RegistrationSuccess.css";

const RegistrationSuccess = () => {
  return (
    <div className="registration-success">
      <LoggedInNavbar />

      <main className="registration-success__main">
        <section className="registration-success__panel">
          <span className="registration-success__badge">
            ● APPLICATION RECEIVED
          </span>
          <h1 className="registration-success__title">
            Registration Successful
          </h1>
          <p className="registration-success__description">
            Welcome to the Partner Network. Your application has been
            received and is being processed by our compliance team. You'll
            receive an email confirmation shortly.
          </p>

          <svg
            className="registration-success__illustration"
            viewBox="0 0 400 220"
            preserveAspectRatio="xMidYMax meet"
            aria-hidden="true"
          >
            <rect x="20" y="150" width="360" height="60" rx="10" fill="#0c2140" />
            <rect x="60" y="90" width="90" height="120" rx="8" fill="#1a3b6b" />
            <rect x="250" y="90" width="90" height="120" rx="8" fill="#1a3b6b" />
            <circle cx="200" cy="120" r="36" fill="#4f83e8" opacity="0.85" />
            <rect x="170" y="150" width="60" height="10" rx="5" fill="#eef4ff" />
          </svg>
        </section>

        <aside className="registration-success__sidebar">
          <Button variant="primary" disabled>
            🕐 Dashboard Preparation in Progress
          </Button>
          <Button variant="secondary">⬇ Download Registration Summary</Button>

          <p className="registration-success__help">
            Need immediate assistance? Our Priority Partner Support line is
            open. <a href="#contact-support">Contact Support</a>
          </p>
        </aside>
      </main>
    </div>
  );
};

export default RegistrationSuccess;
