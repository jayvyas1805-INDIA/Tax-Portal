import multer from "multer";

// Memory storage: files stay in RAM as buffers just long enough to be
// streamed straight to Cloudinary — nothing is written to disk.
const storage = multer.memoryStorage();

const MAX_FILE_SIZE_MB = 5;

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Used on the partner registration route — matches the 3 file inputs
// from the KYC Verification step (Step 4) on the frontend.
export const partnerRegistrationUpload = upload.fields([
  { name: "panCardFile", maxCount: 1 },
  { name: "aadhaarCardFile", maxCount: 1 },
  { name: "passportPhotoFile", maxCount: 1 },
]);

export const profileImageUpload = upload.single("profileImage");

// Same 3 fields, reused for re-submitting/updating KYC documents after
// registration from the KYC Documents page. Any subset can be sent —
// multer just ignores fields that aren't present in the request.
export const kycDocumentsUpload = upload.fields([
  { name: "panCardFile", maxCount: 1 },
  { name: "aadhaarCardFile", maxCount: 1 },
  { name: "passportPhotoFile", maxCount: 1 },
]);

// Single file — cancelled cheque upload on the Bank Account Details page
export const cancelledChequeUpload = upload.single("cancelledChequeFile");

export default upload;
