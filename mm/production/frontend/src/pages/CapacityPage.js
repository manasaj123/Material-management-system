import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import capacityApi from "../api/capacityApi";
import planApi from "../api/planApi";

function CapacityPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [planSummary, setPlanSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) {
      loadAllData(date);
    }
  }, [date]);

  const loadAllData = async (d) => {
    setLoading(true);
    setError("");
    try {
      // Load both capacity plan and production plan summary
      const [capacityData, planData] = await Promise.all([
        capacityApi.getByDate(d).catch(() => []),
        planApi.getByDate(d).catch(() => [])
      ]);
      
      setRows(capacityData || []);
      
      // Calculate plan summary
      if (planData && planData.length > 0) {
        const totalQty = planData.reduce((sum, p) => sum + parseFloat(p.planned_qty || 0), 0);
        const shifts = [...new Set(planData.map(p => p.shift))];
        setPlanSummary({
          totalLines: planData.length,
          totalQty: totalQty,
          shifts: shifts.sort()
        });
      } else {
        setPlanSummary(null);
      }
    } catch (err) {
      setError("Failed to load data");
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        line_id: rows.length + 1,
        shift: 1,
        available_hours: 8
      }
    ]);
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index);
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

  const handleSave = async () => {
    setError("");
    setMessage("");

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.line_id || row.line_id < 1) {
        setError(`Row ${i + 1}: Please enter a valid line ID`);
        return;
      }
      if (!row.shift || row.shift < 1) {
        setError(`Row ${i + 1}: Please enter a valid shift`);
        return;
      }
      if (!row.available_hours || row.available_hours <= 0) {
        setError(`Row ${i + 1}: Available hours must be greater than 0`);
        return;
      }
    }

    setLoading(true);
    try {
      await capacityApi.save(date, rows);
      setMessage("Capacity saved successfully!");
      await loadAllData(date);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to save capacity plan");
      console.error("Save capacity error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    if (!window.confirm("This will replace the current capacity plan with suggestions based on production plan. Continue?")) return;
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const result = await capacityApi.suggest(date);
      setMessage(`Generated ${result.rows?.length || 0} capacity lines from production plan`);
      await loadAllData(date);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "No production plan found. Create a production plan first.");
      console.error("Suggest capacity error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalHours = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.available_hours || 0), 0);
  };

  const getTotalLines = () => {
    return rows.length;
  };

  const getShiftSummary = () => {
    const shifts = {};
    rows.forEach(row => {
      const shift = row.shift;
      if (!shifts[shift]) {
        shifts[shift] = { lines: 0, hours: 0 };
      }
      shifts[shift].lines += 1;
      shifts[shift].hours += parseFloat(row.available_hours || 0);
    });
    return shifts;
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
        input {
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          outline: none;
        }
        input:focus {
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
        .summary-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 12px;
        }
        .summary-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }
        .summary-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .summary-value {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .small-input {
          width: 60px;
        }
        .medium-input {
          width: 100px;
        }
      `}</style>

      <h2>Resource & Capacity Planning</h2>
      <p style={{ color: "#666", marginTop: "-0px", marginBottom: "20px" }}>
        Plan how many production lines and hours needed for each shift
      </p>

      {error && (
        <div className="message message-error">{error}</div>
      )}
      {message && (
        <div className="message message-success">{message}</div>
      )}
      
      {!planSummary && !loading && (
        <div className="message message-info">
          No production plan found for this date. Create a production plan first, then use "Suggest Capacity" to auto-generate capacity lines.
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: "bold" }}>Date: </label>
        <DateInput value={date} onChange={setDate} />
      </div>

      {/* Production Plan Summary */}
      {planSummary && (
        <div className="summary-card">
          <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>Production Plan Summary</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">Total Lines</div>
              <div className="summary-value">{planSummary.totalLines}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Total Quantity</div>
              <div className="summary-value">{planSummary.totalQty}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Shifts</div>
              <div className="summary-value">{planSummary.shifts.join(', ')}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ margin: "16px 0", display: "flex", gap: "8px" }}>
        <button className="btn-info" onClick={handleSuggest} disabled={loading}>
          📋 Suggest Capacity
        </button>
        <button className="btn-success" onClick={handleSave} disabled={loading}>
          💾 Save Capacity
        </button>
        <button className="btn-primary" onClick={handleAddRow} disabled={loading}>
          ➕ Add Row
        </button>
      </div>

      {/* Shift Summary */}
      {rows.length > 0 && (
        <div className="summary-card">
          <h3 style={{ margin: "0 0 8px 0", color: "#333" }}>Capacity Overview</h3>
          <div className="summary-grid">
            {Object.entries(getShiftSummary()).map(([shift, data]) => (
              <div className="summary-item" key={shift}>
                <div className="summary-label">Shift {shift}</div>
                <div className="summary-value" style={{ fontSize: "18px" }}>
                  {data.lines} lines / {data.hours} hrs
                </div>
              </div>
            ))}
            <div className="summary-item" style={{ background: "#e7f3ff" }}>
              <div className="summary-label">Total</div>
              <div className="summary-value" style={{ fontSize: "18px", color: "#004085" }}>
                {getTotalLines()} lines / {getTotalHours()} hrs
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Table */}
      <table className="pp-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Line ID</th>
            <th>Shift</th>
            <th>Available Hours</th>
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
                <input
                  type="number"
                  className="medium-input"
                  value={row.available_hours}
                  onChange={(e) => handleRowChange(index, "available_hours", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.5"
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
              <td colSpan={5} style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                {planSummary 
                  ? 'Click "Suggest Capacity" to auto-generate from production plan, or "Add Row" to manually add lines.'
                  : 'Create a production plan first, then click "Suggest Capacity".'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CapacityPage;