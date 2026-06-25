import React from "react";

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827"
};

const textStyle = {
  fontSize: "14px",
  color: "#4b5563"
};

export default function DashboardPage() {
  return (
    <div>
      <div style={titleStyle}>Dashboard</div>
      <p style={textStyle}>
        Welcome to the Materials Management console. Use the sidebar to manage vendors, materials,
        PR/PO, GRN, stock and invoices.
      </p>
    </div>
  );
}
