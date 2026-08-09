// import PDFDocument from "pdfkit";
// import Commission from "../models/Commission.js";
// import Partner from "../models/Partner.js";

// const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// const buildTransactionQuery = (req) => {
//   const { search, status } = req.query;
//   const query = { partnerId: req.user.id };

//   if (search) {
//     query.$or = [
//       { transactionId: { $regex: search, $options: "i" } },
//       { clientName: { $regex: search, $options: "i" } },
//     ];
//   }

//   if (status && status !== "All") {
//     query.status = status;
//   }

//   return query;
// };

// /**
//  * GET /api/partner/commission/summary?range=6m|1y
//  * Aggregate stats + monthly trend for the Commission Management page.
//  */
// export const getCommissionSummary = async (req, res) => {
//   try {
//     const range = req.query.range === "1y" ? 12 : 6;
//     const partnerId = req.user.id;

//     const allTransactions = await Commission.find({ partnerId });

//     const totalEarnings = allTransactions.reduce((sum, t) => sum + t.amount, 0);
//     const paid = allTransactions
//       .filter((t) => t.status === "Paid")
//       .reduce((sum, t) => sum + t.amount, 0);
//     const pending = allTransactions
//       .filter((t) => t.status === "Pending")
//       .reduce((sum, t) => sum + t.amount, 0);
//     const companyFee = allTransactions.reduce((sum, t) => sum + (t.companyFee || 0), 0);

//     const partner = await Partner.findById(partnerId);
//     const totalWithdrawn = (partner.payouts || [])
//       .filter((p) => p.status === "paid")
//       .reduce((sum, p) => sum + p.amount, 0);
//     const pendingApproval = (partner.payouts || [])
//       .filter((p) => p.status === "processing")
//       .reduce((sum, p) => sum + p.amount, 0);
//     const availableBalance = Math.max(0, paid - totalWithdrawn - pendingApproval);

//     // Build a month-by-month trend of PAID commission for the last N months
//     const now = new Date();
//     const trend = [];
//     for (let i = range - 1; i >= 0; i--) {
//       const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthLabel = MONTH_LABELS[monthDate.getMonth()];

//       const monthTotal = allTransactions
//         .filter(
//           (t) =>
//             t.status === "Paid" &&
//             t.paidAt &&
//             new Date(t.paidAt).getFullYear() === monthDate.getFullYear() &&
//             new Date(t.paidAt).getMonth() === monthDate.getMonth()
//         )
//         .reduce((sum, t) => sum + t.amount, 0);

//       trend.push({ month: monthLabel, amount: monthTotal });
//     }

//     return res.status(200).json({
//       success: true,
//       summary: {
//         totalEarnings,
//         paid,
//         pending,
//         companyFee,
//         availableBalance,
//         totalWithdrawn,
//         pendingApproval,
//         trend,
//       },
//     });
//   } catch (error) {
//     console.error("getCommissionSummary error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching your commission summary.",
//     });
//   }
// };

// /**
//  * GET /api/partner/commission/transactions
//  * Query: search, status, page, pageSize
//  */
// export const getTransactions = async (req, res) => {
//   try {
//     const page = Math.max(1, parseInt(req.query.page, 10) || 1);
//     const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 10);
//     const query = buildTransactionQuery(req);

//     const [transactions, totalItems] = await Promise.all([
//       Commission.find(query)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * pageSize)
//         .limit(pageSize),
//       Commission.countDocuments(query),
//     ]);

//     return res.status(200).json({
//       success: true,
//       transactions,
//       totalItems,
//       totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
//       currentPage: page,
//     });
//   } catch (error) {
//     console.error("getTransactions error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while fetching your transactions.",
//     });
//   }
// };

// /**
//  * GET /api/partner/commission/export?format=csv|pdf
//  * Used for both "Download Statement" (all transactions) and
//  * "Download Invoice" (same export, PDF makes more sense as an invoice).
//  */
// export const exportTransactions = async (req, res) => {
//   try {
//     const format = req.query.format === "pdf" ? "pdf" : "csv";
//     const query = buildTransactionQuery(req);
//     const transactions = await Commission.find(query).sort({ createdAt: -1 });

//     if (format === "csv") {
//       const header = "Transaction ID,Referral ID,Client Name,Business Value,Commission Rate,Amount,Status,Date\n";
//       const rows = transactions
//         .map((t) =>
//           [
//             t.transactionId,
//             t.referralDisplayId || "",
//             `"${t.clientName.replace(/"/g, '""')}"`,
//             t.businessValue,
//             `${t.commissionRate}%`,
//             t.amount,
//             t.status,
//             t.createdAt.toISOString().split("T")[0],
//           ].join(",")
//         )
//         .join("\n");

