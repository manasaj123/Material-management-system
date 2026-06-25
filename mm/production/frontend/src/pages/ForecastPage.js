import React, { useEffect, useState } from "react";
import forecastApi from "../api/forecastApi";
import productApi from "../api/productApi";
import gradePackApi from "../api/gradePackApi";
import NumberInput from "../components/NumberInput";

const formRowStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  alignItems: "flex-end",
  flexWrap: "wrap"
};

const fieldBoxStyle = {
  border: "1px solid #ddd",
  padding: "6px 8px",
  borderRadius: "4px",
  background: "#f9fafb",
  display: "flex",
  flexDirection: "column",
  fontSize: "13px",
  minWidth: "150px"
};

const labelStyle = {
  marginBottom: "4px",
  fontWeight: "500"
};

function ForecastPage() {
  const [period, setPeriod] = useState("2026-W03");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [gradePacks, setGradePacks] = useState([]);

  // Form fields for one line
  const [productId, setProductId] = useState("");
  const [gradePackId, setGradePackId] = useState("");
  const [forecastQty, setForecastQty] = useState(0);

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (period) {
      loadForecast(period);
    }
  }, [period]);

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
      setError("Failed to load products or grade packs");
    }
  };

  const loadForecast = async (p) => {
    setLoading(true);
    setError("");
    try {
      const data = await forecastApi.getByPeriod(p);
      setRows(data || []);
    } catch (err) {
      setError("Failed to load forecast data");
      console.error("Load forecast error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = async () => {
    setError("");
    setMessage("");

    // Validation
    if (!productId) {
      setError("Please select a product");
      return;
    }
    if (!gradePackId) {
      setError("Please select a grade/pack");
      return;
    }
    if (!forecastQty || forecastQty <= 0) {
      setError("Forecast quantity must be greater than 0");
      return;
    }

    // Check for duplicate product + grade_pack combination
    const exists = rows.some(
      r => r.product_id === parseInt(productId) && 
           r.grade_pack_id === parseInt(gradePackId)
    );
    
    if (exists) {
      const product = products.find(p => p.id === parseInt(productId));
      const gradePack = gradePacks.find(g => g.id === parseInt(gradePackId));
      setError(`"${product?.name || product?.code || 'Product'}" with "${gradePack?.name || gradePack?.code || 'Grade/Pack'}" already exists in forecast. Delete the existing line first to add a new one.`);
      return;
    }

    setLoading(true);
    try {
      const newRows = [
        ...rows,
        { 
          product_id: parseInt(productId), 
          grade_pack_id: parseInt(gradePackId), 
          forecast_qty: parseFloat(forecastQty)
        }
      ];

      await forecastApi.save(period, newRows);
      
      const product = products.find(p => p.id === parseInt(productId));
      const gradePack = gradePacks.find(g => g.id === parseInt(gradePackId));
      setMessage(`Forecast added: ${product?.name || product?.code || 'Product'} - ${gradePack?.name || gradePack?.code || 'Grade/Pack'} (Qty: ${forecastQty})`);
      setProductId("");
      setGradePackId("");
      setForecastQty(0);

      await loadForecast(period);
      
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setError("Failed to save forecast line");
      console.error("Save forecast error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLine = async (index) => {
    if (!window.confirm("Are you sure you want to delete this forecast line?")) return;

    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const newRows = rows.filter((_, i) => i !== index);
      await forecastApi.save(period, newRows);
      
      const product = products.find(p => p.id === rows[index].product_id);
      const gradePack = gradePacks.find(g => g.id === rows[index].grade_pack_id);
      setMessage(`Deleted ${product?.name || 'Product'} - ${gradePack?.name || 'Grade/Pack'} from forecast`);
      await loadForecast(period);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete forecast line");
      console.error("Delete forecast error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.code} - ${product.name}` : `Product #${productId}`;
  };

  const getGradePackName = (gradePackId) => {
    const gradePack = gradePacks.find(g => g.id === gradePackId);
    return gradePack ? `${gradePack.name || gradePack.code}` : `Grade/Pack #${gradePackId}`;
  };

  const getTotalForecastQty = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.forecast_qty || 0), 0);
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
          min-width: 180px;
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
          margin-bottom: 16px;
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
        .stats {
          background-color: #e7f3ff;
          padding: 8px 12px;
          border-radius: 4px;
          margin-bottom: 16px;
          color: #004085;
        }
      `}</style>

      <h2>Demand Forecast</h2>

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

      <div style={{ marginBottom: 16 }}>
        <label>
          <strong>Period: </strong>
          <input
            type="text"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            style={{ marginLeft: 6 }}
            placeholder="e.g., 2026-W03"
          />
        </label>
      </div>

      <h3>Create Forecast Line</h3>
      <div style={formRowStyle}>
        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Product</span>
          <select
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setError("");
            }}
          >
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Grade/Pack</span>
          <select
            value={gradePackId}
            onChange={(e) => {
              setGradePackId(e.target.value);
              setError("");
            }}
          >
            <option value="">Select Grade/Pack</option>
            {gradePacks.map(g => (
              <option key={g.id} value={g.id}>
                {g.name || g.code || `Grade/Pack #${g.id}`}
              </option>
            ))}
          </select>
        </div>

        <div style={fieldBoxStyle}>
          <span style={labelStyle}>Forecast Qty</span>
          <NumberInput
            value={forecastQty}
            onChange={(val) => {
              setForecastQty(val);
              setError("");
            }}
            min={0}
          />
        </div>

        <button 
          className="btn-primary"
          onClick={handleAddLine}
          disabled={loading}
        >
          {loading ? "Adding..." : "Create Forecast"}
        </button>
      </div>

      <div className="stats">
        <strong>Total Forecast Quantity: </strong>{getTotalForecastQty().toFixed(2)}
        {" | "}
        <strong>Lines: </strong>{rows.length}
      </div>

      <h3>Forecast Lines</h3>
      <table className="pp-table">
        <thead>
          <tr>
            <th>Forecast id</th>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Forecast Qty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, index) => (
            <tr key={`${r.product_id}_${r.grade_pack_id}`}>
              <td>{index + 1}</td>
              <td>{getProductName(r.product_id)}</td>
              <td>{getGradePackName(r.grade_pack_id)}</td>
              <td>{parseFloat(r.forecast_qty).toFixed(2)}</td>
              <td>
                <button 
                  className="btn-danger"
                  onClick={() => handleDeleteLine(index)}
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loading && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "#666" }}>
                No forecast lines for this period. Add your first forecast line above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ForecastPage;