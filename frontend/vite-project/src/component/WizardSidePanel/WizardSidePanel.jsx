import "./WizardSidePanel.css";

const WizardSidePanel = ({ heading, description, image, features }) => {
  return (
    <aside className="wizard-side-panel">
      {/* <p className="wizard-side-panel__eyebrow">{eyebrow}</p> */}
      <h2 className="wizard-side-panel__heading">{heading}</h2>
      <p className="wizard-side-panel__description">{description}</p>

      <img
        src={image}
        alt={heading}
        className="wizard-side-panel__photo"
      />

      <ul className="wizard-side-panel__features">
        {features.map((feature) => (
          <li key={feature.title} className="wizard-side-panel__feature">
            <span className="wizard-side-panel__feature-icon" aria-hidden="true">
              {feature.icon}
            </span>
            <div>
              <p className="wizard-side-panel__feature-title">{feature.title}</p>
              <p className="wizard-side-panel__feature-text">{feature.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
export default WizardSidePanel;
