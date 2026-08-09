import Commission from "../models/Commission.js";

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

/**
 * GET /api/admin/commissions/export?tab=All|Due
 * CSV export of commissions, respecting the same tab filter as the list.
 */
export const exportCommissions = async (req, res) => {
  try {
    const { tab = "All" } = req.query;
    const filter = {};
    if (tab === "Due") filter.status = "Pending";

    const commissions = await Commission.find(filter)
      .sort({ createdAt: -1 })
      .populate("partnerId", "personalInfo.fullName professionalInfo.companyName email")
      .populate("referralId", "service");

    const header =
      "Transaction ID,Partner,Client,Service,Business Value,Commission Rate,Amount,Company Fee,Status,Date,Paid At\n";
    const rows = commissions
      .map((c) => {
        const partnerName = getPartnerDisplayName(c.partnerId);
        return [
          c.transactionId,
          `"${partnerName.replace(/"/g, '""')}"`,
          `"${c.clientName.replace(/"/g, '""')}"`,
          c.referralId?.service || "—",
          c.businessValue,
          `${c.commissionRate}%`,
          c.amount,
          c.companyFee || 0,
          c.status,
          c.createdAt.toISOString().split("T")[0],
          c.paidAt ? c.paidAt.toISOString().split("T")[0] : "",
        ].join(",");
      })
      .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="commissions.csv"');
    return res.status(200).send(header + rows);
  } catch (error) {
    console.error("exportCommissions (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while exporting commissions.",
    });
  }
};

const toRow = (commission) => {
  const partner = commission.partnerId;
  const name = getPartnerDisplayName(partner);

  return {
    id: commission._id,
    transactionId: commission.transactionId,
    initials: getInitials(name),
    partnerName: name,
    occupation: partner?.professionalInfo?.occupation || "—",
    service: commission.referralId?.service || "—",
    clientName: commission.clientName,
    businessValue: commission.businessValue,
    amount: commission.amount,
    status: commission.status,
    createdAt: commission.createdAt,
    paidAt: commission.paidAt,
  };
};

/**
 * GET /api/admin/commissions/stats
 * Stat cards: Total Commission Generated, Total Paid, Pending Approval, Pending Payment
 */
export const getCommissionStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay());
    startOfThisWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const [
      totals,
      paidTotal,
      pendingAgg,
      generatedThisWeekAgg,
      generatedLastWeekAgg,
    ] = await Promise.all([
      Commission.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Commission.aggregate([
        { $match: { status: "Pending" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Commission.aggregate([
        { $match: { createdAt: { $gte: startOfThisWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Commission.aggregate([
        { $match: { createdAt: { $gte: startOfLastWeek, $lt: startOfThisWeek } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalGenerated = totals[0]?.total || 0;
    const totalPaid = paidTotal[0]?.total || 0;
    const pendingAmount = pendingAgg[0]?.total || 0;
    const pendingCount = pendingAgg[0]?.count || 0;

    const thisWeek = generatedThisWeekAgg[0]?.total || 0;
    const lastWeek = generatedLastWeekAgg[0]?.total || 0;
    const changePercent = lastWeek
      ? Number((((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1))
      : thisWeek > 0
      ? 100
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalGenerated,
        changePercent,
        totalPaid,
        pendingCount,
        pendingAmount,
      },
    });
  } catch (error) {
    console.error("getCommissionStats (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching commission stats.",
    });
  }
};

/**
 * GET /api/admin/commissions?tab=All|Due&page=&limit=
 * "Due" = still Pending. Joins Partner (name/occupation) and Referral (service).
 */
export const getCommissions = async (req, res) => {
  try {
    const { tab = "All" } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);

    const filter = {};
    if (tab === "Due") filter.status = "Pending";

    const [commissions, total] = await Promise.all([
      Commission.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("partnerId", "personalInfo.fullName professionalInfo.companyName professionalInfo.occupation email")
        .populate("referralId", "service"),
      Commission.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: commissions.map(toRow),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("getCommissions (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching commissions.",
    });
  }
};

/**
 * GET /api/admin/commissions/payout-velocity?days=7
 * Daily Pending (created) vs Paid amount, for the bar chart.
 */
export const getPayoutVelocity = async (req, res) => {
  try {
    const days = Math.min(30, Number(req.query.days) || 7);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const [createdByDay, paidByDay] = await Promise.all([
      Commission.aggregate([
        { $match: { createdAt: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$amount" },
          },
        },
      ]),
      Commission.aggregate([
        { $match: { status: "Paid", paidAt: { $gte: start } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const createdMap = new Map(createdByDay.map((d) => [d._id, d.total]));
    const paidMap = new Map(paidByDay.map((d) => [d._id, d.total]));

    const data = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().split("T")[0];
      data.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
        date: key,
        pending: createdMap.get(key) || 0,
        paid: paidMap.get(key) || 0,
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("getPayoutVelocity (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching payout velocity.",
    });
  }
};

/**
 * PATCH /api/admin/commissions/:id/status
 * Body: { status: "Paid" | "Pending" }
 * Marking as Paid stamps paidAt; reverting to Pending clears it.
 */
export const updateCommissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Paid", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "status must be 'Paid' or 'Pending'.",
      });
    }

    const commission = await Commission.findByIdAndUpdate(
      req.params.id,
      { status, paidAt: status === "Paid" ? new Date() : null },
      { new: true }
    )
      .populate("partnerId", "personalInfo.fullName professionalInfo.companyName professionalInfo.occupation email")
      .populate("referralId", "service");

    if (!commission) {
      return res.status(404).json({ success: false, message: "Commission not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Commission marked as ${status}.`,
      data: toRow(commission),
    });
  } catch (error) {
    console.error("updateCommissionStatus (admin) error ->", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating this commission.",
    });
  }
};
