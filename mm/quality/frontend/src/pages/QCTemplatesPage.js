// QCTemplatesPage.js - Fixed import path

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// ✅ FIX: Change import to use the correct path
import qcMasterApi from "../api/qcMasterApi";  // Changed from "../../api/qcMasterApi"

const styles = {
  container: {
    padding: "24px",
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
    fontSize: "24px",
    fontWeight: "bold",
    color: "#1f2937",
    margin: 0
  },
  buttonPrimary: {
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  searchBox: {
    padding: "10px 16px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    width: "300px",
    outline: "none"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    overflow: "hidden"
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    fontWeight: "600",
    color: "#374151",
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e5e7eb"
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
    fontSize: "14px",
    color: "#1f2937"
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  },
  badgeActive: {
    backgroundColor: "#d1fae5",
    color: "#065f46"
  },
  badgeInactive: {
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  },
  buttonSmall: {
    padding: "6px 12px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "none",
    cursor: "pointer",
    marginRight: "8px"
  },
  buttonEdit: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3"
  },
  buttonDelete: {
    backgroundColor: "#fee2e2",
    color: "#991b1b"
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280"
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px",
    color: "#991b1b",
    backgroundColor: "#fee2e2",
    borderRadius: "8px"
  },
  emptyContainer: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280"
  },
  filterBar: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap"
  }
};

export default function QCTemplatesPage() {
  const navigate = useNavigate();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await qcMasterApi.listTemplates();
      
      let data = [];
      
      if (response && response.data) {
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data.templates && Array.isArray(response.data.templates)) {
          data = response.data.templates;
        } else if (typeof response.data === 'object') {
          data = [response.data];
        }
      }
      
      setTemplates(Array.isArray(data) ? data : []);
      
    } catch (err) {
      console.error("Load error:", err);
      setError(err.response?.data?.message || "Failed to load templates");
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (materialId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }
    
    try {
      await qcMasterApi.deleteTemplate(materialId);
      await loadTemplates();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete template");
    }
  };

  const getFilteredTemplates = () => {
    const safeTemplates = Array.isArray(templates) ? templates : [];
    
    return safeTemplates.filter(template => {
      const materialName = template.material_name || template.name || '';
      const materialId = template.material_id || template.id || '';
      
      const matchesSearch = 
        materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materialId.toString().includes(searchTerm);
      
      const isActive = template.is_active !== false;
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "active" && isActive) ||
        (filterStatus === "inactive" && !isActive);
      
      return matchesSearch && matchesStatus;
    });
  };

  const safeTemplates = Array.isArray(templates) ? templates : [];
  const filteredTemplates = getFilteredTemplates();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
        <h3>Loading QC Templates...</h3>
      </div>
    );
  }

  if (error && safeTemplates.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>❌</div>
          <h3>Error Loading Templates</h3>
          <p>{error}</p>
          <button 
            style={styles.buttonPrimary}
            onClick={loadTemplates}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          QC Templates
          <span style={{ 
            fontSize: "14px", 
            fontWeight: "normal", 
            color: "#6b7280",
            marginLeft: "12px"
          }}>
            ({safeTemplates.length})
          </span>
        </h1>
        <button 
          style={styles.buttonPrimary}
          onClick={() => navigate("/qc/templates/new")}
        >
          + New Template
        </button>
      </div>

      <div style={styles.filterBar}>
        <input
          type="text"
          style={styles.searchBox}
          placeholder="Search by material name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          style={{
            ...styles.searchBox,
            width: "150px"
          }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {safeTemplates.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h3 style={{ color: "#1f2937", marginBottom: "8px" }}>No Templates Found</h3>
          <p style={{ color: "#6b7280" }}>
            {searchTerm || filterStatus !== "all" 
              ? "No templates match your filters. Try adjusting your search."
              : "Create your first QC template to get started."}
          </p>
          {!searchTerm && filterStatus === "all" && (
            <button 
              style={{ ...styles.buttonPrimary, marginTop: "16px" }}
              onClick={() => navigate("/qc/templates/new")}
            >
              + Create Template
            </button>
          )}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div style={styles.emptyContainer}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🔍</div>
          <h3 style={{ color: "#1f2937" }}>No Matching Templates</h3>
          <p style={{ color: "#6b7280" }}>
            Try adjusting your search or filter criteria.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Material ID</th>
                <th style={styles.th}>Material Name</th>
                <th style={styles.th}>Parameters</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map((template, index) => (
                <tr key={template.id || template.material_id || index}>
                  <td style={styles.td}>
                    <strong>#{template.material_id || template.id || '-'}</strong>
                  </td>
                  <td style={styles.td}>
                    {template.material_name || template.name || '-'}
                  </td>
                  <td style={styles.td}>
                    {template.parameter_count || template.count || 0}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      ...(template.is_active !== false ? styles.badgeActive : styles.badgeInactive)
                    }}>
                      {template.is_active !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {template.created_at 
                      ? new Date(template.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td style={styles.td}>
                    <button
                      style={{...styles.buttonSmall, ...styles.buttonEdit}}
                      onClick={() => navigate(`/qc/templates/${template.material_id || template.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      style={{...styles.buttonSmall, ...styles.buttonDelete}}
                      onClick={() => handleDelete(template.material_id || template.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}