import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import "./ProfileFormTab.css";

const STATE_OPTIONS = [
  { value: "Gujarat", label: "Gujarat" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Other", label: "Other" },
];

const AddressInfoTab = ({
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
        id="addressLine1"
        name="addressLine1"
        label="Address Line 1"
        value={formData.addressLine1 || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <FormField
        id="addressLine2"
        name="addressLine2"
        label="Address Line 2"
        value={formData.addressLine2 || ""}
        onChange={handleChange}
        disabled={!isEditing}
        optional
      />

      <FormField
        id="city"
        name="city"
        label="City"
        value={formData.city || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <SelectField
        id="state"
        name="state"
        label="State"
        placeholder="Select State"
        options={STATE_OPTIONS}
        value={formData.state || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

      <FormField
        id="pincode"
        name="pincode"
        label="Pincode"
        value={formData.pincode || ""}
        onChange={handleChange}
        disabled={!isEditing}
        required
      />

    </div>
  );
};

export default AddressInfoTab;