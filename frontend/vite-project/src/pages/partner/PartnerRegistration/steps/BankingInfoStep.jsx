import FormField from "../../../../component/FormField/FormField";
import SelectField from "../../../../component/SelectField/SelectField";
import RadioGroup from "../../../../component/RadioGroup/RadioGroup";
import Button from "../../../../component/Button/Button";
import "./BankingInfoStep.css";

const BANK_OPTIONS = [
  { value: "hdfc", label: "HDFC Bank" },
  { value: "icici", label: "ICICI Bank" },
  { value: "sbi", label: "State Bank of India" },
  { value: "axis", label: "Axis Bank" },
  { value: "other", label: "Other" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: "savings", label: "Savings Account" },
  { value: "current", label: "Current Account" },
];

const BankingInfoStep = ({ formData, onFieldChange, onNext, onPrevious }) => {
  const handleChange = (event) => {
    onFieldChange(event.target.name, event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onNext();
  };

  return (
    <form className="banking-step" onSubmit={handleSubmit}>
      <div className="banking-step__header">
        <h3 className="banking-step__header-title">Banking Information</h3>
        <p className="banking-step__header-subtitle">
          Provide your settlement account details for commission payouts.
        </p>
      </div>

      <div className="banking-step__grid">
        <FormField
          id="accountHolderName"
          name="accountHolderName"
          label="Account Holder Name"
          placeholder="Enter full name as per bank records"
          value={formData.accountHolderName}
          onChange={handleChange}
          required
        />
        <SelectField
          id="bankName"
          name="bankName"
          label="Bank Name"
          placeholder="Select your bank"
          options={BANK_OPTIONS}
          value={formData.bankName}
          onChange={handleChange}
          required
        />
        <FormField
          id="accountNumber"
          name="accountNumber"
          label="Account Number"
          placeholder="Enter account number"
          value={formData.accountNumber}
          onChange={handleChange}
          required
        />
        <FormField
          id="reEnterAccountNumber"
          name="reEnterAccountNumber"
          label="Re-enter Account Number"
          placeholder="Verify account number"
          value={formData.reEnterAccountNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div className="banking-step__ifsc-row">
        <FormField
          id="ifscCode"
          name="ifscCode"
          label="IFSC Code / Routing Number"
          placeholder="Enter code"
          value={formData.ifscCode}
          onChange={handleChange}
          required
        />
        <Button type="button" variant="secondary">
          Verify
        </Button>
      </div>

      <RadioGroup
        label="Account Type"
        name="accountType"
        options={ACCOUNT_TYPE_OPTIONS}
        value={formData.accountType}
        onChange={handleChange}
      />

      <p className="banking-step__note">
        All payouts are processed securely through our banking partners.
        Commissions are settled by the 10th of every month.
      </p>

      <div className="banking-step__actions">
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

export default BankingInfoStep;
