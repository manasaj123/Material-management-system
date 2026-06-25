// frontend/src/pages/QCDefectsPage.js
import React, { useState } from "react";
import qcLotApi from "../api/qcLotApi";
import { useNavigate } from "react-router-dom";

export default function QCDefectsPage() {
  const navigate = useNavigate();
  const [lotId, setLotId] = useState("");
  const [defects, setDefects] = useState([]);
  const [lotInfo, setLotInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});

  const loadDefects = async () => {
    if (!lotId) return;
    setLoading(true);
    setError("");
    try {
      // Get full lot details with defects
      const response = await qcLotApi.get(lotId);
      
      // Extract data from response
      const result = response?.data || {};
      const lotData = result.data || {};
      
      // Extract defects - handle different response structures
      let defectsData = [];
      if (lotData.defects && Array.isArray(lotData.defects)) {
        defectsData = lotData.defects;
      } else if (lotData.defects_data && Array.isArray(lotData.defects_data)) {
        defectsData = lotData.defects_data;
      } else if (Array.isArray(lotData)) {
        defectsData = lotData;
      } else if (result.defects && Array.isArray(result.defects)) {
        defectsData = result.defects;
      }
      
      setDefects(defectsData);
      setLotInfo({
        id: lotData.id,
        material_name: lotData.material_name || lotData.material_id,
        status: lotData.status,
        stage: lotData.stage,
        vendor_name: lotData.vendor_name
      });
      
      // Calculate summary
      const critical = defectsData.filter(d => d.severity === 'CRITICAL').length;
      const major = defectsData.filter(d => d.severity === 'MAJOR').length;
      const minor = defectsData.filter(d => d.severity === 'MINOR').length;
      const totalRejected = defectsData.reduce((sum, d) => sum + parseFloat(d.qty_rejected || 0), 0);
      
      setSummary({
        total: defectsData.length,
        critical: critical,
        major: major,
        minor: minor,
        totalRejected: totalRejected,
        needsCAPA: critical > 0 || major > 0
      });
      
    } catch (err) {
      console.error("Error loading defects:", err);
      setError(err.response?.data?.error || "Failed to load defects");
      setDefects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadDefects();
    }
  };

  const handleCreateCAPA = () => {
    if (lotId) {
      navigate(`/qc/capa?lot_id=${lotId}`);
    }
  };

  const styles = {
    container: { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: { fontSize: "24px", fontWeight: "bold", margin: 0 },
    subtitle: { fontSize: "14px", color: "#6b7280" },
    searchBox: {
      display: "flex",
      gap: "12px",
      marginBottom: "24px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    input: {
      padding: "8px 12px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      width: "200px",
      outline: "none",
    },
    button: {
      padding: "8px 16px",
      backgroundColor: "#2563eb",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
    },
    buttonDisabled: {
      padding: "8px 16px",
      backgroundColor: "#9ca3af",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "not-allowed",
      fontSize: "14px",
    },
    buttonDanger: {
      padding: "8px 16px",
      backgroundColor: "#dc2626",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: "#fff",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    th: {
      padding: "12px 16px",
      textAlign: "left",
      backgroundColor: "#f3f4f6",
      borderBottom: "2px solid #e5e7eb",
      fontWeight: "600",
    },
    td: { padding: "12px 16px", borderBottom: "1px solid #e5e7eb" },
    severityCritical: { color: "#dc2626", fontWeight: "600" },
    severityMajor: { color: "#d97706", fontWeight: "600" },
    severityMinor: { color: "#059669", fontWeight: "600" },
    hint: { textAlign: "center", padding: "40px", color: "#9ca3af" },
    error: {
      color: "#dc2626",
      padding: "12px",
      backgroundColor: "#fee2e2",
      borderRadius: "6px",
      marginBottom: "16px",
    },
    lotInfo: {
      backgroundColor: "#f8fafc",
      padding: "16px",
      borderRadius: "8px",
      marginBottom: "20px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
    },
    infoItem: {
      display: "flex",
      flexDirection: "column",
    },
    infoLabel: {
      fontSize: "11px",
      color: "#6b7280",
      textTransform: "uppercase",
      fontWeight: "600",
    },
    infoValue: {
      fontSize: "14px",
      fontWeight: "500",
      color: "#1f2937",
    },
    summaryRow: {
      display: "flex",
      gap: "20px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center",
    },
    summaryCard: {
      backgroundColor: "#fff",
      padding: "12px 20px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      textAlign: "center",
      minWidth: "100px",
    },
    summaryValue: {
      fontSize: "20px",
      fontWeight: "bold",
    },
    summaryLabel: {
      fontSize: "11px",
      color: "#6b7280",
      textTransform: "uppercase",
    },
    badge: (status) => ({
      padding: "3px 10px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "600",
      display: "inline-block",
      backgroundColor: 
        status === "ACCEPTED" ? "#d1fae5" :
        status === "REJECTED" ? "#fee2e2" :
        status === "ACCEPTED_WITH_DEVIATION" ? "#fef3c7" :
        "#e0e7ff",
      color:
        status === "ACCEPTED" ? "#065f46" :
        status === "REJECTED" ? "#991b1b" :
        status === "ACCEPTED_WITH_DEVIATION" ? "#92400e" :
        "#3730a3"
    }),
    capaWarning: {
      backgroundColor: "#fef3c7",
      padding: "12px 16px",
      borderRadius: "6px",
      marginBottom: "16px",
      border: "1px solid #f59e0b",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
    },
    capaWarningText: {
      color: "#92400e",
      fontSize: "14px",
    },
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return styles.severityCritical;
      case "MAJOR":
        return styles.severityMajor;
      default:
        return styles.severityMinor;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🐛 QC Defects</h2>
          <p style={styles.subtitle}>View and manage defects recorded during inspection</p>
        </div>
      </div>

      <div style={styles.searchBox}>
        <input
          style={styles.input}
          type="number"
          placeholder="Enter QC Lot ID"
          value={lotId}
          onChange={(e) => setLotId(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          style={!lotId ? styles.buttonDisabled : styles.button} 
          onClick={loadDefects}
          disabled={!lotId}
        >
          🔍 Load Defects
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!lotId ? (
        <div style={styles.hint}>Enter a QC Lot ID to view its defects</div>
      ) : loading ? (
        <div style={styles.hint}>Loading...</div>
      ) : defects.length === 0 ? (
        <div style={styles.hint}>No defects recorded for this lot ✅</div>
      ) : (
        <>
          {/* Lot Info */}
          {lotInfo && (
            <div style={styles.lotInfo}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Lot ID</span>
                <span style={styles.infoValue}>#{lotInfo.id}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Material</span>
                <span style={styles.infoValue}>{lotInfo.material_name}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Vendor</span>
                <span style={styles.infoValue}>{lotInfo.vendor_name || '-'}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Status</span>
                <span style={styles.badge(lotInfo.status)}>
                  {lotInfo.status?.replace(/_/g, ' ') || 'PENDING'}
                </span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={styles.summaryRow}>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#2563eb" }}>{summary.total}</div>
              <div style={styles.summaryLabel}>Total Defects</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#059669" }}>{summary.minor}</div>
              <div style={styles.summaryLabel}>Minor</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#d97706" }}>{summary.major}</div>
              <div style={styles.summaryLabel}>Major</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#dc2626" }}>{summary.critical}</div>
              <div style={styles.summaryLabel}>Critical</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#7c3aed" }}>{summary.totalRejected}</div>
              <div style={styles.summaryLabel}>Total Rejected</div>
            </div>
          </div>

          {/* CAPA Warning */}
          {summary.needsCAPA && (
            <div style={styles.capaWarning}>
              <span style={styles.capaWarningText}>
                ⚠️ This lot has {summary.critical + summary.major} major/critical defect(s). 
                Corrective action is recommended.
              </span>
              <button style={styles.buttonDanger} onClick={handleCreateCAPA}>
                🛠️ Create CAPA
              </button>
            </div>
          )}

          {/* Defects Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Defect Type</th>
                <th style={styles.th}>Rejected Qty</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Severity</th>
                <th style={styles.th}>Remarks</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {defects.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}>{d.id}</td>
                  <td style={styles.td}>{d.defect_type}</td>
                  <td style={styles.td}>{d.qty_rejected}</td>
                  <td style={styles.td}>{d.unit || "-"}</td>
                  <td style={styles.td}>
                    <span style={getSeverityStyle(d.severity)}>
                      {d.severity || "MINOR"}
                    </span>
                  </td>
                  <td style={styles.td}>{d.remarks || "-"}</td>
                  <td style={styles.td}>
                    {(d.severity === 'MAJOR' || d.severity === 'CRITICAL') && (
                      <button 
                        style={{ 
                          padding: "4px 8px", 
                          backgroundColor: "#dc2626", 
                          color: "#fff", 
                          border: "none", 
                          borderRadius: "4px", 
                          cursor: "pointer",
                          fontSize: "11px"
                        }}
                        onClick={() => navigate(`/qc/capa?defect_id=${d.id}`)}
                      >
                        CAPA
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}