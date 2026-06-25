import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import qcLotApi from "../../api/qcLotApi";
import qcMasterApi from "../../api/qcMasterApi";

const styles = {
  container: {
    padding: "24px",
    fontSize: "14px",
    maxWidth: "1200px",
    margin: "0 auto"
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  },
  headerTitle: {
    margin: "0 0 12px 0",
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1f2937"
  },
  headerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  headerItem: {
    padding: "8px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px"
  },
  headerLabel: {
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600"
  },
  headerValue: {
    fontSize: "14px",
    color: "#1f2937",
    fontWeight: "500",
    marginTop: "2px"
  },
  section: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "20px"
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "16px",
    paddingBottom: "8px",
    borderBottom: "2px solid #e5e7eb"
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
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
    padding: "6px 10px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  select: {
    padding: "6px 10px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
    outline: "none"
  },
  defectCard: {
    backgroundColor: "#f9fafb",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "8px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "8px",
    alignItems: "end"
  },
  buttonPrimary: {
    padding: "10px 20px",
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
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: "500"
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
  buttonDisabled: {
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#9ca3af",
    color: "#fff",
    cursor: "not-allowed",
    fontWeight: "500"
  },
  decisionSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap"
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
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    color: "#6b7280"
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "8px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    marginBottom: "16px",
    textDecoration: "none"
  }
};

