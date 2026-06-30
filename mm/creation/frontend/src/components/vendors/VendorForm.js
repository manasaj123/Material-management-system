import React, { useState, useEffect } from "react";

const formRowStyle = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px"
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontSize: "12px",
  color: "#4b5563",
  flex: 1
};

const inputStyle = {
  padding: "6px 8px",
  fontSize: "13px",
  borderRadius: "4px",
  border: "1px solid #d1d5db"
};

const inputErrorStyle = {
  ...inputStyle,
  border: "2px solid #dc2626",
  backgroundColor: "#fef2f2"
};

const errorStyle = {
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
  cursor: "pointer",
  marginRight: "8px"
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#6b7280"
};

const asteriskStyle = {
  color: "#dc2626",
  marginLeft: "2px"
};

export default function VendorForm({ onSave, editingVendor, onCancelEdit, existingVendors = [] }) {
  const [form, setForm] = useState({
    name: "",
    material_type: "",
    job_work_category: "",
    address: "",
    location: "",
    contact: "",
    gst_no: "",
    bank_details: "",
    qms_certification: "",
    status: "ACTIVE",
    rating: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingVendor) {
      setForm({
        name: editingVendor.name || "",
        material_type: editingVendor.material_type || "",
        job_work_category: editingVendor.job_work_category || "",
        address: editingVendor.address || "",
        location: editingVendor.location || "",
        contact: editingVendor.contact || "",
        gst_no: editingVendor.gst_no || "",
        bank_details: editingVendor.bank_details || "",
        qms_certification: editingVendor.qms_certification || "",
        status: editingVendor.status || "ACTIVE",
        rating: editingVendor.rating || 0
      });
    } else {
      setForm({
        name: "",
        material_type: "",
        job_work_category: "",
        address: "",
        location: "",
        contact: "",
        gst_no: "",
        bank_details: "",
        qms_certification: "",
        status: "ACTIVE",
        rating: 0
      });
    }
    setErrors({});
  }, [editingVendor]);

  // Validate name - only letters and spaces (no special characters or numbers)
  const validateName = (name) => {
    if (!name || name.trim() === "") return "Name is required";
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(name)) return "Name should only contain letters and spaces (no numbers or special characters)";
    return "";
  };

  // Validate material type - required
  const validateMaterialType = (type) => {
    if (!type) return "Material Type is required";
    return "";
  };

  // Validate job work category - required if material type is "Job Work"
  const validateJobWorkCategory = (category, materialType) => {
    if (materialType === "Job Work" && !category) {
      return "Job Work Category is required";
    }
    return "";
  };

  // Validate address - required
  const validateAddress = (address) => {
    if (!address || address.trim() === "") return "Address is required";
    return "";
  };

  // Validate location - required
  const validateLocation = (location) => {
    if (!location || location.trim() === "") return "Location is required";
    return "";
  };

  // Validate contact - exactly 10 digits
  const validateContact = (contact) => {
    if (!contact || contact.trim() === "") return "Contact number is required";
    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contact)) return "Contact should be exactly 10 digits (numbers only)";
    return "";
  };

  // Validate GST - 15 characters alphanumeric
  const validateGST = (gst) => {
    if (!gst || gst.trim() === "") return "GST number is required";
    const gstRegex = /^[0-9A-Z]{15}$/;
    if (!gstRegex.test(gst.toUpperCase())) return "GST number must be 15 characters (letters and numbers only)";
    return "";
  };

  // Validate bank details - required
  const validateBankDetails = (bankDetails) => {
    if (!bankDetails || bankDetails.trim() === "") return "Bank details are required";
    return "";
  };

  // Validate rating - between 0-5
  const validateRating = (rating) => {
    if (rating === "" || rating === null || rating === undefined) return "Rating is required";
    const num = Number(rating);
    if (isNaN(num)) return "Rating must be a number";
    if (num < 0 || num > 5) return "Rating must be between 0 and 5";
    if (!Number.isInteger(num)) return "Rating must be a whole number";
    return "";
  };

  // Check for duplicate vendor name
  const validateDuplicateName = (name, currentId) => {
    if (!name || name.trim() === "") return "";
    const duplicate = existingVendors.find(v => 
      v.name && v.name.toLowerCase().trim() === name.toLowerCase().trim() && v.id !== currentId
    );
    if (duplicate) return "Vendor name already exists";
    return "";
  };

  // Check for duplicate GST
  const validateDuplicateGST = (gst, currentId) => {
    if (!gst || gst.trim() === "") return "";
    const duplicate = existingVendors.find(v => 
      v.gst_no && v.gst_no.toLowerCase().trim() === gst.toLowerCase().trim() && v.id !== currentId
    );
    if (duplicate) return "GST number already exists";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // For GST, convert to uppercase
    if (name === "gst_no") {
      processedValue = value.toUpperCase();
    }
    
    // For contact, only allow numbers
    if (name === "contact") {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // For name, only allow letters and spaces
    if (name === "name") {
      processedValue = value.replace(/[^A-Za-z\s]/g, '');
    }
    
    setForm((f) => ({ ...f, [name]: processedValue }));
    
    // Clear errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // If material_type changes, clear job_work_category error
    if (name === "material_type") {
      setErrors(prev => ({ ...prev, job_work_category: "" }));
    }
  };

  const getInputStyle = (fieldName) => {
    return errors[fieldName] ? inputErrorStyle : inputStyle;
  };

  const getSelectStyle = (fieldName) => {
    return errors[fieldName] ? inputErrorStyle : inputStyle;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    const nameError = validateName(form.name);
    if (nameError) newErrors.name = nameError;
    
    const materialTypeError = validateMaterialType(form.material_type);
    if (materialTypeError) newErrors.material_type = materialTypeError;
    
    // Job work category validation
    const jobWorkError = validateJobWorkCategory(form.job_work_category, form.material_type);
    if (jobWorkError) newErrors.job_work_category = jobWorkError;
    
    const addressError = validateAddress(form.address);
    if (addressError) newErrors.address = addressError;
    
    const locationError = validateLocation(form.location);
    if (locationError) newErrors.location = locationError;
    
    const contactError = validateContact(form.contact);
    if (contactError) newErrors.contact = contactError;
    
    const gstError = validateGST(form.gst_no);
    if (gstError) newErrors.gst_no = gstError;
    
    const bankDetailsError = validateBankDetails(form.bank_details);
    if (bankDetailsError) newErrors.bank_details = bankDetailsError;
    
    const ratingError = validateRating(form.rating);
    if (ratingError) newErrors.rating = ratingError;
    
    // Duplicate validations
    const duplicateNameError = validateDuplicateName(form.name, editingVendor?.id);
    if (duplicateNameError) newErrors.name = duplicateNameError;
    
    const duplicateGSTError = validateDuplicateGST(form.gst_no, editingVendor?.id);
    if (duplicateGSTError) newErrors.gst_no = duplicateGSTError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(form);
      if (!editingVendor) {
        setForm({
          name: "",
          material_type: "",
          job_work_category: "",
          address: "",
          location: "",
          contact: "",
          gst_no: "",
          bank_details: "",
          qms_certification: "",
          status: "ACTIVE",
          rating: 0
        });
      }
    }
  };

  // Determine if Job Work Category should be shown
  const showJobWorkCategory = form.material_type === "Job Work";

  return (
    <form onSubmit={handleSubmit}>
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Vendor Name <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("name")}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Only letters and spaces"
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
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
          {errors.material_type && <div style={errorStyle}>{errors.material_type}</div>}
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
            {errors.job_work_category && <div style={errorStyle}>{errors.job_work_category}</div>}
          </label>
        </div>
      )}

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Address <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("address")}
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Enter full address"
          />
          {errors.address && <div style={errorStyle}>{errors.address}</div>}
        </label>
        <label style={labelStyle}>
          Location <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("location")}
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            placeholder="City, State, or Region"
          />
          {errors.location && <div style={errorStyle}>{errors.location}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Contact <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("contact")}
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
            placeholder="Exactly 10 digits"
            maxLength="10"
          />
          {errors.contact && <div style={errorStyle}>{errors.contact}</div>}
        </label>
        <label style={labelStyle}>
          GST No <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("gst_no")}
            name="gst_no"
            value={form.gst_no}
            onChange={handleChange}
            required
            placeholder="15 characters (letters and numbers)"
            maxLength="15"
          />
          {errors.gst_no && <div style={errorStyle}>{errors.gst_no}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Bank Details <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("bank_details")}
            name="bank_details"
            value={form.bank_details}
            onChange={handleChange}
            required
            placeholder="Bank name, account number, IFSC"
          />
          {errors.bank_details && <div style={errorStyle}>{errors.bank_details}</div>}
        </label>
        <label style={labelStyle}>
          QMS Certification
          <select
            style={inputStyle}
            name="qms_certification"
            value={form.qms_certification}
            onChange={handleChange}
          >
            <option value="">Select Certification</option>
            <option value="ISO 9001">ISO 9001</option>
            <option value="ISO 14001">ISO 14001</option>
            <option value="ISO 45001">ISO 45001</option>
            <option value="ISO 22000">ISO 22000</option>
            <option value="IATF 16949">IATF 16949</option>
            <option value="AS9100">AS9100</option>
            <option value="IRIS">IRIS</option>
            <option value="CE">CE</option>
            <option value="UL">UL</option>
            <option value="RoHS">RoHS</option>
            <option value="REACH">REACH</option>
            <option value="HACCP">HACCP</option>
            <option value="GMP">GMP</option>
            <option value="Other">Other</option>
          </select>
          {errors.qms_certification && <div style={errorStyle}>{errors.qms_certification}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Status
          <select
            style={inputStyle}
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label style={labelStyle}>
          Rating <span style={asteriskStyle}>*</span>
          <input
            style={getInputStyle("rating")}
            name="rating"
            type="number"
            step="1"
            min="0"
            max="5"
            value={form.rating}
            onChange={handleChange}
            required
            placeholder="0 to 5"
          />
          {errors.rating && <div style={errorStyle}>{errors.rating}</div>}
        </label>
      </div>

      <button type="submit" style={buttonStyle}>
        {editingVendor ? "Update Vendor" : "Save Vendor"}
      </button>
      
      {editingVendor && (
        <button type="button" style={cancelButtonStyle} onClick={onCancelEdit}>
          Cancel Edit
        </button>
      )}
    </form>
  );
}