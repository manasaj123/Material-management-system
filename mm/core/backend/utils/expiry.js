export const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  const exp = new Date(expiryDate);

  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Expired";
  if (diffDays <= 3) return "Near Expiry";
  return "Fresh";
};
