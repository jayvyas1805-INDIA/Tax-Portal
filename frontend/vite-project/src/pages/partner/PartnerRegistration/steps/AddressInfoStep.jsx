import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import Button from "../../../../component/Button/Button";
import "./AddressInfoStep.css";

const STATE_OPTIONS = [
  { value: "AP", label: "Andhra Pradesh" },
  { value: "AR", label: "Arunachal Pradesh" },
  { value: "AS", label: "Assam" },
  { value: "BR", label: "Bihar" },
  { value: "CG", label: "Chhattisgarh" },
  { value: "GA", label: "Goa" },
  { value: "GJ", label: "Gujarat" },
  { value: "HR", label: "Haryana" },
  { value: "HP", label: "Himachal Pradesh" },
  { value: "JH", label: "Jharkhand" },
  { value: "KA", label: "Karnataka" },
  { value: "KL", label: "Kerala" },
  { value: "MP", label: "Madhya Pradesh" },
  { value: "MH", label: "Maharashtra" },
  { value: "MN", label: "Manipur" },
  { value: "ML", label: "Meghalaya" },
  { value: "MZ", label: "Mizoram" },
  { value: "NL", label: "Nagaland" },
  { value: "OD", label: "Odisha" },
  { value: "PB", label: "Punjab" },
  { value: "RJ", label: "Rajasthan" },
  { value: "SK", label: "Sikkim" },
  { value: "TN", label: "Tamil Nadu" },
  { value: "TS", label: "Telangana" },
  { value: "TR", label: "Tripura" },
  { value: "UP", label: "Uttar Pradesh" },
  { value: "UK", label: "Uttarakhand" },
  { value: "WB", label: "West Bengal" },
];
const AddressInfoStep = ({ formData, onFieldChange, onNext, onPrevious }) => {
  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="address-info-step" onSubmit={handleSubmit}>
      <div className="address-info-step__header">
        <span className="address-info-step__header-icon" aria-hidden="true">
          📍
        </span>
        <h3 className="address-info-step__header-title">
          Address Information
        </h3>
      </div>

      <div className="address-info-step__grid">
        <FormField
          id="addressLine1"
          name="addressLine1"
          label="Address Line 1"
          placeholder="e.g. 123 Corporate Plaza"
          value={formData.addressLine1}
          onChange={handleChange}
          required
        />
        <FormField
          id="addressLine2"
          name="addressLine2"
          label="Address Line 2"
          placeholder="Suite, floor, or building"
          value={formData.addressLine2}
          onChange={handleChange}
          optional
        />

        <div className="address-info-step__row">
          <FormField
            id="city"
            name="city"
            label="City"
            placeholder="New York"
            value={formData.city}
            onChange={handleChange}
            required
          />
          <SelectField
            id="state"
            name="state"
            label="State"
            placeholder="Select State"
            options={STATE_OPTIONS}
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>

        <FormField
          id="pincode"
          name="pincode"
          label="Pincode / ZIP Code"
          placeholder="10001"
          value={formData.pincode}
          onChange={handleChange}
          required
        />
      </div>

      <div className="address-info-step__actions">
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

export default AddressInfoStep;
