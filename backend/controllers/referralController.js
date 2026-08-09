// import PDFDocument from "pdfkit";
// import Referral from "../models/Referral.js";

// const buildReferralQuery = (req) => {
//   const { search, status, dateFrom, dateTo } = req.query;

//   const query = { partnerId: req.user.id };

//   if (search) {
//     query.$or = [
//       { clientName: { $regex: search, $options: "i" } },
//       { clientContact: { $regex: search, $options: "i" } },
//     ];
//   }

//   if (status && status !== "All Statuses") {
//     query.status = status;
//   }

//   if (dateFrom || dateTo) {
//     query.createdAt = {};
//     if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
//     if (dateTo) query.createdAt.$lte = new Date(`${dateTo}T23:59:59`);
//   }

//   return query;
// };

// /**
//  * POST /api/partner/referrals
//  * Body: { clientName, clientContact, service, estimatedValue }
//  */
// export const createReferral = async (req, res) => {
//   try {
//     const { clientName, clientContact, service, estimatedValue } = req.body;

//     if (!clientName || !clientContact || !service || !estimatedValue) {
//       return res.status(400).json({
//         success: false,
//         message: "Client name, contact, service, and estimated value are all required.",
//       });
//     }

//     const referral = await Referral.create({
//       partnerId: req.user.id,
//       clientName,
//       clientContact,
//       service,
//       estimatedValue,
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Referral created successfully.",
//       referral,
//     });
//   } catch (error) {
//     console.error("createReferral error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while creating the referral.",
//     });
//   }
// };

// /**
//  * GET /api/partner/referrals
//  * Query: search, status, dateFrom, dateTo, page, pageSize
//  */
// export const getReferrals = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//     const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 10);

//     const query = buildReferralQuery(req);

//     const [referrals, totalItems] = await Promise.all([
//       Referral.find(query)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * pageSize)
//         .limit(pageSize),
//       Referral.countDocuments(query),
//     ]);

//     return res.status(200).json({
//       success: true,
//       referrals,
//       totalItems,
//       totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error("getReferrals error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching your referrals.",
//     });
//   }
// };

// /**
//  * GET /api/partner/referrals/export?format=csv|pdf
//  * Exports every referral matching the current filters (no pagination).
//  */
// export const exportReferrals = async (req, res) => {
//   try {
//     const format = req.query.format === "pdf" ? "pdf" : "csv";
//     const query = buildReferralQuery(req);
//     const referrals = await Referral.find(query).sort({ createdAt: -1 });

//     if (format === "csv") {
//       const header = "Referral ID,Date,Client Name,Client Contact,Service,Status,Estimated Value\n";
//       const rows = referrals
//         .map((referral) =>
//           [
//             referral.referralId,
//             referral.createdAt.toISOString().split("T")[0],
//             `"${referral.clientName.replace(/"/g, '""')}"`,
//             referral.clientContact,
//             `"${referral.service.replace(/"/g, '""')}"`,
//             referral.status,
//             referral.estimatedValue,
//           ].join(",")
//         )
//         .join("\n");

//       res.setHeader("Content-Type", "text/csv");
//       res.setHeader("Content-Disposition", 'attachment; filename="referrals.csv"');
//       return res.status(200).send(header + rows);
//     }

//     // PDF export
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", 'attachment; filename="referrals.pdf"');

//     const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
//     doc.pipe(res);

//     doc.fontSize(16).text("My Referrals", { align: "center" });
//     doc.moveDown();

//     const columns = [
//       { label: "Referral ID", width: 110 },
//       { label: "Date", width: 90 },
//       { label: "Client Name", width: 160 },
//       { label: "Service", width: 160 },
//       { label: "Status", width: 110 },
//       { label: "Est. Value", width: 100 },
//     ];

//     let y = doc.y;
//     let x = doc.x;

//     doc.fontSize(10).font("Helvetica-Bold");
//     columns.forEach((col) => {
//       doc.text(col.label, x, y, { width: col.width });
//       x += col.width;
//     });

//     doc.moveDown(0.5);
//     doc.font("Helvetica");

//     referrals.forEach((referral) => {
//       y = doc.y;
//       x = doc.x;
//       const rowValues = [
//         referral.referralId,
//         referral.createdAt.toISOString().split("T")[0],
//         referral.clientName,
//         referral.service,
//         referral.status,
//         `Rs. ${referral.estimatedValue.toLocaleString()}`,
//       ];

//       rowValues.forEach((value, index) => {
//         doc.text(String(value), x, y, { width: columns[index].width });
//         x += columns[index].width;
//       });

//       doc.moveDown(0.6);

//       if (doc.y > 500) {
//         doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
//       }
//     });

