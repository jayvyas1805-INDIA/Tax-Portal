import { useState } from "react";
import FormField from "../../../../component/FormField/FormField";
import PasswordField from "../../../../component/PasswordField/PasswordField";
import RadioGroup from "../../../../component/RadioGroup/RadioGroup";
import Button from "../../../../component/Button/Button";
import "./PersonalInfoStep.css";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const PersonalInfoStep = ({ formData, onFieldChange, onNext }) => {
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
    setPasswordError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    onNext();
  };

  return (
    <form className="personal-info-step" onSubmit={handleSubmit}>
      <div className="personal-info-step__header">
        <span className="personal-info-step__header-icon" aria-hidden="true">
          👤
        </span>
        <h3 className="personal-info-step__header-title">
          Personal Information
        </h3>
      </div>

      <div className="personal-info-step__grid">
        <FormField
          id="fullName"
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
        <FormField
          id="mobileNumber"
          name="mobileNumber"
          label="Mobile Number"
          type="tel"
          placeholder="+91 98765 43210"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
        />
        <FormField
          id="emailAddress"
          name="emailAddress"
          label="Email Address"
          type="email"
          placeholder="john@example.com"
          value={formData.emailAddress}
          onChange={handleChange}
          required
        />
        <FormField
          id="dateOfBirth"
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
        />
      </div>

      <div className="personal-info-step__grid">
        <PasswordField
          id="password"
          name="password"
          label="Create Password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
        />
        <PasswordField
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
      </div>

      {passwordError && (
        <p className="personal-info-step__error">{passwordError}</p>
      )}

      <RadioGroup
        label="Gender"
        name="gender"
        options={GENDER_OPTIONS}
        value={formData.gender}
        onChange={handleChange}
        className="personal-info-step__radio-group"
      />

      <div className="personal-info-step__actions">
        <Button type="submit" variant="primary">
          Continue →
        </Button>
      </div>
    </form>
  );
};

export default PersonalInfoStep;
