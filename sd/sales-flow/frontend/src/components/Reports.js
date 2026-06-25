import React, { useEffect, useState } from "react";
import {
  getCustomerReportApi,
  getRegionReportApi,
  getSummaryReportApi
} from "../api/reportApi";

const styles = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "16px 18px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
    marginTop: "10px"
  },
  title: {
    margin: "0 0 10px 0",
    color: "#0b3c5d"
  },
  subTitle: {
    margin: "14px 0 6px 0",
    color: "#333"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
    fontSize: "14px"
  },
  th: {
    borderBottom: "1px solid #ccc",
    textAlign: "left",
    padding: "6px",
    backgroundColor: "#f7f7f7"
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "6px"
  },
  numeric: {
    textAlign: "right"
  },
  summaryCard: {
    backgroundColor: "#f0f7ff",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px"
  },
  summaryItem: {
    textAlign: "center",
    flex: "1",
    minWidth: "120px"
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0b3c5d",
    margin: "4px 0"
  },
  summaryLabel: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase"
  },
  noData: {
    textAlign: "center",
    padding: "20px",
    color: "#999",
    fontStyle: "italic"
  },
  loadingText: {
    textAlign: "center",
    padding: "20px",
    color: "#666"
  },
  error: {
    color: "red",
    marginBottom: "8px",
    fontSize: "13px",
    padding: "10px",
    backgroundColor: "#fff8f8",
    borderRadius: "4px"
  }
};

const Reports = ({ token }) => {
  const [customerData, setCustomerData] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, [token]);

  const loadReports = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");
    
    try {
      const [customer, region, summaryData] = await Promise.all([
        getCustomerReportApi(token),
        getRegionReportApi(token),
        getSummaryReportApi(token).catch(() => null) // Summary might not be available yet
      ]);
      
      setCustomerData(Array.isArray(customer) ? customer : []);
      setRegionData(Array.isArray(region) ? region : []);
      setSummary(summaryData);
    } catch (err) {
      setError("Failed to load reports. Please try again.");
      console.error("Report load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (loading) {
    return (
      <div style={styles.card}>
        <h3 style={styles.title}>Reports</h3>
        <div style={styles.loadingText}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Reports</h3>
      
      {error && <div style={styles.error}>{error}</div>}

      {/* Summary Cards */}
      {summary && (
        <div style={styles.summaryCard}>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{summary.totalOrders}</div>
            <div style={styles.summaryLabel}>Total Orders</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{summary.totalItems}</div>
            <div style={styles.summaryLabel}>Total Items</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{formatCurrency(summary.totalSales)}</div>
            <div style={styles.summaryLabel}>Total Sales</div>
          </div>
          <div style={styles.summaryItem}>
            <div style={styles.summaryValue}>{formatCurrency(summary.averageOrderValue)}</div>
            <div style={styles.summaryLabel}>Avg Order Value</div>
          </div>
        </div>
      )}

      {/* Customer-wise Sales */}
      <h4 style={styles.subTitle}>Customer-wise Sales</h4>
      {customerData.length === 0 ? (
        <div style={styles.noData}>No customer data available</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Customer</th>
                <th style={{ ...styles.th, ...styles.numeric }}>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {customerData.map((c, index) => (
                <tr key={c.customer || index}>
                  <td style={styles.td}>{c.customer || "Unknown"}</td>
                  <td style={{ ...styles.td, ...styles.numeric }}>
                    {formatCurrency(c.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Region-wise Sales */}
      <h4 style={styles.subTitle}>Region-wise Sales</h4>
      {regionData.length === 0 ? (
        <div style={styles.noData}>No region data available</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Region</th>
                <th style={{ ...styles.th, ...styles.numeric }}>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {regionData.map((r, index) => (
                <tr key={r.region || index}>
                  <td style={styles.td}>{r.region || "Unknown"}</td>
                  <td style={{ ...styles.td, ...styles.numeric }}>
                    {formatCurrency(r.totalSales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reports;