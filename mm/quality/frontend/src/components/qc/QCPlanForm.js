import React, { useEffect, useState } from "react";
import qcMasterApi from "../../api/qcMasterApi";

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e5e7eb"
  },
  title: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    backgroundColor: "#e0e7ff",
    color: "#3730a3"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px"
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
  input: {
    padding: "6px 8px",
    fontSize: "13px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  select: {
    padding: "6px 8px",
    fontSize: "13px",
    borderRadius: "4px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
    outline: "none"
  },
  checkbox: {
    width: "16px",
    height: "16px",
    cursor: "pointer"
  },
  buttonPrimary: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500"
  },
  buttonSecondary: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "500",
    marginLeft: "8px"
  },
  buttonDanger: {
    padding: "4px 8px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#ef4444",
    color: "#fff",
    cursor: "pointer"
  },
  addButton: {
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px dashed #2563eb",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    cursor: "pointer",
    marginTop: "16px",
    width: "100%"
  },
  empty: {
    textAlign: "center",
    padding: "40px",
    color: "#9ca3af"
  },
  loadingText: {
    textAlign: "center",
    padding: "40px",
    color: "#6b7280"
  },
  error: {
    padding: "10px 16px",
    borderRadius: "6px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
    marginBottom: "16px"
  },
  actionsRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb"
  },
  requiredMark: {
    color: "#ef4444",
    marginLeft: "2px"
  }
};

