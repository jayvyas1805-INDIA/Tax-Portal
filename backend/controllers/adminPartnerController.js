import Partner from "../models/Partner.js";

const getPartnerDisplayName = (partner) =>
  partner?.professionalInfo?.companyName ||
  partner?.personalInfo?.fullName ||
  partner?.email ||
  "Unknown Partner";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

// Overall KYC status derived from the 3 individual document checks.
const getKycStatus = (kycInfo) => {
  const docStatuses = [
    kycInfo?.panCard?.status,
    kycInfo?.aadhaarCard?.status,
    kycInfo?.photo?.status,
  ];

  if (docStatuses.includes("rejected")) return "Rejected";
  if (docStatuses.every((status) => status === "verified")) return "Verified";
  return "Pending";
};

const toDirectoryRow = (partner) => {
  const name = getPartnerDisplayName(partner);

  return {
    id: partner._id,
    pan: partner.kycInfo?.panNumber || "—",
    initials: getInitials(name),
    name,
    tier: partner.tier || "Emerging Bronze",
    occupation: partner.professionalInfo?.occupation || "—",
    email: partner.email,
    phone: partner.personalInfo?.mobileNumber || "—",
    regDate: partner.registration?.submittedAt || partner.createdAt,
    kycStatus: getKycStatus(partner.kycInfo),
    accountStatus: partner.isActive ? "Active" : "Suspended",
  };
};

/**
 * GET /api/admin/partners/stats
 * Stat cards: Total Partners, Pending KYC, Active Partners, New This Month
 */
export const getPartnerStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalPartners,
      pendingKyc,
      activePartners,
      newThisMonth,
      newLastMonth,
    ] = await Promise.all([
      Partner.countDocuments({}),
      Partner.countDocuments({
        $or: [
          { "kycInfo.panCard.status": { $ne: "verified" } },
          { "kycInfo.aadhaarCard.status": { $ne: "verified" } },
          { "kycInfo.photo.status": { $ne: "verified" } },
        ],
      }),
      Partner.countDocuments({ isActive: true }),
      Partner.countDocuments({ createdAt: { $gte: startOfThisMonth } }),
      Partner.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
    ]);

    const activePartnersPercent = totalPartners
      ? Number(((activePartners / totalPartners) * 100).toFixed(1))
      : 0;

    const growthPercent = newLastMonth
      ? Number((((newThisMonth - newLastMonth) / newLastMonth) * 100).toFixed(1))
      : newThisMonth > 0
        ? 100
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalPartners,
        pendingKyc,
        activePartners,
        activePartnersPercent,
        newThisMonth,
        growthPercent,
      },
    });
  } catch (error) {
    console.error("getPartnerStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching partner stats.",
    });
  }
};

/**
 * GET /api/admin/partners
 * Query params:
 *   tab      - "All" | "Pending" | "Suspended"  (Pending = KYC not fully verified)
 *   search   - matches name, email, or PAN
 *   page     - default 1
 *   limit    - default 10
 */
export const getPartners = async (req, res) => {
  try {
    const { tab = "All", search = "" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const filter = {};

    if (tab === "Pending") {
      filter.$or = [
        { "kycInfo.panCard.status": { $ne: "verified" } },
        { "kycInfo.aadhaarCard.status": { $ne: "verified" } },
        { "kycInfo.photo.status": { $ne: "verified" } },
      ];
    } else if (tab === "Suspended") {
      filter.isActive = false;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$and = (filter.$and || []).concat([
        {
          $or: [
            { "personalInfo.fullName": regex },
            { "professionalInfo.companyName": regex },
            { email: regex },
            { "kycInfo.panNumber": regex },
          ],
        },
      ]);
    }

    const [partners, total] = await Promise.all([
      Partner.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Partner.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: partners.map(toDirectoryRow),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("getPartners (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching partners.",
    });
  }
};

/**
 * GET /api/admin/partners/:id
 * Full partner profile for a detail/drawer view.
 */
export const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id).select("+bankingInfo.accountNumber");

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...toDirectoryRow(partner),
        personalInfo: partner.personalInfo,
        professionalInfo: partner.professionalInfo,
        addressInfo: partner.addressInfo,
        kycInfo: partner.kycInfo,
        bankingInfo: partner.bankingInfo,
        registration: partner.registration,
      },
    });
  } catch (error) {
    console.error("getPartnerById (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching this partner.",
    });
  }
};

/**
 * PATCH /api/admin/partners/:id/status
 * Body: { isActive: boolean }
 * Suspend or reactivate a partner account.
 */
