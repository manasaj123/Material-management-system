import { useState } from "react";
import { getExpiryStatus } from "../utils/expiry";

export function getExpiryStatus(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);

  const diffDays = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "Expired";
  if (diffDays <= 3) return "Near Expiry";
  return "Fresh";
}
