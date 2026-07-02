import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import Table from "../components/common/Table";
import "../pages/style.css";

const GrnPage = () => {
  const [grns, setGrns] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [pos, setPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState("");
  const [loading, setLoading] = useState(false);

  const [items, setItems] = useState([
    {
      item_id: "",
      part_number: "",
      material_name: "",
      batch_no: "",
      uom: "",
      qty_received: "",
      price: "",
      expiry_date: "",
    },
  ]);

  const [formData, setFormData] = useState({
    grn_no: "",
    warehouse_id: "",
    received_date: new Date().toISOString().split("T")[0],
  });

  const [qcGRN, setQcGRN] = useState(null);
  const [qcItems, setQcItems] = useState([]);

  useEffect(() => {
    loadGrns();
    loadWarehouses();
    loadPOs();
  }, []);

  // ────────── DATA LOADING ──────────
  const loadWarehouses = async () => {
    try {
      const res = await axiosClient.get("/warehouse");
      setWarehouses(res.data || []);
      if (res.data?.length)
        setFormData((prev) => ({
          ...prev,
          warehouse_id: res.data[0].id.toString(),
        }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadGrns = async () => {
    try {
      const res = await axiosClient.get("/grn/pending");
      setGrns(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPOs = async () => {
    try {
      const res = await axiosClient.get("/grn/purchase-orders");
      setPOs((res.data || []).filter((p) => p.status === "OPEN"));
    } catch (err) {
      console.error(err);
    }
  };

  // ────────── PO SELECTION ──────────
  const handlePOChange = async (poId) => {
    setSelectedPO(poId);
    if (!poId) {
      setItems([
        {
          item_id: "",
          part_number: "",
          material_name: "",
          batch_no: "",
          uom: "",
          qty_received: "",
          price: "",
          expiry_date: "",
        },
      ]);
      return;
    }
    try {
      const res = await axiosClient.get(`/grn/po/${poId}/items`);
      setItems(
        (res.data || []).map((po) => ({
          item_id: po.material_id?.toString() || "",
          part_number: po.part_number || "",
          material_name: po.part_name || po.material_name || "",
          batch_no: po.batch_no || "",
          uom: po.uom || "",
          qty_received: po.qty?.toString() || "",
          price: po.price || "",
          expiry_date: po.expiry_date?.split("T")[0] || "",
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ────────── ITEM ROW MANAGEMENT ──────────
  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // ────────── SUBMIT ──────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validItems = items.filter((i) => i.item_id && i.qty_received);
    if (!validItems.length) {
      alert("Add at least one valid item");
      setLoading(false);
      return;
    }

    try {
      await axiosClient.post("/grn", {
        grn_no: formData.grn_no.trim().toUpperCase() || `GRN${Date.now()}`,
        warehouse_id: parseInt(formData.warehouse_id),
        received_date: formData.received_date,
        po_id: selectedPO || null,
        items: validItems.map((i) => ({
          item_id: parseInt(i.item_id),
          batch_no: i.batch_no,
          qty_received: parseInt(i.qty_received),
          expiry_date: i.expiry_date || null,
        })),
      });
      alert("✅ GRN created!");
      loadGrns();
      setFormData((prev) => ({
        ...prev,
        grn_no: "",
        received_date: new Date().toISOString().split("T")[0],
      }));
      setSelectedPO("");
      setItems([
        {
          item_id: "",
          part_number: "",
          material_name: "",
          batch_no: "",
          uom: "",
          qty_received: "",
          price: "",
          expiry_date: "",
        },
      ]);
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ────────── QC ──────────
  const openQCModal = async (grn) => {
    try {
      const res = await axiosClient.get(`/grn/${grn.id}/items`);
      setQcItems(
        (res.data || []).map((it) => ({
          ...it,
          accepted_qty:
            it.qc_status === "accepted"
              ? it.qty_received
              : it.accepted_qty || 0,
          rejected_qty:
            it.qc_status === "rejected"
              ? it.qty_received
              : it.rejected_qty || 0,
          qc_remarks: it.qc_remarks || "",
        })),
      );
      setQcGRN(grn);
    } catch (err) {
      console.error(err);
    }
  };

  const saveQC = async () => {
    // Validate each item
    for (const it of qcItems) {
      const qtyReceived = Number(it.qty_received) || 0;
      const acceptedQty = Number(it.accepted_qty) || 0;
      const rejectedQty = Number(it.rejected_qty) || 0;
      const total = acceptedQty + rejectedQty;

      if (it.qc_status === "pending") {
        alert(
          `❌ Please set a decision (Accept/Reject) for all items before saving.`,
        );
        return;
      }

      if (it.qc_status === "accepted" && acceptedQty <= 0) {
        alert(
          `❌ Accepted quantity must be greater than 0 for accepted items.`,
        );
        return;
      }

      if (it.qc_status === "rejected" && rejectedQty <= 0) {
        alert(
          `❌ Rejected quantity must be greater than 0 for rejected items.`,
        );
        return;
      }

      if (total !== qtyReceived) {
        alert(
          `❌ Accepted (${acceptedQty}) + Rejected (${rejectedQty}) = ${total}, but must equal Received Qty (${qtyReceived}).`,
        );
        return;
      }
    }

    try {
      const payload = {
        grnId: qcGRN.id,
        items: qcItems.map((it) => ({
          id: it.id,
          qc_status: it.qc_status,
          accepted_qty: Number(it.accepted_qty),
          rejected_qty: Number(it.rejected_qty),
          qc_remarks: it.qc_remarks,
        })),
      };
      await axiosClient.put(`/grn/${qcGRN.id}/qc`, payload);
      alert("✅ QC saved successfully!");
      setQcGRN(null);
      loadGrns();
    } catch (err) {
      alert("❌ QC failed: " + (err.response?.data?.error || err.message));
    }
  };

  // ────────── PUTAWAY ──────────
  const handlePutAway = async (grnId) => {
    if (!window.confirm("Put away accepted items?")) return;
    try {
      await axiosClient.put(`/grn/${grnId}/putaway`);
      alert("✅ Put‑away completed!");
      loadGrns();
    } catch (err) {
      alert("❌ " + (err.response?.data?.error || err.message));
    }
  };

  // ────────── COLUMNS ──────────
  const grnColumns = [
    { key: "grn_no", label: "GRN No" },
    {
      key: "received_date",
      label: "Date",
      render: (row) => new Date(row.received_date).toLocaleDateString("en-IN"),
    },
    { key: "total_items", label: "Items" },
    { key: "po_no", label: "PO" },
    {
      key: "qc",
      label: "QC",
      render: (row) => {
        if (row.rejected_count === row.item_count)
          return <span style={{ color: "red" }}>🔴 Rejected</span>;
        if (row.accepted_count > 0)
          return (
            <span style={{ color: "green" }}>
              🟢 {row.accepted_count} Accepted
            </span>
          );
        return <span style={{ color: "orange" }}>🟡 Pending</span>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <>
          <button
            className="btn btn-sm btn-info"
            style={{ marginRight: 5 }}
            onClick={() => openQCModal(row)}
          >
            🔍 QC
          </button>
          <button
            className="btn btn-sm btn-success"
            onClick={() => handlePutAway(row.id)}
            disabled={!row.accepted_count}
          >
            📦 Put Away
          </button>
        </>
      ),
    },
  ];

  const totalPending = grns.reduce(
    (s, g) => s + (Number(g.total_items) || 0),
    0,
  );

  // ────────── RENDER ──────────
  return (
    <div>
      <div className="page-header">
        <h1>📥 RM Inward (GRN)</h1>
        <span style={{ color: "#27ae60", fontWeight: "bold" }}>
          📦 Pending: {totalPending} items
        </span>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Warehouses</h3>
          <p className="metric-value">{warehouses.length}</p>
        </div>
        <div className="card">
          <h3>Pending GRNs</h3>
          <p className="metric-value">{grns.length}</p>
        </div>
        <div className="card">
          <h3>Pending Items</h3>
          <p className="metric-value">{totalPending}</p>
        </div>
      </div>

      {/* CREATE FORM */}
      <div className="card">
        <h3>➕ Create New GRN</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              GRN No <small>(auto if blank)</small>
            </label>
            <input
              value={formData.grn_no}
              onChange={(e) =>
                setFormData({ ...formData, grn_no: e.target.value })
              }
              placeholder="GRN-001"
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <div className="form-group">
              <label>Warehouse *</label>
              <select
                value={formData.warehouse_id}
                onChange={(e) =>
                  setFormData({ ...formData, warehouse_id: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Received Date *</label>
              <input
                type="date"
                value={formData.received_date}
                onChange={(e) =>
                  setFormData({ ...formData, received_date: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: "1rem" }}>
            <label>Purchase Order</label>
            <select
              value={selectedPO}
              onChange={(e) => handlePOChange(e.target.value)}
            >
              <option value="">-- Select PO --</option>
              {pos.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.po_no}
                </option>
              ))}
            </select>
          </div>

          {/* ITEMS TABLE */}
          <div
            className="card"
            style={{ marginTop: "1rem", background: "#f8f9fa" }}
          >
            <h4>📋 Items Received</h4>
            <table
              className="table"
              style={{ width: "100%", fontSize: "13px" }}
            >
              <thead>
                <tr>
                  <th>Part No</th>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>UOM</th>
                  <th>Price</th>
                  <th>Qty *</th>
                  <th>Expiry</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={item.part_number}
                        readOnly
                        style={{ width: "100px", background: "#f0f0f0" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.material_name}
                        readOnly
                        style={{ width: "150px", background: "#f0f0f0" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.batch_no}
                        onChange={(e) =>
                          updateItem(idx, "batch_no", e.target.value)
                        }
                        style={{ width: "120px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.uom}
                        readOnly
                        style={{ width: "60px", background: "#f0f0f0" }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={item.price}
                        readOnly
                        style={{ width: "80px", background: "#f0f0f0" }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.qty_received}
                        onChange={(e) =>
                          updateItem(idx, "qty_received", e.target.value)
                        }
                        required
                        style={{ width: "80px" }}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={item.expiry_date}
                        onChange={(e) =>
                          updateItem(idx, "expiry_date", e.target.value)
                        }
                        style={{ width: "130px" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "1rem" }}
          >
            {loading ? "⏳ Creating..." : "➕ Create GRN"}
          </button>
        </form>
      </div>

      {/* GRN LIST */}
      <div className="card">
        <h3>📋 Pending GRNs ({grns.length})</h3>
        {grns.length > 0 ? (
          <Table columns={grnColumns} data={grns} />
        ) : (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            No pending GRNs
          </div>
        )}
      </div>

      {/* QC MODAL */}
      {qcGRN && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "50px auto",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <h3>QC - {qcGRN.grn_no}</h3>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Batch</th>
                  <th>Qty</th>
                  <th>Decision</th>
                  <th>Acc Qty</th>
                  <th>Rej Qty</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {qcItems.map((it, idx) => (
                  <tr key={it.id}>
                    <td>{it.part_name || it.name}</td>
                    <td>{it.batch_no}</td>
                    <td>{it.qty_received}</td>
                    <td>
                      <select
                        value={it.qc_status}
                        onChange={(e) => {
                          const newItems = [...qcItems];
                          newItems[idx].qc_status = e.target.value;
                          if (e.target.value === "accepted") {
                            newItems[idx].accepted_qty = it.qty_received;
                            newItems[idx].rejected_qty = 0;
                          } else if (e.target.value === "rejected") {
                            newItems[idx].rejected_qty = it.qty_received;
                            newItems[idx].accepted_qty = 0;
                          }
                          setQcItems(newItems);
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accept</option>
                        <option value="rejected">Reject</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={it.accepted_qty}
                        onChange={(e) => {
                          const n = [...qcItems];
                          n[idx].accepted_qty = e.target.value;
                          setQcItems(n);
                        }}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={it.rejected_qty}
                        onChange={(e) => {
                          const n = [...qcItems];
                          n[idx].rejected_qty = e.target.value;
                          setQcItems(n);
                        }}
                        style={{ width: 70 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={it.qc_remarks}
                        onChange={(e) => {
                          const n = [...qcItems];
                          n[idx].qc_remarks = e.target.value;
                          setQcItems(n);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: "1rem" }}>
              <button className="btn btn-primary" onClick={saveQC}>
                Save QC
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setQcGRN(null)}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrnPage;
