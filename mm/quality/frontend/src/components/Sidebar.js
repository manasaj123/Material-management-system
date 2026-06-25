// quality/frontend/src/components/Sidebar.js
// UPDATED - New structure with proper sections

import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function QualitySidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const styles = {
    sidebar: {
      width: "220px",
      backgroundColor: "#f3f4f6",
      minHeight: "calc(100vh - 60px)",
      padding: "16px 0",
      borderRight: "1px solid #e5e7eb",
      flexShrink: 0,
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    title: {
      fontSize: "16px",
      fontWeight: "bold",
      color: "#1f2937",
      padding: "0 20px 16px 20px",
      borderBottom: "1px solid #e5e7eb",
      marginBottom: "8px",
    },
    sectionTitle: {
      fontSize: "11px",
      fontWeight: 600,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      padding: "12px 20px 4px 20px",
      marginTop: "8px",
    },
    link: {
      display: "block",
      padding: "8px 20px",
      color: "#374151",
      textDecoration: "none",
      fontSize: "14px",
      transition: "all 0.2s",
    },
    linkActive: {
      backgroundColor: "#2563eb",
      color: "#ffffff",
      borderRadius: "0 4px 4px 0",
    },
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.title}>🔬 Quality</div>

      {/* Overview */}
      <div style={styles.sectionTitle}>📊 Overview</div>
      <Link
        to="/qc"
        style={{
          ...styles.link,
          ...(isActive("/qc") && 
            !isActive("/qc/lots") && 
            !isActive("/qc/in-process") &&
            !isActive("/qc/final") &&
            !isActive("/qc/results") &&
            !isActive("/qc/defects") &&
            !isActive("/qc/capa") &&
            !isActive("/qc/inspection-plans")
            ? styles.linkActive : {}),
        }}
      >
        Dashboard
      </Link>

      {/* Inspection Lots */}
      <div style={styles.sectionTitle}>📦 Inspection Lots</div>
      <Link
        to="/qc/lots"
        style={{
          ...styles.link,
          ...(isActive("/qc/lots") ? styles.linkActive : {}),
        }}
      >
        QC Lots
      </Link>
      <Link
        to="/qc/in-process"
        style={{
          ...styles.link,
          ...(isActive("/qc/in-process") ? styles.linkActive : {}),
        }}
      >
        In-Process Inspections
      </Link>
      <Link
        to="/qc/final"
        style={{
          ...styles.link,
          ...(isActive("/qc/final") ? styles.linkActive : {}),
        }}
      >
        Final Inspections
      </Link>

      {/* Recording */}
      <div style={styles.sectionTitle}>📝 Recording</div>
      <Link
        to="/qc/results"
        style={{
          ...styles.link,
          ...(isActive("/qc/results") ? styles.linkActive : {}),
        }}
      >
        QC Results
      </Link>
      <Link
        to="/qc/defects"
        style={{
          ...styles.link,
          ...(isActive("/qc/defects") ? styles.linkActive : {}),
        }}
      >
        QC Defects
      </Link>

      {/* Actions */}
      <div style={styles.sectionTitle}>🛠️ Actions</div>
      <Link
        to="/qc/capa"
        style={{
          ...styles.link,
          ...(isActive("/qc/capa") ? styles.linkActive : {}),
        }}
      >
        CAPA
      </Link>

      {/* Reference */}
      <div style={styles.sectionTitle}>📋 Reference</div>
      <Link
        to="/qc/inspection-plans"
        style={{
          ...styles.link,
          ...(isActive("/qc/inspection-plans") ? styles.linkActive : {}),
        }}
      >
        Inspection Plans (View)
      </Link>

      {/* REMOVED: QC Parameters, Material Templates, QC Plans - Now in Inspection Module */}
    </div>
  );
}