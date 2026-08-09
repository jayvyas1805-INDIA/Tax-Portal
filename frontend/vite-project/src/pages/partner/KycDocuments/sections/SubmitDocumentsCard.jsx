import Button from "../../../../component/Button/Button";
import "./SubmitDocumentsCard.css";

const SubmitDocumentsCard = ({
  panNumber,
  aadhaarNumber,
  onPanNumberChange,
  onAadhaarNumberChange,
  fileNames,
  onFileChange,
  onDiscard,
  onUploadDocuments,
  isSubmitting,
}) => {
  const handleFileInputChange = (fieldName) => (event) => {
    const file = event.target.files?.[0];
    if (file) onFileChange(fieldName, file);
  };

  return (
    <div className="submit-documents-card">
      <p className="submit-documents-card__title">Submit New Documents</p>

      <div className="submit-documents-card__section">
        <p className="submit-documents-card__section-label">PAN Card Details</p>
        <div className="submit-documents-card__row">
          <input
            type="text"
            placeholder="Enter PAN Number"
            value={panNumber}
            onChange={(event) => onPanNumberChange(event.target.value)}
            className="submit-documents-card__input"
          />
          <label className="submit-documents-card__upload-btn">
            📎 {fileNames.panCardFile || "Upload PAN Copy"}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              hidden
              onChange={handleFileInputChange("panCardFile")}
            />
          </label>
        </div>
      </div>

      <div className="submit-documents-card__section">
        <p className="submit-documents-card__section-label">Aadhaar Card Details</p>
        <div className="submit-documents-card__row">
          <input
            type="text"
            placeholder="Enter Aadhaar Number"
            value={aadhaarNumber}
            onChange={(event) => onAadhaarNumberChange(event.target.value)}
            className="submit-documents-card__input"
          />
          <label className="submit-documents-card__upload-btn">
            📎 {fileNames.aadhaarCardFile || "Upload Aadhaar Copy"}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              hidden
              onChange={handleFileInputChange("aadhaarCardFile")}
            />
          </label>
        </div>
      </div>

      <div className="submit-documents-card__section">
        <p className="submit-documents-card__section-label">Photograph Upload</p>
        <div className="submit-documents-card__photo-zone">
          <span className="submit-documents-card__photo-icon" aria-hidden="true">
            🧑
          </span>
          <div className="submit-documents-card__photo-info">
            <p className="submit-documents-card__photo-hint">
              {fileNames.passportPhotoFile || "Clear headshot with plain background."}
            </p>
            <p className="submit-documents-card__photo-subhint">
              JPG or PNG, max 5MB
            </p>
          </div>
          <label className="submit-documents-card__replace-btn">
            📷 Replace Image
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              hidden
              onChange={handleFileInputChange("passportPhotoFile")}
            />
          </label>
        </div>
      </div>

      <div className="submit-documents-card__actions">
        <Button variant="secondary" onClick={onDiscard} disabled={isSubmitting}>
          Discard Changes
        </Button>
        <Button variant="primary" onClick={onUploadDocuments} disabled={isSubmitting}>
          {isSubmitting ? "Uploading..." : "Upload New Documents"}
        </Button>
      </div>
    </div>
  );
};

export default SubmitDocumentsCard;