//       res.setHeader("Content-Type", "text/csv");
//       res.setHeader("Content-Disposition", 'attachment; filename="commission-statement.csv"');
//       return res.status(200).send(header + rows);
//     }

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", 'attachment; filename="commission-statement.pdf"');

//     const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
//     doc.pipe(res);

//     doc.fontSize(16).text("Commission Statement", { align: "center" });
//     doc.moveDown();

//     const columns = [
//       { label: "Transaction ID", width: 110 },
//       { label: "Client Name", width: 160 },
//       { label: "Business Value", width: 110 },
//       { label: "Comm. Rate", width: 90 },
//       { label: "Amount", width: 100 },
//       { label: "Status", width: 90 },
//       { label: "Date", width: 90 },
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

//     transactions.forEach((t) => {
//       y = doc.y;
//       x = doc.x;
//       const values = [
//         t.transactionId,
//         t.clientName,
//         `Rs. ${t.businessValue.toLocaleString()}`,
//         `${t.commissionRate}%`,
//         `Rs. ${t.amount.toLocaleString()}`,
//         t.status,
//         t.createdAt.toISOString().split("T")[0],
//       ];
//       values.forEach((value, index) => {
//         doc.text(String(value), x, y, { width: columns[index].width });
//         x += columns[index].width;
//       });
//       doc.moveDown(0.6);

//       if (doc.y > 500) doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
//     });

//     doc.end();
//   } catch (error) {
//     console.error("exportTransactions error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while exporting your statement.",
//     });
//   }
// };

// /**
//  * POST /api/partner/commission/withdraw
//  * Moves the current available balance into a "processing" payout entry.
//  * There's no real bank transfer here — this just records the request for
//  * admin/finance to action, same pattern as the existing payouts array.
//  */
// export const requestWithdrawal = async (req, res) => {
//   try {
//     const partner = await Partner.findById(req.user.id);
//     if (!partner) {
//       return res.status(404).json({ success: false, message: "Partner not found." });
//     }

//     const allTransactions = await Commission.find({ partnerId: user.id });
//     const paid = allTransactions
//       .filter((t) => t.status === "Paid")
//       .reduce((sum, t) => sum + t.amount, 0);
//     const totalWithdrawn = (partner.payouts || [])
//       .filter((p) => p.status === "paid")
//       .reduce((sum, p) => sum + p.amount, 0);
//     const pendingApproval = (partner.payouts || [])
//       .filter((p) => p.status === "processing")
//       .reduce((sum, p) => sum + p.amount, 0);
//     const availableBalance = Math.max(0, paid - totalWithdrawn - pendingApproval);

//     if (availableBalance <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "You have no available balance to withdraw right now.",
//       });
//     }

//     partner.payouts.push({
//       amount: availableBalance,
//       paidAt: new Date(),
//       status: "processing",
//     });
//     await partner.save();

//     return res.status(200).json({
//       success: true,
//       message: `Withdrawal request for ₹${availableBalance.toLocaleString()} submitted for approval.`,
//     });
//   } catch (error) {
//     console.error("requestWithdrawal error ->", error);
//     return res.status(500).json({
//       success: false,
//       message: "Something went wrong while requesting your withdrawal.",
//     });
//   }
// };


import PDFDocument from "pdfkit";
import Commission from "../models/Commission.js";
import Partner from "../models/Partner.js";
import createNotification from "../utils/createNotification.js";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const buildTransactionQuery = (req) => {
  const { search, status } = req.query;
  const query = { partnerId: req.user.id };

  if (search) {
    query.$or = [
      { transactionId: { $regex: search, $options: "i" } },
      { clientName: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "All") {
    query.status = status;
  }

  return query;
};

/**
 * GET /api/partner/commission/summary?range=6m|1y
 * Aggregate stats + monthly trend for the Commission Management page.
 */
export const getCommissionSummary = async (req, res) => {
  try {
    const range = req.query.range === "1y" ? 12 : 6;
    const partnerId = req.user.id;

    const allTransactions = await Commission.find({ partnerId });

    const totalEarnings = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const paid = allTransactions
      .filter((t) => t.status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const pending = allTransactions
      .filter((t) => t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);
    const companyFee = allTransactions.reduce((sum, t) => sum + (t.companyFee || 0), 0);

    const partner = await Partner.findById(partnerId);
    const totalWithdrawn = (partner.payouts || [])
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingApproval = (partner.payouts || [])
      .filter((p) => p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = Math.max(0, paid - totalWithdrawn - pendingApproval);

    // Build a month-by-month trend of PAID commission for the last N months
    const now = new Date();
    const trend = [];
    for (let i = range - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = MONTH_LABELS[monthDate.getMonth()];

      const monthTotal = allTransactions
        .filter(
          (t) =>
            t.status === "Paid" &&
            t.paidAt &&
            new Date(t.paidAt).getFullYear() === monthDate.getFullYear() &&
            new Date(t.paidAt).getMonth() === monthDate.getMonth()
        )
        .reduce((sum, t) => sum + t.amount, 0);

      trend.push({ month: monthLabel, amount: monthTotal });
    }

    return res.status(200).json({
      success: true,
      summary: {
        totalEarnings,
        paid,
        pending,
        companyFee,
        availableBalance,
        totalWithdrawn,
        pendingApproval,
        trend,
      },
    });
  } catch (error) {
    console.error("getCommissionSummary error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your commission summary.",
    });
  }
};

/**
 * GET /api/partner/commission/transactions
 * Query: search, status, page, pageSize
 */
export const getTransactions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(req.query.pageSize, 10) || 10);
    const query = buildTransactionQuery(req);

    const [transactions, totalItems] = await Promise.all([
      Commission.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Commission.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      transactions,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
      currentPage: page,
    });
  } catch (error) {
    console.error("getTransactions error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your transactions.",
    });
  }
};

