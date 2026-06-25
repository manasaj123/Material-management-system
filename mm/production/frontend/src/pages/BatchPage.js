import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import batchApi from "../api/batchApi";
import productApi from "../api/productApi";
import gradePackApi from "../api/gradePackApi";
import planApi from "../api/planApi";

const headerStyle = {
  marginBottom: "8px"
};

const topRowStyle = {
  display: "flex",
  gap: "8px",
  alignItems: "center",
  marginBottom: "8px"
};

const buttonBarStyle = {
  margin: "8px 0",
  display: "flex",
  gap: "8px"
};

function BatchPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [gradePacks, setGradePacks] = useState([]);

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (date) {
      loadBatches(date);
    }
  }, [date]);

  const loadMasterData = async () => {
    try {
      const [productData, gradePackData] = await Promise.all([
        productApi.list(),
        gradePackApi.list()
      ]);
      setProducts(productData);
      setGradePacks(gradePackData);
    } catch (err) {
      console.error("Failed to load master data:", err);
    }
  };

  const loadBatches = async (d) => {
    setLoading(true);
    setError("");
    try {
      const data = await batchApi.getByDate(d);
      setRows(data || []);
    } catch (err) {
      setError("Failed to load batches");
      console.error("Load batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        product_id: "",
        grade_pack_id: "",
        batch_size: 0,
        line_id: rows.length + 1,
        shift: 1,
        status: "created"
      }
    ]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    // Re-number line_id
    const renumbered = newRows.map((row, i) => ({
      ...row,
      line_id: i + 1
    }));
    setRows(renumbered);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = rows.map((row, i) => {
      if (i === index) {
        return { ...row, [field]: value };
      }
      return row;
    });
    setRows(newRows);
    setError("");
  };

  const handleGenerateFromPlan = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      // Get production plan for the date
      const planData = await planApi.getByDate(date);
      
      if (!planData || planData.length === 0) {
        setError("No production plan found for this date. Create a production plan first.");
        setLoading(false);
        return;
      }
      
      // Create batches from production plan
      const batchRows = planData.map((plan, index) => ({
        product_id: plan.product_id,
        grade_pack_id: plan.grade_pack_id,
        batch_size: plan.planned_qty,
        line_id: index + 1,
        shift: plan.shift,
        status: "created"
      }));
      
      setRows(batchRows);
      setMessage(`Generated ${batchRows.length} batches from production plan`);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to generate batches from plan");
      console.error("Generate batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setMessage("");

    // Validate rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.product_id) {
        setError(`Row ${i + 1}: Please select a product`);
        return;
      }
      if (!row.grade_pack_id) {
        setError(`Row ${i + 1}: Please select a grade/pack`);
        return;
      }
      if (!row.batch_size || row.batch_size <= 0) {
        setError(`Row ${i + 1}: Batch size must be greater than 0`);
        return;
      }
      if (!row.shift || row.shift < 1) {
        setError(`Row ${i + 1}: Please enter a valid shift`);
        return;
      }
    }

    setLoading(true);
    try {
      await batchApi.createMany(date, rows);
      setMessage("Batches saved successfully!");
      await loadBatches(date);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to save batches");
      console.error("Save batches error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? `${product.code} - ${product.name}` : `Product #${productId}`;
  };

  const getGradePackName = (gradePackId) => {
    const gradePack = gradePacks.find(g => g.id === parseInt(gradePackId));
    return gradePack ? `${gradePack.name || gradePack.code}` : `Grade/Pack #${gradePackId}`;
  };

  const getTotalBatchSize = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.batch_size || 0), 0);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        .pp-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .pp-table th,
        .pp-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .pp-table th {
          background-color: #f4f6f8;
        }
        .pp-table tr:nth-child(even) {
          background-color: #fafafa;
        }
        .pp-table tr:hover {
          background-color: #f1f1f1;
        }
        select, input {
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
        }
        select:focus, input:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }
        button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s, opacity 0.3s;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary {
          background-color: #007bff;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .btn-success {
          background-color: #28a745;
          color: white;
        }
        .btn-success:hover:not(:disabled) {
          background-color: #218838;
        }
        .btn-info {
          background-color: #17a2b8;
          color: white;
        }
        .btn-info:hover:not(:disabled) {
          background-color: #138496;
        }
        .btn-danger {
          background-color: #dc3545;
          color: white;
        }
        .btn-danger:hover:not(:disabled) {
          background-color: #c82333;
        }
        .message {
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          animation: fadeIn 0.3s ease-in;
        }
        .message-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .message-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .message-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stats {
          background-color: #e7f3ff;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          color: #004085;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .small-input {
          width: 60px;
        }
        .medium-input {
          width: 100px;
        }
      `}</style>

      <h2 style={headerStyle}>Batch Creation / Scheduling</h2>
      <p style={{ color: "#666", marginTop: "-10px", marginBottom: "20px" }}>
        Create production batches from the production plan
      </p>

      {error && (
        <div className="message message-error">{error}</div>
      )}
      {message && (
        <div className="message message-success">{message}</div>
      )}

      <div style={topRowStyle}>
        <label style={{ fontWeight: "bold" }}>Date: </label>
        <DateInput value={date} onChange={setDate} />
      </div>

      <div style={buttonBarStyle}>
        <button 
          className="btn-info"
          onClick={handleGenerateFromPlan}
          disabled={loading}
        >
          📋 Generate from Plan
        </button>
        <button 
          className="btn-primary"
          onClick={handleAddRow}
          disabled={loading}
        >
          ➕ Add Batch
        </button>
        <button 
          className="btn-success"
          onClick={handleSave}
          disabled={loading}
        >
          💾 Save Batches
        </button>
      </div>

      <div className="stats">
        <span>
          <strong>Total Batches: </strong>{rows.length}
        </span>
        <span>
          <strong>Total Batch Size: </strong>{getTotalBatchSize().toFixed(2)}
        </span>
      </div>

      <table className="pp-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Batch Size</th>
            <th>Line</th>
            <th>Shift</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <select
                  value={row.product_id}
                  onChange={(e) => handleRowChange(index, "product_id", e.target.value ? parseInt(e.target.value) : "")}
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={row.grade_pack_id}
                  onChange={(e) => handleRowChange(index, "grade_pack_id", e.target.value ? parseInt(e.target.value) : "")}
                >
                  <option value="">Select Grade/Pack</option>
                  {gradePacks.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name || g.code || `Grade/Pack #${g.id}`}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  className="medium-input"
                  value={row.batch_size}
                  onChange={(e) => handleRowChange(index, "batch_size", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="small-input"
                  value={row.line_id}
                  onChange={(e) => handleRowChange(index, "line_id", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="small-input"
                  value={row.shift}
                  onChange={(e) => handleRowChange(index, "shift", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </td>
              <td>
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteRow(index)}
                  disabled={loading}
                >
                  ✕
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loading && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                No batches created. Click "Generate from Plan" to auto-create from production plan, or "Add Batch" to manually add.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default BatchPage;