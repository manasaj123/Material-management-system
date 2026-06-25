// frontend/src/pages/QCResultsPage.js
import React, { useState } from "react";
import qcLotApi from "../api/qcLotApi";

export default function QCResultsPage() {
  const [lotId, setLotId] = useState("");
  const [results, setResults] = useState([]);
  const [lotInfo, setLotInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({});

  const loadResults = async () => {
    if (!lotId) return;
    setLoading(true);
    setError("");
    try {
      // Get full lot details with results
      const response = await qcLotApi.get(lotId);
      
      // Extract data from response
      const result = response?.data || {};
      const lotData = result.data || {};
      
      // Extract results - handle different response structures
      let resultsData = [];
      if (lotData.results && Array.isArray(lotData.results)) {
        resultsData = lotData.results;
      } else if (lotData.results_data && Array.isArray(lotData.results_data)) {
        resultsData = lotData.results_data;
      } else if (Array.isArray(lotData)) {
        resultsData = lotData;
      } else if (result.results && Array.isArray(result.results)) {
        resultsData = result.results;
      }
      
      setResults(resultsData);
      setLotInfo({
        id: lotData.id,
        material_name: lotData.material_name || lotData.material_id,
        status: lotData.status,
        stage: lotData.stage,
        vendor_name: lotData.vendor_name
      });
      
      // Calculate summary
      const passed = resultsData.filter(r => r.pass_fail === true || r.pass_fail === 1).length;
      const failed = resultsData.filter(r => r.pass_fail === false || r.pass_fail === 0).length;
      
      setSummary({
        total: resultsData.length,
        passed: passed,
        failed: failed,
        passRate: resultsData.length > 0 ? Math.round((passed / resultsData.length) * 100) : 0
      });
      
    } catch (err) {
      console.error("Error loading results:", err);
      setError(err.response?.data?.error || "Failed to load results");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadResults();
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
    pass: { color: "#059669", fontWeight: "600" },
    fail: { color: "#dc2626", fontWeight: "600" },
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
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 QC Results</h2>
          <p style={styles.subtitle}>View inspection results for QC lots</p>
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
          onClick={loadResults}
          disabled={!lotId}
        >
          🔍 Load Results
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {!lotId ? (
        <div style={styles.hint}>Enter a QC Lot ID to view its results</div>
      ) : loading ? (
        <div style={styles.hint}>Loading...</div>
      ) : results.length === 0 ? (
        <div style={styles.hint}>No results recorded for this lot</div>
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
                <span style={styles.infoLabel}>Stage</span>
                <span style={styles.infoValue}>{lotInfo.stage || 'WAREHOUSE'}</span>
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
              <div style={styles.summaryLabel}>Total Parameters</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#059669" }}>{summary.passed}</div>
              <div style={styles.summaryLabel}>Passed</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#dc2626" }}>{summary.failed}</div>
              <div style={styles.summaryLabel}>Failed</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{ ...styles.summaryValue, color: "#7c3aed" }}>{summary.passRate}%</div>
              <div style={styles.summaryLabel}>Pass Rate</div>
            </div>
          </div>

          {/* Results Table */}
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Parameter</th>
                <th style={styles.th}>Measured Value</th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td style={styles.td}>
                    {r.parameter_name || r.parameter_id || "N/A"}
                  </td>
                  <td style={styles.td}>{r.measured_value}</td>
                  <td style={styles.td}>{r.unit || "-"}</td>
                  <td style={styles.td}>
                    {r.pass_fail ? (
                      <span style={styles.pass}>✅ PASS</span>
                    ) : (
                      <span style={styles.fail}>❌ FAIL</span>
                    )}
                  </td>
                  <td style={styles.td}>{r.remark || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}