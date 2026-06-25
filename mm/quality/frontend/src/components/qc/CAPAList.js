import React from "react";

export default function CAPAList({ rows, loading, onChangeStatus }) {
  const styles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "13px",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    th: {
      textAlign: "left",
      padding: "10px 12px",
      borderBottom: "2px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      fontWeight: "600",
      color: "#374151"
    },
    td: {
      padding: "10px 12px",
      borderBottom: "1px solid #f3f4f6"
    },
    badge: (status) => ({
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "11px",
      fontWeight: "600",
      display: "inline-block",
      textTransform: "uppercase",
      backgroundColor: 
        status === "CLOSED" ? "#d1fae5" :
        status === "IN_PROGRESS" ? "#e0e7ff" :
        status === "OPEN" ? "#fef3c7" : "#f3f4f6",
      color:
        status === "CLOSED" ? "#065f46" :
        status === "IN_PROGRESS" ? "#3730a3" :
        status === "OPEN" ? "#92400e" : "#6b7280"
    }),
    actionButton: {
      padding: "4px 10px",
      borderRadius: "4px",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      fontSize: "12px",
      cursor: "pointer",
      marginRight: "4px"
    },
    empty: {
      textAlign: "center",
      padding: "40px",
      color: "#9ca3af",
      backgroundColor: "#ffffff",
      borderRadius: "8px"
    },
    loading: {
      textAlign: "center",
      padding: "40px",
      color: "#6b7280"
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading CAPA records...</div>;
  }

  if (!rows || rows.length === 0) {
    return <div style={styles.empty}>No CAPA records found.</div>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Title</th>
            <th style={styles.th}>Lot ID</th>
            <th style={styles.th}>Owner</th>
            <th style={styles.th}>Due Date</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td style={styles.td}><strong>#{row.id}</strong></td>
              <td style={styles.td}>{row.title}</td>
              <td style={styles.td}>{row.lot_id || "-"}</td>
              <td style={styles.td}>{row.owner || "-"}</td>
              <td style={styles.td}>{formatDate(row.due_date)}</td>
              <td style={styles.td}>
                <span style={styles.badge(row.status)}>
                  {row.status?.replace(/_/g, " ")}
                </span>
              </td>
              <td style={styles.td}>
                {row.status === "OPEN" && (
                  <>
                    <button 
                      style={{...styles.actionButton, color: "#7c3aed", borderColor: "#7c3aed"}}
                      onClick={() => onChangeStatus(row.id, "IN_PROGRESS")}
                    >
                      Start
                    </button>
                    <button 
                      style={{...styles.actionButton, color: "#059669", borderColor: "#059669"}}
                      onClick={() => onChangeStatus(row.id, "CLOSED")}
                    >
                      Close
                    </button>
                  </>
                )}
                {row.status === "IN_PROGRESS" && (
                  <button 
                    style={{...styles.actionButton, color: "#059669", borderColor: "#059669"}}
                    onClick={() => onChangeStatus(row.id, "CLOSED")}
                  >
                    Close
                  </button>
                )}
                {row.status === "CLOSED" && (
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>Completed ✓</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}