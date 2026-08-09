import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import "./ProfileFormTab.css";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PersonalInfoTab = ({
  formData,
  onFieldChange,
  isEditing,
}) => {

  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  return (
    <div className="profile-form-tab">

      <FormField
        id="fullName"
        name="fullName"
        label="Full Name"
        value={formData.fullName || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <FormField
        id="mobileNumber"
        name="mobileNumber"
        label="Mobile Number"
        type="tel"
        value={formData.mobileNumber || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      {/* Email should never be editable */}

      <FormField
        id="emailAddress"
        name="emailAddress"
        label="Email Address"
        type="email"
        value={formData.emailAddress || ""}
        disabled
        required
      />

      <FormField
        id="dateOfBirth"
        name="dateOfBirth"
        label="Date of Birth"
        type="date"
        value={formData.dateOfBirth || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <SelectField
        id="gender"
        name="gender"
        label="Gender"
        placeholder="Select Gender"
        options={GENDER_OPTIONS}
        value={formData.gender || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

    </div>
  );
};

export default PersonalInfoTab;