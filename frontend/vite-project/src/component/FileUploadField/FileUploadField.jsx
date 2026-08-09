import { useState } from "react";
import "./FileUploadField.css";

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const DEFAULT_MAX_SIZE_MB = 5;

const FileUploadField = ({
  id,
  icon,
  title,
  hint,
  accept,
  onFileSelect,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
}) => {
  const [fileName, setFileName] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return "Unsupported file type. Please upload a JPG, PNG, or PDF.";
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      return `File is too large. Maximum size is ${maxSizeMb}MB.`;
    }
    return "";
  };

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setFileName(file.name);
    onFileSelect(file);
  };

  const handleInputChange = (event) => {
    handleFiles(event.target.files);
    // Reset the input so re-selecting the same (fixed) file re-triggers onChange
    event.target.value = "";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <div>
      <div
        className={`file-upload-field${
          isDragActive ? " file-upload-field--active" : ""
        }${error ? " file-upload-field--error" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label htmlFor={id} className="file-upload-field__label">
          <span className="file-upload-field__icon" aria-hidden="true">
            {icon}
          </span>
          <span className="file-upload-field__title">{title}</span>
          <span className="file-upload-field__hint">
            {fileName ? fileName : hint}
          </span>
        </label>
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="file-upload-field__input"
        />
      </div>
      {error && <p className="file-upload-field__error">{error}</p>}
    </div>
  );
};

export default FileUploadField;
