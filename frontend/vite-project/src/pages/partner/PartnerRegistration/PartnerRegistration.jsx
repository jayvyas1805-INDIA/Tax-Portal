import { useState } from "react";
import Navbar from "../../../component/Navbar/Navbar";
import Footer from "../../../component/Footer/Footer";
import WizardSidePanel from "../../../component/WizardSidePanel/WizardSidePanel";
import WizardStepper from "../../../component/WizardStepper/WizardStepper";
import ProfileCompletenessCard from "../../../component/ProfileCompletenessCard/ProfileCompletenessCard";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import ProfessionalInfoStep from "./steps/ProfessionalInfoStep";
import AddressInfoStep from "./steps/AddressInfoStep";
import KYCVerificationStep from "./steps/KYCVerificationStep";
import BankingInfoStep from "./steps/BankingInfoStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";
import FinalAcceptanceStep from "./steps/FinalAcceptanceStep";
import ApplicationSubmitted from "./ApplicationSubmitted";
import { registerPartner } from "../../../api/authApi";
import handshake from "../../../assets/handshake.jpg";
import two from "../../../assets/2nd.jpg";
import three from "../../../assets/3rd.jpg";
import verification from "../../../assets/verification.jfif";
import "./PartnerRegistration.css";

const TOTAL_STEPS = 7;

const STEP_TITLES = {
  1: "Personal Info",
  2: "Professional Info",
  3: "Address Information",
  4: "KYC Verification",
  5: "Banking Information",
  6: "Application Review",
  7: "Final Acceptance",
};

const STEPPER_NODES = [
  { id: 1, label: "PROFILE" },
  { id: 2, label: "PROFESSIONAL" },
  { id: 3, label: "ADDRESS" },
  { id: 4, label: "IDENTITY" },
  { id: 5, label: "BANKING" },
  { id: 6, label: "REVIEW" },
  { id: 7, label: "CONFIRM" },
];

const REQUIRED_FIELDS = [
  "fullName",
  "mobileNumber",
  "emailAddress",
  "dateOfBirth",
  "gender",
  "password",
  "occupation",
  "experienceYears",
  "addressLine1",
  "city",
  "state",
  "pincode",
  "panNumber",
  "aadhaarNumber",
  "panCardFile",
  "aadhaarCardFile",
  "passportPhotoFile",
  "accountHolderName",
  "bankName",
  "accountNumber",
  "reEnterAccountNumber",
  "ifscCode",
  "accountType",
];

const getCompletionPercentage = (
  formData,
  agreedToTerms,
  agreedToTermsConditions,
  agreedToPrivacyPolicy
) => {
  const totalFields = REQUIRED_FIELDS.length + 3;
  let filled = REQUIRED_FIELDS.filter((field) => Boolean(formData[field])).length;
  if (agreedToTerms) filled += 1;
  if (agreedToTermsConditions) filled += 1;
  if (agreedToPrivacyPolicy) filled += 1;
  return Math.round((filled / totalFields) * 100);
};

const SIDE_PANEL_CONTENT = {
  1: {
    heading: "Register as a Udyog Mantra Partner and earn commissions.",
    description:
      "Join a growing network of tax and financial professionals earning recurring commissions for every successful referral.",
    features: [
      { icon: "💰", title: "Earn up to 15% commission", description: "On every successful referral you bring to the platform." },
      { icon: "📊", title: "Real-time tracking", description: "Monitor referrals and payouts from a live dashboard." },
      { icon: "🎓", title: "Dedicated support and training", description: "Get onboarded with hands-on guidance from our team." },
    ],
    image: handshake
  },
  2: {
    heading: "Register as a Udyog Mantra Partner and earn commissions.",
    description: "Tell us about your professional background so we can tailor your partner experience.",
    features: [
      { icon: "🛡️", title: "Institutional Trust", description: "Join a network of elite financial professionals backed by modern SaaS efficiency." },
      { icon: "🔁", title: "Transparent Payouts", description: "Real-time tracking of commissions and automated monthly settlements." },
    ],
    image: two
  },
  3: {
    heading: "Address Verification",
    description: "Providing your address helps us verify your location and ensures all physical correspondence reaches the correct professional office.",
    features: [
      { icon: "✅", title: "Address Verification", description: "Ensuring compliance and accurate communication through localized validation." },
      { icon: "🔒", title: "Secure Data", description: "Your information is protected by enterprise-grade security and encryption protocols." },
    ],
    image: three
  },
  4: {
    heading: "Institutional Trust & Security",
    description: "We employ bank-grade encryption and executive-level compliance standards to protect your professional identity.",
    features: [
      { icon: "🔒", title: "Secure Document Handling", description: "Your uploaded documents are encrypted end-to-end." },
      { icon: "⚡", title: "Instant Verification", description: "Automated checks speed up your approval time." },
      { icon: "🛡️", title: "Privacy Protected", description: "Documents are never shared outside compliance review." },
    ],
    image: verification
  },
  5: {
    heading: "Secure Payouts",
    description: "Your earnings are managed with institutional-grade security and precision.",
    features: [
      { icon: "✅", title: "Automated monthly settlements", description: "Payouts run like clockwork every month." },
      { icon: "🔀", title: "Multiple payout options", description: "Choose the settlement method that suits you." },
      { icon: "🔒", title: "Secure encrypted transfers", description: "Every transaction is protected end-to-end." },
    ],
    image: handshake
  },
  6: {
    heading: "Review Your Application",
    description: "Please verify all information before submitting your registration for final approval. Accuracy ensures swift onboarding.",
    features: [
      { icon: "⚡", title: "Fast Approval", description: "Processed within 24 business hours." },
      { icon: "🔒", title: "Identity Secured", description: "Bank-grade encryption for all documents." },
      { icon: "🚀", title: "Instant Onboarding", description: "Immediate access to the portal upon approval." },
    ],
    image: two
  },
  7: {
    heading: "Review Your Application",
    description: "Please verify all information before submitting your registration for final approval. Accuracy ensures swift onboarding.",
    features: [
      { icon: "⚡", title: "Fast Approval", description: "Processed within 24 business hours." },
      { icon: "🔒", title: "Identity Secured", description: "Bank-grade encryption for all documents." },
      { icon: "🚀", title: "Instant Onboarding", description: "Immediate access to the portal upon approval." },
    ],
  },
  image: three
};

