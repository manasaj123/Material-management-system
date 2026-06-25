import React, { useEffect, useState } from "react";
import DateInput from "../components/DateInput";
import workOrderApi from "../api/workOrderApi";
import batchApi from "../api/batchApi";
import productApi from "../api/productApi";
import gradePackApi from "../api/gradePackApi";
import NumberInput from "../components/NumberInput";

function WorkOrderPage() {
  const [date, setDate] = useState("2026-01-20");
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [gradePacks, setGradePacks] = useState([]);
  const [batches, setBatches] = useState([]);

  // Form fields
  const [batchId, setBatchId] = useState("");
  const [lineId, setLineId] = useState(1);
  const [shift, setShift] = useState(1);
  const [productId, setProductId] = useState("");
  const [gradePackId, setGradePackId] = useState("");
  const [plannedQty, setPlannedQty] = useState(0);

  useEffect(() => {
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
    loadMasterData();
  }, []);

  useEffect(() => {
    if (date) {
      const loadData = async () => {
        setLoading(true);
        setError("");
        try {
          const [workOrderData, batchData] = await Promise.all([
            workOrderApi.getByDate(date).catch(() => []),
            batchApi.getByDate(date).catch(() => [])
          ]);
          setRows(workOrderData || []);
          setBatches(batchData || []);
        } catch (err) {
          setError("Failed to load work orders");
          console.error("Load work orders error:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [date]);

  const handleCreate = async () => {
    setError("");
    setMessage("");

    if (!productId) {
      setError("Please select a product");
      return;
    }
    if (!gradePackId) {
      setError("Please select a grade/pack");
      return;
    }
    if (!plannedQty || plannedQty <= 0) {
      setError("Planned quantity must be greater than 0");
      return;
    }
    if (!lineId || lineId < 1) {
      setError("Please enter a valid line ID");
      return;
    }
    if (!shift || shift < 1) {
      setError("Please enter a valid shift");
      return;
    }

    setLoading(true);
    try {
      await workOrderApi.create({
        plan_date: date,
        batch_id: batchId || null,
        line_id: lineId,
        shift: shift,
        product_id: parseInt(productId),
        grade_pack_id: parseInt(gradePackId),
        planned_qty: parseFloat(plannedQty),
        actual_qty: 0,
        wastage_qty: 0,
        status: "open"
      });

      setMessage("Work order created successfully!");
      setBatchId("");
      setLineId(1);
      setShift(1);
      setProductId("");
      setGradePackId("");
      setPlannedQty(0);
      
      // Reload work orders
      const workOrderData = await workOrderApi.getByDate(date);
      setRows(workOrderData || []);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to create work order");
      console.error("Create work order error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (row) => {
    setError("");
    setMessage("");

    setLoading(true);
    try {
      await workOrderApi.updateActuals(row.id, {
        actual_qty: parseFloat(row.actual_qty) || 0,
        wastage_qty: parseFloat(row.wastage_qty) || 0,
        status: row.status
      });
      setMessage("Work order updated successfully!");
      
      const workOrderData = await workOrderApi.getByDate(date);
      setRows(workOrderData || []);
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to update work order");
      console.error("Update work order error:", err);
    } finally {
      setLoading(false);
    }
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

  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? `${product.code} - ${product.name}` : `Product #${productId}`;
  };

  const getGradePackName = (gradePackId) => {
    const gradePack = gradePacks.find(g => g.id === parseInt(gradePackId));
    return gradePack ? `${gradePack.name || gradePack.code}` : `Grade/Pack #${gradePackId}`;
  };

  const getBatchInfo = (batchId) => {
    const batch = batches.find(b => b.id === parseInt(batchId));
    return batch ? `Batch #${batch.id} (${batch.batch_size})` : `Batch #${batchId}`;
  };

  const getTotalPlanned = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.planned_qty || 0), 0);
  };

  const getTotalActual = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.actual_qty || 0), 0);
  };

  const getTotalWastage = () => {
    return rows.reduce((sum, row) => sum + parseFloat(row.wastage_qty || 0), 0);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <style>{`
        .pp-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13px;
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
          font-size: 12px;
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
          font-size: 11px;
        }
        .btn-success:hover:not(:disabled) {
          background-color: #218838;
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
          font-size: 13px;
        }
        .form-row {
          display: flex;
          gap: 8px;
          margin: 12px 0;
          align-items: flex-end;
          flex-wrap: wrap;
        }
        .field-box {
          border: 1px solid #ddd;
          padding: 4px 6px;
          border-radius: 4px;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          font-size: 12px;
          min-width: 130px;
        }
        .field-label {
          margin-bottom: 2px;
          font-weight: 500;
          font-size: 11px;
          white-space: nowrap;
        }
        .small-input {
          width: 60px;
        }
      `}</style>

      <h2>Work Orders / Execution</h2>
      <p style={{ color: "#666", marginTop: "-0px", marginBottom: "20px", fontSize: "13px" }}>
        Track actual production quantities and wastage against planned work orders
      </p>

      {error && <div className="message message-error">{error}</div>}
      {message && <div className="message message-success">{message}</div>}

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: "bold" }}>Date: </label>
        <DateInput value={date} onChange={setDate} />
      </div>

      {/* Create Work Order Form */}
      <h3>Create Work Order</h3>
      <div className="form-row">
        <div className="field-box">
          <span className="field-label">Batch ID</span>
          <select
            value={batchId}
            onChange={(e) => {
              setBatchId(e.target.value);
              setError("");
            }}
          >
            <option value="">No Batch</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                Batch #{b.id} (Qty: {b.batch_size})
              </option>
            ))}
          </select>
        </div>

        <div className="field-box">
          <span className="field-label">Product</span>
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

        <div className="field-box">
          <span className="field-label">Grade/Pack</span>
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

        <div className="field-box">
          <span className="field-label">Line ID</span>
          <NumberInput value={lineId} onChange={setLineId} min={1} />
        </div>

        <div className="field-box">
          <span className="field-label">Shift</span>
          <NumberInput value={shift} onChange={setShift} min={1} />
        </div>

        <div className="field-box">
          <span className="field-label">Planned Qty</span>
          <NumberInput value={plannedQty} onChange={setPlannedQty} min={0} />
        </div>

        <div className="field-box">
          <span className="field-label">&nbsp;</span>
          <button className="btn-primary" onClick={handleCreate} disabled={loading}>
            Create WO
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats">
        <span><strong>Total Planned: </strong>{getTotalPlanned().toFixed(2)}</span>
        <span><strong>Total Actual: </strong>{getTotalActual().toFixed(2)}</span>
        <span><strong>Total Wastage: </strong>{getTotalWastage().toFixed(2)}</span>
        <span><strong>Orders: </strong>{rows.length}</span>
      </div>

      {/* Work Orders Table */}
      <table className="pp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Batch</th>
            <th>Product</th>
            <th>Grade/Pack</th>
            <th>Line</th>
            <th>Shift</th>
            <th>Planned Qty</th>
            <th>Actual Qty</th>
            <th>Wastage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index}>
              <td>{row.id}</td>
              <td>{row.batch_id ? getBatchInfo(row.batch_id) : '-'}</td>
              <td>{getProductName(row.product_id)}</td>
              <td>{getGradePackName(row.grade_pack_id)}</td>
              <td>{row.line_id}</td>
              <td>{row.shift}</td>
              <td>{parseFloat(row.planned_qty).toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  className="small-input"
                  value={row.actual_qty}
                  onChange={(e) => handleRowChange(index, "actual_qty", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </td>
              <td>
                <input
                  type="number"
                  className="small-input"
                  value={row.wastage_qty}
                  onChange={(e) => handleRowChange(index, "wastage_qty", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </td>
              <td>
                <select
                  value={row.status}
                  onChange={(e) => handleRowChange(index, "status", e.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                <button 
                  className="btn-success"
                  onClick={() => handleUpdate(row)}
                  disabled={loading}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !loading && (
            <tr>
              <td colSpan={11} style={{ textAlign: "center", color: "#666", padding: "20px" }}>
                No work orders for this date. Create a work order above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default WorkOrderPage;