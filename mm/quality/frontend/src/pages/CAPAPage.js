import React, { useEffect, useState } from "react";
import capaApi from "../api/capaApi";
import CAPAList from "../components/qc/CAPAList";
import CAPAForm from "../components/qc/CAPAForm";

export default function CAPAPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const styles = {
    container: {
      padding: "24px",
      fontSize: "14px",
      maxWidth: "1200px",
      margin: "0 auto"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px"
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1f2937",
      margin: 0
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "16px",
      marginBottom: "24px"
    },
    statCard: {
      backgroundColor: "#ffffff",
      padding: "16px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      textAlign: "center"
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "bold"
    },
    statLabel: {
      fontSize: "12px",
      color: "#6b7280",
      textTransform: "uppercase",
      marginTop: "4px"
    },
    filterRow: {
      display: "flex",
      gap: "12px",
      marginBottom: "20px",
      flexWrap: "wrap",
      alignItems: "center"
    },
    filterButton: {
      padding: "6px 14px",
      borderRadius: "20px",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      fontSize: "13px",
      cursor: "pointer"
    },
    filterButtonActive: {
      padding: "6px 14px",
      borderRadius: "20px",
      border: "1px solid #2563eb",
      backgroundColor: "#2563eb",
      color: "#ffffff",
      fontSize: "13px",
      cursor: "pointer"
    },
    separator: {
      margin: "32px 0",
      borderTop: "2px solid #e5e7eb"
    },
    sectionTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#1f2937",
      marginBottom: "16px"
    },
    message: {
      padding: "10px 16px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "13px"
    },
    successMessage: {
      backgroundColor: "#d1fae5",
      color: "#065f46"
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await capaApi.list(params);
      setRows(res.data || []);
    } catch (err) {
      setError("Failed to load CAPA records");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleSaveCAPA = async (data) => {
    setError("");
    setSuccess("");
    try {
      await capaApi.create(data);
      setSuccess("CAPA created successfully!");
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create CAPA");
    }
  };

  const handleChangeStatus = async (id, status) => {
    setError("");
    setSuccess("");
    try {
      await capaApi.updateStatus(id, status);
      setSuccess(`CAPA #${id} status updated to ${status}`);
      await load();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  // Calculate stats
  const totalCAPA = rows.length;
  const openCAPA = rows.filter(r => r.status === "OPEN").length;
  const inProgressCAPA = rows.filter(r => r.status === "IN_PROGRESS").length;
  const closedCAPA = rows.filter(r => r.status === "CLOSED").length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>CAPA Management</h2>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          Corrective and Preventive Actions
        </span>
      </div>

      {error && <div style={{...styles.message, ...styles.errorMessage}}>{error}</div>}
      {success && <div style={{...styles.message, ...styles.successMessage}}>{success}</div>}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: "#2563eb"}}>{totalCAPA}</div>
          <div style={styles.statLabel}>Total CAPA</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: "#d97706"}}>{openCAPA}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: "#7c3aed"}}>{inProgressCAPA}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: "#059669"}}>{closedCAPA}</div>
          <div style={styles.statLabel}>Closed</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <button 
          style={statusFilter === "" ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setStatusFilter("")}
        >
          All
        </button>
        <button 
          style={statusFilter === "OPEN" ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setStatusFilter("OPEN")}
        >
          Open
        </button>
        <button 
          style={statusFilter === "IN_PROGRESS" ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setStatusFilter("IN_PROGRESS")}
        >
          In Progress
        </button>
        <button 
          style={statusFilter === "CLOSED" ? styles.filterButtonActive : styles.filterButton}
          onClick={() => setStatusFilter("CLOSED")}
        >
          Closed
        </button>
      </div>

      <CAPAList 
        rows={rows} 
        loading={loading}
        onChangeStatus={handleChangeStatus} 
      />

      <div style={styles.separator} />

      <h3 style={styles.sectionTitle}>Create New CAPA</h3>
      <CAPAForm onSave={handleSaveCAPA} />
    </div>
  );
}