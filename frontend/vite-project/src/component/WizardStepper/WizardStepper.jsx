import "./WizardStepper.css";

const WizardStepper = ({
  steps,
  activeNodeId,
  stepTitle,
  stepNumber,
  totalSteps,
  completePercentage,
}) => {
  return (
    <div className="wizard-stepper">
      <div className="wizard-stepper__meta">
        <div>
          <p className="wizard-stepper__title">{stepTitle}</p>
          <p className="wizard-stepper__subtitle">
            Step {stepNumber} of {totalSteps}
          </p>
        </div>
        <span className="wizard-stepper__percentage">
          {completePercentage}% Complete
        </span>
      </div>

      <ol className="wizard-stepper__list">
        {steps.map((step, index) => {
          const isCompleted = step.id < activeNodeId;
          const isActive = step.id === activeNodeId;

          return (
            <li key={step.id} className="wizard-stepper__item">
              <div className="wizard-stepper__node-wrap">
                <span
                  className={`wizard-stepper__node${
                    isCompleted ? " wizard-stepper__node--completed" : ""
                  }${isActive ? " wizard-stepper__node--active" : ""}`}
                >
                  {isCompleted ? "✓" : step.id}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className={`wizard-stepper__connector${
                      isCompleted ? " wizard-stepper__connector--completed" : ""
                    }`}
                  />
                )}
              </div>
              <span
                className={`wizard-stepper__step-label${
                  isActive ? " wizard-stepper__step-label--active" : ""
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default WizardStepper;