export default function QCLotDetail() {
  const { id: lotId } = useParams();
  const navigate = useNavigate();
  
  const [lot, setLot] = useState(null);
  const [params, setParams] = useState([]);
  const [results, setResults] = useState({});
  const [decision, setDecision] = useState("ACCEPT");
  const [defects, setDefects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = useCallback(async () => {
    if (!lotId) return;
    
    setLoading(true);
    setError("");
    
    try {
      // ✅ FIX: Get the lot with proper error handling
      const lotRes = await qcLotApi.get(lotId);
      
      // Check if response has the expected structure
      if (!lotRes.data || !lotRes.data.lot) {
        throw new Error("Invalid response structure");
      }
      
      const lotData = lotRes.data.lot;
      setLot(lotData);

      // ✅ FIX: Validate material_id before fetching template
      if (!lotData.material_id) {
        console.warn("No material_id found in lot data");
        setParams([]);
        return;
      }

      // ✅ FIX: Get template with proper error handling
      try {
        const tmplRes = await qcMasterApi.getTemplate(lotData.material_id);
        
        // Handle different response structures
        let templateParams = [];
        if (tmplRes.data && Array.isArray(tmplRes.data)) {
          templateParams = tmplRes.data;
        } else if (tmplRes.data && tmplRes.data.data && Array.isArray(tmplRes.data.data)) {
          templateParams = tmplRes.data.data;
        } else if (Array.isArray(tmplRes.data)) {
          templateParams = tmplRes.data;
        }
        
        setParams(templateParams);

        // ✅ FIX: Initialize results using the correct ID field
        const initial = {};
        templateParams.forEach(p => {
          // Use parameter_id or id - whichever is available
          const paramId = p.parameter_id || p.id;
          if (paramId) {
            initial[paramId] = { 
              value: "", 
              pass_fail: true, 
              remark: "" 
            };
          }
        });
        setResults(initial);
      } catch (templateErr) {
        console.error("Error fetching template:", templateErr);
        setParams([]);
        setResults({});
        // Don't set error here - we still have the lot data
      }
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load QC lot details");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleResultChange = (paramId, field, value) => {
    setResults(prev => ({
      ...prev,
      [paramId]: {
        ...prev[paramId],
        [field]: value
      }
    }));
  };

  const addDefectRow = () => {
    setDefects(d => [
      ...d,
      {
        defect_type: "",
        qty_rejected: "",
        unit: lot?.unit || "",
        severity: "MINOR",
        remarks: ""
      }
    ]);
  };

  const removeDefectRow = (index) => {
    setDefects(d => d.filter((_, i) => i !== index));
  };

  const updateDefect = (index, field, value) => {
    setDefects(ds =>
      ds.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  const validateResults = () => {
    for (const p of params) {
      // ✅ FIX: Use the correct ID field
      const paramId = p.parameter_id || p.id;
      const r = results[paramId];
      if (!r || r.value === "" || r.value === null) {
        setError(`Please enter measured value for parameter: ${p.parameter_name || p.name}`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    
    if (!validateResults()) return;
    
    // Check if any defects have incomplete data
    const validDefects = defects.filter(d => d.defect_type && d.qty_rejected);
    const incompleteDefects = defects.some(d => 
      (d.defect_type && !d.qty_rejected) || (!d.defect_type && d.qty_rejected)
    );
    
    if (incompleteDefects) {
      setError("Please complete all defect fields or remove incomplete rows");
      return;
    }
    
    setSaving(true);
    try {
      const resultArray = params.map(p => {
        // ✅ FIX: Use the correct ID field
        const paramId = p.parameter_id || p.id;
        const r = results[paramId] || {};
        return {
          parameter_id: paramId, // Use the actual parameter_id
          measured_value: r.value === "" ? null : Number(r.value),
          unit: p.unit,
          pass_fail: r.pass_fail !== false,
          remark: r.remark || ""
        };
      });

      const payload = {
        decision,
        results: resultArray,
        defects: validDefects.map(d => ({
          defect_type: d.defect_type,
          qty_rejected: Number(d.qty_rejected) || 0,
          unit: d.unit,
          severity: d.severity,
          remarks: d.remarks
        }))
      };

      await qcLotApi.recordResults(lotId, payload);
      setSuccess("QC results saved successfully!");
      setTimeout(() => {
        navigate("/qc/lots");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving QC results");
      console.error("Save error:", err);
    } finally {
      setSaving(false);
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

  // ✅ FIX: Add loading guard
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <h3>Loading QC Lot Details...</h3>
      </div>
    );
  }

  if (!lot) {
    return (
      <div style={styles.loadingContainer}>
        <h3>QC Lot not found</h3>
        <button style={styles.buttonSecondary} onClick={() => navigate("/qc/lots")}>
          Back to QC Lots
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button 
        style={styles.backButton}
        onClick={() => navigate("/qc/lots")}
      >
        ← Back to QC Lots
      </button>

      {/* Messages */}
      {error && <div style={{...styles.message, ...styles.errorMessage}}>{error}</div>}
      {success && <div style={{...styles.message, ...styles.successMessage}}>{success}</div>}

      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>
          QC Lot #{lot.id}
          <span style={{ ...styles.badge(lot.status), marginLeft: "12px" }}>
            {lot.status?.replace(/_/g, " ")}
          </span>
        </h3>
        <div style={styles.headerGrid}>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Material ID</div>
            <div style={styles.headerValue}>{lot.material_id || "-"}</div>
          </div>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Vendor ID</div>
            <div style={styles.headerValue}>{lot.vendor_id || "-"}</div>
          </div>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Batch ID</div>
            <div style={styles.headerValue}>{lot.batch_id || "-"}</div>
          </div>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Location</div>
            <div style={styles.headerValue}>{lot.location_id || "-"}</div>
          </div>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Stage</div>
            <div style={styles.headerValue}>{lot.stage}</div>
          </div>
          <div style={styles.headerItem}>
            <div style={styles.headerLabel}>Created Date</div>
            <div style={styles.headerValue}>{formatDate(lot.planned_date || lot.created_at)}</div>
          </div>
        </div>
      </div>

      {/* Parameters Section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Quality Parameters ({params.length})</div>
        {params.length === 0 ? (
          <div style={{ color: "#6b7280", padding: "20px", textAlign: "center" }}>
            No parameters defined for this material
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Parameter</th>
                  <th style={styles.th}>Specification</th>
                  <th style={styles.th}>Measured Value</th>
                  <th style={styles.th}>Pass/Fail</th>
                  <th style={styles.th}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {params.map(p => {
                  // ✅ FIX: Use the correct ID field
                  const paramId = p.parameter_id || p.id;
                  const r = results[paramId] || {};
                  const spec =
                    p.lower_spec_limit != null || p.upper_spec_limit != null
                      ? `${p.lower_spec_limit ?? "—"} to ${p.upper_spec_limit ?? "—"} ${p.unit || ""}`
                      : "No spec defined";
                  const passFailColor = r.pass_fail ? "#059669" : "#dc2626";
                  
                  return (
                    <tr key={paramId}>
                      <td style={styles.td}>
                        <strong>{p.parameter_name || p.name}</strong>
                      </td>
                      <td style={styles.td}>{spec}</td>
                      <td style={styles.td}>
                        <input
                          style={styles.input}
                          type="number"
                          step="any"
                          placeholder="Enter value"
                          value={r.value ?? ""}
                          onChange={e =>
                            handleResultChange(
                              paramId,
                              "value",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td style={styles.td}>
                        <select
                          style={{
                            ...styles.select,
                            color: passFailColor,
                            fontWeight: "600"
                          }}
                          value={r.pass_fail ? "PASS" : "FAIL"}
                          onChange={e =>
                            handleResultChange(
                              paramId,
                              "pass_fail",
                              e.target.value === "PASS"
                            )
                          }
                        >
                          <option value="PASS">✓ PASS</option>
                          <option value="FAIL">✗ FAIL</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        <input
                          style={styles.input}
                          placeholder="Optional remarks"
                          value={r.remark || ""}
                          onChange={e =>
                            handleResultChange(
                              paramId,
                              "remark",
                              e.target.value
                            )
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Defects Section */}
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={styles.sectionTitle} style={{ marginBottom: 0, paddingBottom: 0, borderBottom: "none" }}>
            Defects {defects.length > 0 && `(${defects.length})`}
          </div>
          <button
            type="button"
            onClick={addDefectRow}
            style={styles.buttonSecondary}
          >
            + Add Defect
          </button>
        </div>
        
        {defects.length === 0 ? (
          <div style={{ color: "#6b7280", padding: "20px", textAlign: "center" }}>
            No defects recorded. Click "Add Defect" to record quality defects.
          </div>
        ) : (
          defects.map((d, idx) => (
            <div key={idx} style={styles.defectCard}>
              <div>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  Defect Type *
                </label>
                <input
                  style={styles.input}
                  placeholder="e.g., Scratch, Crack"
                  value={d.defect_type}
                  onChange={e => updateDefect(idx, "defect_type", e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  Qty Rejected *
                </label>
                <input
                  style={styles.input}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={d.qty_rejected}
                  onChange={e => updateDefect(idx, "qty_rejected", e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  Unit
                </label>
                <input
                  style={styles.input}
                  placeholder="pcs/kg"
                  value={d.unit}
                  onChange={e => updateDefect(idx, "unit", e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  Severity
                </label>
                <select
                  style={styles.select}
                  value={d.severity}
                  onChange={e => updateDefect(idx, "severity", e.target.value)}
                >
                  <option value="MINOR">MINOR</option>
                  <option value="MAJOR">MAJOR</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "#6b7280", display: "block", marginBottom: "4px" }}>
                  Remarks
                </label>
                <input
                  style={styles.input}
                  placeholder="Optional"
                  value={d.remarks}
                  onChange={e => updateDefect(idx, "remarks", e.target.value)}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => removeDefectRow(idx)}
                  style={styles.buttonDanger}
                >
                  ✕ Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Final Decision</div>
        <div style={styles.decisionSection}>
          <select
            style={{ ...styles.select, width: "250px", padding: "10px" }}
            value={decision}
            onChange={e => setDecision(e.target.value)}
          >
            <option value="ACCEPT">✓ ACCEPT</option>
            <option value="REJECT">✗ REJECT</option>
            <option value="ACCEPT_WITH_DEVIATION">⚠ ACCEPT WITH DEVIATION</option>
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={saving ? styles.buttonDisabled : styles.buttonPrimary}
          >
            {saving ? "⏳ Saving..." : "💾 Save QC Results"}
          </button>
        </div>
      </div>
    </div>
  );
}