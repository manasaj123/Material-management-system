// mm/inspection/frontend/src/pages/QualityNotificationPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

export default function QualityNotificationPage() {
  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    qnNumber: "",
    qnType: "CUSTOMER", // CUSTOMER complaint / VENDOR complaint

    purchaseOrderNo: "",
    inspectionLotNo: "",

    defectType: "",
    causeCodeGroup: "QM", // QM = design defect group
    causeCode: "",
    causeText: "",

    taskCodeGroup: "QM-G2", // rework code group
    taskCode: "",
    taskText: "",

    activityCodeGroup: "QM-G2", // special complaint group
    activityCode: "",
    activityText: "",

    status: "OPEN" // OPEN / COMPLETED
  });

  const [errors, setErrors] = useState({
    qnNumber: "",
    qnType: "",
    purchaseOrderNo: "",
    inspectionLotNo: "",
    defectType: "",
    status: ""
  });

  const cleanCode = v =>
    (v || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/quality-notifications`),
        axios.get(`${BASE_URL}/quality-notifications/recycle-bin`)
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

    if (
      [
        "qnNumber",
        "purchaseOrderNo",
        "inspectionLotNo",
        "defectType",
        "causeCodeGroup",
        "causeCode",
        "taskCodeGroup",
        "taskCode",
        "activityCodeGroup",
        "activityCode"
      ].includes(name)
    ) {
      newValue = cleanCode(value);
    }

    if (Object.prototype.hasOwnProperty.call(errors, name)) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const newErrors = {
      qnNumber: "",
      qnType: "",
      purchaseOrderNo: "",
      inspectionLotNo: "",
      defectType: "",
      status: ""
    };

    const qnNumberTrim = form.qnNumber.trim();
    const poTrim = form.purchaseOrderNo.trim();
    const lotTrim = form.inspectionLotNo.trim();
    const defectTrim = form.defectType.trim();

    if (!qnNumberTrim) {
      newErrors.qnNumber = "Quality notification number is required";
    }

    if (!form.qnType) {
      newErrors.qnType = "Notification type is required";
    }

    if (!poTrim) {
      newErrors.purchaseOrderNo = "Purchase order number is required";
    }

    if (!lotTrim) {
      newErrors.inspectionLotNo = "Inspection lot number is required";
    }

    if (!defectTrim) {
      newErrors.defectType = "Defect type is required";
    }

    if (!form.status) {
      newErrors.status = "Status is required";
    }

    const hasErrors = Object.values(newErrors).some(msg => msg);
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      qnNumber: qnNumberTrim,
      qnType: form.qnType || "CUSTOMER",

      purchaseOrderNo: poTrim,
      inspectionLotNo: lotTrim,

      defectType: defectTrim,
      causeCodeGroup: form.causeCodeGroup || "QM",
      causeCode: form.causeCode || null,
      causeText: form.causeText || null,

      taskCodeGroup: form.taskCodeGroup || "QM-G2",
      taskCode: form.taskCode || null,
      taskText: form.taskText || null,

      activityCodeGroup: form.activityCodeGroup || "QM-G2",
      activityCode: form.activityCode || null,
      activityText: form.activityText || null,

      status: form.status || "OPEN"
    };

    try {
      if (editingId) {
        await axios.put(
          `${BASE_URL}/quality-notifications/${editingId}`,
          payload
        );
      } else {
        await axios.post(`${BASE_URL}/quality-notifications`, payload);
      }
    } catch (err) {
      console.error("Save Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Error saving quality notification");
      return;
    }

    setForm({
      qnNumber: "",
      qnType: "CUSTOMER",
      purchaseOrderNo: "",
      inspectionLotNo: "",
      defectType: "",
      causeCodeGroup: "QM",
      causeCode: "",
      causeText: "",
      taskCodeGroup: "QM-G2",
      taskCode: "",
      taskText: "",
      activityCodeGroup: "QM-G2",
      activityCode: "",
      activityText: "",
      status: "OPEN"
    });
    setEditingId(null);
    loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      qnNumber: cleanCode(item.qnNumber || ""),
      qnType: item.qnType || "CUSTOMER",

      purchaseOrderNo: cleanCode(item.purchaseOrderNo || ""),
      inspectionLotNo: cleanCode(item.inspectionLotNo || ""),

      defectType: cleanCode(item.defectType || ""),
      causeCodeGroup: cleanCode(item.causeCodeGroup || "QM"),
      causeCode: cleanCode(item.causeCode || ""),
      causeText: item.causeText || "",

      taskCodeGroup: cleanCode(item.taskCodeGroup || "QM-G2"),
      taskCode: cleanCode(item.taskCode || ""),
      taskText: item.taskText || "",

      activityCodeGroup: cleanCode(item.activityCodeGroup || "QM-G2"),
      activityCode: cleanCode(item.activityCode || ""),
      activityText: item.activityText || "",

      status: item.status || "OPEN"
    });
    setErrors({
      qnNumber: "",
      qnType: "",
      purchaseOrderNo: "",
      inspectionLotNo: "",
      defectType: "",
      status: ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/quality-notifications/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/quality-notifications/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/quality-notifications/${id}/hard-delete`
    );
    loadData();
  };

  const markCompleted = async id => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    await axios.put(`${BASE_URL}/quality-notifications/${id}`, {
      ...item,
      status: "COMPLETED"
    });
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Quality Notification - Defect Analysis" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Quality Notification"
                : "Create Quality Notification"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              {/* Step 1: Basic notification info */}
              <div className="form-row">
                <label>Quality Notification No.</label>
                <input
                  name="qnNumber"
                  value={form.qnNumber}
                  onChange={handleChange}
                  placeholder="Enter QN number"
                />
                {errors.qnNumber && (
                  <span className="error-text">{errors.qnNumber}</span>
                )}
              </div>

              <div className="form-row">
                <label>Notification Type</label>
                <select
                  name="qnType"
                  value={form.qnType}
                  onChange={handleChange}
                >
                  <option value="CUSTOMER">Customer Complaint</option>
                  <option value="VENDOR">Complaint against Vendor</option>
                </select>
                {errors.qnType && (
                  <span className="error-text">{errors.qnType}</span>
                )}
              </div>

              <div className="form-row">
                <label>Purchase Order No.</label>
                <input
                  name="purchaseOrderNo"
                  value={form.purchaseOrderNo}
                  onChange={handleChange}
                  placeholder="PO number for received goods"
                />
                {errors.purchaseOrderNo && (
                  <span className="error-text">{errors.purchaseOrderNo}</span>
                )}
              </div>

              <div className="form-row">
                <label>Inspection Lot No.</label>
                <input
                  name="inspectionLotNo"
                  value={form.inspectionLotNo}
                  onChange={handleChange}
                  placeholder="Inspection lot linked to PO"
                />
                {errors.inspectionLotNo && (
                  <span className="error-text">{errors.inspectionLotNo}</span>
                )}
              </div>

              {/* Step 3: Defect type & cause */}
              <div className="form-row">
                <label>Defect Type</label>
                <input
                  name="defectType"
                  value={form.defectType}
                  onChange={handleChange}
                  placeholder="e.g. DESIGN_DEFECT, WRONG_SPEC"
                />
                {errors.defectType && (
                  <span className="error-text">{errors.defectType}</span>
                )}
              </div>

              <div className="form-row">
                <label>Cause Code Group</label>
                <input
                  name="causeCodeGroup"
                  value={form.causeCodeGroup}
                  onChange={handleChange}
                  placeholder="QM"
                />
              </div>

              <div className="form-row">
                <label>Cause Code</label>
                <input
                  name="causeCode"
                  value={form.causeCode}
                  onChange={handleChange}
                  placeholder="e.g. QM-01"
                />
              </div>

              <div className="form-row">
                <label>Cause Text</label>
                <input
                  name="causeText"
                  value={form.causeText}
                  onChange={handleChange}
                  placeholder="Explain root cause"
                />
              </div>

              {/* Step 6: Tasks (rework) */}
              <div className="form-row">
                <label>Task Code Group</label>
                <input
                  name="taskCodeGroup"
                  value={form.taskCodeGroup}
                  onChange={handleChange}
                  placeholder="QM-G2 (rework)"
                />
              </div>

              <div className="form-row">
                <label>Task Code</label>
                <input
                  name="taskCode"
                  value={form.taskCode}
                  onChange={handleChange}
                  placeholder="e.g. QM-G2-01"
                />
              </div>

              <div className="form-row">
                <label>Task Text (Rework)</label>
                <input
                  name="taskText"
                  value={form.taskText}
                  onChange={handleChange}
                  placeholder="Describe rework to be done"
                />
              </div>

              {/* Step 7: Activities */}
              <div className="form-row">
                <label>Activity Code Group</label>
                <input
                  name="activityCodeGroup"
                  value={form.activityCodeGroup}
                  onChange={handleChange}
                  placeholder="QM-G2 (special complaint)"
                />
              </div>

              <div className="form-row">
                <label>Activity Code</label>
                <input
                  name="activityCode"
                  value={form.activityCode}
                  onChange={handleChange}
                  placeholder="e.g. QM-G2-02"
                />
              </div>

              <div className="form-row">
                <label>Activity Text</label>
                <input
                  name="activityText"
                  value={form.activityText}
                  onChange={handleChange}
                  placeholder="e.g. File special complaint against vendor"
                />
              </div>

              {/* Status / Complete */}
              <div className="form-row">
                <label>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="OPEN">Open</option>
                  <option value="COMPLETED">Completed</option>
                </select>
                {errors.status && (
                  <span className="error-text">{errors.status}</span>
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
              <h3>
                {showRecycleBin
                  ? "Quality Notifications - Recycle Bin"
                  : "Quality Notifications"}
              </h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>QN No.</th>
                  <th>Type</th>
                  <th>PO No.</th>
                  <th>Lot No.</th>
                  <th>Defect Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.qnNumber}</td>
                    <td>{item.qnType}</td>
                    <td>{item.purchaseOrderNo}</td>
                    <td>{item.inspectionLotNo}</td>
                    <td>{item.defectType}</td>
                    <td>{item.status}</td>
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
                          {item.status !== "COMPLETED" && (
                            <button
                              className="action-complete"
                              onClick={() => markCompleted(item.id)}
                            >
                              Complete
                            </button>
                          )}
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