export default function QCPlanForm({ materialId, mode = "view", onSave }) {
  // ✅ FIX: Initialize params as empty array
  const [params, setParams] = useState([]);
  const [originalParams, setOriginalParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!materialId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError("");
      
      try {
        const res = await qcMasterApi.getTemplate(materialId);
        
        // ✅ FIX: Handle different response structures and ensure array
        let data = [];
        
        if (res && res.data) {
          if (Array.isArray(res.data)) {
            data = res.data;
          } else if (res.data.data && Array.isArray(res.data.data)) {
            data = res.data.data;
          } else if (res.data.parameters && Array.isArray(res.data.parameters)) {
            data = res.data.parameters;
          } else {
            // If it's a single object, wrap it in an array
            data = Array.isArray(res.data) ? res.data : [res.data];
          }
        }
        
        // ✅ FIX: Ensure data is always an array
        const safeData = Array.isArray(data) ? data : [];
        setParams(safeData);
        setOriginalParams(JSON.parse(JSON.stringify(safeData))); // Deep copy
      } catch (err) {
        setError("Failed to load QC plan");
        console.error("Load error:", err);
        // ✅ FIX: Set empty array on error
        setParams([]);
        setOriginalParams([]);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [materialId]);

  // ✅ FIX: Handle param changes with safety checks
  const handleParamChange = (index, field, value) => {
    // Ensure params is an array
    const currentParams = Array.isArray(params) ? params : [];
    
    if (index < 0 || index >= currentParams.length) {
      console.warn(`Index ${index} out of bounds`);
      return;
    }
    
    const updated = [...currentParams];
    updated[index] = { 
      ...updated[index], 
      [field]: value 
    };
    setParams(updated);
    setHasChanges(true);
  };

  // ✅ FIX: Add new param with safety checks
  const addNewParam = () => {
    const currentParams = Array.isArray(params) ? params : [];
    
    const newParam = {
      parameter_id: null, // New parameter
      parameter_name: "",
      unit: "",
      lower_spec_limit: "",
      upper_spec_limit: "",
      required: true,
      isNew: true
    };
    setParams([...currentParams, newParam]);
    setHasChanges(true);
  };

  // ✅ FIX: Remove param with safety checks
  const removeParam = (index) => {
    const currentParams = Array.isArray(params) ? params : [];
    
    if (index < 0 || index >= currentParams.length) {
      console.warn(`Index ${index} out of bounds`);
      return;
    }
    
    if (window.confirm("Are you sure you want to remove this parameter?")) {
      const updated = currentParams.filter((_, i) => i !== index);
      setParams(updated);
      setHasChanges(true);
    }
  };

  // ✅ FIX: Validate with safety checks
  const validateParams = () => {
    const currentParams = Array.isArray(params) ? params : [];
    
    for (const p of currentParams) {
      if (!p.parameter_name || !p.parameter_name.trim()) {
        setError("All parameters must have a name");
        return false;
      }
    }
    return true;
  };

  // ✅ FIX: Save with safety checks
  const handleSave = async () => {
    const currentParams = Array.isArray(params) ? params : [];
    
    // Validate
    if (!validateParams()) return;
    
    setSaving(true);
    setError("");
    
    try {
      await qcMasterApi.saveTemplate(materialId, currentParams);
      setOriginalParams(JSON.parse(JSON.stringify(currentParams)));
      setHasChanges(false);
      if (onSave) onSave();
      // Show success message
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save QC plan");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FIX: Cancel with safety checks
  const handleCancel = () => {
    const currentOriginal = Array.isArray(originalParams) ? originalParams : [];
    
    if (hasChanges && !window.confirm("Discard changes?")) return;
    setParams(JSON.parse(JSON.stringify(currentOriginal)));
    setHasChanges(false);
  };

  // ✅ FIX: Get safe params array for rendering
  const safeParams = Array.isArray(params) ? params : [];

  if (loading) {
    return (
      <div style={styles.loadingText}>
        Loading QC Plan for Material #{materialId}...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          QC Plan: Material #{materialId}
          <span style={{...styles.badge, marginLeft: "12px"}}>
            {safeParams.length} Parameters
          </span>
        </h3>
        {mode === "edit" && (
          <span style={{ fontSize: "12px", color: "#d97706" }}>
            {hasChanges ? "⚠ Unsaved changes" : "✓ Saved"}
          </span>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {safeParams.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>📝</div>
          <p>No quality parameters defined for this material.</p>
          {mode === "edit" && (
            <button style={styles.buttonPrimary} onClick={addNewParam}>
              + Add First Parameter
            </button>
          )}
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>#</th>
                <th style={styles.th}>
                  Parameter Name
                  {mode === "edit" && <span style={styles.requiredMark}>*</span>}
                </th>
                <th style={styles.th}>Unit</th>
                <th style={styles.th}>Lower Limit</th>
                <th style={styles.th}>Upper Limit</th>
                <th style={styles.th}>Required</th>
                {mode === "edit" && <th style={styles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {safeParams.map((p, idx) => (
                <tr key={p.parameter_id || p.id || idx}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        value={p.parameter_name || p.name || ""}
                        onChange={e => handleParamChange(idx, "parameter_name", e.target.value)}
                        placeholder="Parameter name"
                      />
                    ) : (
                      <strong>{p.parameter_name || p.name || "-"}</strong>
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        value={p.unit || ""}
                        onChange={e => handleParamChange(idx, "unit", e.target.value)}
                        placeholder="e.g., mm, kg"
                      />
                    ) : (
                      p.unit || "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        type="number"
                        step="any"
                        value={p.lower_spec_limit ?? ""}
                        onChange={e => handleParamChange(idx, "lower_spec_limit", e.target.value)}
                        placeholder="Min"
                      />
                    ) : (
                      p.lower_spec_limit ?? "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        style={styles.input}
                        type="number"
                        step="any"
                        value={p.upper_spec_limit ?? ""}
                        onChange={e => handleParamChange(idx, "upper_spec_limit", e.target.value)}
                        placeholder="Max"
                      />
                    ) : (
                      p.upper_spec_limit ?? "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {mode === "edit" ? (
                      <input
                        type="checkbox"
                        style={styles.checkbox}
                        checked={p.required !== false}
                        onChange={e => handleParamChange(idx, "required", e.target.checked)}
                      />
                    ) : (
                      p.required !== false ? "✅ Yes" : "❌ No"
                    )}
                  </td>
                  {mode === "edit" && (
                    <td style={styles.td}>
                      <button
                        style={styles.buttonDanger}
                        onClick={() => removeParam(idx)}
                        title="Remove parameter"
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Parameter Button (Edit Mode) */}
      {mode === "edit" && (
        <button style={styles.addButton} onClick={addNewParam}>
          + Add Parameter
        </button>
      )}

      {/* Save/Cancel Buttons (Edit Mode) */}
      {mode === "edit" && hasChanges && (
        <div style={styles.actionsRow}>
          <button style={styles.buttonSecondary} onClick={handleCancel}>
            Cancel
          </button>
          <button 
            style={styles.buttonPrimary} 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </div>
  );
}