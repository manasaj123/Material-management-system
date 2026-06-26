import React from "react";

const tableStyle = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: "0 4px",
  fontSize: "12px",
  background: "#ffffff",
};

const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#ffffff",
  fontWeight: "600",
  borderRadius: "4px 4px 0 0",
  fontSize: "11px",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "6px 8px",
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  verticalAlign: "top",
  fontSize: "12px",
};

const actionBtnStyle = {
  padding: "3px 8px",
  fontSize: "10px",
  fontWeight: "600",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.15s",
  marginRight: "3px",
};

const editBtnStyle = {
  ...actionBtnStyle,
  background: "linear-gradient(135deg, #2768f4 0%, #2768f4 100%)",
  color: "#ffffff",
  boxShadow: "0 1px 3px rgba(16, 185, 129, 0.2)",
  marginBottom: "3px",
};

const deleteBtnStyle = {
  ...actionBtnStyle,
  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  color: "#ffffff",
  boxShadow: "0 1px 3px rgba(239, 68, 68, 0.2)",
};

const statusActiveStyle = {
  padding: "2px 6px",
  fontSize: "9px",
  fontWeight: "600",
  borderRadius: "10px",
  color: "#ffffff",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  whiteSpace: "nowrap",
};

const statusInactiveStyle = {
  ...statusActiveStyle,
  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
};

export default function MaterialList({
  data,
  onEdit,
  onDelete,
  onView
}) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          borderRadius: "8px",
          border: "2px dashed #d1d5db",
          color: "#6b7280",
          fontSize: "13px",
        }}
      >
        No materials yet. Add your first material above!
      </div>
    );
  }

  return (
    <div
      style={{
        overflowX: "auto",
        padding: "6px",
        background: "#f8fafc",
        borderRadius: "12px",
      }}
    >
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Part No.</th>
            <th style={thStyle}>Part Name</th>
            <th style={thStyle}>Material Name</th>
            <th style={thStyle}>Code</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>UOM</th>
            <th style={thStyle}>Weight</th>
            <th style={thStyle}>Location</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((m) => (
            <tr
              key={m.id}
              style={{ transition: "all 0.15s ease" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
                e.currentTarget.style.transform = "scale(1.005)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <td style={tdStyle}>
                <strong style={{ color: "#3b82f6", fontSize: "12px" }}>
                  {m.part_number || m.id}
                </strong>
              </td>
              <td style={tdStyle}>
                <span style={{ color: "#1f2937", fontWeight: "600", fontSize: "12px" }}>
                  {m.part_name}
                </span>
              </td>
              <td style={tdStyle}>
                <span style={{ fontSize: "11px" }}>{m.material_name}</span>
              </td>
              <td style={{ ...tdStyle, fontSize: "11px" }}>{m.material_code || "—"}</td>
              <td style={tdStyle}>
                <div style={{ color: "#059669", fontSize: "11px" }}>
                  {m.material_type}
                </div>
                {m.material_type === "Job Work" && m.job_work_category && (
                  <div style={{ color: "#6b7280", fontSize: "9px" }}>
                    {m.job_work_category}
                  </div>
                )}
              </td>
              <td style={{ ...tdStyle, fontSize: "11px" }}>{m.uom}</td>
              <td style={{ ...tdStyle, fontSize: "11px" }}>
                {m.part_weight || "—"}
              </td>
              <td style={{ ...tdStyle, fontSize: "11px" }}>
                {m.storage_location}
              </td>
              <td style={{ ...tdStyle, fontSize: "12px", fontWeight: "600" }}>
                {m.qty != null ? m.qty : "—"}
              </td>
              <td style={tdStyle}>
                <span style={m.status === "Active" ? statusActiveStyle : statusInactiveStyle}>
                  {m.status || "Active"}
                </span>
              </td>
              <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                <button
                  style={{
                    ...actionBtnStyle,
                    backgroundColor: "#374151",
                    color: "#fff",
                    marginBottom: "2px",
                  }}
                  onClick={() => onView(m)}
                >
                  View
                </button>
                <button
                  style={editBtnStyle}
                  onClick={() => onEdit(m)}
                  onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
                  onMouseOut={(e) => (e.target.style.transform = "none")}
                >
                  Edit
                </button>
                <button
                  style={deleteBtnStyle}
                  onClick={() => onDelete(m.id)}
                  onMouseOver={(e) => (e.target.style.transform = "translateY(-1px)")}
                  onMouseOut={(e) => (e.target.style.transform = "none")}
                >
                  Del
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}