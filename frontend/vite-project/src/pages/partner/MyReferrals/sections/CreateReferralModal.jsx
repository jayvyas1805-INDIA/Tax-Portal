import { useState } from "react";
import Modal from "../../../../component/Modal/Modal";
import FormField from "../../../../component/FormField/FormField";
import Button from "../../../../component/Button/Button";
import "./CreateReferralModal.css";

const EMPTY_FORM = {
  clientName: "",
  clientContact: "",
  service: "",
  estimatedValue: "",
};

const CreateReferralModal = ({ isOpen, onClose, onCreate, isSubmitting, error }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onCreate(formData);
    if (success) {
      setFormData(EMPTY_FORM);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Referral">
      <form className="create-referral-modal" onSubmit={handleSubmit}>
        <FormField
          id="clientName"
          name="clientName"
          label="Client Name"
          placeholder="e.g. Velocity Solutions"
          value={formData.clientName}
          onChange={handleChange}
          required
        />
        <FormField
          id="clientContact"
          name="clientContact"
          label="Client Mobile Number"
          type="tel"
          placeholder="+91 98123 45601"
          value={formData.clientContact}
          onChange={handleChange}
          required
        />
        <FormField
          id="service"
          name="service"
          label="Service"
          placeholder="e.g. GST Filing"
          value={formData.service}
          onChange={handleChange}
          required
        />
        <FormField
          id="estimatedValue"
          name="estimatedValue"
          label="Estimated Value (₹)"
          type="number"
          placeholder="45000"
          value={formData.estimatedValue}
          onChange={handleChange}
          required
        />

        {error && <p className="create-referral-modal__error">{error}</p>}

        <div className="create-referral-modal__actions">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Referral"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateReferralModal;
