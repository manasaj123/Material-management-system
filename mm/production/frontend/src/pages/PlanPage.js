import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import planApi from "../api/planApi";
import productApi from "../api/productApi";
import gradePackApi from "../api/gradePackApi";

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

const buttonStyle = {
  padding: "6px 10px",
  fontSize: "13px",
  cursor: "pointer"
};

function PlanPage() {
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
      loadPlan(date);
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

  const loadPlan = async (d) => {
    setLoading(true);
    setError("");
    try {
      const data = await planApi.getByDate(d);
      setRows(data || []);
    } catch (err) {
      setError("Failed to load plan");
      console.error("Load plan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        shift: 1,
        product_id: "",
        grade_pack_id: "",
        planned_qty: 0,
        status: "planned"
      }
    ]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
    setRows(newRows);
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
      if (!row.shift || row.shift < 1) {
        setError(`Row ${i + 1}: Please enter a valid shift`);
        return;
      }
      if (!row.planned_qty || row.planned_qty <= 0) {
        setError(`Row ${i + 1}: Planned quantity must be greater than 0`);
        return;
      }
    }

    setLoading(true);
    try {
      await planApi.save(date, rows);
      setMessage("Plan saved successfully!");
      await loadPlan(date);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to save plan");
      console.error("Save plan error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFromForecast = async () => {
    if (!window.confirm("This will replace the current plan with forecast data. Continue?")) return;
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const period = window.prompt("Enter forecast period (e.g., 2026-W03):", "2026-W03");
      if (!period) {
        setLoading(false);
        return;
      }
      
      const result = await planApi.generateFromForecast(period, date);
      setMessage(result.message || "Plan generated from forecast");
      await loadPlan(date);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate plan from forecast");
      console.error("Generate plan error:", err);
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
        select {
          min-width: 150px;
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shift-input {
          width: 60px;
        }
        .qty-input {
          width: 100px;
        }
      `}</style>

      <h2 style={headerStyle}>Production Plan</h2>

      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}
      {message && (
        <div className="message message-success">
          {message}
        </div>
      )}

      <div style={topRowStyle}>
        <DateInput value={date} onChange={setDate} />
      </div>

      <div style={buttonBarStyle}>
        <button 
          className="btn-info"
          onClick={handleGenerateFromForecast} 
          disabled={loading}
        >
          Generate from Forecast
        </button>
        <button 
          className="btn-success"
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Plan"}
        </button>
        <button 
          className="btn-primary"
          onClick={handleAddRow}
          disabled={loading}
        >
          Add Row
        </button>
      </div>

      <table className="pp-table">
        <thead>
          <tr>
            <th>Plan ID</th>
            <th>Shift</th>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Planned Qty</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <input
                  type="number"
                  className="shift-input"
                  value={row.shift}
                  onChange={(e) => handleRowChange(index, "shift", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </td>
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
                  className="qty-input"
                  value={row.planned_qty}
                  onChange={(e) => handleRowChange(index, "planned_qty", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="1"
                />
              </td>
              <td>
                <select
                  value={row.status}
                  onChange={(e) => handleRowChange(index, "status", e.target.value)}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="final">Final</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                No plan lines for this date. Click "Generate from Forecast" or "Add Row" to create plan.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PlanPage;