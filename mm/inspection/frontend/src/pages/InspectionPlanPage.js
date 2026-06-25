// mm/inspection/frontend/src/pages/InspectionPlanPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const CREATION_BASE_URL = "http://localhost:5002/api"; // MM materials
const BASE_URL = "http://localhost:5003/api";          // Inspection backend

export default function InspectionPlanPage() {
  const [plans, setPlans] = useState([]);
  const [binPlans, setBinPlans] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const [form, setForm] = useState({
    materialCode: "",
    plantCode: "",
    groupCode: "",
    vendorCode: "",
    validFrom: "",
    deletionFlag: "0", // 0 = active, 1 = flagged
    usageCode: "5",
    statusCode: "4",
    planningGroup: "",
    fromLotSize: "",
    toLotSize: ""
  });

  const [errors, setErrors] = useState({});

  const loadData = async () => {
    try {
      const [activeRes, binRes, matRes] = await Promise.all([
        axios.get(`${BASE_URL}/inspection-plans`),
        axios.get(`${BASE_URL}/inspection-plans/recycle-bin`),
        axios.get(`${CREATION_BASE_URL}/materials`)
      ]);

      setPlans(activeRes.data || []);
      setBinPlans(binRes.data || []);
      setMaterials(matRes.data || []);
    } catch (err) {
      console.error("InspectionPlan loadData error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    // Optional: force uppercase for codes
    if (
      [
        "materialCode",
        "plantCode",
        "groupCode",
        "vendorCode",
        "planningGroup"
      ].includes(name)
    ) {
      newValue = value.toUpperCase();
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Regex rules
    const codeRegex = /^[A-Z0-9_-]+$/;      // for plant/group/vendor/planning group
    const materialRegex = /^[A-Z0-9_-]+$/;  // material code
    const usageStatusRegex = /^[0-9]+$/;    // numeric codes for usage/status

    // Material
    if (!form.materialCode.trim()) {
      newErrors.materialCode = "Material is required";
    } else if (!materialRegex.test(form.materialCode.trim())) {
      newErrors.materialCode =
        "Material can contain letters, numbers, _ and - only";
    }

    // Plant
    if (!form.plantCode.trim()) {
      newErrors.plantCode = "Plant is required";
    } else if (!codeRegex.test(form.plantCode.trim())) {
      newErrors.plantCode =
        "Plant can contain letters, numbers, _ and - only (no spaces or symbols like @)";
    }

    // Group (optional)
    if (form.groupCode && !codeRegex.test(form.groupCode.trim())) {
      newErrors.groupCode =
        "Group can contain letters, numbers, _ and - only";
    }

    // Vendor (optional)
    if (form.vendorCode && !codeRegex.test(form.vendorCode.trim())) {
      newErrors.vendorCode =
        "Vendor can contain letters, numbers, _ and - only";
    }

    // Valid from
    if (!form.validFrom) {
      newErrors.validFrom = "Valid from is required";
    }

    // Usage code
    if (form.usageCode && !usageStatusRegex.test(form.usageCode.trim())) {
      newErrors.usageCode = "Usage must be numeric (e.g. 5)";
    }

    // Status code
    if (form.statusCode && !usageStatusRegex.test(form.statusCode.trim())) {
      newErrors.statusCode = "Status must be numeric (e.g. 4)";
    }

    // Planning group
    if (form.planningGroup && !codeRegex.test(form.planningGroup.trim())) {
      newErrors.planningGroup =
        "Planning group can contain letters, numbers, _ and - only";
    }

    // Lot size numeric checks (>= 0)
    const lotFields = ["fromLotSize", "toLotSize"];
    lotFields.forEach(field => {
      const value = form[field];
      if (value !== "" && isNaN(Number(value))) {
        newErrors[field] = "Must be a number";
      } else if (value !== "" && Number(value) < 0) {
        newErrors[field] = "Cannot be negative";
      }
    });

    // Relationship: fromLotSize <= toLotSize (if both present)
    const fromLot =
      form.fromLotSize === "" ? null : Number(form.fromLotSize);
    const toLot =
      form.toLotSize === "" ? null : Number(form.toLotSize);

    if (fromLot !== null && toLot !== null && toLot < fromLot) {
      newErrors.toLotSize = "To lot size cannot be less than from lot size";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    if (!form.materialCode || !form.plantCode || !form.validFrom) return;

    const payload = {
      materialCode: form.materialCode,
      plantCode: form.plantCode,
      groupCode: form.groupCode,
      vendorCode: form.vendorCode,
      validFrom: form.validFrom,
      deletionFlag: form.deletionFlag,
      usageCode: form.usageCode,
      statusCode: form.statusCode,
      planningGroup: form.planningGroup,
      fromLotSize:
        form.fromLotSize === "" ? null : Number(form.fromLotSize),
      toLotSize:
        form.toLotSize === "" ? null : Number(form.toLotSize)
    };

    if (editingId) {
      await axios.put(
        `${BASE_URL}/inspection-plans/${editingId}`,
        payload
      );
    } else {
      await axios.post(`${BASE_URL}/inspection-plans`, payload);
    }

    setForm({
      materialCode: "",
      plantCode: "",
      groupCode: "",
      vendorCode: "",
      validFrom: "",
      deletionFlag: "0",
      usageCode: "5",
      statusCode: "4",
      planningGroup: "",
      fromLotSize: "",
      toLotSize: ""
    });
    setEditingId(null);
    setErrors({});
    await loadData();
  };

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      materialCode: item.material_code || item.materialCode || "",
      plantCode: item.plant_code || item.plantCode || "",
      groupCode: item.group_code || item.groupCode || "",
      vendorCode: item.vendor_code || item.vendorCode || "",
      validFrom: (item.valid_from || item.validFrom || "").slice(0, 10),
      deletionFlag:
        item.deletion_flag != null ? String(item.deletion_flag) : "0",
      usageCode: item.usage_code || item.usageCode || "5",
      statusCode: item.status_code || item.statusCode || "4",
      planningGroup: item.planning_group || item.planningGroup || "",
      fromLotSize:
        item.from_lot_size != null ? String(item.from_lot_size) : "",
      toLotSize:
        item.to_lot_size != null ? String(item.to_lot_size) : ""
    });
    setErrors({});
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/inspection-plans/${id}`);
    await loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/inspection-plans/${id}/restore`);
    await loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(
      `${BASE_URL}/inspection-plans/${id}/hard-delete`
    );
    await loadData();
  };

  const list = showRecycleBin ? binPlans : plans;

  return (
    <div className="qc-master-page">
      <Sidebar />

      <div className="qc-master-content">
        <Header title="Inspection Plan" />

        <div className="qc-master-body">
          {/* FORM CARD */}
          <div className="qc-master-form-card">
            <h3>
              {editingId
                ? "Edit Inspection Plan"
                : "Create Inspection Plan"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              {/* Row 1: Material + Plant */}
              <div className="form-row">
                <label>Material code</label>
                <select
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                >
                  <option value="">Select material...</option>
                  {materials.map(m => (
                    <option
                      key={m.id}
                      value={m.material_number || m.code || m.id}
                    >
                      {(m.material_number || m.code || m.id) +
                        " - " +
                        (m.name || "")}
                    </option>
                  ))}
                </select>
                {errors.materialCode && (
                  <span className="error-text">
                    {errors.materialCode}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>Plant</label>
                <input
                  name="plantCode"
                  value={form.plantCode}
                  onChange={handleChange}
                  placeholder="Plant"
                  required
                />
                {errors.plantCode && (
                  <span className="error-text">{errors.plantCode}</span>
                )}
              </div>

              {/* Row 2: Group + Vendor */}
              <div className="form-row">
                <label>Group</label>
                <input
                  name="groupCode"
                  value={form.groupCode}
                  onChange={handleChange}
                  placeholder="Task list group"
                />
                {errors.groupCode && (
                  <span className="error-text">{errors.groupCode}</span>
                )}
              </div>

              <div className="form-row">
                <label>Vendor</label>
                <input
                  name="vendorCode"
                  value={form.vendorCode}
                  onChange={handleChange}
                  placeholder="Vendor"
                />
                {errors.vendorCode && (
                  <span className="error-text">{errors.vendorCode}</span>
                )}
              </div>

              {/* Row 3: Valid from + Deletion flag */}
              <div className="form-row">
                <label>Valid from (key date)</label>
                <input
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                  required
                />
                {errors.validFrom && (
                  <span className="error-text">{errors.validFrom}</span>
                )}
              </div>

              <div className="form-row">
                <label>Deletion flag</label>
                <select
                  name="deletionFlag"
                  value={form.deletionFlag}
                  onChange={handleChange}
                >
                  <option value="0">Active</option>
                  <option value="1">Flagged for deletion</option>
                </select>
              </div>

              {/* Row 4: Usage + Status */}
              <div className="form-row">
                <label>Usage</label>
                <input
                  name="usageCode"
                  value={form.usageCode}
                  onChange={handleChange}
                  placeholder="5"
                />
                {errors.usageCode && (
                  <span className="error-text">{errors.usageCode}</span>
                )}
              </div>

              <div className="form-row">
                <label>Status</label>
                <input
                  name="statusCode"
                  value={form.statusCode}
                  onChange={handleChange}
                  placeholder="4 (Released)"
                />
                {errors.statusCode && (
                  <span className="error-text">{errors.statusCode}</span>
                )}
              </div>

              {/* Row 5: Planning group + From lot size */}
              <div className="form-row">
                <label>Planning group</label>
                <input
                  name="planningGroup"
                  value={form.planningGroup}
                  onChange={handleChange}
                  placeholder="Planner group"
                />
                {errors.planningGroup && (
                  <span className="error-text">
                    {errors.planningGroup}
                  </span>
                )}
              </div>

              <div className="form-row">
                <label>From lot size</label>
                <input
                  type="number"
                  name="fromLotSize"
                  min="0"
                  value={form.fromLotSize}
                  onChange={handleChange}
                />
                {errors.fromLotSize && (
                  <span className="error-text">
                    {errors.fromLotSize}
                  </span>
                )}
              </div>

              {/* Row 6: To lot size */}
              <div className="form-row">
                <label>To lot size</label>
                <input
                  type="number"
                  name="toLotSize"
                  min="0"
                  value={form.toLotSize}
                  onChange={handleChange}
                />
                {errors.toLotSize && (
                  <span className="error-text">{errors.toLotSize}</span>
                )}
              </div>

              <div className="form-row-full">
                <button type="submit">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>

          {/* LIST */}
          <div className="qc-master-list">
            <div className="qc-master-list-header">
              <h3>
                {showRecycleBin
                  ? "Inspection Plans - Recycle Bin"
                  : "Inspection Plans"}
              </h3>

              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th>Material</th>
                  <th>Plant</th>
                  <th>Group</th>
                  <th>Vendor</th>
                  <th>Valid from</th>
                  <th>Deletion flag</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Planning group</th>
                  <th>From lot size</th>
                  <th>To lot size</th>
                  {!showRecycleBin && <th>Actions</th>}
                  {showRecycleBin && <th>Deleted At</th>}
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td className="col-id">{item.id}</td>
                    <td>{item.material_code || item.materialCode}</td>
                    <td>{item.plant_code || item.plantCode}</td>
                    <td>{item.group_code || item.groupCode}</td>
                    <td>{item.vendor_code || item.vendorCode}</td>
                    <td>
                      {(item.valid_from || item.validFrom || "")
                        .toString()
                        .slice(0, 10)}
                    </td>
                    <td>
                      {item.deletion_flag != null
                        ? String(item.deletion_flag)
                        : ""}
                    </td>
                    <td>{item.usage_code || item.usageCode}</td>
                    <td>{item.status_code || item.statusCode}</td>
                    <td>
                      {item.planning_group || item.planningGroup}
                    </td>
                    <td>
                      {item.from_lot_size != null
                        ? item.from_lot_size
                        : ""}
                    </td>
                    <td>
                      {item.to_lot_size != null ? item.to_lot_size : ""}
                    </td>

                    {!showRecycleBin && (
                      <td>
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
                      </td>
                    )}
                    {showRecycleBin && (
                      <td>
                        {item.deleted_at || item.deletedAt || "-"}
                        <div style={{ marginTop: 4 }}>
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
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={showRecycleBin ? 13 : 13}
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