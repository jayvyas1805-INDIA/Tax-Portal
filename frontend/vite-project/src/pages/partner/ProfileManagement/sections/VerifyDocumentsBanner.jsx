import Button from "../../../../component/Button/Button";
import { useNavigate } from "react-router-dom";
import "./VerifyDocumentsBanner.css";

const VerifyDocumentsBanner = ({ onCompleteKyc }) => {
  const navigate = useNavigate();
  return (
    <div className="verify-documents-banner">
      <div>
        <p className="verify-documents-banner__title">Verify your Documents</p>
        <p className="verify-documents-banner__description">
          Upload your latest bank statements and ID proofs to reach 100%
          completion.
        </p>
      </div>
      <Button variant="secondary" onClick={() => navigate("/kyc-documents")}>
        Complete KYC
      </Button>
    </div>
  );
};

export default VerifyDocumentsBanner;
