import React, { useEffect, useState, useMemo } from "react";
import poApi from "../api/poApi";
import vendorApi from "../api/vendorApi";
import materialApi from "../api/materialApi";

// Helper functions (same as before)
const toLocalDateString = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatAmount = (amount) => {
  if (!amount && amount !== 0) return "0";
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toFixed(2).replace(/\.00$/, "");
};

const formatAmountWithDecimals = (amount) => {
  if (!amount && amount !== 0) return "0.00";
  const num = Number(amount);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Batch generation helper
const generateBatchNo = (material, index) => {
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const sku = material?.part_number || material?.material_code || "MAT";
  const seq = String(index + 1).padStart(3, "0");
  return `${sku}-${dateStr}-${seq}`;
};

// Styles (same as before)
const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827",
};
const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  marginBottom: "16px",
};
const formRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
  flexWrap: "wrap",
};
const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1,
  minWidth: "150px",
};
const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db",
};
const inputErrorStyle = {
  ...inputStyle,
  border: "2px solid #dc2626",
  backgroundColor: "#fef2f2",
};
const errorTextStyle = { color: "#dc2626", fontSize: "11px", marginTop: "4px" };
const buttonStyle = {
  marginTop: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  cursor: "pointer",
};
const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6b7280",
  marginLeft: "8px",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
};
const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  backgroundColor: "#f3f4f6",
  color: "#374151",
  borderBottom: "2px solid #e5e7eb",
};
const tdStyle = { padding: "6px 8px", borderBottom: "1px solid #f3f4f6" };
const summaryLabelStyle = {
  fontSize: "13px",
  fontWeight: "500",
  color: "#374151",
  textAlign: "right",
  padding: "4px 8px",
};
const summaryValueStyle = {
  fontSize: "13px",
  fontWeight: "600",
  color: "#111827",
  padding: "4px 8px",
  textAlign: "right",
};

