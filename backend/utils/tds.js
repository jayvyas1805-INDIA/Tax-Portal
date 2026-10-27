// TDS (Tax Deducted at Source) on direct sales agent commission.
// Rate (%) defaults to 2 and can be overridden with the TDS_RATE environment variable.
export const getTdsRate = () => {
  const rate = parseFloat(process.env.TDS_RATE);
  return Number.isFinite(rate) && rate >= 0 ? rate : 2;
};

export const calculateTds = (amount = 0) =>
  Math.round((Number(amount) || 0) * getTdsRate()) / 100;

export const withTds = (commission) => {
  const plain = typeof commission.toObject === "function" ? commission.toObject() : commission;
  return { ...plain, tdsRate: getTdsRate(), tdsAmount: calculateTds(plain.amount) };
};