/**
 * GET /api/partner/commission/export?format=csv|pdf
 * Used for both "Download Statement" (all transactions) and
 * "Download Invoice" (same export, PDF makes more sense as an invoice).
 */
export const exportTransactions = async (req, res) => {
  try {
    const format = req.query.format === "pdf" ? "pdf" : "csv";
    const query = buildTransactionQuery(req);
    const transactions = await Commission.find(query).sort({ createdAt: -1 });

    if (format === "csv") {
      const header = "Transaction ID,Referral ID,Client Name,Business Value,Commission Rate,Amount,Status,Date\n";
      const rows = transactions
        .map((t) =>
          [
            t.transactionId,
            t.referralDisplayId || "",
            `"${t.clientName.replace(/"/g, '""')}"`,
            t.businessValue,
            `${t.commissionRate}%`,
            t.amount,
            t.status,
            t.createdAt.toISOString().split("T")[0],
          ].join(",")
        )
        .join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="commission-statement.csv"');
      return res.status(200).send(header + rows);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="commission-statement.pdf"');

    const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
    doc.pipe(res);

    doc.fontSize(16).text("Commission Statement", { align: "center" });
    doc.moveDown();

    const columns = [
      { label: "Transaction ID", width: 110 },
      { label: "Client Name", width: 160 },
      { label: "Business Value", width: 110 },
      { label: "Comm. Rate", width: 90 },
      { label: "Amount", width: 100 },
      { label: "Status", width: 90 },
      { label: "Date", width: 90 },
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

    transactions.forEach((t) => {
      y = doc.y;
      x = doc.x;
      const values = [
        t.transactionId,
        t.clientName,
        `Rs. ${t.businessValue.toLocaleString()}`,
        `${t.commissionRate}%`,
        `Rs. ${t.amount.toLocaleString()}`,
        t.status,
        t.createdAt.toISOString().split("T")[0],
      ];
      values.forEach((value, index) => {
        doc.text(String(value), x, y, { width: columns[index].width });
        x += columns[index].width;
      });
      doc.moveDown(0.6);

      if (doc.y > 500) doc.addPage({ margin: 40, size: "A4", layout: "landscape" });
    });

    doc.end();
  } catch (error) {
    console.error("exportTransactions error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting your statement.",
    });
  }
};

/**
 * POST /api/partner/commission/withdraw
 * Moves the current available balance into a "processing" payout entry.
 * There's no real bank transfer here — this just records the request for
 * admin/finance to action, same pattern as the existing payouts array.
 */
export const requestWithdrawal = async (req, res) => {
  try {
    const partner = await Partner.findById(req.user.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: "Partner not found." });
    }

    const allTransactions = await Commission.find({ partnerId: partner._id });
    const paid = allTransactions
      .filter((t) => t.status === "Paid")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawn = (partner.payouts || [])
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingApproval = (partner.payouts || [])
      .filter((p) => p.status === "processing")
      .reduce((sum, p) => sum + p.amount, 0);
    const availableBalance = Math.max(0, paid - totalWithdrawn - pendingApproval);

    if (availableBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "You have no available balance to withdraw right now.",
      });
    }

    partner.payouts.push({
      amount: availableBalance,
      paidAt: new Date(),
      status: "processing",
    });
    await partner.save();

    createNotification(req.user.id, {
      icon: "💳",
      title: `Withdrawal Requested: ₹${availableBalance.toLocaleString()}`,
      description: "Your withdrawal request has been submitted and is pending admin approval.",
      category: "commission",
    });

    return res.status(200).json({
      success: true,
      message: `Withdrawal request for ₹${availableBalance.toLocaleString()} submitted for approval.`,
    });
  } catch (error) {
    console.error("requestWithdrawal error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while requesting your withdrawal.",
    });
  }
};