const INITIAL_FORM_DATA = {
  fullName: "",
  mobileNumber: "",
  emailAddress: "",
  dateOfBirth: "",
  gender: "",
  password: "",
  confirmPassword: "",
  occupation: "",
  companyName: "",
  experienceYears: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  panNumber: "",
  aadhaarNumber: "",
  panCardFile: null,
  aadhaarCardFile: null,
  passportPhotoFile: null,
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  reEnterAccountNumber: "",
  ifscCode: "",
  accountType: "",
};

const PartnerRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToTermsConditions, setAgreedToTermsConditions] = useState(false);
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleFieldChange = (name, value) => {
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (name, file) => {
    setFormData((previous) => ({ ...previous, [name]: file }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    setCurrentStep((step) => Math.min(step + 1, TOTAL_STEPS));
    scrollToTop();
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 1));
    scrollToTop();
  };

  const handleEditStep = (stepId) => {
    setCurrentStep(stepId);
    scrollToTop();
  };

  const handleFinalRegister = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await registerPartner(formData, {
        agreedToTerms,
        agreedToTermsConditions,
        agreedToPrivacyPolicy,
      });

      setReferenceNumber(response.referenceNumber);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("authUser", JSON.stringify(response.user));
      setIsSubmitted(true);
      scrollToTop();
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          "Something went wrong while submitting your registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sidePanelContent = SIDE_PANEL_CONTENT[currentStep] ?? SIDE_PANEL_CONTENT[2];
  const activeNodeId = currentStep;
  const completePercentage = getCompletionPercentage(
    formData,
    agreedToTerms,
    agreedToTermsConditions,
    agreedToPrivacyPolicy
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep formData={formData} onFieldChange={handleFieldChange} onNext={handleNext} />
        );
      case 2:
        return (
          <ProfessionalInfoStep formData={formData} onFieldChange={handleFieldChange} onNext={handleNext} onPrevious={handlePrevious} />
        );
      case 3:
        return (
          <AddressInfoStep formData={formData} onFieldChange={handleFieldChange} onNext={handleNext} onPrevious={handlePrevious} />
        );
      case 4:
        return (
          <KYCVerificationStep formData={formData} onFieldChange={handleFieldChange} onFileChange={handleFileChange} onNext={handleNext} onPrevious={handlePrevious} />
        );
      case 5:
        return (
          <BankingInfoStep formData={formData} onFieldChange={handleFieldChange} onNext={handleNext} onPrevious={handlePrevious} />
        );
      case 6:
        return (
          <ReviewSubmitStep
            formData={formData}
            agreedToTerms={agreedToTerms}
            onAgreeChange={(event) => setAgreedToTerms(event.target.checked)}
            onEditStep={handleEditStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <FinalAcceptanceStep
            agreedToTermsConditions={agreedToTermsConditions}
            agreedToPrivacyPolicy={agreedToPrivacyPolicy}
            onAgreementChange={(event) => {
              if (event.target.name === "agreeTermsConditions") {
                setAgreedToTermsConditions(event.target.checked);
              } else {
                setAgreedToPrivacyPolicy(event.target.checked);
              }
            }}
            onNext={handleFinalRegister}
            onPrevious={handlePrevious}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="partner-registration">
      <Navbar />

      <div className="partner-registration__body">
        <WizardSidePanel
          image={sidePanelContent.image}
          heading={sidePanelContent.heading}
          description={sidePanelContent.description}
          features={sidePanelContent.features}
        />

        <main className="partner-registration__main">
          {isSubmitted ? (
            <ApplicationSubmitted
              referenceNumber={referenceNumber}
              email={formData.emailAddress}
            />
          ) : (
            <>
              <WizardStepper
                steps={STEPPER_NODES}
                activeNodeId={activeNodeId}
                stepTitle={STEP_TITLES[currentStep]}
                stepNumber={currentStep}
                totalSteps={TOTAL_STEPS}
                completePercentage={completePercentage}
              />

              <div className="partner-registration__form-card">{renderStep()}</div>

              <ProfileCompletenessCard percentage={completePercentage} />
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default PartnerRegistration;
