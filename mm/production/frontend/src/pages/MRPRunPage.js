import React, { useState } from "react";
import DateInput from "../components/DateInput";
import mrpApi from "../api/mrpApi";

function MRPRunPage() {
  const [date, setDate] = useState("2026-01-20");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState([]);

  const handleRun = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);
    setRequirements([]);
    
    try {
      const res = await mrpApi.run(date);
      setResult(res);
      setMessage(res.message || "");
      
      // If there are requirements, fetch them
      if (res.inserted > 0) {
        await loadRequirements();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to run MRP");
      console.error("MRP run error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRequirements = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/mrp?date=${date}`);
      const data = await response.json();
      setRequirements(data || []);
    } catch (err) {
      console.error("Failed to load requirements:", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#ffc107';
      case 'fulfilled': return '#28a745';
      case 'partial': return '#17a2b8';
      default: return '#6c757d';
    }
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
          font-size: 13px;
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
        .message {
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          animation: fadeIn 0.3s ease-in;
          font-size: 13px;
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
        .result-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          margin-top: 16px;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          margin-top: 12px;
        }
        .stat-item {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          text-align: center;
        }
        .stat-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 20px;
          font-weight: bold;
          color: #333;
        }
        .status-badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          display: inline-block;
        }
      `}</style>

      <h2>MRP – Material Requirement Planning</h2>
      <p style={{ color: "#666", marginTop: "-0px", marginBottom: "20px", fontSize: "13px" }}>
        Calculate material requirements based on production plan and BOM (Bill of Materials)
      </p>

      {error && <div className="message message-error">{error}</div>}
      {message && <div className="message message-success">{message}</div>}

      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
        <label style={{ fontWeight: "bold" }}>Date: </label>
        <DateInput value={date} onChange={setDate} />
        <button className="btn-primary" onClick={handleRun} disabled={loading}>
          {loading ? "Running..." : "🔧 Run MRP"}
        </button>
      </div>

      {!loading && !result && (
        <div className="message message-info">
          Click "Run MRP" to calculate material requirements for the production plan on this date.
          <br />
          <small>Make sure you have a Production Plan and BOM defined for the products.</small>
        </div>
      )}

      {result && (
        <div className="result-card">
          <h3 style={{ margin: "0 0 12px 0" }}>MRP Results</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <div className="stat-label">Production Plan Lines</div>
              <div className="stat-value">{result.planLines || 0}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Material Requirements</div>
              <div className="stat-value">{result.inserted || 0}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ fontSize: "14px", color: result.inserted > 0 ? "#28a745" : "#ffc107" }}>
                {result.inserted > 0 ? "✓ Complete" : "⚠️ No BOM Found"}
              </div>
            </div>
          </div>
        </div>
      )}

      {requirements.length > 0 && (
        <>
          <h3 style={{ marginTop: "20px" }}>Material Requirements Detail</h3>
          <table className="pp-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Material</th>
                <th>Required Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req, index) => (
                <tr key={req.id || index}>
                  <td>{index + 1}</td>
                  <td>{req.product_name || `Product #${req.product_id}`} ({req.product_code || ''})</td>
                  <td>{req.material_name || `Material #${req.material_id}`} ({req.material_code || ''})</td>
                  <td>{parseFloat(req.required_qty).toFixed(2)}</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(req.status) }}>
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {result && result.inserted === 0 && result.planLines > 0 && (
        <div className="message message-info" style={{ marginTop: "16px" }}>
          <strong>Note:</strong> Production plan exists but no material requirements were generated. 
          <br />
          This means no BOM (Bill of Materials) is defined for the products in the plan. 
          <br />
          Add BOM entries to specify which materials are needed for each product.
        </div>
      )}
    </div>
  );
}

export default MRPRunPage;