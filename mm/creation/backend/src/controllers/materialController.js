import { Material } from "../models/Material.js";
import axios from "axios";

const INTEGRATION_HUB = "http://localhost:3000";

export const getMaterials = async (req, res, next) => {
  try {
    const [rows] = await Material.findAll();
    console.log(`📊 Retrieved ${rows.length} materials`);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching materials:", err);
    next(err);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    console.log("📝 Creating material with data:", req.body);
    
    // Check for duplicate part_name
    const duplicate = await Material.findByName(req.body.part_name);
    console.log("🔍 Duplicate check result:", duplicate.length > 0 ? "Found" : "Not found");
    
    if (duplicate.length > 0) {
      console.log(`❌ Duplicate found: "${req.body.part_name}" (ID: ${duplicate[0].id})`);
      return res.status(409).json({ 
        error: `A material with Part Name "${req.body.part_name}" already exists.`,
        field: "part_name",
        existingId: duplicate[0].id
      });
    }

    const [result] = await Material.create(req.body);
    console.log(`✅ Material created with ID: ${result.insertId}`);
    
    const [rows] = await Material.findById(result.insertId);
    const created = rows[0] || null;

    try {
      await axios.post(`${INTEGRATION_HUB}/api/material/sync`, {
        source: "mm_creation",
        material: {
          id: result.insertId,
          part_name: created.part_name,
          material_name: created.material_name,
          material_code: created.material_code,
          part_number: created.part_number,
          material_type: created.material_type,
          uom: created.uom,
        },
      });
      console.log(`✅ Material "${created.part_name}" (${created.part_number}) sent to integration hub`);
    } catch (syncError) {
      console.error("⚠️ Sync failed:", syncError.message);
    }

    res.status(201).json({
      id: result.insertId,
      part_number: created?.part_number || null,
      message: "Material created successfully"
    });
  } catch (err) {
    console.error("❌ Create material error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ 
        error: "A material with this Part Name already exists.",
        field: "part_name"
      });
    }
    next(err);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`📝 Updating material ID: ${id}`, req.body);
    
    if (req.body.part_name) {
      // First, get the current material
      const [current] = await Material.findById(id);
      const currentMaterial = current[0];
      
      if (!currentMaterial) {
        return res.status(404).json({ error: "Material not found" });
      }
      
      // Only check for duplicates if the name is actually changing
      if (currentMaterial.part_name !== req.body.part_name) {
        const duplicate = await Material.findByNameExcludingId(req.body.part_name, id);
        if (duplicate.length > 0) {
          console.log(`❌ Duplicate found for update: "${req.body.part_name}"`);
          return res.status(409).json({ 
            error: `Another material already uses Part Name "${req.body.part_name}".`,
            field: "part_name"
          });
        }
      }
    }
    
    await Material.update(id, req.body);
    console.log(`✅ Material ID ${id} updated successfully`);
    res.json({ success: true, message: "Material updated successfully" });
  } catch (err) {
    console.error("❌ Update material error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ 
        error: "A material with this Part Name already exists.",
        field: "part_name"
      });
    }
    next(err);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting material ID: ${id}`);
    await Material.remove(id);
    console.log(`✅ Material ID ${id} deleted successfully`);
    res.json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    console.error("❌ Delete material error:", err);
    if (err.code === "MATERIAL_IN_USE_PR" || err.code === "MATERIAL_IN_USE_PO") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};