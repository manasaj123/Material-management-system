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

export default function VendorForm({ onSave, editingVendor, onCancelEdit, existingVendors = [] }) {
  const [form, setForm] = useState({
    name: "",
    type: "VENDOR",
    address: "",
    contact: "",
    gst_no: "",
    bank_details: "",
    status: "ACTIVE",
    rating: 0
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingVendor) {
      setForm(editingVendor);
    } else {
      setForm({
        name: "",
        type: "VENDOR",
        address: "",
        contact: "",
        gst_no: "",
        bank_details: "",
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

  // Validate address - required
  const validateAddress = (address) => {
    if (!address || address.trim() === "") return "Address is required";
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
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validations
    const nameError = validateName(form.name);
    if (nameError) newErrors.name = nameError;
    
    const addressError = validateAddress(form.address);
    if (addressError) newErrors.address = addressError;
    
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
          type: "VENDOR",
          address: "",
          contact: "",
          gst_no: "",
          bank_details: "",
          status: "ACTIVE",
          rating: 0
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={formRowStyle}>
        <label style={labelStyle}>
          Name *
          <input
            style={inputStyle}
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Only letters and spaces"
          />
          {errors.name && <div style={errorStyle}>{errors.name}</div>}
        </label>
        <label style={labelStyle}>
          Type *
          <select
            style={inputStyle}
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="VENDOR">Vendor</option>
            <option value="FARMER">Farmer</option>
          </select>
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Address *
          <input
            style={inputStyle}
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            placeholder="Enter full address"
          />
          {errors.address && <div style={errorStyle}>{errors.address}</div>}
        </label>
        <label style={labelStyle}>
          Contact *
          <input
            style={inputStyle}
            name="contact"
            value={form.contact}
            onChange={handleChange}
            required
            placeholder="Exactly 10 digits"
            maxLength="10"
          />
          {errors.contact && <div style={errorStyle}>{errors.contact}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          GST No *
          <input
            style={inputStyle}
            name="gst_no"
            value={form.gst_no}
            onChange={handleChange}
            required
            placeholder="15 characters (letters and numbers)"
            maxLength="15"
          />
          {errors.gst_no && <div style={errorStyle}>{errors.gst_no}</div>}
        </label>
        <label style={labelStyle}>
          Bank Details *
          <input
            style={inputStyle}
            name="bank_details"
            value={form.bank_details}
            onChange={handleChange}
            required
            placeholder="Bank name, account number, IFSC"
          />
          {errors.bank_details && <div style={errorStyle}>{errors.bank_details}</div>}
        </label>
      </div>

      <div style={formRowStyle}>
        <label style={labelStyle}>
          Status *
          <select
            style={inputStyle}
            name="status"
            value={form.status}
            onChange={handleChange}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label style={labelStyle}>
          Rating *
          <input
            style={inputStyle}
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
        {editingVendor ? "Update Vendor / Farmer" : "Save Vendor / Farmer"}
      </button>
      
      {editingVendor && (
        <button type="button" style={cancelButtonStyle} onClick={onCancelEdit}>
          Cancel Edit
        </button>
      )}
    </form>
  );
}