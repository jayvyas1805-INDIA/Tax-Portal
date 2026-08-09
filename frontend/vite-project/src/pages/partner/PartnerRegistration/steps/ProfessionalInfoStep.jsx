import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import Button from "../../../../component/Button/Button";
import "./ProfessionalInfoStep.css";

const OCCUPATION_OPTIONS = [
  { value: "chartered_accountant", label: "Chartered Accountant" },
  { value: "tax_consultant", label: "Tax Consultant" },
  { value: "financial_advisor", label: "Financial Advisor" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "lawyer", label: "Lawyer" },
  { value: "other", label: "Other" },
];

const ProfessionalInfoStep = ({
  formData,
  onFieldChange,
  onNext,
  onPrevious,
}) => {
  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="professional-info-step" onSubmit={handleSubmit}>
      <div className="professional-info-step__header">
        <span
          className="professional-info-step__header-icon"
          aria-hidden="true"
        >
          💼
        </span>
        <h3 className="professional-info-step__header-title">
          Professional Information
        </h3>
      </div>

      <div className="professional-info-step__grid">
        <SelectField
          id="occupation"
          name="occupation"
          label="Occupation"
          placeholder="Select your profession"
          options={OCCUPATION_OPTIONS}
          value={formData.occupation}
          onChange={handleChange}
          required
        />
        <FormField
          id="companyName"
          name="companyName"
          label="Company/Firm Name"
          placeholder="e.g. Global Tax Solutions Ltd."
          value={formData.companyName}
          onChange={handleChange}
          optional
        />
        <FormField
          id="experienceYears"
          name="experienceYears"
          label="Experience (Years)"
          type="number"
          placeholder="0"
          value={formData.experienceYears}
          onChange={handleChange}
          required
        />
      </div>

      <div className="professional-info-step__actions">
        <Button variant="secondary" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button type="submit" variant="primary">
          Continue →
        </Button>
      </div>
    </form>
  );
};

export default ProfessionalInfoStep;
