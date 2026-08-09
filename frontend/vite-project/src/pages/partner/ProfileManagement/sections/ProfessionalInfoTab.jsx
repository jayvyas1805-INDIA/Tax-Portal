import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import "./ProfileFormTab.css";

const OCCUPATION_OPTIONS = [
  { value: "chartered_accountant", label: "Chartered Accountant" },
  { value: "tax_consultant", label: "Senior Tax Consultant" },
  { value: "financial_advisor", label: "Financial Advisor" },
  { value: "lawyer", label: "Lawyer" },
  { value: "other", label: "Other" },
];

const ProfessionalInfoTab = ({
  formData,
  onFieldChange,
  isEditing,
}) => {

  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  return (
    <div className="profile-form-tab">

      <SelectField
        id="occupation"
        name="occupation"
        label="Occupation"
        placeholder="Select your profession"
        options={OCCUPATION_OPTIONS}
        value={formData.occupation || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <FormField
        id="companyName"
        name="companyName"
        label="Company / Firm Name"
        value={formData.companyName || ""}
        onChange={handleChange}
        disabled={!isEditing}
        optional
      />

      <FormField
        id="experienceYears"
        name="experienceYears"
        label="Experience (Years)"
        type="number"
        value={formData.experienceYears || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

    </div>
  );
};

export default ProfessionalInfoTab;