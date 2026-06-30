import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import materialApi from "../api/materialApi";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    setRefreshing(true);

    const res = await materialApi.getAll();
    setMaterials(res.data || []);
  } catch (err) {
    console.error("Failed to load dashboard", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

  const totalMaterials = materials.length;

  const activeMaterials = materials.filter(
    (m) => m.status === "Active"
  ).length;

  const materialTypes = new Set(
    materials.map((m) => m.material_type)
  ).size;

  const storageLocations = new Set(
    materials.map((m) => m.storage_location)
  ).size;
  const filteredMaterials = materials.filter((item) =>
  item.part_name?.toLowerCase().includes(search.toLowerCase()) ||
  item.material_name?.toLowerCase().includes(search.toLowerCase()) ||
  item.part_number?.toLowerCase().includes(search.toLowerCase())
);

  const cardStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    flex: 1,
    minWidth: 220
  };

  const numberStyle = {
    fontSize: 34,
    fontWeight: "bold",
    color: "#2563eb",
    marginTop: 10
  };

  if (loading) {
    return <h3>Loading Dashboard...</h3>;
  }
  const materialTypeSummary = materials.reduce((acc, item) => {
  const type = item.material_type || "Unknown";
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});

const storageSummary = materials.reduce((acc, item) => {
  const location = item.storage_location || "Unknown";
  acc[location] = (acc[location] || 0) + 1;
  return acc;
}, {});

  return (
    <div>

      <h1 style={{ marginBottom: 8 }}>
        Material Management Dashboard
      </h1>

      <p style={{ color: "#666", marginBottom: 30 }}>
        Overview of all material records
      </p>

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 30
        }}
      >
        <div style={cardStyle}>
          <h3>📦 Total Materials</h3>
          <div style={numberStyle}>{totalMaterials}</div>
        </div>

        <div style={cardStyle}>
          <h3>✅ Active Materials</h3>
          <div style={numberStyle}>{activeMaterials}</div>
        </div>

        <div style={cardStyle}>
          <h3>🏷 Material Types</h3>
          <div style={numberStyle}>{materialTypes}</div>
        </div>

        <div style={cardStyle}>
          <h3>📍 Storage Locations</h3>
          <div style={numberStyle}>{storageLocations}</div>
        </div>
      </div>

      <div
  style={{
    display: "flex",
    gap: "15px",
    marginBottom: "30px"
  }}
>
  <button
  onClick={loadDashboard}
  disabled={refreshing}
  style={{
    background: refreshing ? "#94a3b8" : "#16a34a",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    cursor: refreshing ? "not-allowed" : "pointer",
    fontWeight: "bold"
  }}
>
  {refreshing ? "Refreshing..." : "🔄 Refresh Dashboard"}
</button>

  <button
    onClick={() => navigate("/materials")}
    style={{
      background: "#2563eb",
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: 8,
      cursor: "pointer",
      fontWeight: "bold"
    }}
  >
    📦 View All Materials
  </button>
</div>
      <div
  style={{
    marginTop: 40,
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  }}
>
  <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  }}
>
  <h2>Recent Materials</h2>

  <input
    type="text"
    placeholder="Search Material..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: 280,
      padding: 10,
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 15
    }}
  />
</div>
  

  <table
    style={{
      width: "100%",
      borderCollapse: "collapse"
    }}
  >
    <thead>
      <tr style={{ background: "#2563eb", color: "#fff" }}>
        <th style={{ padding: 12 }}>Part No</th>
        <th style={{ padding: 12 }}>Part Name</th>
        <th style={{ padding: 12 }}>Material</th>
        <th style={{ padding: 12 }}>Qty</th>
        <th style={{ padding: 12 }}>Status</th>
      </tr>
    </thead>

    <tbody>
      {filteredMaterials.slice(0, 5).map((item) => (
        <tr
          key={item.id}
          style={{
            borderBottom: "1px solid #eee"
          }}
        >
          <td style={{ padding: 12 }}>{item.part_number}</td>

          <td style={{ padding: 12 }}>{item.part_name}</td>

          <td style={{ padding: 12 }}>{item.material_name}</td>

          <td style={{ padding: 12 }}>{item.qty ?? 0}</td>

          <td style={{ padding: 12 }}>
            <span
              style={{
                background:
                  item.status === "Active"
                    ? "#22c55e"
                    : "#ef4444",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 13
              }}
            >
              {item.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
<div
  style={{
    display: "flex",
    gap: 20,
    marginTop: 30,
    flexWrap: "wrap"
  }}
>
  <div
    style={{
      flex: 1,
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}
  >
    <h2>Material Type Summary</h2>

    {Object.entries(materialTypeSummary).map(([type, count]) => (
      <div
        key={type}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #eee"
        }}
      >
        <span>{type}</span>
        <strong>{count}</strong>
      </div>
    ))}
  </div>

  <div
    style={{
      flex: 1,
      background: "#fff",
      borderRadius: 12,
      padding: 20,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
    }}
  >
    <h2>Storage Summary</h2>

    {Object.entries(storageSummary).map(([location, count]) => (
      <div
        key={location}
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 0",
          borderBottom: "1px solid #eee"
        }}
      >
        <span>{location}</span>
        <strong>{count}</strong>
      </div>
    ))}
  </div>
</div>

    </div>
  );
}