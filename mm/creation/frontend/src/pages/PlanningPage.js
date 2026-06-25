import React, { useEffect, useState } from "react";
import stockApi from "../api/stockApi";
import materialApi from "../api/materialApi";
import prApi from "../api/prApi";

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
  color: "#111827"
};

const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  padding: "16px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  marginBottom: "16px"
};

const textStyle = {
  fontSize: "13px",
  color: "#4b5563"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "13px",
  marginTop: "8px"
};

const thStyle = {
  textAlign: "left",
  padding: "6px 8px",
  borderBottom: "1px solid #e5e7eb",
  backgroundColor: "#f9fafb"
};

const tdStyle = {
  padding: "6px 8px",
  borderBottom: "1px solid #f3f4f6"
};

const buttonStyle = {
  padding: "4px 8px",
  fontSize: "11px",
  borderRadius: "4px",
  border: "none",
  cursor: "pointer",
  backgroundColor: "#2563eb",
  color: "#ffffff"
};

export default function PlanningPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingPR, setCreatingPR] = useState(null);

  const loadPlanning = async () => {
    try {
      setLoading(true);

      // Fetch all required data
      const [stockRes, matRes, prRes] = await Promise.all([
        stockApi.getSummary(),
        materialApi.getAll(),
        prApi.getAll()
      ]);

      const stockData = stockRes.data || [];
      const materials = matRes.data || [];
      const allPRs = prRes.data || [];

      console.log("Stock Data:", stockData);
      console.log("Materials:", materials);

      // Group stock by material NAME (not ID) to handle duplicates
      const stockByName = {};
      stockData.forEach(row => {
        // Find material name from materials list
        const material = materials.find(m => m.id === row.material_id);
        const materialName = material ? material.name : `Material-${row.material_id}`;
        
        if (!stockByName[materialName]) {
          stockByName[materialName] = {
            totalQty: 0,
            uom: material ? material.uom : "KG",
            material_id: row.material_id,
            batches: []
          };
        }
        stockByName[materialName].totalQty += Number(row.qty || 0);
        stockByName[materialName].batches.push(row);
      });

      // Also include materials with zero stock but need to be considered
      materials.forEach(m => {
        if (!stockByName[m.name]) {
          stockByName[m.name] = {
            totalQty: 0,
            uom: m.uom,
            material_id: m.id,
            batches: []
          };
        }
      });

      console.log("Stock by Name:", stockByName);

      // Group pending PRs by material name
      const pendingByName = {};
      const openPRs = allPRs.filter(pr => pr.status === 'OPEN' || pr.status === 'APPROVED');
      openPRs.forEach(pr => {
        if (pr.items && pr.items.length) {
          pr.items.forEach(item => {
            const material = materials.find(m => m.id === item.material_id);
            const materialName = material ? material.name : `Material-${item.material_id}`;
            pendingByName[materialName] = (pendingByName[materialName] || 0) + Number(item.qty || 0);
          });
        }
      });

      // Build planning rows
      const planningRows = Object.keys(stockByName).map((materialName) => {
        const stock = stockByName[materialName];
        const currentQty = stock.totalQty;
        const pendingQty = pendingByName[materialName] || 0;
        const effectiveQty = currentQty + pendingQty;
        const minQty = 10;
        const maxQty = 30;
        const suggestedQty = Math.max(0, maxQty - effectiveQty);

        return {
          material_id: stock.material_id,
          material_name: materialName,
          uom: stock.uom,
          currentQty,
          pendingQty,
          effectiveQty,
          minQty,
          maxQty,
          suggestedQty,
          needsReorder: currentQty < minQty
        };
      });

      // Show only materials that need reorder (current stock below min)
      const filtered = planningRows.filter((r) => r.currentQty < r.minQty);
      
      // Sort by current stock (lowest first)
      filtered.sort((a, b) => a.currentQty - b.currentQty);
      
      setRows(filtered);
    } catch (e) {
      console.error(e);
      alert("Error loading planning data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const createPRFromSuggestion = async (material) => {
    if (material.suggestedQty <= 0) {
      alert(`Cannot create PR for ${material.material_name}. Suggested quantity is ${material.suggestedQty}.`);
      return;
    }

    const message = `Create Purchase Requisition for:\n\n` +
      `Material: ${material.material_name}\n` +
      `Suggested Quantity: ${material.suggestedQty} ${material.uom}\n` +
      `Current Stock: ${material.currentQty}\n` +
      `Pending PRs: ${material.pendingQty}\n` +
      `Effective Stock: ${material.effectiveQty}\n` +
      `Min Level: ${material.minQty}\n` +
      `Max Level: ${material.maxQty}\n\n` +
      `Proceed?`;

    if (!window.confirm(message)) return;
    
    setCreatingPR(material.material_id);
    try {
      const today = new Date();
      const reqDate = today.toISOString().split('T')[0];
      const requiredDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      
      const cleanName = material.material_name.replace(/[^A-Za-z0-9]/g, '');
      const batchNo = `PLAN-${cleanName}-${Date.now()}`;

      const payload = {
        header: {
          req_date: reqDate,
          requester: "Planning System",
          uom: material.uom,
          batch: batchNo,
          plant: "PLANT01",
          purchase_org: "PO001"
        },
        items: [
          {
            material_id: material.material_id,
            qty: material.suggestedQty,
            required_date: requiredDate,
            remarks: `Auto-generated from Planning Board - Stock: ${material.currentQty}`
          }
        ]
      };

      await prApi.create(payload);
      alert(`✅ Purchase Requisition created for ${material.material_name}\nQuantity: ${material.suggestedQty} ${material.uom}`);
      await loadPlanning();
    } catch (e) {
      console.error(e);
      alert(`Error creating PR: ${e.response?.data?.message || e.message}`);
    } finally {
      setCreatingPR(null);
    }
  };

  useEffect(() => {
    loadPlanning();
  }, []);

  // Calculate totals for display
  const totalCurrentStock = rows.reduce((sum, r) => sum + r.currentQty, 0);
  const totalSuggestedQty = rows.reduce((sum, r) => sum + r.suggestedQty, 0);

  return (
    <div>
      <div style={titleStyle}>Planning Board</div>

      <div style={cardStyle}>
        <p style={textStyle}>
          This view suggests PR quantities when current stock goes below a simple minimum level for each material.
        </p>

        <div style={{ display: "flex", gap: "8px", marginTop: "8px", marginBottom: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            style={{
              padding: "6px 10px",
              fontSize: "13px",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              backgroundColor: "#f9fafb",
              cursor: "pointer"
            }}
            onClick={loadPlanning}
          >
            🔄 Refresh suggestions
          </button>
          
          {rows.length > 0 && (
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Total stock: <strong>{totalCurrentStock}</strong> | Suggested: <strong>{totalSuggestedQty}</strong>
            </span>
          )}
        </div>

        {loading ? (
          <div style={textStyle}>Calculating suggestions...</div>
        ) : rows.length === 0 ? (
          <div style={{ ...textStyle, textAlign: "center", padding: "20px", backgroundColor: "#f0fdf4", borderRadius: "6px" }}>
            ✅ All materials are above minimum stock.
          </div>
        ) : (
          <div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>UOM</th>
                  <th style={thStyle}>Current Stock</th>
                  <th style={thStyle}>Pending PR</th>
                  <th style={thStyle}>Effective Stock</th>
                  <th style={thStyle}>Min / Max</th>
                  <th style={thStyle}>Suggested Qty</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const canCreatePR = r.suggestedQty > 0;
                  
                  return (
                    <tr key={r.material_id} style={r.currentQty === 0 ? { backgroundColor: "#fee2e2" } : {}}>
                      <td style={tdStyle}>
                        <strong>{r.material_name}</strong>
                        {r.currentQty === 0 && (
                          <span style={{ marginLeft: "4px", fontSize: "10px", color: "#dc2626" }}>⚠️ Out of Stock</span>
                        )}
                        {r.currentQty > 0 && r.currentQty < r.minQty && (
                          <span style={{ marginLeft: "4px", fontSize: "10px", color: "#f59e0b" }}>⚠️ Low Stock</span>
                        )}
                      </td>
                      <td style={tdStyle}>{r.uom}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: "bold" }}>
                          {r.currentQty}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {r.pendingQty > 0 ? (
                          <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{r.pendingQty}</span>
                        ) : "-"}
                      </td>
                      <td style={tdStyle}>
                        <span>
                          {r.effectiveQty}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {r.minQty} / {r.maxQty}
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#2563eb", fontSize: "14px" }}>{r.suggestedQty}</strong>
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={buttonStyle}
                          onClick={() => createPRFromSuggestion(r)}
                          disabled={creatingPR === r.material_id || r.suggestedQty <= 0}
                        >
                          {creatingPR === r.material_id ? "Creating..." : "Create PR"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {/* Info message */}
            <div style={{ 
              marginTop: "16px", 
              padding: "12px", 
              backgroundColor: "#dbeafe", 
              borderRadius: "6px",
              borderLeft: "3px solid #2563eb"
            }}>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1e40af", marginBottom: "4px" }}>
                ℹ️ Stock Information
              </div>
              <div style={{ fontSize: "12px", color: "#1e40af" }}>
                • Current Stock includes all batches from Stock Summary (Total: 78 units across all materials)<br/>
                • Pending PR shows open Purchase Requisitions not yet received<br/>
                • Effective Stock = Current Stock + Pending PR<br/>
                • Suggested Qty = Max Level - Effective Stock
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}