export default function POPage() {
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pos, setPOs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [viewPO, setViewPO] = useState(null);

  // Header state – source_type always "DIRECT", but kept for potential future use
  const [header, setHeader] = useState({
    po_no: "",
    po_date: "",
    vendor_id: "",
    payment_terms: "",
    currency: "INR",
    po_type: "STOCK",
    status: "OPEN",
    freight_charges: "0",
  });

  // Items state includes batch fields
  const [items, setItems] = useState([
    {
      material_id: "",
      batch_no: "",
      qty: "",
      price: "",
      tax_percent: "",
      expiry_date: "",
      delivery_date: "",
    },
  ]);

  // Totals calculation
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;
    items.forEach((item) => {
      if (item.material_id && item.qty && item.price) {
        const itemTotal = Number(item.qty) * Number(item.price);
        subtotal += itemTotal;
        if (item.tax_percent) {
          totalTax += itemTotal * (Number(item.tax_percent) / 100);
        }
      }
    });
    const freight = Number(header.freight_charges) || 0;
    return {
      subtotal,
      totalTax,
      freight,
      grandTotal: subtotal + totalTax + freight,
    };
  }, [items, header.freight_charges]);

  // Load reference data (vendors, materials)
  const loadRefs = async () => {
    try {
      const [vRes, mRes] = await Promise.all([
        vendorApi.getAll(),
        materialApi.getAll(),
      ]);
      setVendors(vRes.data);
      setMaterials(mRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPOs = async () => {
    try {
      setLoading(true);
      const res = await poApi.getAll();
      setPOs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefs();
    loadPOs();
  }, []);

  // Validation functions (same)
  const validateNoSpecialChars = (value, fieldName) => {
    if (!value) return "";
    const regex = /^[A-Za-z0-9\s]+$/;
    return regex.test(value)
      ? ""
      : `${fieldName} should only contain letters, numbers and spaces`;
  };
  const validateNotPastDate = (date, fieldName) => {
    if (!date) return "";
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? `${fieldName} cannot be a past date` : "";
  };
  const validateQuantity = (qty) => {
    if (!qty && qty !== 0) return "";
    const num = Number(qty);
    if (isNaN(num) || num <= 0) return "Quantity must be greater than 0";
    return "";
  };
  const validatePrice = (price) => {
    if (!price && price !== 0) return "";
    const num = Number(price);
    if (isNaN(num) || num < 0) return "Price cannot be negative";
    return "";
  };
  const validateTax = (tax) => {
    if (!tax && tax !== 0) return "";
    const num = Number(tax);
    if (isNaN(num) || num < 0 || num > 100)
      return "Tax must be between 0 and 100";
    return "";
  };
  const validateFreight = (freight) => {
    if (!freight && freight !== 0) return "";
    const num = Number(freight);
    if (isNaN(num) || num < 0) return "Freight cannot be negative";
    return "";
  };

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "payment_terms")
      processedValue = value.replace(/[^A-Za-z0-9\s]/g, "");
    if (name === "currency")
      processedValue = value.replace(/[^A-Za-z]/g, "").toUpperCase();
    if (name === "freight_charges")
      processedValue = value.replace(/[^0-9.]/g, "");
    setHeader((h) => ({ ...h, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    let processedValue = value;
    if (field === "qty" && value < 0) processedValue = "";
    if (field === "price" && value < 0) processedValue = "";
    if (field === "tax_percent" && value < 0) processedValue = "";
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, [field]: processedValue } : it,
      ),
    );
    if (errors[`item_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`item_${index}_${field}`]: "" }));
    }
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        material_id: "",
        batch_no: "",
        qty: "",
        price: "",
        tax_percent: "",
        expiry_date: "",
        delivery_date: "",
      },
    ]);
  };

  const resetForm = () => {
    setEditingId(null);
    setErrors({});
    setHeader({
      po_no: "",
      po_date: "",
      vendor_id: "",
      payment_terms: "",
      currency: "INR",
      po_type: "STOCK",
      status: "OPEN",
      freight_charges: "0",
    });
    setItems([
      {
        material_id: "",
        batch_no: "",
        qty: "",
        price: "",
        tax_percent: "",
        expiry_date: "",
        delivery_date: "",
      },
    ]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!header.po_date) newErrors.po_date = "PO Date is required";
    else {
      const past = validateNotPastDate(header.po_date, "PO Date");
      if (past) newErrors.po_date = past;
    }
    if (!header.vendor_id) newErrors.vendor_id = "Vendor is required";
    if (header.payment_terms) {
      const err = validateNoSpecialChars(header.payment_terms, "Payment Terms");
      if (err) newErrors.payment_terms = err;
    }
    if (!header.currency) newErrors.currency = "Currency is required";
    else if (header.currency.length !== 3)
      newErrors.currency = "Currency must be 3 letters";
    const freightErr = validateFreight(header.freight_charges);
    if (freightErr) newErrors.freight_charges = freightErr;

    let hasValidItem = false;
    items.forEach((item, idx) => {
      if (item.material_id && item.qty && item.price) {
        hasValidItem = true;
        const qtyErr = validateQuantity(item.qty);
        if (qtyErr) newErrors[`item_${idx}_qty`] = qtyErr;
        const priceErr = validatePrice(item.price);
        if (priceErr) newErrors[`item_${idx}_price`] = priceErr;
        const taxErr = validateTax(item.tax_percent);
        if (taxErr) newErrors[`item_${idx}_tax`] = taxErr;
        if (item.delivery_date) {
          const past = validateNotPastDate(item.delivery_date, "Delivery Date");
          if (past) newErrors[`item_${idx}_delivery_date`] = past;
        }
      } else if (item.material_id || item.qty || item.price) {
        if (!item.material_id)
          newErrors[`item_${idx}_material`] = "Select material";
        if (!item.qty) newErrors[`item_${idx}_qty`] = "Quantity required";
        if (!item.price) newErrors[`item_${idx}_price`] = "Price required";
      }
    });
    if (!hasValidItem)
      newErrors.general = "At least one complete item is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return alert("Please fix validation errors");
    try {
      const payload = {
        header: {
          po_no: header.po_no,
          po_date: header.po_date,
          vendor_id: Number(header.vendor_id),
          payment_terms: header.payment_terms,
          currency: header.currency,
          po_type: header.po_type,
          status: header.status,
          freight_charges: Number(header.freight_charges) || 0,
        },
        items: items
          .filter((i) => i.material_id && i.qty && i.price)
          .map((i) => ({
            material_id: Number(i.material_id),
            batch_no: i.batch_no,
            qty: Number(i.qty),
            price: Number(i.price),
            tax_percent: Number(i.tax_percent) || 0,
            expiry_date: i.expiry_date || null,
            delivery_date: i.delivery_date || null,
          })),
      };
      if (editingId) {
        await poApi.update(editingId, payload);
        alert("PO Updated");
      } else {
        await poApi.create(payload);
        alert("PO Created");
      }
      resetForm();
      loadPOs();
    } catch (e) {
      console.error(e);
      alert("Failed to save PO");
    }
  };

  const editPO = async (po) => {
    setEditingId(po.id);
    setErrors({});
    try {
      const res = await poApi.getById(po.id);
      const { header: hdr, items: its } = res.data;
      setHeader({
        po_no: hdr.po_no || "",
        po_date: toLocalDateString(hdr.po_date),
        vendor_id: hdr.vendor_id || "",
        payment_terms: hdr.payment_terms || "",
        currency: hdr.currency || "INR",
        po_type: hdr.po_type || "STOCK",
        status: hdr.status || "OPEN",
        freight_charges: hdr.freight_charges || "0",
      });
      setItems(
        (its || []).map((it) => ({
          material_id: it.material_id || "",
          batch_no: it.batch_no || "",
          qty: it.qty || "",
          price: it.price || "",
          tax_percent: it.tax_percent || "",
          expiry_date: it.expiry_date ? toLocalDateString(it.expiry_date) : "",
          delivery_date: it.delivery_date
            ? toLocalDateString(it.delivery_date)
            : "",
        })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const deletePO = async (id) => {
    if (!window.confirm("Delete this PO?")) return;
    try {
      await poApi.deleteById(id);
      loadPOs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelEdit = () => resetForm();

  const getInputStyle = (fieldName) =>
    errors[fieldName] ? inputErrorStyle : inputStyle;

  return (
    <div>
      <div style={titleStyle}>Purchase Orders</div>

      {/* Create/Edit Form */}
      <div style={cardStyle}>
        <form onSubmit={handleSubmit}>
          <div style={formRowStyle}>
            <label style={labelStyle}>
              PO No
              <input
                style={inputStyle}
                name="po_no"
                value={header.po_no}
                readOnly
                placeholder="Auto"
              />
            </label>
            <label style={labelStyle}>
              PO Date *
              <input
                style={getInputStyle("po_date")}
                type="date"
                name="po_date"
                value={header.po_date}
                onChange={handleHeaderChange}
                max={getTodayDate()}
                required
              />
              {errors.po_date && (
                <div style={errorTextStyle}>{errors.po_date}</div>
              )}
            </label>
            <label style={labelStyle}>
              Vendor *
              <select
                style={getInputStyle("vendor_id")}
                name="vendor_id"
                value={header.vendor_id}
                onChange={handleHeaderChange}
                required
              >
                <option value="">Select</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.type})
                  </option>
                ))}
              </select>
              {errors.vendor_id && (
                <div style={errorTextStyle}>{errors.vendor_id}</div>
              )}
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Payment Terms
              <input
                style={getInputStyle("payment_terms")}
                name="payment_terms"
                value={header.payment_terms}
                onChange={handleHeaderChange}
                placeholder="Net 30"
              />
              {errors.payment_terms && (
                <div style={errorTextStyle}>{errors.payment_terms}</div>
              )}
            </label>
            <label style={labelStyle}>
              Currency *
              <input
                style={getInputStyle("currency")}
                name="currency"
                value={header.currency}
                onChange={handleHeaderChange}
                maxLength="3"
                placeholder="INR"
              />
              {errors.currency && (
                <div style={errorTextStyle}>{errors.currency}</div>
              )}
            </label>
            <label style={labelStyle}>
              PO Type
              <select
                style={inputStyle}
                name="po_type"
                value={header.po_type}
                onChange={handleHeaderChange}
              >
                <option value="SUB_CONTRACT">Sub Contract</option>
                <option value="CONSUMER">Consumer</option>
                <option value="STOCK">Stock Transfer</option>
                <option value="SERVICE">Service</option>
              </select>
            </label>
            <label style={labelStyle}>
              Status
              <select
                style={inputStyle}
                name="status"
                value={header.status}
                onChange={handleHeaderChange}
              >
                <option value="OPEN">OPEN</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="INVOICED">INVOICED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </label>
          </div>

          <div style={formRowStyle}>
            <label style={labelStyle}>
              Freight Charges
              <input
                style={getInputStyle("freight_charges")}
                name="freight_charges"
                value={header.freight_charges}
                onChange={handleHeaderChange}
                placeholder="0.00"
              />
              {errors.freight_charges && (
                <div style={errorTextStyle}>{errors.freight_charges}</div>
              )}
            </label>
            <div style={{ flex: 1 }}></div>
          </div>

          <h4 style={{ margin: "12px 0 4px" }}>Items *</h4>
          {items.map((it, idx) => (
            <div key={idx} style={formRowStyle}>
              <label style={labelStyle}>
                Material *
                <select
                  style={
                    errors[`item_${idx}_material`]
                      ? inputErrorStyle
                      : inputStyle
                  }
                  value={it.material_id}
                  onChange={(e) => {
                    const materialId = e.target.value;
                    handleItemChange(idx, "material_id", materialId);
                    const material = materials.find((m) => m.id == materialId);
                    if (material) {
                      const autoBatch = generateBatchNo(material, idx);
                      handleItemChange(idx, "batch_no", autoBatch);
                      if (material.expiry_days > 0) {
                        const expDate = new Date();
                        expDate.setDate(
                          expDate.getDate() + material.expiry_days,
                        );
                        handleItemChange(
                          idx,
                          "expiry_date",
                          expDate.toISOString().split("T")[0],
                        );
                      }
                    }
                  }}
                >
                  <option value="">Select</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.part_name || m.material_name} ({m.part_number})
                    </option>
                  ))}
                </select>
                {errors[`item_${idx}_material`] && (
                  <div style={errorTextStyle}>
                    {errors[`item_${idx}_material`]}
                  </div>
                )}
              </label>

              <label style={labelStyle}>
                Batch No *
                <input
                  style={
                    errors[`item_${idx}_batch`] ? inputErrorStyle : inputStyle
                  }
                  value={it.batch_no}
                  onChange={(e) =>
                    handleItemChange(idx, "batch_no", e.target.value)
                  }
                  placeholder="Auto"
                  maxLength="50"
                />
                {errors[`item_${idx}_batch`] && (
                  <div style={errorTextStyle}>
                    {errors[`item_${idx}_batch`]}
                  </div>
                )}
              </label>

              <label style={labelStyle}>
                Qty *
                <input
                  style={
                    errors[`item_${idx}_qty`] ? inputErrorStyle : inputStyle
                  }
                  type="number"
                  step="1"
                  min="1"
                  value={it.qty}
                  onChange={(e) => handleItemChange(idx, "qty", e.target.value)}
                  placeholder="0"
                />
                {errors[`item_${idx}_qty`] && (
                  <div style={errorTextStyle}>{errors[`item_${idx}_qty`]}</div>
                )}
              </label>

              <label style={labelStyle}>
                Price *
                <input
                  style={
                    errors[`item_${idx}_price`] ? inputErrorStyle : inputStyle
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  value={it.price}
                  onChange={(e) =>
                    handleItemChange(idx, "price", e.target.value)
                  }
                  placeholder="0.00"
                />
                {errors[`item_${idx}_price`] && (
                  <div style={errorTextStyle}>
                    {errors[`item_${idx}_price`]}
                  </div>
                )}
              </label>

              <label style={labelStyle}>
                Tax %
                <input
                  style={
                    errors[`item_${idx}_tax`] ? inputErrorStyle : inputStyle
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={it.tax_percent}
                  onChange={(e) =>
                    handleItemChange(idx, "tax_percent", e.target.value)
                  }
                  placeholder="0"
                />
                {errors[`item_${idx}_tax`] && (
                  <div style={errorTextStyle}>{errors[`item_${idx}_tax`]}</div>
                )}
              </label>

              <label style={labelStyle}>
                Expiry Date
                <input
                  style={inputStyle}
                  type="date"
                  value={it.expiry_date}
                  onChange={(e) =>
                    handleItemChange(idx, "expiry_date", e.target.value)
                  }
                  min={getTodayDate()}
                />
              </label>

              <label style={labelStyle}>
                Delivery Date
                <input
                  style={
                    errors[`item_${idx}_delivery_date`]
                      ? inputErrorStyle
                      : inputStyle
                  }
                  type="date"
                  value={it.delivery_date}
                  onChange={(e) =>
                    handleItemChange(idx, "delivery_date", e.target.value)
                  }
                  min={getTodayDate()}
                />
                {errors[`item_${idx}_delivery_date`] && (
                  <div style={errorTextStyle}>
                    {errors[`item_${idx}_delivery_date`]}
                  </div>
                )}
              </label>

              <label
                style={{ ...labelStyle, flex: "0 0 auto", minWidth: "80px" }}
              >
                Total
                <input
                  style={{ ...inputStyle, backgroundColor: "#f9fafb" }}
                  type="text"
                  value={
                    it.material_id && it.qty && it.price
                      ? formatAmountWithDecimals(
                          Number(it.qty) * Number(it.price),
                        )
                      : "0.00"
                  }
                  readOnly
                />
              </label>
            </div>
          ))}

          {errors.general && (
            <div style={{ ...errorTextStyle, margin: "8px 0" }}>
              {errors.general}
            </div>
          )}

          {/* Totals Summary */}
          <div
            style={{
              marginTop: "16px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <table style={{ width: "300px", fontSize: "13px" }}>
                <tbody>
                  <tr>
                    <td style={summaryLabelStyle}>Subtotal:</td>
                    <td style={summaryValueStyle}>
                      {header.currency}{" "}
                      {formatAmountWithDecimals(totals.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryLabelStyle}>Tax Amount:</td>
                    <td style={summaryValueStyle}>
                      {header.currency}{" "}
                      {formatAmountWithDecimals(totals.totalTax)}
                    </td>
                  </tr>
                  <tr>
                    <td style={summaryLabelStyle}>Freight:</td>
                    <td style={summaryValueStyle}>
                      {header.currency}{" "}
                      {formatAmountWithDecimals(totals.freight)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: "2px solid #374151" }}>
                    <td
                      style={{
                        ...summaryLabelStyle,
                        fontSize: "14px",
                        fontWeight: "600",
                      }}
                    >
                      Grand Total:
                    </td>
                    <td
                      style={{
                        ...summaryValueStyle,
                        fontSize: "14px",
                        fontWeight: "700",
                      }}
                    >
                      {header.currency}{" "}
                      {formatAmountWithDecimals(totals.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            style={{
              ...buttonStyle,
              backgroundColor: "#6b7280",
              marginRight: "8px",
            }}
            onClick={addRow}
          >
            + Add Row
          </button>
          <button type="submit" style={buttonStyle}>
            {editingId ? "Update PO" : "Save PO"}
          </button>
          {editingId && (
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Existing POs Table */}
      <div style={cardStyle}>
        <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>
          Existing POs
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : pos.length === 0 ? (
          <div>No POs found.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>PO No</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Vendor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>PO Type</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id}>
                  <td style={tdStyle}>{po.po_no}</td>
                  <td style={tdStyle}>{toLocalDateString(po.po_date)}</td>
                  <td style={tdStyle}>{po.vendor_name}</td>
                  <td style={tdStyle}>{po.status}</td>
                  <td style={tdStyle}>{formatAmount(po.gross_amount)}</td>
                  <td style={tdStyle}>{po.po_type}</td>
                  <td style={tdStyle}>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        marginRight: "4px",
                        fontSize: "12px",
                        backgroundColor: "#374151",
                      }}
                      onClick={() => setViewPO(po)}
                    >
                      View
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        marginRight: "4px",
                        fontSize: "12px",
                      }}
                      onClick={() => editPO(po)}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#dc2626",
                      }}
                      onClick={() => deletePO(po.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View PO Modal */}
      {viewPO && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "10px",
              minWidth: "500px",
              maxWidth: "700px",
            }}
          >
            <h3>PO Details</h3>
            <p>
              <b>PO No:</b> {viewPO.po_no}
            </p>
            <p>
              <b>Date:</b> {toLocalDateString(viewPO.po_date)}
            </p>
            <p>
              <b>Vendor:</b> {viewPO.vendor_name}
            </p>
            <p>
              <b>Status:</b> {viewPO.status}
            </p>
            <p>
              <b>Amount:</b> {formatAmount(viewPO.gross_amount)}
            </p>
            <p>
              <b>PO Type:</b> {viewPO.po_type}
            </p>
            <button
              onClick={() => setViewPO(null)}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "15px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
