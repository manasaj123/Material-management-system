import React, { useEffect, useState, useCallback } from "react";

const formRowStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  flexWrap: "wrap",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "13px",
  color: "#1f2937",
  flex: 1,
  minWidth: "180px",
};

const inputStyle = {
  padding: "8px 12px",
  fontSize: "13px",
  borderRadius: "6px",
  border: "2px solid #e5e7eb",
  backgroundColor: "#fafbfc",
  transition: "all 0.2s",
  outline: "none",
};

const inputErrorStyle = {
  ...inputStyle,
  border: "2px solid #dc2626",
  backgroundColor: "#fef2f2",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const selectErrorStyle = {
  ...selectStyle,
  border: "2px solid #dc2626",
  backgroundColor: "#fef2f2",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  marginRight: "8px",
};

const primaryBtnStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
};

const cancelBtnStyle = {
  ...buttonStyle,
  background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
  color: "#ffffff",
  boxShadow: "0 4px 12px rgba(107, 114, 128, 0.3)",
};

const errorMessageStyle = {
  color: "#dc2626",
  fontSize: "11px",
  marginTop: "4px",
};

const asteriskStyle = {
  color: "#dc2626",
  marginLeft: "2px",
};

// Get today's date in local timezone as YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format date for input field - ensures date is displayed correctly
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

const getDefaultFormState = () => ({
  part_number: "",
  part_name: "",
  material_name: "",
  material_code: "",
  material_type: "",
  job_work_category: "",
  uom: "KG",
  color_code: "",
  part_weight: "",
  received_date: getTodayDate(),
  storage_location: "RM Storage",
  coil_number: "",
  heat_number: "",
  shelf_life_days: "",
  status: "Active",
  qty: "",
});

