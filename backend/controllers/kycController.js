// import Partner from "../models/Partner.js";
// import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// const DOCUMENT_LABELS = {
//   panCardFile: "PAN Card Copy",
//   aadhaarCardFile: "Aadhaar Front & Back",
//   passportPhotoFile: "Live Photograph",
// };

// /**
//  * Compliance level is a simple rollup of the 3 document statuses:
//  * any rejected -> LOW, any still pending -> MEDIUM, all verified -> HIGH
//  */
// const computeComplianceLevel = (kycInfo) => {
//   const statuses = [kycInfo.panCard.status, kycInfo.aadhaarCard.status, kycInfo.photo.status];

//   if (statuses.includes("rejected")) return "LOW";
//   if (statuses.every((status) => status === "verified")) return "HIGH";
//   return "MEDIUM";
// };

// /**
//  * GET /api/partner/kyc
//  * Protected — returns the 3 documents' statuses + submission history.
//  */
// export const getKycStatus = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user.id);

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }

//     const { kycInfo } = partner;

//     return res.status(200).json({
//       success: true,
//       kyc: {
//         panNumber: kycInfo.panNumber,
//         aadhaarNumber: kycInfo.aadhaarNumber,
//         panCard: kycInfo.panCard,
//         aadhaarCard: kycInfo.aadhaarCard,
//         photo: kycInfo.photo,
//         history: [...kycInfo.history].sort((a, b) => b.submittedAt - a.submittedAt),
//         complianceLevel: computeComplianceLevel(kycInfo),
//       },
//     });
//   } catch (error) {
//     console.error("getKycStatus error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching your KYC status.",
//     });
//   }
// };

// /**
//  * PUT /api/partner/kyc
//  * Protected — multipart form-data. Any subset of panNumber, aadhaarNumber,
//  * panCardFile, aadhaarCardFile, passportPhotoFile can be sent; only the
//  * documents actually included get re-submitted (status reset to pending).
//  */
// export const resubmitKycDocuments = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user.id);

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }

//     const { panNumber, aadhaarNumber } = req.body;
//     const files = req.files || {};

//     const fieldToDocKey = {
//       panCardFile: "panCard",
//       aadhaarCardFile: "aadhaarCard",
//       passportPhotoFile: "photo",
//     };

//     const uploadEntries = Object.entries(files).filter(([, fileArr]) => fileArr?.[0]);

//     if (uploadEntries.length === 0 && !panNumber && !aadhaarNumber) {
//       return res.status(400).json({
//         success: false,
//         message: "Nothing to update — provide a new number or document to resubmit.",
//       });
//     }

//     const uploadResults = await Promise.allSettled(
//       uploadEntries.map(([fieldName, fileArr]) =>
//         uploadToCloudinary(fileArr[0].buffer, "kyc", fieldName)
//       )
//     );

//     const failed = uploadResults
//       .map((result, index) => ({ result, fieldName: uploadEntries[index][0] }))
//       .filter(({ result }) => result.status === "rejected")
//       .map(({ fieldName }) => DOCUMENT_LABELS[fieldName]);

//     if (failed.length > 0) {
//       return res.status(502).json({
//         success: false,
//         message: `We couldn't upload: ${failed.join(", ")}. Please try again.`,
//       });
//     }

//     if (panNumber) partner.kycInfo.panNumber = panNumber;
//     if (aadhaarNumber) partner.kycInfo.aadhaarNumber = aadhaarNumber;

//     uploadEntries.forEach(([fieldName], index) => {
//       const docKey = fieldToDocKey[fieldName];
//       const fileUrl = uploadResults[index].value;

//       partner.kycInfo[docKey] = {
//         fileUrl,
//         status: "pending",
//         adminRemarks: "",
//         submittedAt: new Date(),
//       };

//       partner.kycInfo.history.unshift({
//         documentType: DOCUMENT_LABELS[fieldName],
//         fileUrl,
//         status: "pending",
//         adminRemarks: "",
//         submittedAt: new Date(),
//       });
//     });

//     await partner.save();

//     return res.status(200).json({
//       success: true,
//       message: "Documents submitted for verification.",
//       kyc: {
//         panNumber: partner.kycInfo.panNumber,
//         aadhaarNumber: partner.kycInfo.aadhaarNumber,
//         panCard: partner.kycInfo.panCard,
//         aadhaarCard: partner.kycInfo.aadhaarCard,
//         photo: partner.kycInfo.photo,
//         history: [...partner.kycInfo.history].sort((a, b) => b.submittedAt - a.submittedAt),
//         complianceLevel: computeComplianceLevel(partner.kycInfo),
//       },
//     });
//   } catch (error) {
//     console.error("resubmitKycDocuments error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while submitting your documents.",
//     });
//   }
// };


import Partner from "../models/Partner.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import createNotification from "../utils/createNotification.js";
import createAdminNotification from "../utils/createAdminNotification.js";

