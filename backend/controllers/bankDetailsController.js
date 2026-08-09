// import Partner from "../models/Partner.js";
// import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// const lastDayOfMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0);

// const computeNextPayoutDate = () => {
//   const now = new Date();
//   const endOfThisMonth = lastDayOfMonth(now.getFullYear(), now.getMonth());

//   if (now.getDate() < endOfThisMonth.getDate()) {
//     return endOfThisMonth;
//   }
//   return lastDayOfMonth(now.getFullYear(), now.getMonth() + 1);
// };

// const buildResponse = (partner) => {
//   const { bankingInfo, payouts } = partner;
//   const recentPayment = payouts?.length
//     ? [...payouts].sort((a, b) => b.paidAt - a.paidAt)[0]
//     : null;

//   return {
//     accountHolderName: bankingInfo.accountHolderName,
//     bankName: bankingInfo.bankName,
//     branch: bankingInfo.branch,
//     accountNumber: bankingInfo.accountNumber,
//     ifscCode: bankingInfo.ifscCode,
//     accountType: bankingInfo.accountType,
//     cancelledChequeFileUrl: bankingInfo.cancelledChequeFileUrl,
//     adminRemarks: bankingInfo.adminRemarks,
//     verificationStatus: bankingInfo.verificationStatus,
//     recentPayment,
//     nextPayoutDate: computeNextPayoutDate(),
//   };
// };

// /**
//  * GET /api/partner/bank-details
//  * Protected — the partner viewing their own account number is expected
//  * (that's why bankingInfo.accountNumber is select:false by default and
//  * explicitly included here, rather than exposed on every generic query).
//  */
// export const getBankDetails = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user.id).select("+bankingInfo.accountNumber");

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }

//     return res.status(200).json({ success: true, bankDetails: buildResponse(partner) });
//   } catch (error) {
//     console.error("getBankDetails error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching your bank details.",
//     });
//   }
// };

// /**
//  * PUT /api/partner/bank-details
//  * Protected — multipart form-data. Any change resets verificationStatus
//  * to "pending" since edits require admin re-approval before payouts
//  * resume (matches the Security Alert shown on this page).
//  */
// export const updateBankDetails = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user.id).select("+bankingInfo.accountNumber");

//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }

//     const { accountHolderName, bankName, branch, ifscCode, accountNumber, accountType } = req.body;

//     if (!accountHolderName || !bankName || !ifscCode || !accountNumber || !accountType) {
//       return res.status(400).json({
//         success: false,
//         message: "Account holder name, bank name, IFSC code, account number, and account type are required.",
//       });
//     }

//     let cancelledChequeFileUrl = partner.bankingInfo.cancelledChequeFileUrl;
//     if (req.file) {
//       try {
//         cancelledChequeFileUrl = await uploadToCloudinary(req.file.buffer, "banking", "cancelled-cheque");
//       } catch (uploadError) {
//         console.error("Cancelled cheque upload failed ->", uploadError);
//         return res.status(502).json({
//           success: false,
//           message: "We couldn't upload your cancelled cheque. Please try again.",
//         });
//       }
//     }

//     partner.bankingInfo = {
//       accountHolderName,
//       bankName,
//       branch: branch || "",
//       accountNumber,
//       ifscCode,
//       accountType,
//       cancelledChequeFileUrl,
//       adminRemarks: "", // cleared — awaiting fresh review
//       verificationStatus: "pending",
//     };

//     await partner.save();

//     return res.status(200).json({
//       success: true,
//       message: "Bank details updated. Changes are pending admin approval.",
//       bankDetails: buildResponse(partner),
//     });
//   } catch (error) {
//     console.error("updateBankDetails error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while updating your bank details.",
//     });
//   }
// };


import Partner from "../models/Partner.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import createNotification from "../utils/createNotification.js";

const lastDayOfMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0);

const computeNextPayoutDate = () => {
  const now = new Date();
  const endOfThisMonth = lastDayOfMonth(now.getFullYear(), now.getMonth());

  if (now.getDate() < endOfThisMonth.getDate()) {
    return endOfThisMonth;
  }
  return lastDayOfMonth(now.getFullYear(), now.getMonth() + 1);
};

const buildResponse = (partner) => {
  const { bankingInfo, payouts } = partner;
  const recentPayment = payouts?.length
    ? [...payouts].sort((a, b) => b.paidAt - a.paidAt)[0]
    : null;

  return {
    accountHolderName: bankingInfo.accountHolderName,
    bankName: bankingInfo.bankName,
    branch: bankingInfo.branch,
    accountNumber: bankingInfo.accountNumber,
    ifscCode: bankingInfo.ifscCode,
    accountType: bankingInfo.accountType,
    cancelledChequeFileUrl: bankingInfo.cancelledChequeFileUrl,
    adminRemarks: bankingInfo.adminRemarks,
    verificationStatus: bankingInfo.verificationStatus,
    recentPayment,
    nextPayoutDate: computeNextPayoutDate(),
  };
};

/**
 * GET /api/partner/bank-details
 * Protected — the partner viewing their own account number is expected
 * (that's why bankingInfo.accountNumber is select:false by default and
 * explicitly included here, rather than exposed on every generic query).
 */
export const getBankDetails = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select("+bankingInfo.accountNumber");

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({ success: true, bankDetails: buildResponse(partner) });
  } catch (error) {
    console.error("getBankDetails error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your bank details.",
    });
  }
};

/**
 * PUT /api/partner/bank-details
 * Protected — multipart form-data. Any change resets verificationStatus
 * to "pending" since edits require admin re-approval before payouts
 * resume (matches the Security Alert shown on this page).
 */
export const updateBankDetails = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id).select("+bankingInfo.accountNumber");

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const { accountHolderName, bankName, branch, ifscCode, accountNumber, accountType } = req.body;

    if (!accountHolderName || !bankName || !ifscCode || !accountNumber || !accountType) {
      return res.status(400).json({
        success: false,
        message: "Account holder name, bank name, IFSC code, account number, and account type are required.",
      });
    }

    let cancelledChequeFileUrl = partner.bankingInfo.cancelledChequeFileUrl;
    if (req.file) {
      try {
        cancelledChequeFileUrl = await uploadToCloudinary(req.file.buffer, "banking", "cancelled-cheque");
      } catch (uploadError) {
        console.error("Cancelled cheque upload failed ->", uploadError);
        return res.status(502).json({
          success: false,
          message: "We couldn't upload your cancelled cheque. Please try again.",
        });
      }
    }

    partner.bankingInfo = {
      accountHolderName,
      bankName,
      branch: branch || "",
      accountNumber,
      ifscCode,
      accountType,
      cancelledChequeFileUrl,
      adminRemarks: "", // cleared — awaiting fresh review
      verificationStatus: "pending",
    };

    await partner.save();

    createNotification(req.user.id, {
      icon: "🏦",
      title: "Bank Details Updated",
      description: "Your bank details were changed and are now pending admin approval.",
      category: "system",
    });

    return res.status(200).json({
      success: true,
      message: "Bank details updated. Changes are pending admin approval.",
      bankDetails: buildResponse(partner),
    });
  } catch (error) {
    console.error("updateBankDetails error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating your bank details.",
    });
  }
};
