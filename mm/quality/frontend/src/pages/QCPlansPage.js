import React, { useState } from "react";
import QCPlanForm from "../components/qc/QCPlanForm";
import qcMasterApi from "../api/qcMasterApi";

export default function QCPlansPage() {
  const [materialId, setMaterialId] = useState("");
  const [viewMode, setViewMode] = useState("view"); // 'view' or 'edit'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const styles = {
    container: {
      padding: "24px",
      fontSize: "14px",
      maxWidth: "1200px",
      margin: "0 auto"
    },
    header: {
      textAlign: "center",
      marginBottom: "24px"
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#1f2937",
      marginBottom: "8px"
    },
    subtitle: {
      fontSize: "14px",
      color: "#6b7280"
    },
    filterCard: {
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      marginBottom: "20px"
    },
    filterRow: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "12px",
      flexWrap: "wrap"
    },
    label: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontWeight: "500",
      fontSize: "14px"
    },
    input: {
      padding: "8px 12px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      width: "180px",
      outline: "none"
    },
    button: {
      padding: "8px 16px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "500"
    },
    buttonSecondary: {
      padding: "8px 16px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      color: "#374151",
      cursor: "pointer",
      fontWeight: "500"
    },
    modeButtons: {
      display: "flex",
      gap: "8px",
      marginLeft: "12px"
    },
    modeButton: {
      padding: "6px 12px",
      fontSize: "13px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      backgroundColor: "#ffffff",
      cursor: "pointer"
    },
    modeButtonActive: {
      padding: "6px 12px",
      fontSize: "13px",
      borderRadius: "6px",
      border: "1px solid #2563eb",
      backgroundColor: "#2563eb",
      color: "#fff",
      cursor: "pointer"
    },
    message: {
      padding: "10px 16px",
      borderRadius: "6px",
      marginBottom: "16px",
      fontSize: "13px",
      textAlign: "center"
    },
    successMessage: {
      backgroundColor: "#d1fae5",
      color: "#065f46"
    },
    errorMessage: {
      backgroundColor: "#fee2e2",
      color: "#991b1b"
    },
    hint: {
      textAlign: "center",
      padding: "40px",
      color: "#9ca3af",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      fontSize: "14px"
    },
    statsCards: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
      fontSize: "24px",
      fontWeight: "bold",
      color: "#2563eb"
    },
    statLabel: {
      fontSize: "12px",
      color: "#6b7280",
      marginTop: "4px"
    }
  };

  const handleLoadPlan = () => {
    if (materialId) {
      setError("");
      setSuccess("");
    }
  };

  const handleSaveComplete = () => {
    setSuccess("QC Plan saved successfully!");
    setViewMode("view");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>QC Plans Management</h2>
        <p style={styles.subtitle}>
          Define quality inspection parameters for materials
        </p>
      </div>

      {error && <div style={{...styles.message, ...styles.errorMessage}}>{error}</div>}
      {success && <div style={{...styles.message, ...styles.successMessage}}>{success}</div>}

      {/* Filter Section */}
      <div style={styles.filterCard}>
        <div style={styles.filterRow}>
          <label style={styles.label}>
            <span>Material ID:</span>
            <input
              style={styles.input}
              type="number"
              value={materialId}
              onChange={e => setMaterialId(e.target.value)}
              placeholder="Enter material ID"
              min="1"
            />
          </label>
          <button style={styles.button} onClick={handleLoadPlan}>
            Load Plan
          </button>
          
          {materialId && (
            <div style={styles.modeButtons}>
              <button 
                style={viewMode === "view" ? styles.modeButtonActive : styles.modeButton}
                onClick={() => setViewMode("view")}
              >
                View
              </button>
              <button 
                style={viewMode === "edit" ? styles.modeButtonActive : styles.modeButton}
                onClick={() => setViewMode("edit")}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {!materialId ? (
        <div style={styles.hint}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <div>Enter a Material ID above to view or edit its QC plan</div>
        </div>
      ) : (
        <QCPlanForm 
          materialId={Number(materialId)} 
          mode={viewMode}
          onSave={handleSaveComplete}
        />
      )}
    </div>
  );
}