export const updatePartnerAccountStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive (boolean) is required.",
      });
    }

    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Partner account ${isActive ? "activated" : "suspended"} successfully.`,
      data: toDirectoryRow(partner),
    });
  } catch (error) {
    console.error("updatePartnerAccountStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the account status.",
    });
  }
};

const KYC_DOC_FIELDS = {
  panCard: "PAN Card Copy",
  aadhaarCard: "Aadhaar Front & Back",
  photo: "Live Photograph",
};

/**
 * PATCH /api/admin/partners/:id/kyc/:docType
 * docType: "panCard" | "aadhaarCard" | "photo"
 * Body: { status: "verified" | "rejected", adminRemarks? }
 * Approves or rejects a single KYC document. Pushes an entry into kycInfo.history
 * and recomputes the overall kycInfo.status ("complete" once all 3 are verified).
 */
export const updateKycDocumentStatus = async (req, res) => {
  try {
    const { docType, id } = req.params;
    const { status, adminRemarks = "" } = req.body;

    if (!KYC_DOC_FIELDS[docType]) {
      return res.status(400).json({
        success: false,
        message: `docType must be one of: ${Object.keys(KYC_DOC_FIELDS).join(", ")}`,
      });
    }

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'verified' or 'rejected'.",
      });
    }

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    partner.kycInfo[docType].status = status;
    partner.kycInfo[docType].adminRemarks = adminRemarks;

    partner.kycInfo.history.push({
      documentType: KYC_DOC_FIELDS[docType],
      fileUrl: partner.kycInfo[docType].fileUrl,
      status,
      adminRemarks,
      submittedAt: new Date(),
    });

    // Overall kycInfo.status is "complete" only once all 3 documents are verified.
    const allVerified = ["panCard", "aadhaarCard", "photo"].every(
      (key) => partner.kycInfo[key].status === "verified"
    );
    partner.kycInfo.status = allVerified ? "complete" : "pending";

    await partner.save();

    return res.status(200).json({
      success: true,
      message: `${KYC_DOC_FIELDS[docType]} marked as ${status}.`,
      data: toDirectoryRow(partner),
    });
  } catch (error) {
    console.error("updateKycDocumentStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating this KYC document.",
    });
  }
};

/**
 * PATCH /api/admin/partners/:id/banking
 * Body: { verificationStatus: "verified" | "rejected", adminRemarks? }
 * Approves or rejects a partner's banking details.
 */
export const updateBankingVerification = async (req, res) => {
  try {
    const { verificationStatus, adminRemarks = "" } = req.body;

    if (!["verified", "rejected"].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: "verificationStatus must be 'verified' or 'rejected'.",
      });
    }

    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      {
        "bankingInfo.verificationStatus": verificationStatus,
        "bankingInfo.adminRemarks": adminRemarks,
        "bankingInfo.status": verificationStatus === "verified" ? "complete" : "pending",
      },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Banking details marked as ${verificationStatus}.`,
      data: toDirectoryRow(partner),
    });
  } catch (error) {
    console.error("updateBankingVerification (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating banking verification.",
    });
  }
};

/**
 * PATCH /api/admin/partners/:id/application-status
 * Body: { applicationStatus: "approved" | "rejected" | "pending_review" }
 * Approves or rejects a partner's registration application. Rejecting also
 * suspends the account so a rejected applicant can't log in and act as a partner.
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationStatus } = req.body;

    if (!["approved", "rejected", "pending_review"].includes(applicationStatus)) {
      return res.status(400).json({
        success: false,
        message: "applicationStatus must be 'approved', 'rejected', or 'pending_review'.",
      });
    }

    const update = { "registration.applicationStatus": applicationStatus };
    if (applicationStatus === "rejected") update.isActive = false;
    if (applicationStatus === "approved") update.isActive = true;

    const partner = await Partner.findByIdAndUpdate(req.params.id, update, { new: true });

    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Partner application ${applicationStatus}.`,
      data: toDirectoryRow(partner),
    });
  } catch (error) {
    console.error("updateApplicationStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the application status.",
    });
  }
};

/**
 * GET /api/admin/partners/export
 * CSV export of the partner directory, respecting the same tab/search filters as the list.
 */
export const exportPartners = async (req, res) => {
  try {
    const { tab = "All", search = "" } = req.query;
    const filter = {};

    if (tab === "Pending") {
      filter.$or = [
        { "kycInfo.panCard.status": { $ne: "verified" } },
        { "kycInfo.aadhaarCard.status": { $ne: "verified" } },
        { "kycInfo.photo.status": { $ne: "verified" } },
      ];
    } else if (tab === "Suspended") {
      filter.isActive = false;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$and = (filter.$and || []).concat([
        {
          $or: [
            { "personalInfo.fullName": regex },
            { "professionalInfo.companyName": regex },
            { email: regex },
            { "kycInfo.panNumber": regex },
          ],
        },
      ]);
    }

    const partners = await Partner.find(filter).sort({ createdAt: -1 });
    const rows = partners.map(toDirectoryRow);

    const header = "PAN,Name,Occupation,Email,Phone,Registration Date,KYC Status,Account Status\n";
    const csvRows = rows
      .map((r) =>
        [
          r.pan,
          `"${r.name.replace(/"/g, '""')}"`,
          r.occupation,
          r.email,
          r.phone,
          new Date(r.regDate).toISOString().split("T")[0],
          r.kycStatus,
          r.accountStatus,
        ].join(",")
      )
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="partner-directory.csv"');
    return res.status(200).send(header + csvRows);
  } catch (error) {
    console.error("exportPartners (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting partners.",
    });
  }
};
