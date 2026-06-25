import React from "react";

const topbarStyle = {
  height: "48px",
  backgroundColor: "#ffffff",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  boxSizing: "border-box"
};

const titleStyle = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#111827"
};

const rightStyle = {
  fontSize: "12px",
  color: "#6b7280"
};

export default function Topbar() {
  return (
    <div style={topbarStyle}>
      <div style={titleStyle}>Materials Management</div>
      <div style={rightStyle}>Logged in as: MM User</div>
    </div>
  );
}