export default function MaterialForm({
  onSave,
  editingMaterial,
  onCancelEdit,
  materials = [],
  isSaving = false, 
}) {
  const [form, setForm] = useState(getDefaultFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const safeString = useCallback((val) => {
    if (val === null || val === undefined || val === "") return "";
    return String(val);
  }, []);

  useEffect(() => {
    if (editingMaterial) {
      let formattedDate = "";
      if (editingMaterial.received_date) {
        if (typeof editingMaterial.received_date === 'string') {
          if (editingMaterial.received_date.includes('T')) {
            formattedDate = editingMaterial.received_date.split('T')[0];
          } else {
            formattedDate = editingMaterial.received_date;
          }
        } else {
          formattedDate = formatDateForInput(editingMaterial.received_date);
        }
      }
      
      setForm({
        part_number: safeString(editingMaterial.part_number),
        part_name: safeString(editingMaterial.part_name),
        material_name: safeString(editingMaterial.material_name),
        material_code: safeString(editingMaterial.material_code),
        material_type: safeString(editingMaterial.material_type),
        job_work_category: safeString(editingMaterial.job_work_category),
        uom: safeString(editingMaterial.uom) || "KG",
        color_code: safeString(editingMaterial.color_code),
        part_weight: safeString(editingMaterial.part_weight),
        received_date: formattedDate || getTodayDate(),
        storage_location: safeString(editingMaterial.storage_location) || "RM Storage",
        coil_number: safeString(editingMaterial.coil_number),
        heat_number: safeString(editingMaterial.heat_number),
        shelf_life_days: safeString(editingMaterial.shelf_life_days),
        status: safeString(editingMaterial.status) || "Active",
        qty: safeString(editingMaterial.qty),
      });
    } else {
      setForm(getDefaultFormState());
    }
    setErrors({});
  }, [editingMaterial, safeString]);

  const validatePartNumber = (value) => {
    if (!value || value.trim() === "") return "Part Number is required";
    if (value.length > 50) return "Part Number must be less than 50 characters";
    return "";
  };

  const validatePartName = (value) => {
    if (!value || value.trim() === "") return "Part Name is required";
    if (value.length > 200) return "Part Name must be less than 200 characters";
    return "";
  };

  const validateMaterialName = (value) => {
    if (!value || value.trim() === "") return "Material Name is required";
    if (value.length > 200) return "Material Name must be less than 200 characters";
    return "";
  };

  const validateMaterialType = (value) => {
    if (!value) return "Material Type is required";
    return "";
  };

  const validateUOM = (value) => {
    if (!value) return "UOM is required";
    return "";
  };

  const validateStorageLocation = (value) => {
    if (!value) return "Storage Location is required";
    return "";
  };

  const validatePartWeight = (weight) => {
    if (weight && weight !== "") {
      const num = Number(weight);
      if (isNaN(num)) return "Part weight must be a number";
      if (num < 0) return "Part weight cannot be negative";
      if (num > 999999999) return "Part weight is too large";
    }
    return "";
  };

  const validateShelfLife = (days) => {
    if (days && days !== "") {
      const num = Number(days);
      if (isNaN(num)) return "Shelf life must be a number";
      if (num < 0) return "Shelf life cannot be negative";
      if (num > 99999) return "Shelf life is too large";
    }
    return "";
  };

  const validateQty = (qty) => {
    if (qty && qty !== "") {
      const num = Number(qty);
      if (isNaN(num)) return "Quantity must be a number";
      if (num < 0) return "Quantity cannot be negative";
      if (num > 999999999) return "Quantity is too large";
    }
    return "";
  };

  const validateColorCode = (value) => {
    if (value && value.length > 20) return "Color code must be less than 20 characters";
    return "";
  };

  const validateMaterialCode = (value) => {
    if (value && value.length > 50) return "Material code must be less than 50 characters";
    return "";
  };

  const validateCoilNumber = (value) => {
    if (value && value.length > 50) return "Coil number must be less than 50 characters";
    return "";
  };

  const validateHeatNumber = (value) => {
    if (value && value.length > 50) return "Heat number must be less than 50 characters";
    return "";
  };

  const checkDuplicatePartNumber = (partNumber, excludeId) => {
    if (!partNumber || !materials.length) return "";
    
    const duplicate = materials.some(m => 
      m.part_number && 
      m.part_number.toLowerCase() === partNumber.toLowerCase() && 
      m.id !== (excludeId || -1)
    );
    
    return duplicate ? "This Part Number already exists" : "";
  };

  const checkDuplicatePartName = (name, excludeId) => {
    if (!name || !materials.length) return "";
    
    const duplicate = materials.some(m => 
      m.part_name && 
      m.part_name.toLowerCase() === name.toLowerCase() && 
      m.id !== (excludeId || -1)
    );
    
    return duplicate ? "This Part Name already exists" : "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;

    if (name === "part_name" || name === "material_name") {
      processedValue = value;
    }

    if (name === "received_date") {
      processedValue = value;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const partNumberError = validatePartNumber(form.part_number);
    if (partNumberError) newErrors.part_number = partNumberError;

    const duplicatePartNumberError = checkDuplicatePartNumber(form.part_number, editingMaterial?.id);
    if (duplicatePartNumberError) newErrors.part_number = duplicatePartNumberError;

    const partNameError = validatePartName(form.part_name);
    if (partNameError) newErrors.part_name = partNameError;

    const materialNameError = validateMaterialName(form.material_name);
    if (materialNameError) newErrors.material_name = materialNameError;

    const materialTypeError = validateMaterialType(form.material_type);
    if (materialTypeError) newErrors.material_type = materialTypeError;

    const uomError = validateUOM(form.uom);
    if (uomError) newErrors.uom = uomError;

    const storageLocationError = validateStorageLocation(form.storage_location);
    if (storageLocationError) newErrors.storage_location = storageLocationError;

    const duplicateNameError = checkDuplicatePartName(form.part_name, editingMaterial?.id);
    if (duplicateNameError) newErrors.part_name = duplicateNameError;

    const partWeightError = validatePartWeight(form.part_weight);
    if (partWeightError) newErrors.part_weight = partWeightError;

    const shelfLifeError = validateShelfLife(form.shelf_life_days);
    if (shelfLifeError) newErrors.shelf_life_days = shelfLifeError;

    const qtyError = validateQty(form.qty);
    if (qtyError) newErrors.qty = qtyError;

    const colorCodeError = validateColorCode(form.color_code);
    if (colorCodeError) newErrors.color_code = colorCodeError;

    const materialCodeError = validateMaterialCode(form.material_code);
    if (materialCodeError) newErrors.material_code = materialCodeError;

    const coilNumberError = validateCoilNumber(form.coil_number);
    if (coilNumberError) newErrors.coil_number = coilNumberError;

    const heatNumberError = validateHeatNumber(form.heat_number);
    if (heatNumberError) newErrors.heat_number = heatNumberError;

    if (form.material_type === "Job Work" && !form.job_work_category) {
      newErrors.job_work_category = "Job Work Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const basePayload = {
        part_number: form.part_number.trim(),
        part_name: form.part_name.trim(),
        material_name: form.material_name.trim(),
        material_code: form.material_code || null,
        material_type: form.material_type,
        job_work_category: form.material_type === "Job Work" ? form.job_work_category : null,
        uom: form.uom,
        color_code: form.color_code || null,
        part_weight: form.part_weight ? Number(form.part_weight) : null,
        received_date: form.received_date || null,
        storage_location: form.storage_location,
        coil_number: form.coil_number || null,
        heat_number: form.heat_number || null,
        shelf_life_days: form.shelf_life_days ? Number(form.shelf_life_days) : null,
        status: form.status || "Active",
        qty: form.qty ? Number(form.qty) : null,
      };

      const payload = editingMaterial
        ? { ...basePayload }
        : basePayload;

      await onSave(payload);

      if (!editingMaterial) {
        setForm(getDefaultFormState());
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? inputErrorStyle : inputStyle;
  };

  const getSelectStyle = (fieldName) => {
    return errors[fieldName] ? selectErrorStyle : selectStyle;
  };

  const showJobWorkCategory = form.material_type === "Job Work";

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}
      noValidate
    >
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Part Number <span style={asteriskStyle}>*</span>
          <input
            name="part_number"
            value={form.part_number}
            onChange={handleChange}
            style={getInputStyle("part_number")}
            required
            placeholder="Enter Part Number"
            maxLength="50"
          />
          {errors.part_number && <div style={errorMessageStyle}>{errors.part_number}</div>}
        </label>

        <label style={labelStyle}>
          Part Name <span style={asteriskStyle}>*</span>
          <input
            name="part_name"
            value={form.part_name}
            onChange={handleChange}
            style={getInputStyle("part_name")}
            required
            placeholder="Technical name of the part"
            maxLength="200"
          />
          {errors.part_name && <div style={errorMessageStyle}>{errors.part_name}</div>}
        </label>

        <label style={labelStyle}>
          Material Name <span style={asteriskStyle}>*</span>
          <input
            name="material_name"
            value={form.material_name}
            onChange={handleChange}
            style={getInputStyle("material_name")}
            required
            placeholder="Common name used by users"
            maxLength="200"
          />
          {errors.material_name && <div style={errorMessageStyle}>{errors.material_name}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Material Code
          <input
            name="material_code"
            value={form.material_code || ""}
            onChange={handleChange}
            style={getInputStyle("material_code")}
            placeholder="Internal company code"
            maxLength="50"
          />
          {errors.material_code && <div style={errorMessageStyle}>{errors.material_code}</div>}
        </label>

        <label style={labelStyle}>
          Material Type <span style={asteriskStyle}>*</span>
          <select
            name="material_type"
            value={form.material_type}
            onChange={handleChange}
            style={getSelectStyle("material_type")}
            required
          >
            <option value="">Select Type</option>
            <option value="Raw Material">Raw Material</option>
            <option value="BOP">BOP (Bought-Out Parts)</option>
            <option value="Job Work">Job Work</option>
            <option value="Service">Service</option>
            <option value="Accessories">Accessories</option>
          </select>
          {errors.material_type && <div style={errorMessageStyle}>{errors.material_type}</div>}
        </label>

        <label style={labelStyle}>
          UOM <span style={asteriskStyle}>*</span>
          <select
            name="uom"
            value={form.uom}
            onChange={handleChange}
            style={getSelectStyle("uom")}
            required
          >
            <option value="KG">KG (Kilograms)</option>
            <option value="LTR">LTR (Liters)</option>
            <option value="PCS">PCS (Pieces)</option>
            <option value="NOS">NOS (Numbers)</option>
            <option value="BOXES">BOXES (Boxes)</option>
          </select>
          {errors.uom && <div style={errorMessageStyle}>{errors.uom}</div>}
        </label>
      </div>

      {showJobWorkCategory && (
        <div style={formRowStyle}>
          <label style={labelStyle}>
            Job Work Category <span style={asteriskStyle}>*</span>
            <select
              name="job_work_category"
              value={form.job_work_category}
              onChange={handleChange}
              style={getSelectStyle("job_work_category")}
              required
            >
              <option value="">Select Category</option>
              <option value="Forging">Forging</option>
              <option value="Machining">Machining</option>
              <option value="Plating">Plating</option>
              <option value="Heat Treatment">Heat Treatment</option>
              <option value="Tapping">Tapping</option>
              <option value="Sorting">Sorting</option>
              <option value="Thread Rolling">Thread Rolling</option>
              <option value="Milling">Milling</option>
            </select>
            {errors.job_work_category && <div style={errorMessageStyle}>{errors.job_work_category}</div>}
          </label>
        </div>
      )}

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Color Code
          <input
            name="color_code"
            value={form.color_code}
            onChange={handleChange}
            style={getInputStyle("color_code")}
            placeholder="Material or coating color"
            maxLength="20"
          />
          {errors.color_code && <div style={errorMessageStyle}>{errors.color_code}</div>}
        </label>

        <label style={labelStyle}>
          Part Weight
          <input
            type="number"
            step="0.001"
            name="part_weight"
            value={form.part_weight}
            onChange={handleChange}
            style={getInputStyle("part_weight")}
            min="0"
            placeholder="Weight per unit"
          />
          {errors.part_weight && <div style={errorMessageStyle}>{errors.part_weight}</div>}
        </label>

        <label style={labelStyle}>
          Received Date
          <input
            type="date"
            name="received_date"
            value={form.received_date}
            onChange={handleChange}
            style={inputStyle}
          />
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Storage Location <span style={asteriskStyle}>*</span>
          <select
            name="storage_location"
            value={form.storage_location}
            onChange={handleChange}
            style={getSelectStyle("storage_location")}
            required
          >
            <option value="RM Storage">RM Storage</option>
            <option value="BOP Storage">BOP Storage</option>
          </select>
          {errors.storage_location && <div style={errorMessageStyle}>{errors.storage_location}</div>}
        </label>

        <label style={labelStyle}>
          Coil Number
          <input
            name="coil_number"
            value={form.coil_number}
            onChange={handleChange}
            style={getInputStyle("coil_number")}
            placeholder="Unique coil number"
            maxLength="50"
          />
          {errors.coil_number && <div style={errorMessageStyle}>{errors.coil_number}</div>}
        </label>

        <label style={labelStyle}>
          Heat Number
          <input
            name="heat_number"
            value={form.heat_number}
            onChange={handleChange}
            style={getInputStyle("heat_number")}
            placeholder="Manufacturer's heat number"
            maxLength="50"
          />
          {errors.heat_number && <div style={errorMessageStyle}>{errors.heat_number}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Shelf Life (Days)
          <input
            type="number"
            name="shelf_life_days"
            value={form.shelf_life_days}
            onChange={handleChange}
            style={getInputStyle("shelf_life_days")}
            min="0"
            placeholder="Days material remains usable"
          />
          {errors.shelf_life_days && <div style={errorMessageStyle}>{errors.shelf_life_days}</div>}
        </label>

        <label style={labelStyle}>
          Status
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={selectStyle}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <label style={labelStyle}>
          Quantity
          <input
            type="number"
            name="qty"
            value={form.qty}
            onChange={handleChange}
            style={getInputStyle("qty")}
            min="0"
            step="0.01"
            placeholder="Current quantity"
          />
          {errors.qty && <div style={errorMessageStyle}>{errors.qty}</div>}
        </label>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "16px" }}>
        <button
          type="submit"
          style={{
            ...primaryBtnStyle,
            opacity: isSubmitting ? 0.7 : 1,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
          onMouseOver={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = "translateY(-2px)";
            }
          }}
          onMouseOut={(e) => {
            if (!isSubmitting) {
              e.target.style.transform = "none";
            }
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : (editingMaterial ? "Update Material" : "Save Material")}
        </button>
        {editingMaterial && (
          <button
            type="button"
            style={cancelBtnStyle}
            onClick={onCancelEdit}
            onMouseOver={(e) => (e.target.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.target.style.transform = "none")}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}