//     doc.end();
//   } catch (error) {
//     console.error("exportReferrals error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while exporting your referrals.",
//     });
//   }
// };


import PDFDocument from "pdfkit";
import Referral from "../models/Referral.js";
import createNotification from "../utils/createNotification.js";
import createAdminNotification from "../utils/createAdminNotification.js";

const buildReferralQuery = (req) => {
  const { search, status, dateFrom, dateTo } = req.query;

  const query = { partnerId: req.user.id };

  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: "i" } },
      { clientContact: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All Statuses") {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(`${dateTo}T23:59:59`);
  }

  return query;
};

/**
 * POST /api/partner/referrals
 * Body: { clientName, clientContact, service, estimatedValue }
 */
export const createReferral = async (req, res) => {
  try {
    const { clientName, clientContact, service, estimatedValue } = req.body;

    if (!clientName || !clientContact || !service || !estimatedValue) {
      return res.status(400).json({
        success: false,
        message: "Client name, contact, service, and estimated value are all required.",
      });
    }

    const referral = await Referral.create({
      partnerId: req.user.id,
      clientName,
      clientContact,
      service,
      estimatedValue,
    });

    createNotification(req.user.id, {
      icon: "🆕",
      title: `New Referral Added: ${clientName}`,
      description: `Your referral for ${service} (${referral.referralId}) has been submitted.`,
      category: "referrals",
    });

    createAdminNotification({
      icon: "🔗",
      title: `New Referral Logged: ${clientName}`,
      detail: `Partner submitted a new referral for ${service} (${referral.referralId}), estimated value $${Number(estimatedValue).toLocaleString()}.`,
      category: "partner",
      relatedPartnerId: req.user.id,
      relatedReferralId: referral._id,
    });

    return res.status(201).json({
      success: true,
      message: "Referral created successfully.",
      referral,
    });
  } catch (error) {
    console.error("createReferral error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the referral.",
    });
  }
};

/**
 * GET /api/partner/referrals
 * Query: search, status, dateFrom, dateTo, page, pageSize
 */
export const getReferrals = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 10);

    const query = buildReferralQuery(req);

    const [referrals, totalItems] = await Promise.all([
      Referral.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Referral.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      referrals,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      currentPage: page,
    });
  } catch (error) {
    console.error("getReferrals error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your referrals.",
    });
  }
};

/**
 * GET /api/partner/referrals/export?format=csv|pdf
 * Exports every referral matching the current filters (no pagination).
 */
export const exportReferrals = async (req, res) => {
  try {
    const format = req.query.format === "pdf" ? "pdf" : "csv";
    const query = buildReferralQuery(req);
    const referrals = await Referral.find(query).sort({ createdAt: -1 });

    if (format === "csv") {
      const header = "Referral ID,Date,Client Name,Client Contact,Service,Status,Estimated Value\n";
      const rows = referrals
        .map((referral) =>
          [
            referral.referralId,
            referral.createdAt.toISOString().split("T")[0],
            `"${referral.clientName.replace(/"/g, '""')}"`,
            referral.clientContact,
            `"${referral.service.replace(/"/g, '""')}"`,
            referral.status,
            referral.estimatedValue,
          ].join(",")
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="referrals.csv"');
      return res.status(200).send(header + rows);
    }

    // PDF export
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="referrals.pdf"');

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    doc.pipe(res);

    doc.fontSize(16).text("My Referrals", { align: "center" });
    doc.moveDown();

    const columns = [
      { label: "Referral ID", width: 110 },
      { label: "Date", width: 90 },
      { label: "Client Name", width: 160 },
      { label: "Service", width: 160 },
      { label: "Status", width: 110 },
      { label: "Est. Value", width: 100 },
    ];

    let y = doc.y;
    let x = doc.x;

    doc.fontSize(10).font("Helvetica-Bold");
    columns.forEach((col) => {
      doc.text(col.label, x, y, { width: col.width });
      x += col.width;
    });

    doc.moveDown(0.5);
    doc.font("Helvetica");

    referrals.forEach((referral) => {
      y = doc.y;
      x = doc.x;
      const rowValues = [
        referral.referralId,
        referral.createdAt.toISOString().split("T")[0],
        referral.clientName,
        referral.service,
        referral.status,
        `Rs. ${referral.estimatedValue.toLocaleString()}`,
      ];

      rowValues.forEach((value, index) => {
        doc.text(String(value), x, y, { width: columns[index].width });
        x += columns[index].width;
      });

      doc.moveDown(0.6);

      if (doc.y > 500) {
        doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
      }
    });

    doc.end();
  } catch (error) {
    console.error("exportReferrals error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting your referrals.",
    });
  }
};