const DOCUMENT_LABELS = {
  panCardFile: "PAN Card Copy",
  aadhaarCardFile: "Aadhaar Front & Back",
  passportPhotoFile: "Live Photograph",
};

/**
 * Compliance level is a simple rollup of the 3 document statuses:
 * any rejected -> LOW, any still pending -> MEDIUM, all verified -> HIGH
 */
const computeComplianceLevel = (kycInfo) => {
  const statuses = [kycInfo.panCard.status, kycInfo.aadhaarCard.status, kycInfo.photo.status];

  if (statuses.includes("rejected")) return "LOW";
  if (statuses.every((status) => status === "verified")) return "HIGH";
  return "MEDIUM";
};

/**
 * GET /api/partner/kyc
 * Protected — returns the 3 documents' statuses + submission history.
 */
export const getKycStatus = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const { kycInfo } = partner;

    return res.status(200).json({
      success: true,
      kyc: {
        panNumber: kycInfo.panNumber,
        aadhaarNumber: kycInfo.aadhaarNumber,
        panCard: kycInfo.panCard,
        aadhaarCard: kycInfo.aadhaarCard,
        photo: kycInfo.photo,
        history: [...kycInfo.history].sort((a, b) => b.submittedAt - a.submittedAt),
        complianceLevel: computeComplianceLevel(kycInfo),
      },
    });
  } catch (error) {
    console.error("getKycStatus error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your KYC status.",
    });
  }
};

/**
 * PUT /api/partner/kyc
 * Protected — multipart form-data. Any subset of panNumber, aadhaarNumber,
 * panCardFile, aadhaarCardFile, passportPhotoFile can be sent; only the
 * documents actually included get re-submitted (status reset to pending).
 */
export const resubmitKycDocuments = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const { panNumber, aadhaarNumber } = req.body;
    const files = req.files || {};

    const fieldToDocKey = {
      panCardFile: "panCard",
      aadhaarCardFile: "aadhaarCard",
      passportPhotoFile: "photo",
    };

    const uploadEntries = Object.entries(files).filter(([, fileArr]) => fileArr?.[0]);

    if (uploadEntries.length === 0 && !panNumber && !aadhaarNumber) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update — provide a new number or document to resubmit.",
      });
    }

    const uploadResults = await Promise.allSettled(
      uploadEntries.map(([fieldName, fileArr]) =>
        uploadToCloudinary(fileArr[0].buffer, "kyc", fieldName)
      )
    );

    const failed = uploadResults
      .map((result, index) => ({ result, fieldName: uploadEntries[index][0] }))
      .filter(({ result }) => result.status === "rejected")
      .map(({ fieldName }) => DOCUMENT_LABELS[fieldName]);

    if (failed.length > 0) {
      return res.status(502).json({
        success: false,
        message: `We couldn't upload: ${failed.join(", ")}. Please try again.`,
      });
    }

    if (panNumber) partner.kycInfo.panNumber = panNumber;
    if (aadhaarNumber) partner.kycInfo.aadhaarNumber = aadhaarNumber;

    uploadEntries.forEach(([fieldName], index) => {
      const docKey = fieldToDocKey[fieldName];
      const fileUrl = uploadResults[index].value;

      partner.kycInfo[docKey] = {
        fileUrl,
        status: "pending",
        adminRemarks: "",
        submittedAt: new Date(),
      };

      partner.kycInfo.history.unshift({
        documentType: DOCUMENT_LABELS[fieldName],
        fileUrl,
        status: "pending",
        adminRemarks: "",
        submittedAt: new Date(),
      });
    });

    await partner.save();

    if (uploadEntries.length > 0) {
      createNotification(req.user.id, {
        icon: "📄",
        title: "KYC Documents Submitted",
        description: `${uploadEntries.map(([field]) => DOCUMENT_LABELS[field]).join(", ")} submitted for verification.`,
        category: "system",
      });

      createAdminNotification({
        icon: "⚠",
        title: `Pending Verification: ${partner.professionalInfo?.companyName || partner.personalInfo?.fullName || partner.email}`,
        detail: `${uploadEntries.map(([field]) => DOCUMENT_LABELS[field]).join(", ")} uploaded and require admin review.`,
        category: "critical",
        relatedPartnerId: partner._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents submitted for verification.",
      kyc: {
        panNumber: partner.kycInfo.panNumber,
        aadhaarNumber: partner.kycInfo.aadhaarNumber,
        panCard: partner.kycInfo.panCard,
        aadhaarCard: partner.kycInfo.aadhaarCard,
        photo: partner.kycInfo.photo,
        history: [...partner.kycInfo.history].sort((a, b) => b.submittedAt - a.submittedAt),
        complianceLevel: computeComplianceLevel(partner.kycInfo),
      },
    });
  } catch (error) {
    console.error("resubmitKycDocuments error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while submitting your documents.",
    });
  }
};
