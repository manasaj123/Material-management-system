// frontend/src/pages/QCDashboardPage.js
import React, { useEffect, useState } from "react";
import qcLotApi from "../api/qcLotApi";
import capaApi from "../api/capaApi";

export default function QCDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const styles = {
    container: {
      minHeight: "100vh",
      padding: 10,
      backgroundImage:
        "linear-gradient(90deg, rgba(120, 171, 253, 0.49), rgba(195, 220, 212, 0.73), rgba(176, 213, 250, 0.73))",
      fontSize: 13
    },
    title: {
      fontSize: 32,
      marginBottom: 16,
      textAlign: "center",
      fontWeight: "bold",
      fontFamily: "roboto, sans-serif"
    },
    cardsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
      gap: 16,
      maxWidth: 960,
      margin: "0 auto"
    },
    card: {
      backgroundColor: "rgba(255,255,255,0.9)",
      borderRadius: 8,
      padding: 16,
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 4,
      color: "#374151"
    },
    cardValue: {
      fontSize: 28,
      fontWeight: "bold"
    },
    cardSub: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 4
    },
    errorText: {
      color: "#dc2626",
      textAlign: "center",
      padding: "20px",
      backgroundColor: "#fee2e2",
      borderRadius: "8px",
      maxWidth: "600px",
      margin: "0 auto"
    },
    colorPrimary: { color: "#2563eb" },
    colorPending: { color: "#d97706" },
    colorAccepted: { color: "#059669" },
    colorRejected: { color: "#dc2626" },
    colorDeviation: { color: "#7c3aed" },
    colorInProgress: { color: "#8b5cf6" },
    colorOpen: { color: "#d97706" },
    colorClosed: { color: "#059669" }
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Fetch QC lots summary
        const lotsResponse = await qcLotApi.list();
        const lotsResult = lotsResponse?.data || {};
        
        // Fetch CAPA summary
        const capaResponse = await capaApi.list();
        const capaResult = capaResponse?.data || {};
        
        // Extract lot data
        let lotsData = [];
        if (lotsResult.data && Array.isArray(lotsResult.data)) {
          lotsData = lotsResult.data;
        } else if (Array.isArray(lotsResult)) {
          lotsData = lotsResult;
        } else if (lotsResult.lots && Array.isArray(lotsResult.lots)) {
          lotsData = lotsResult.lots;
        } else if (lotsResult.rows && Array.isArray(lotsResult.rows)) {
          lotsData = lotsResult.rows;
        }
        
        // Calculate lot stats
        const lotStats = {
          total: lotsData.length,
          byStatus: {
            PENDING: lotsData.filter(l => l.status === 'PENDING').length,
            ACCEPTED: lotsData.filter(l => l.status === 'ACCEPTED').length,
            REJECTED: lotsData.filter(l => l.status === 'REJECTED').length,
            ACCEPTED_WITH_DEVIATION: lotsData.filter(l => l.status === 'ACCEPTED_WITH_DEVIATION').length,
            IN_PROGRESS: lotsData.filter(l => l.status === 'IN_PROGRESS').length
          }
        };
        
        // Extract CAPA data
        let capaData = [];
        if (capaResult.data && Array.isArray(capaResult.data)) {
          capaData = capaResult.data;
        } else if (Array.isArray(capaResult)) {
          capaData = capaResult;
        } else if (capaResult.capas && Array.isArray(capaResult.capas)) {
          capaData = capaResult.capas;
        }
        
        // Calculate CAPA stats
        const capaStats = {
          total: capaData.length,
          byStatus: {
            OPEN: capaData.filter(c => c.status === 'OPEN').length,
            IN_PROGRESS: capaData.filter(c => c.status === 'IN_PROGRESS').length,
            CLOSED: capaData.filter(c => c.status === 'CLOSED').length
          }
        };
        
        setSummary({
          lots: lotStats,
          capa: capaStats
        });
        
      } catch (e) {
        console.error("Failed to load dashboard summary", e);
        setError("Failed to load dashboard data. Please check your connection.");
        setSummary({
          lots: { total: 0, byStatus: { PENDING: 0, ACCEPTED: 0, REJECTED: 0, ACCEPTED_WITH_DEVIATION: 0, IN_PROGRESS: 0 } },
          capa: { total: 0, byStatus: { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0 } }
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lotsPending = summary?.lots?.byStatus?.PENDING || 0;
  const lotsAccepted = summary?.lots?.byStatus?.ACCEPTED || 0;
  const lotsRejected = summary?.lots?.byStatus?.REJECTED || 0;
  const lotsInProgress = summary?.lots?.byStatus?.IN_PROGRESS || 0;
  const lotsWithDeviation = summary?.lots?.byStatus?.ACCEPTED_WITH_DEVIATION || 0;
  const capaOpen = summary?.capa?.byStatus?.OPEN || 0;
  const capaInProgress = summary?.capa?.byStatus?.IN_PROGRESS || 0;
  const capaClosed = summary?.capa?.byStatus?.CLOSED || 0;

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Material Quality Dashboard</h2>
        <div style={styles.errorText}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Material Quality Dashboard</h2>

      {loading && <div style={{ textAlign: "center", padding: "40px" }}>Loading summary...</div>}

      {!loading && summary && (
        <div style={styles.cardsRow}>
          {/* QC Lots Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>📦 QC Lots</div>
            <div style={{ ...styles.cardValue, ...styles.colorPrimary }}>{summary.lots.total}</div>
            <div style={styles.cardSub}>
              <span style={styles.colorPending}>Pending: {lotsPending}</span>
              {" • "}
              <span style={styles.colorInProgress}>In Progress: {lotsInProgress}</span>
            </div>
            <div style={styles.cardSub}>
              <span style={styles.colorAccepted}>Accepted: {lotsAccepted}</span>
              {" • "}
              <span style={styles.colorRejected}>Rejected: {lotsRejected}</span>
            </div>
            <div style={styles.cardSub}>
              <span style={styles.colorDeviation}>Accepted w/ Dev: {lotsWithDeviation}</span>
            </div>
          </div>

          {/* CAPA Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>🛠️ CAPA</div>
            <div style={{ ...styles.cardValue, ...styles.colorPrimary }}>{summary.capa.total}</div>
            <div style={styles.cardSub}>
              <span style={styles.colorPending}>Open: {capaOpen}</span>
              {" • "}
              <span style={styles.colorInProgress}>In Progress: {capaInProgress}</span>
            </div>
            <div style={styles.cardSub}>
              <span style={styles.colorClosed}>Closed: {capaClosed}</span>
            </div>
          </div>

          {/* Summary Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>📊 Summary</div>
            <div style={{ ...styles.cardValue, ...styles.colorPrimary }}>
              {summary.lots.total + summary.capa.total}
            </div>
            <div style={styles.cardSub}>
              Total QC Lots: {summary.lots.total}
            </div>
            <div style={styles.cardSub}>
              Total CAPA: {summary.capa.total}
            </div>
            <div style={styles.cardSub}>
              <span style={styles.colorAccepted}>
                {summary.lots.total > 0 
                  ? Math.round((lotsAccepted / summary.lots.total) * 100) 
                  : 0}% Acceptance Rate
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}