// mm/inspection/frontend/src/pages/ResultRecordingUsageDecisionPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api"; // inspection backend

export default function ResultRecordingUsageDecisionPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [form, setForm] = useState({
    plantCode: "",
    origin: "01",
    materialCode: "",
    batchNumber: "",
    vendorCode: "",
    resultText: "",
    usageDecision: ""  // UD code, e.g. 'A'
  });
  const [editingId, setEditingId] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const loadData = async () => {
    try {
      const [activeRes, binRes] = await Promise.all([
        axios.get(`${BASE_URL}/raw-material-inspections`),
        axios.get(`${BASE_URL}/raw-material-inspections/recycle-bin`)
      ]);

      setItems(activeRes.data || []);
      setBinItems(binRes.data || []);
    } catch (err) {
      console.error(
        "ResultRecordingUsageDecision loadData error:",
        err
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    if (["plantCode", "materialCode", "batchNumber", "vendorCode"].includes(name)) {
      newValue = value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    } else if (name === "usageDecision") {
      newValue = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

const handleSubmit = async e => {
  e.preventDefault();

  if (
    !form.plantCode ||
    !form.materialCode ||
    !form.batchNumber ||
    !form.vendorCode
  ) {
    return;
  }

  const payload = {
    plantCode: form.plantCode,
    origin: form.origin,
    materialCode: form.materialCode,
    batchNumber: form.batchNumber,
    vendorCode: form.vendorCode,
    resultText: form.resultText,
    usageDecision: form.usageDecision
  };

  try {
    if (editingId) {
      await axios.put(
        `${BASE_URL}/raw-material-inspections/${editingId}`,
        payload
      );
    } else {
      await axios.post(
        `${BASE_URL}/raw-material-inspections`,
        payload
      );
    }

    setForm({
      plantCode: "",
      origin: "01",
      materialCode: "",
      batchNumber: "",
      vendorCode: "",
      resultText: "",
      usageDecision: ""
    });
    setEditingId(null);
    await loadData();
  } catch (err) {
    if (err.response) {
      console.error("Submit error:", err.response.data);
      alert(err.response.data.message || "Validation error");
    } else {
      console.error("Submit error:", err);
      alert("Request failed");
    }
  }
};

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      plantCode: item.plantCode || "",
      origin: item.origin || "01",
      materialCode: item.materialCode || "",
      batchNumber: item.batchNumber || "",
      vendorCode: item.vendorCode || "",
      resultText: item.resultText || "",
      usageDecision: item.usageDecision || ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(
      `${BASE_URL}/raw-material-inspections/${id}`
    );
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(
      `${BASE_URL}/raw-material-inspections/${id}/restore`
    );
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/raw-material-inspections/${id}/hard-delete`
    );
    await loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />

      <div className="qc-master-content">
        <Header title="Result Recording & Usage Decision" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Result / Usage Decision"
                : "Create Result / Usage Decision"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              {/* Row 1: Plant + Origin */}
              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plantCode"
                  value={form.plantCode}
                  onChange={handleChange}
                  placeholder="e.g. 1000"
                  required
                />
              </div>

              <div className="form-row">
                <label>Inspection lot origin</label>
                <select
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                >
                  <option value="01">01 - Raw material</option>
                  <option value="02">02 - In-process</option>
                  <option value="03">03 - Final</option>
                </select>
              </div>

              {/* Row 2: Material + Batch */}
              <div className="form-row">
                <label>Material (raw)</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Material code"
                  required
                />
              </div>

              <div className="form-row">
                <label>Batch</label>
                <input
                  name="batchNumber"
                  value={form.batchNumber}
                  onChange={handleChange}
                  placeholder="Batch"
                  required
                />
              </div>

              {/* Row 3: Vendor */}
              <div className="form-row">
                <label>Vendor</label>
                <input
                  name="vendorCode"
                  value={form.vendorCode}
                  onChange={handleChange}
                  placeholder="Vendor"
                  required
                />
              </div>

              {/* Row 4: Result */}
              <div className="form-row form-row-full">
                <label>Result recording (overall)</label>
                <textarea
                  name="resultText"
                  value={form.resultText}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Overall result of inspection"
                />
              </div>

              {/* Row 5: Usage decision code (UD) */}
              <div className="form-row">
                <label>Usage decision (UD code)</label>
                <input
                  name="usageDecision"
                  value={form.usageDecision}
                  onChange={handleChange}
                  placeholder="e.g. A"
                  maxLength={1}
                />
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* List card */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>
                {showRecycleBin
                  ? "Result / UD - Recycle Bin"
                  : "Result / UD List"}
              </h3>

              <button
                onClick={() =>
                  setShowRecycleBin(v => !v)
                }
              >
                {showRecycleBin
                  ? "Show Active"
                  : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Plant</th>
                  <th>Origin</th>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>Vendor</th>
                  <th>Result</th>
                  <th>UD code</th>
                  <th>Quality score</th>
                  {showRecycleBin && <th>Deleted At</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{item.plantCode}</td>
                    <td>{item.origin}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.batchNumber}</td>
                    <td>{item.vendorCode}</td>
                    <td>{item.resultText}</td>
                    <td>{item.usageDecision}</td>
                    <td>{item.qualityScore}</td>
                    {showRecycleBin && (
                      <td>{item.deletedAt || "-"}</td>
                    )}

                    <td>
                      {!showRecycleBin && (
                        <div className="btn">
                          <button
                            className="action-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-delete"
                            onClick={() =>
                              handleSoftDelete(item.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {showRecycleBin && (
                        <div className="btn">
                          <button
                            className="action-restore"
                            onClick={() =>
                              handleRestore(item.id)
                            }
                          >
                            Restore
                          </button>
                          <button
                            className="action-hard-delete"
                            onClick={() =>
                              handleHardDelete(item.id)
                            }
                          >
                            Delete Permanently
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={showRecycleBin ? 11 : 10}
                      style={{ textAlign: "center" }}
                    >
                      No records
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}