import React, { useState, useEffect } from "react";
import stockTransferApi from "../api/stockTransferApi";
import stockApi from "../api/stockApi";
import materialApi from "../api/materialApi";

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  marginBottom: "16px"
};

const formRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
  flexWrap: "wrap"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1,
  minWidth: "150px"
};

const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db"
};

const inputErrorStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "2px solid #dc2626",
  backgroundColor: "#fef2f2"
};

const errorTextStyle = {
  color: "#dc2626",
  fontSize: "11px",
  marginTop: "4px"
};

const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer"
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6b7280"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px"
};

const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb"
};

const tdStyle = {
  padding: "6px 8px",
  borderBottom: "1px solid #f3f4f6"
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function StockTransferPage() {
  const [header, setHeader] = useState({
    from_location_id: "",
    to_location_id: "",
    transfer_date: "",
    ref_no: ""
  });

  const [items, setItems] = useState([
    { material_id: "", qty: "", unit_cost: "" }
  ]);

  const [stockRows, setStockRows] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastTransferFilter, setLastTransferFilter] = useState(null);

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Remove special characters from reference number
    if (name === "ref_no") {
      processedValue = value.replace(/[^A-Za-z0-9\s-]/g, '');
    }
    
    setHeader((h) => ({ ...h, [name]: processedValue }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    let processedValue = value;
    
    // For quantity, ensure positive numbers
    if (field === "qty") {
      if (value < 0) processedValue = "";
    }
    
    // For unit cost, ensure non-negative
    if (field === "unit_cost") {
      if (value < 0) processedValue = "";
    }
    
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: processedValue } : it))
    );
    
    // Clear error for this item field
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: "" }));
    }
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      { material_id: "", qty: "", unit_cost: "" }
    ]);
  };

  const removeRow = (index) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem("lastTransferFilter");
    setLastTransferFilter(null);
  };

  const loadStockSummary = async () => {
    try {
      setLoadingStock(true);
      const [stockRes, matRes] = await Promise.all([
        stockApi.getSummary(),
        materialApi.getAll()
      ]);
      setStockRows(stockRes.data);
      setMaterials(matRes.data);
    } catch (e) {
      console.error("LOAD STOCK ERROR", e);
    } finally {
      setLoadingStock(false);
    }
  };

  // Load stock when page first opens
  useEffect(() => {
    loadStockSummary();
    const saved = localStorage.getItem("lastTransferFilter");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLastTransferFilter(parsed);
      } catch (e) {
        console.error("PARSE FILTER ERROR", e);
        clearLocalStorage();
      }
    }
  }, []);

  // Validation functions
  const validateNotPastDate = (date, fieldName) => {
    if (!date) return "";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return `${fieldName} cannot be a past date`;
    }
    return "";
  };

  const validateLocationId = (id, fieldName) => {
    if (!id) return `${fieldName} is required`;
    const num = Number(id);
    if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`;
    return "";
  };

  const validateMaterialId = (materialId, fieldName) => {
    if (!materialId) return `${fieldName} is required`;
    const num = Number(materialId);
    if (isNaN(num) || num <= 0) return `${fieldName} must be a positive number`;
    
    // Check if material exists in materials table
    const materialExists = materials.some(m => m.id === num);
    if (!materialExists) {
      return `${fieldName} ${num} does not exist. Available: ${materials.map(m => `${m.id} (${m.name})`).join(', ')}`;
    }
    return "";
  };

  const validateQuantity = (qty, availableStock, fieldName) => {
    if (!qty && qty !== 0) return `${fieldName} is required`;
    const num = Number(qty);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num <= 0) return `${fieldName} must be greater than 0`;
    if (availableStock !== undefined && availableStock >= 0 && num > availableStock) {
      return `Insufficient stock. Available: ${availableStock}, Requested: ${num}`;
    }
    return "";
  };

  const validateUnitCost = (cost) => {
    if (!cost) return "";
    const num = Number(cost);
    if (isNaN(num)) return "Unit Cost must be a number";
    if (num < 0) return "Unit Cost cannot be negative";
    return "";
  };

  const validateReferenceNo = (refNo) => {
    if (!refNo) return "";
    const regex = /^[A-Za-z0-9\s-]+$/;
    if (!regex.test(refNo)) {
      return "Reference No should only contain letters, numbers, spaces and hyphens";
    }
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate From Location
    const fromLocationError = validateLocationId(header.from_location_id, "From Location");
    if (fromLocationError) newErrors.from_location_id = fromLocationError;
    
    // Validate To Location
    const toLocationError = validateLocationId(header.to_location_id, "To Location");
    if (toLocationError) newErrors.to_location_id = toLocationError;
    
    // Check if from and to locations are same
    if (header.from_location_id && header.to_location_id && 
        Number(header.from_location_id) === Number(header.to_location_id)) {
      newErrors.to_location_id = "To Location cannot be same as From Location";
    }
    
    // Validate Transfer Date
    if (!header.transfer_date) {
      newErrors.transfer_date = "Transfer Date is required";
    } else {
      const pastDateError = validateNotPastDate(header.transfer_date, "Transfer Date");
      if (pastDateError) newErrors.transfer_date = pastDateError;
    }
    
    // Validate Reference No
    const refNoError = validateReferenceNo(header.ref_no);
    if (refNoError) newErrors.ref_no = refNoError;
    
    // Validate items
    let hasValidItem = false;
    items.forEach((item, idx) => {
      if (item.material_id && item.qty) {
        hasValidItem = true;
        
        // Validate material exists
        const materialError = validateMaterialId(item.material_id, "Material");
        if (materialError) {
          newErrors[`item_${idx}_material_id`] = materialError;
        }
        
        // Check available stock for this material at from location
        let availableStock = -1;
        if (materials.some(m => m.id === Number(item.material_id))) {
          availableStock = stockRows
            .filter(r => r.material_id === Number(item.material_id) && r.location_id === Number(header.from_location_id))
            .reduce((sum, r) => sum + (r.qty || 0), 0);
        }
        
        // Validate quantity
        const qtyError = validateQuantity(item.qty, availableStock, "Quantity");
        if (qtyError) newErrors[`item_${idx}_qty`] = qtyError;
        
        // Validate unit cost
        const costError = validateUnitCost(item.unit_cost);
        if (costError) newErrors[`item_${idx}_unit_cost`] = costError;
      } else if (item.material_id || item.qty) {
        if (!item.material_id) newErrors[`item_${idx}_material_id`] = "Material is required";
        if (!item.qty) newErrors[`item_${idx}_qty`] = "Quantity is required";
      }
    });
    
    if (!hasValidItem) {
      newErrors.general = "At least one item with material and quantity is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fix the validation errors before submitting");
      return;
    }
    
    try {
      const payload = {
        header: {
          ...header,
          from_location_id: Number(header.from_location_id),
          to_location_id: Number(header.to_location_id),
          transfer_date: header.transfer_date
        },
        items: items
          .filter((it) => it.material_id && it.qty)
          .map((it) => ({
            material_id: Number(it.material_id),
            qty: Number(it.qty),
            unit_cost: Number(it.unit_cost) || 0
            // No batch_id - it will be NULL in the database
          }))
      };

      await stockTransferApi.create(payload);
      alert("✅ Stock transfer posted successfully");

      const lastFrom = Number(header.from_location_id);
      const lastTo = Number(header.to_location_id);
      const lastMaterial = Number(items[0].material_id);

      setHeader({
        from_location_id: "",
        to_location_id: "",
        transfer_date: "",
        ref_no: ""
      });
      setItems([{ material_id: "", qty: "", unit_cost: "" }]);
      setErrors({});

      await loadStockSummary();

      const filter = {
        from_location_id: lastFrom,
        to_location_id: lastTo,
        material_id: lastMaterial
      };
      setLastTransferFilter(filter);
      localStorage.setItem("lastTransferFilter", JSON.stringify(filter));
    } catch (err) {
      console.error("TRANSFER POST ERROR", err);
      alert("Error posting transfer: " + (err.response?.data?.message || err.message));
    }
  };

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? inputErrorStyle : inputStyle;
  };

  // Get material name by ID
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : "";
  };

  const filteredRows =
    lastTransferFilter && stockRows.length
      ? stockRows.filter(
          (r) =>
            r.material_id === lastTransferFilter.material_id &&
            (r.location_id === lastTransferFilter.from_location_id ||
              r.location_id === lastTransferFilter.to_location_id)
        )
      : stockRows;

  // Get available materials for dropdown
  const materialOptions = materials.filter(m => m.id && m.id > 0).map(m => ({ id: m.id, name: m.name, uom: m.uom }));

  return (
    <div>
      <div style={titleStyle}>Stock Transfer Between Locations</div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              From Location ID *
              <input
                style={getInputStyle("from_location_id")}
                name="from_location_id"
                type="number"
                min="1"
                value={header.from_location_id}
                onChange={handleHeaderChange}
                placeholder="Enter location ID (e.g., 1, 2, 3)"
                required
              />
              {errors.from_location_id && <div style={errorTextStyle}>{errors.from_location_id}</div>}
            </label>
            <label style={labelStyle}>
              To Location ID *
              <input
                style={getInputStyle("to_location_id")}
                name="to_location_id"
                type="number"
                min="1"
                value={header.to_location_id}
                onChange={handleHeaderChange}
                placeholder="Enter location ID (e.g., 1, 2, 3)"
                required
              />
              {errors.to_location_id && <div style={errorTextStyle}>{errors.to_location_id}</div>}
            </label>
            <label style={labelStyle}>
              Transfer Date *
              <input
                style={getInputStyle("transfer_date")}
                type="date"
                name="transfer_date"
                value={header.transfer_date}
                onChange={handleHeaderChange}
                max={getTodayDate()}
                required
              />
              {errors.transfer_date && <div style={errorTextStyle}>{errors.transfer_date}</div>}
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Reference No
              <input
                style={getInputStyle("ref_no")}
                name="ref_no"
                value={header.ref_no}
                onChange={handleHeaderChange}
                placeholder="Letters, numbers, spaces and hyphens only"
              />
              {errors.ref_no && <div style={errorTextStyle}>{errors.ref_no}</div>}
            </label>
          </div>

          <div style={{ fontSize: "13px", fontWeight: 500, margin: "8px 0" }}>
            Lines *
          </div>

          {items.map((it, idx) => {
            const materialId = Number(it.material_id);
            const materialExists = materials.some(m => m.id === materialId);
            const availableStock = materialExists ? stockRows
              .filter(r => r.material_id === materialId && r.location_id === Number(header.from_location_id))
              .reduce((sum, r) => sum + (r.qty || 0), 0) : -1;
            
            return (
              <div key={idx} style={{ marginBottom: "16px", padding: "8px", border: "1px solid #e5e7eb", borderRadius: "4px" }}>
                <div style={formRowStyle}>
                  <label style={labelStyle}>
                    Material *
                    <select
                      style={getInputStyle(`item_${idx}_material_id`)}
                      value={it.material_id}
                      onChange={(e) =>
                        handleItemChange(idx, "material_id", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Material</option>
                      {materialOptions.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.id} - {m.name} ({m.uom})
                        </option>
                      ))}
                    </select>
                    {errors[`item_${idx}_material_id`] && <div style={errorTextStyle}>{errors[`item_${idx}_material_id`]}</div>}
                  </label>
                  <label style={labelStyle}>
                    Qty *
                    <input
                      style={getInputStyle(`item_${idx}_qty`)}
                      type="number"
                      step="1"
                      min="1"
                      value={it.qty}
                      onChange={(e) =>
                        handleItemChange(idx, "qty", e.target.value)
                      }
                      placeholder=" 0"
                      required
                    />
                    {errors[`item_${idx}_qty`] && <div style={errorTextStyle}>{errors[`item_${idx}_qty`]}</div>}
                    {it.material_id && header.from_location_id && materialExists && availableStock >= 0 && (
                      <div style={{ fontSize: "10px", color: availableStock > 0 ? "#059669" : "#dc2626", marginTop: "2px" }}>
                        Available at source: {availableStock} units
                      </div>
                    )}
                    {it.material_id && !materialExists && (
                      <div style={{ fontSize: "10px", color: "#dc2626", marginTop: "2px" }}>
                        ⚠️ Material ID {it.material_id} does not exist. Please select from dropdown.
                      </div>
                    )}
                  </label>
                  <label style={labelStyle}>
                    Unit Cost
                    <input
                      style={getInputStyle(`item_${idx}_unit_cost`)}
                      type="number"
                      step="0.01"
                      min="0"
                      value={it.unit_cost}
                      onChange={(e) =>
                        handleItemChange(idx, "unit_cost", e.target.value)
                      }
                      placeholder="Optional"
                    />
                    {errors[`item_${idx}_unit_cost`] && <div style={errorTextStyle}>{errors[`item_${idx}_unit_cost`]}</div>}
                  </label>
                  {items.length > 1 && (
                    <button
                      type="button"
                      style={{
                        ...secondaryButtonStyle,
                        marginTop: "22px",
                        padding: "6px 8px"
                      }}
                      onClick={() => removeRow(idx)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {errors.general && (
            <div style={{ ...errorTextStyle, marginBottom: "8px" }}>{errors.general}</div>
          )}

          <button
            type="button"
            style={{ ...secondaryButtonStyle, marginRight: "8px" }}
            onClick={addRow}
          >
            + Add Line
          </button>

          <button type="submit" style={buttonStyle}>
            Post Transfer
          </button>
        </form>
      </div>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "14px", fontWeight: 500 }}>
            Current Stock Summary (Last Transfer)
          </div>
          {lastTransferFilter && (
            <button
              style={{
                padding: "4px 8px",
                fontSize: "11px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                backgroundColor: "#fee2e2",
                cursor: "pointer",
                color: "#dc2626"
              }}
              onClick={clearLocalStorage}
            >
              Clear Filter
            </button>
          )}
        </div>
        {loadingStock ? (
          <div style={{ fontSize: "13px" }}>Loading...</div>
        ) : filteredRows.length === 0 ? (
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            {lastTransferFilter ? "No stock data for the selected filter." : "Complete a transfer to see filtered results."}
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Material ID</th>
                <th style={thStyle}>Material Name</th>
                <th style={thStyle}>Location ID</th>
                <th style={thStyle}>Batch ID</th>
                <th style={thStyle}>Qty</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => {
                const isFrom =
                  lastTransferFilter &&
                  r.location_id === lastTransferFilter.from_location_id;
                const isTo =
                  lastTransferFilter &&
                  r.location_id === lastTransferFilter.to_location_id;
                const materialName = getMaterialName(r.material_id);

                return (
                  <tr
                    key={r.material_id + "-" + r.location_id + "-" + (r.batch_id || "NB")}
                    style={{
                      backgroundColor: isFrom
                        ? "#fee2e2"
                        : isTo
                        ? "#dcfce7"
                        : "white"
                    }}
                  >
                    <td style={tdStyle}>{r.material_id}</td>
                    <td style={tdStyle}>{materialName || "-"}</td>
                    <td style={tdStyle}>
                      {r.location_id}
                      {isFrom ? " (Source)" : isTo ? " (Destination)" : ""}
                    </td>
                    <td style={tdStyle}>{r.batch_id || "-"}</td>
                    <td style={tdStyle}>{r.qty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}