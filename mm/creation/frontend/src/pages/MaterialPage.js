import React, { useEffect, useState, useCallback } from "react";
import materialApi from "../api/materialApi";
import MaterialForm from "../components/materials/MaterialForm";
import MaterialList from "../components/materials/MaterialList";

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  marginBottom: "24px",
  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #10b981 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

const cardStyle = {
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  borderRadius: "16px",
  padding: "18px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  marginBottom: "18px",
  border: "1px solid rgba(255,255,255,0.2)"
};

const pageContainer = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "10px"
};

const refreshButtonStyle = {
  padding: "8px 16px",
  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "13px",
  transition: "all 0.2s",
  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  marginBottom: "16px"
};

// Helper function to format date for display
const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return "—";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "—";
    // Format as DD-MM-YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return "—";
  }
};

export default function MaterialPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [viewMaterial, setViewMaterial] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading materials...");
      const res = await materialApi.getAll();
      console.log(`✅ Loaded ${res.data.length} materials`);
      console.log("📋 Part names:", res.data.map(m => m.part_name).sort());
      setMaterials(res.data);
    } catch (e) {
      console.error("Error loading materials:", e);
      if (e.response && e.response.status === 404) {
        alert("❌ Cannot connect to the server. Please make sure the backend is running on port 5002.");
      } else {
        alert("❌ Failed to load materials. Please check the console for details.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handleSave = async (form) => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      
      // Trim the part_name
      const trimmedPartName = form.part_name ? form.part_name.trim() : "";
      console.log("📝 Saving material with trimmed name:", trimmedPartName);
      
      // FORCE REFRESH: Get fresh data from the server before checking duplicates
      console.log("🔄 Fetching fresh data from server...");
      const freshResponse = await materialApi.getAll();
      const freshMaterials = freshResponse.data;
      console.log(`📊 Fresh data loaded: ${freshMaterials.length} materials`);
      console.log("📋 Fresh part names:", freshMaterials.map(m => m.part_name).sort());
      
      // Update the state with fresh data
      setMaterials(freshMaterials);
      
      // Check for duplicates using fresh data
      const duplicateItems = freshMaterials.filter(m => 
        m.part_name && 
        m.part_name.toLowerCase().trim() === trimmedPartName.toLowerCase() && 
        m.id !== (editingMaterial?.id || -1)
      );
      
      console.log("🔍 Duplicate items found:", duplicateItems);
      console.log("🔍 Duplicate count:", duplicateItems.length);
      
      if (duplicateItems.length > 0) {
        const duplicateIds = duplicateItems.map(m => `ID: ${m.id}, Name: "${m.part_name}"`).join('\n');
        alert(`❌ The Part Name "${trimmedPartName}" already exists.\n\nFound duplicates:\n${duplicateIds}\n\nPlease use a different name.`);
        const partNameInput = document.querySelector('input[name="part_name"]');
        if (partNameInput) {
          partNameInput.style.border = "2px solid #dc2626";
          partNameInput.focus();
        }
        setIsSaving(false);
        return;
      }
      
      console.log("✅ No duplicate found, proceeding with save...");
      
      // Clean the form data
      const cleanForm = {
        ...form,
        part_name: trimmedPartName,
        material_name: form.material_name ? form.material_name.trim() : "",
        material_code: form.material_code ? form.material_code.trim() : "",
        color_code: form.color_code ? form.color_code.trim() : "",
        coil_number: form.coil_number ? form.coil_number.trim() : "",
        heat_number: form.heat_number ? form.heat_number.trim() : "",
        // Ensure received_date is in YYYY-MM-DD format
        received_date: form.received_date || null,
      };
      
      let response;
      if (editingMaterial) {
        response = await materialApi.update(editingMaterial.id, cleanForm);
        console.log("✅ Material updated:", response.data);
        alert("✅ Material updated successfully!");
      } else {
        response = await materialApi.create(cleanForm);
        console.log("✅ Material created:", response.data);
        alert("✅ Material created successfully!");
      }
      
      setEditingMaterial(null);
      
      // Force reload after save
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 300);
      
    } catch (e) {
      console.error("❌ Save failed:", e);
      
      if (e.response) {
        console.error("Error response:", e.response.data);
        console.error("Error status:", e.response.status);
        
        if (e.response.status === 409) {
          const errorMsg = e.response.data?.error || "Duplicate entry";
          alert(`❌ ${errorMsg}\n\nThis Part Name already exists in the database. Please use a different name.`);
        } else if (e.response.status === 404) {
          alert("❌ API endpoint not found. Please check:\n1. Backend server is running\n2. Port is correct (5002)\n3. Routes are properly configured");
        } else if (e.response.status === 400) {
          alert(`❌ Bad request: ${e.response.data?.error || "Invalid data"}`);
        } else {
          alert(`❌ Error ${e.response.status}: ${e.response.data?.error || "Unknown error"}`);
        }
      } else if (e.request) {
        alert("❌ Cannot connect to the server. Please make sure the backend is running on port 5002.");
      } else {
        alert("❌ Failed to save material. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
  };
  
  const handleView = (material) => {
    setViewMaterial(material);
  };
  
  const closeView = () => {
    setViewMaterial(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        await materialApi.remove(id);
        alert("✅ Material deleted successfully!");
        setRefreshKey(prev => prev + 1);
      } catch (e) {
        console.error("Delete failed:", e);
        if (e.response && e.response.status === 400) {
          alert(`❌ ${e.response.data?.error || "Cannot delete this material"}`);
        } else {
          alert("❌ Failed to delete material");
        }
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingMaterial(null);
  };

  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered...");
    await loadData();
    alert(`🔄 Data refreshed! Found ${materials.length} materials.`);
  };

  return (
    <div style={pageContainer}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={titleStyle}>Material Management</div>
        <button
          onClick={handleRefresh}
          style={refreshButtonStyle}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          🔄 Refresh Data
        </button>
      </div>

      <div style={cardStyle}>
        <MaterialForm
          onSave={handleSave}
          editingMaterial={editingMaterial}
          onCancelEdit={handleCancelEdit}
          materials={materials}
          isSaving={isSaving}
        />
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "#6b7280",
              background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
              borderRadius: "12px"
            }}
          >
            <div>Loading materials...</div>
            <div style={{ fontSize: "12px", marginTop: "8px", color: "#9ca3af" }}>
              {materials.length > 0 && `Currently showing ${materials.length} items`}
            </div>
          </div>
        ) : (
          <>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              marginBottom: "12px",
              padding: "0 4px"
            }}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                Total: <strong>{materials.length}</strong> materials
              </span>
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <MaterialList
              data={materials}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </>
        )}
        
        {viewMaterial && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
            onClick={closeView}
          >
            <div
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "12px",
                width: "500px",
                maxHeight: "80vh",
                overflowY: "auto",
                position: "relative",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, color: "#1f2937" }}>Material Details</h2>
              <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
              <p><b>Part Number:</b> {viewMaterial.part_number}</p>
              <p><b>Part Name:</b> {viewMaterial.part_name}</p>
              <p><b>Material Name:</b> {viewMaterial.material_name}</p>
              <p><b>Material Code:</b> {viewMaterial.material_code || "—"}</p>
              <p><b>Material Type:</b> {viewMaterial.material_type}</p>
              {viewMaterial.material_type === "Job Work" && (
                <p><b>Job Work Category:</b> {viewMaterial.job_work_category}</p>
              )}
              <p><b>UOM:</b> {viewMaterial.uom}</p>
              <p><b>Color Code:</b> {viewMaterial.color_code || "—"}</p>
              <p><b>Part Weight:</b> {viewMaterial.part_weight || "—"}</p>
              <p><b>Received Date:</b> {formatDateForDisplay(viewMaterial.received_date)}</p>
              <p><b>Storage Location:</b> {viewMaterial.storage_location}</p>
              <p><b>Coil Number:</b> {viewMaterial.coil_number || "—"}</p>
              <p><b>Heat Number:</b> {viewMaterial.heat_number || "—"}</p>
              <p><b>Shelf Life:</b> {viewMaterial.shelf_life_days || "—"} days</p>
              <p><b>Status:</b> {viewMaterial.status || "Active"}</p>
              <p><b>Quantity:</b> {viewMaterial.qty || "—"}</p>
              <button
                onClick={closeView}
                style={{
                  marginTop: "15px",
                  padding: "8px 16px",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
                onMouseOver={(e) => (e.target.style.background = "#1d4ed8")}
                onMouseOut={(e) => (e.target.style.background = "#2563eb")}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}