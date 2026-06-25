import React, { useState } from "react";

export default function CAPAForm({ onSave, defaultLotId, defaultDefectId }) {
  const [form, setForm] = useState({
    lot_id: defaultLotId || "",
    defect_id: defaultDefectId || "",
    title: "",
    problem_desc: "",
    root_cause: "",
    corrective_actions: "",
    preventive_actions: "",
    owner: "",
    due_date: "",
    status: "OPEN"
  });
  const [errors, setErrors] = useState({});

  const styles = {
    formCard: {
      backgroundColor: "#ffffff",
      padding: "24px",
      borderRadius: "8px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
      marginBottom: "16px"
    },
    field: {
      display: "flex",
      flexDirection: "column",
      gap: "4px"
    },
    fullRow: {
      gridColumn: "1 / -1"
    },
    label: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#374151",
      textTransform: "uppercase"
    },
    required: {
      color: "#ef4444"
    },
    input: {
      padding: "8px 10px",
      fontSize: "13px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      outline: "none",
      width: "100%",
      boxSizing: "border-box"
    },
    inputError: {
      padding: "8px 10px",
      fontSize: "13px",
      borderRadius: "6px",
      border: "1px solid #ef4444",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      backgroundColor: "#fef2f2"
    },
    textarea: {
      padding: "8px 10px",
      fontSize: "13px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
      resize: "vertical",
      minHeight: "60px"
    },
    errorText: {
      color: "#ef4444",
      fontSize: "11px"
    },
    button: {
      padding: "10px 24px",
      fontSize: "14px",
      borderRadius: "6px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontWeight: "500"
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.problem_desc.trim()) newErrors.problem_desc = "Problem description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) {
      setErrors(e => ({ ...e, [name]: undefined }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    
    onSave({
      ...form,
      lot_id: form.lot_id || null,
      defect_id: form.defect_id || null
    });
    
    // Reset form
    setForm({
      lot_id: "",
      defect_id: "",
      title: "",
      problem_desc: "",
      root_cause: "",
      corrective_actions: "",
      preventive_actions: "",
      owner: "",
      due_date: "",
      status: "OPEN"
    });
  };

  return (
    <form onSubmit={handleSubmit} style={styles.formCard}>
      <div style={styles.grid}>
        <div style={styles.field}>
          <span style={styles.label}>
            Title <span style={styles.required}>*</span>
          </span>
          <input
            name="title"
            style={errors.title ? styles.inputError : styles.input}
            value={form.title}
            onChange={handleChange}
            placeholder="Enter CAPA title"
          />
          {errors.title && <span style={styles.errorText}>{errors.title}</span>}
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Owner</span>
          <input
            name="owner"
            style={styles.input}
            value={form.owner}
            onChange={handleChange}
            placeholder="Responsible person"
          />
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Lot ID</span>
          <input
            name="lot_id"
            type="number"
            style={styles.input}
            value={form.lot_id}
            onChange={handleChange}
            placeholder="QC Lot ID"
          />
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Defect ID</span>
          <input
            name="defect_id"
            type="number"
            style={styles.input}
            value={form.defect_id}
            onChange={handleChange}
            placeholder="Defect ID"
          />
        </div>

        <div style={styles.field}>
          <span style={styles.label}>Due Date</span>
          <input
            type="date"
            name="due_date"
            style={styles.input}
            value={form.due_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ ...styles.field, ...styles.fullRow }}>
          <span style={styles.label}>
            Problem Description <span style={styles.required}>*</span>
          </span>
          <textarea
            name="problem_desc"
            style={errors.problem_desc ? {...styles.textarea, border: "1px solid #ef4444", backgroundColor: "#fef2f2"} : styles.textarea}
            rows={3}
            value={form.problem_desc}
            onChange={handleChange}
            placeholder="Describe the problem in detail"
          />
          {errors.problem_desc && <span style={styles.errorText}>{errors.problem_desc}</span>}
        </div>

        <div style={{ ...styles.field, ...styles.fullRow }}>
          <span style={styles.label}>Root Cause</span>
          <textarea
            name="root_cause"
            style={styles.textarea}
            rows={3}
            value={form.root_cause}
            onChange={handleChange}
            placeholder="What caused the problem?"
          />
        </div>

        <div style={{ ...styles.field, ...styles.fullRow }}>
          <span style={styles.label}>Corrective Actions</span>
          <textarea
            name="corrective_actions"
            style={styles.textarea}
            rows={3}
            value={form.corrective_actions}
            onChange={handleChange}
            placeholder="Actions to fix the current issue"
          />
        </div>

        <div style={{ ...styles.field, ...styles.fullRow }}>
          <span style={styles.label}>Preventive Actions</span>
          <textarea
            name="preventive_actions"
            style={styles.textarea}
            rows={3}
            value={form.preventive_actions}
            onChange={handleChange}
            placeholder="Actions to prevent recurrence"
          />
        </div>
      </div>

      <button type="submit" style={styles.button}>
        💾 Save CAPA
      </button>
    </form>
  );
}