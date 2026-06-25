// mm/inspection/frontend/src/pages/FinalInspectionPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/qc/Sidebar";
import Header from "../components/qc/Header";
import "./Pagestyles.css";

const BASE_URL = "http://localhost:5003/api";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function FinalInspectionPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const inProcessId = query.get("inProcessId");

  const [items, setItems] = useState([]);
  const [binItems, setBinItems] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    materialCode: "",
    productionPlant: "",
    orderType: "",
    orderQuantity: "",
    orderDate: "",
    planCode: ""
  });

  const [errors, setErrors] = useState({
    materialCode: "",
    productionPlant: "",
    orderType: "",
    orderQuantity: "",
    orderDate: "",
    planCode: ""
  });

  const cleanCode = v =>
    (v || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  const loadData = async () => {
    try {
      const [active, bin] = await Promise.all([
        axios.get(`${BASE_URL}/final-inspections`),
        axios.get(`${BASE_URL}/final-inspections/recycle-bin`)
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

  // prefill from In-Process Inspection if id present
  useEffect(() => {
    const loadFromInProcess = async () => {
      if (!inProcessId) return;
      try {
        const res = await axios.get(
          `${BASE_URL}/in-process-inspections/${inProcessId}`
        );
        setForm(prev => ({
          ...prev,
          materialCode: cleanCode(res.data.materialCode || ""),
          productionPlant: cleanCode(res.data.productionPlant || "")
        }));
      } catch (err) {
        console.error("Load from In-Process error:", err);
      }
    };
    loadFromInProcess();
  }, [inProcessId]);

  const handleChange = e => {
    const { name, value } = e.target;
    let newValue = value;

    // code-like fields: uppercase + restrict
    if (["materialCode", "productionPlant", "orderType", "planCode"].includes(name)) {
      newValue = value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    }

    // numeric for quantity
    if (name === "orderQuantity") {
      const cleaned = value.replace(/[^0-9.\-]/g, "");
      let result = cleaned;
      const firstMinus = result.indexOf("-");
      if (firstMinus > 0) {
        result = result.replace(/-/g, "");
      }
      const parts = result.split(".");
      if (parts.length > 2) {
        result = parts[0] + "." + parts.slice(1).join("");
      }
      newValue = result;
    }

    if (Object.prototype.hasOwnProperty.call(errors, name)) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    setForm(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async e => {
  e.preventDefault();

  const newErrors = {
    materialCode: "",
    productionPlant: "",
    orderType: "",
    orderQuantity: "",
    orderDate: "",
    planCode: ""
  };

  const code = form.materialCode.trim();
  const plant = form.productionPlant.trim();
  const oType = form.orderType.trim();
  const qtyStr = form.orderQuantity.toString().trim();
  const oDate = form.orderDate.trim();
  const plan = form.planCode.trim();

  const codeRegex = /^[A-Z0-9_-]+$/;

  if (!code) {
    newErrors.materialCode = "Material code is required";
  } else if (!codeRegex.test(code)) {
    newErrors.materialCode =
      "Material code must contain only letters, numbers, '_' or '-' (e.g. MC-001)";
  }

  if (!plant) {
    newErrors.productionPlant = "Production plant is required";
  } else if (!codeRegex.test(plant)) {
    newErrors.productionPlant =
      "Production plant must contain only letters, numbers, '_' or '-'";
  }

  if (!oType) {
    newErrors.orderType = "Order type is required";
  } else if (!codeRegex.test(oType)) {
    newErrors.orderType =
      "Order type must contain only letters, numbers, '_' or '-'";
  }

  // quantity: required, number, > 0
  if (!qtyStr) {
    newErrors.orderQuantity = "Order quantity is required";
  } else {
    const qty = Number(qtyStr);
    if (Number.isNaN(qty)) {
      newErrors.orderQuantity = "Order quantity must be a valid number";
    } else if (qty <= 0) {
      newErrors.orderQuantity =
        "Order quantity must be greater than 0 (no negative or zero)";
    }
  }

  if (!oDate) {
    newErrors.orderDate = "Order date is required";
  }

  if (!plan) {
    newErrors.planCode = "Plan code is required";
  } else if (!codeRegex.test(plan)) {
    newErrors.planCode =
      "Plan code must contain only letters, numbers, '_' or '-'";
  }

  const hasErrors = Object.values(newErrors).some(msg => msg);
  if (hasErrors) {
    setErrors(newErrors);
    return;
  }

  const payload = {
    materialCode: form.materialCode,
    productionPlant: form.productionPlant,
    orderType: form.orderType,
    orderQuantity: Number(form.orderQuantity),
    orderDate: form.orderDate,
    planCode: form.planCode
  };

  try {
    if (editingId) {
      await axios.put(
        `${BASE_URL}/final-inspections/${editingId}`,
        payload
      );
    } else {
      await axios.post(`${BASE_URL}/final-inspections`, payload);
    }
  } catch (err) {
    console.error("Save Error:", err.response?.data || err);
    alert(err.response?.data?.message || "Error saving record");
    return;
  }

  setForm({
    materialCode: "",
    productionPlant: "",
    orderType: "",
    orderQuantity: "",
    orderDate: "",
    planCode: ""
  });
  setEditingId(null);
  loadData();
};

  const handleEdit = item => {
    setEditingId(item.id);
    setForm({
      materialCode: cleanCode(item.materialCode),
      productionPlant: cleanCode(item.productionPlant),
      orderType: cleanCode(item.orderType),
      orderQuantity:
        item.orderQuantity != null ? String(item.orderQuantity) : "",
      orderDate: item.orderDate ? item.orderDate.slice(0, 10) : "",
      planCode: cleanCode(item.planCode)
    });
    setErrors({
      materialCode: "",
      productionPlant: "",
      orderType: "",
      orderQuantity: "",
      orderDate: "",
      planCode: ""
    });
  };

  const handleSoftDelete = async id => {
    await axios.delete(`${BASE_URL}/final-inspections/${id}`);
    loadData();
  };

  const handleRestore = async id => {
    await axios.post(`${BASE_URL}/final-inspections/${id}/restore`);
    loadData();
  };

  const handleHardDelete = async id => {
    await axios.delete(`${BASE_URL}/final-inspections/${id}/hard-delete`);
    loadData();
  };

  const list = showRecycleBin ? binItems : items;

  return (
    <div className="qc-master-page">
      <Sidebar />
      <div className="qc-master-content">
        <Header title="Final Inspection - Production Order" />

        <div className="qc-master-body">
          {/* Form card */}
          <div className="qc-master-form-card">
            <h3>
              {editingId ? "Edit Final Inspection" : "Create Final Inspection"}
            </h3>

            <form onSubmit={handleSubmit} className="qc-form">
              <div className="form-row">
                <label>Material Code</label>
                <input
                  name="materialCode"
                  value={form.materialCode}
                  onChange={handleChange}
                  placeholder="Enter material code"
                />
                {errors.materialCode && (
                  <span className="error-text">{errors.materialCode}</span>
                )}
              </div>

              <div className="form-row">
                <label>Production Plant</label>
                <input
                  name="productionPlant"
                  value={form.productionPlant}
                  onChange={handleChange}
                  placeholder="Enter production plant"
                />
                {errors.productionPlant && (
                  <span className="error-text">{errors.productionPlant}</span>
                )}
              </div>

              <div className="form-row">
                <label>Production Order Type</label>
                <input
                  name="orderType"
                  value={form.orderType}
                  onChange={handleChange}
                  placeholder="Enter order type"
                />
                {errors.orderType && (
                  <span className="error-text">{errors.orderType}</span>
                )}
              </div>

              <div className="form-row">
                <label>Production Order Quantity</label>
                <input
                  type="number"
                  step="0.001"
                  name="orderQuantity"
                  value={form.orderQuantity}
                  onChange={handleChange}
                  placeholder="Enter quantity"
                />
                {errors.orderQuantity && (
                  <span className="error-text">{errors.orderQuantity}</span>
                )}
              </div>

              <div className="form-row">
                <label>Current Date</label>
                <input
                  type="date"
                  name="orderDate"
                  value={form.orderDate}
                  onChange={handleChange}
                />
                {errors.orderDate && (
                  <span className="error-text">{errors.orderDate}</span>
                )}
              </div>

              <div className="form-row">
                <label>Plan Code</label>
                <input
                  name="planCode"
                  value={form.planCode}
                  onChange={handleChange}
                  placeholder="Enter plan code"
                />
                {errors.planCode && (
                  <span className="error-text">{errors.planCode}</span>
                )}
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
              <h3>{showRecycleBin ? "Recycle Bin" : "Final Inspection List"}</h3>
              <button onClick={() => setShowRecycleBin(v => !v)}>
                {showRecycleBin ? "Show Active" : "Show Recycle Bin"}
              </button>
            </div>

            <table className="qc-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Material Code</th>
                  <th>Production Plant</th>
                  <th>Order Type</th>
                  <th>Quantity</th>
                  <th>Order Date</th>
                  <th>Plan Code</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.materialCode}</td>
                    <td>{item.productionPlant}</td>
                    <td>{item.orderType}</td>
                    <td>{item.orderQuantity}</td>
                    <td>{item.orderDate && item.orderDate.slice(0, 10)}</td>
                    <td>{item.planCode}</td>
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