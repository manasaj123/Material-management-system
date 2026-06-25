// mm/inspection/frontend/src/pages/DefectsRecordingPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function DefectsRecordingPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    defectType: "CUSTOMER", // CUSTOMER / VENDOR / INTERNAL
    title: "",
    description: "",
    materialCode: "",
    lotOrOrderNo: "",
    reporter: "",
    priority: "MEDIUM" // LOW / MEDIUM / HIGH
  });

  const [errors, setErrors] = useState({
    defectType: "",
    title: "",
    description: "",
    materialCode: "",
    lotOrOrderNo: "",
    reporter: "",
    priority: ""
  });

  const cleanCode = v =>
    (v || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/defects`),
        axios.get(`${BASE_URL}/defects/recycle-bin`)
      ]);
      setItems(active.data || []);
      setBinItems(bin.data || []);
    } catch (err) {
      console.error("Load Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    // title: only letters, numbers, spaces (no special chars)
    if (name === "title") {
      newValue = value.replace(/[^A-Za-z0-9 ]/g, "");
    }

    // code-like fields: uppercase + restrict chars
    if (["materialCode", "lotOrOrderNo", "reporter"].includes(name)) {
      newValue = cleanCode(value);
    }

    // clear error when user edits that field
    if (Object.prototype.hasOwnProperty.call(errors, name)) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {
      defectType: "",
      title: "",
      description: "",
      materialCode: "",
      lotOrOrderNo: "",
      reporter: "",
      priority: ""
    };

    const titleTrim = form.title.trim();
    const descTrim = form.description.trim();
    const matTrim = form.materialCode.trim();
    const lotTrim = form.lotOrOrderNo.trim();
    const repTrim = form.reporter.trim();

    const titleRegex = /^[A-Za-z0-9 ]+$/;

    // required: defectType
    if (!form.defectType) {
      newErrors.defectType = "Defect type is required";
    }

    // required: title, and no special chars
    if (!titleTrim) {
      newErrors.title = "Title is required";
    } else if (!titleRegex.test(titleTrim)) {
      newErrors.title =
        "Title must contain only letters, numbers and spaces (no special characters)";
    }

    // required: description
    if (!descTrim) {
      newErrors.description = "Description is required";
    }

    // required: materialCode, lotOrOrderNo, reporter
    if (!matTrim) {
      newErrors.materialCode = "Material code is required";
    }
    if (!lotTrim) {
      newErrors.lotOrOrderNo = "Lot / Order No. is required";
    }
    if (!repTrim) {
      newErrors.reporter = "Reporter is required";
    }

    // required: priority
    if (!form.priority) {
      newErrors.priority = "Priority is required";
    }

    const hasErrors = Object.values(newErrors).some(msg => msg);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      defectType: form.defectType,
      title: titleTrim,
      description: descTrim,
      materialCode: matTrim,
      lotOrOrderNo: lotTrim,
      reporter: repTrim,
      priority: form.priority
    };

    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/defects/${editingId}`, payload);
      } else {
        await axios.post(`${BASE_URL}/defects`, payload);
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Error saving defect");
      return;
    }

    setForm({
      defectType: "CUSTOMER",
      title: "",
      description: "",
      materialCode: "",
      lotOrOrderNo: "",
      reporter: "",
      priority: "MEDIUM"
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      defectType: item.defectType || "CUSTOMER",
      title: (item.title || "").replace(/[^A-Za-z0-9 ]/g, ""),
      description: item.description || "",
      materialCode: cleanCode(item.materialCode || ""),
      lotOrOrderNo: cleanCode(item.lotOrOrderNo || ""),
      reporter: cleanCode(item.reporter || ""),
      priority: item.priority || "MEDIUM"
    });
    setErrors({
      defectType: "",
      title: "",
      description: "",
      materialCode: "",
      lotOrOrderNo: "",
      reporter: "",
      priority: ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/defects/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/defects/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/defects/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Defects Recording" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>{editingId ? "Edit Defect" : "Record Defect"}</h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Defect Type</label>
                <select
                  name="defectType"
                  value={form.defectType}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">
                    Customer complaint (delivered to customer)
                  </option>
                  <option value="VENDOR">
                    Vendor complaint (goods from supplier)
                  </option>
                  <option value="INTERNAL">
                    Internal defect (in‑process inspection)
                  </option>
                </select>
                {errors.defectType && (
                  <span className="error-text">{errors.defectType}</span>
                )}
              </div>

              <div className="form-row">
                <label>Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Short defect title"
                />
                {errors.title && (
                  <span className="error-text">{errors.title}</span>
                )}
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the defect"
                  rows={3}
                />
                {errors.description && (
                  <span className="error-text">{errors.description}</span>
                )}
              </div>

              <div className="form-row">
                <label>Material Code</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Material code"
                />
                {errors.materialCode && (
                  <span className="error-text">{errors.materialCode}</span>
                )}
              </div>

              <div className="form-row">
                <label>Lot / Order No.</label>
                <input
                  name="lotOrOrderNo"
                  value={form.lotOrOrderNo}
                  onChange={handleChange}
                  placeholder="Inspection lot or order number"
                />
                {errors.lotOrOrderNo && (
                  <span className="error-text">{errors.lotOrOrderNo}</span>
                )}
              </div>

              <div className="form-row">
                <label>Reporter</label>
                <input
                  name="reporter"
                  value={form.reporter}
                  onChange={handleChange}
                  placeholder="Who reported the defect"
                />
                {errors.reporter && (
                  <span className="error-text">{errors.reporter}</span>
                )}
              </div>

              <div className="form-row">
                <label>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {errors.priority && (
                  <span className="error-text">{errors.priority}</span>
                )}
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>

          {/* List card */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>{showRecycleBin ? "Recycle Bin" : "Defects List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Material</th>
                  <th>Lot/Order</th>
                  <th>Priority</th>
                  <th>Reporter</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.defectType}</td>
                    <td>{item.title}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.lotOrOrderNo}</td>
                    <td>{item.priority}</td>
                    <td>{item.reporter}</td>
                    <td>
                      {!showRecycleBin ? (
                        <>
                          <button
                            className="action-edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-delete"
                            onClick={() => handleSoftDelete(item.id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="action-restore"
                            onClick={() => handleRestore(item.id)}
                          >
                            Restore
                          </button>
                          <button
                            className="action-hard-delete"
                            onClick={() => handleHardDelete(item.id)}
                          >
                            Delete Permanently
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
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