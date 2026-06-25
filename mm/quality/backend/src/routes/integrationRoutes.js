// backend/src/routes/integrationRoutes.js
// COMPLETE UPDATED - With Vendor Support and All Integration Endpoints

import express from "express";
import db from "../config/db.js";
import axios from "axios";

const router = express.Router();

// ============================================
// 1. RECEIVE MATERIAL FROM INTEGRATION HUB
// ============================================
router.post("/material", async (req, res) => {
  const { material_name, material_code } = req.body;

  console.log(
    `📦 Quality receiving: ${material_name} (Code: ${material_code})`,
  );

  try {
    // Check if material already exists
    const [existing] = await db.query(
      "SELECT id FROM qc_lots WHERE material_id = ? OR material_name = ?",
      [material_code, material_name],
    );

    if (existing.length > 0) {
      console.log(`   ⚠️ Material already exists (ID: ${existing[0].id})`);
      return res.json({ id: existing[0].id, success: true, existing: true });
    }

    const [result] = await db.query(
      `INSERT INTO qc_lots (material_id, material_name, stage, status, source_type) 
       VALUES (?, ?, 'WAREHOUSE', 'PENDING', 'INTEGRATION')`,
      [material_code, material_name],
    );

    console.log(`   ✅ Created Quality record (ID: ${result.insertId})`);
    res.json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("Integration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 2. RECEIVE QC LOT FROM INTEGRATION HUB (with vendor)
// ============================================
router.post("/qc-lot", async (req, res) => {
  const { 
    material_id, 
    material_name, 
    material_code,
    batch_id, 
    vendor_id, 
    vendor_name,
    po_id,
    grn_id,
    inspection_lot_id,
    stage = 'WAREHOUSE',
    location_id = 1
  } = req.body;

  console.log(`📦 QC Lot receiving: ${material_name} (Code: ${material_code})`);
  console.log(`   Vendor: ${vendor_name || vendor_id || 'Not provided'}`);

  try {
    // Check if lot already exists
    const [existing] = await db.query(
      `SELECT id FROM qc_lots 
       WHERE material_id = ? AND batch_id = ? AND source_type = 'INTEGRATION'`,
      [material_code, batch_id],
    );

    if (existing.length > 0) {
      console.log(`   ⚠️ QC Lot already exists (ID: ${existing[0].id})`);
      return res.json({ 
        id: existing[0].id, 
        success: true, 
        existing: true 
      });
    }

    // Insert QC lot with vendor details
    const [result] = await db.query(
      `INSERT INTO qc_lots 
       (material_id, material_name, batch_id, vendor_id, vendor_name, 
        location_id, stage, source_type, source_id, inspection_lot_id, 
        status, planned_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', CURDATE(), NOW())`,
      [
        material_code || material_id,
        material_name,
        batch_id,
        vendor_id || null,
        vendor_name || null,
        location_id,
        stage,
        'INTEGRATION',
        grn_id || po_id || null,
        inspection_lot_id || null
      ],
    );

    console.log(`   ✅ Created QC Lot (ID: ${result.insertId})`);

    // Notify Integration Hub about QC lot creation
    try {
      await axios.post('http://localhost:3000/webhook/qc-lot-created', {
        qc_lot_id: result.insertId,
        inspection_lot_id: inspection_lot_id,
        material_code: material_code,
        vendor_id: vendor_id,
        status: 'PENDING'
      });
      console.log(`   ✅ Notified Integration Hub`);
    } catch (webhookError) {
      console.error('   ⚠️ Failed to notify Integration Hub:', webhookError.message);
    }

    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'QC Lot created successfully'
    });
  } catch (err) {
    console.error("Error creating QC lot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 3. RECEIVE VENDOR FROM INTEGRATION HUB
// ============================================
router.post("/vendor", async (req, res) => {
  const { 
    vendor_id, 
    vendor_name, 
    vendor_code,
    contact,
    address,
    type = 'VENDOR'
  } = req.body;

  console.log(`🏢 Quality receiving vendor: ${vendor_name} (ID: ${vendor_id})`);

  try {
    // Check if vendor already exists in quality module
    const [existing] = await db.query(
      "SELECT id FROM qc_lots WHERE vendor_id = ? OR vendor_name = ?",
      [vendor_id, vendor_name],
    );

    if (existing.length > 0) {
      console.log(`   ⚠️ Vendor already exists in quality records`);
      return res.json({ 
        success: true, 
        existing: true,
        message: 'Vendor already exists'
      });
    }

    // Vendor reference is stored in qc_lots table
    // No need to create a separate vendor record in quality module
    // Just log that vendor is available for QC lots
    console.log(`   ✅ Vendor ${vendor_name} is now available for QC lots`);
    
    res.json({ 
      success: true,
      message: `Vendor ${vendor_name} received and available for QC lots`,
      vendor_id: vendor_id
    });
  } catch (err) {
    console.error("Error receiving vendor:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 4. GET INSPECTION PLAN FROM INSPECTION MODULE
// ============================================
router.get("/inspection-plan/:materialCode", async (req, res) => {
  const { materialCode } = req.params;

  console.log(`🔍 Fetching inspection plan for: ${materialCode}`);

  try {
    // Try to get from Inspection module
    const INSPECTION_URL = process.env.INSPECTION_URL || 'http://localhost:5003';
    
    const response = await axios.get(
      `${INSPECTION_URL}/api/integration/inspection-plan/${materialCode}`
    );
    
    console.log(`   ✅ Inspection plan found`);
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(`   ❌ Failed to fetch inspection plan:`, error.message);
    
    // If inspection module not available, try local fallback
    try {
      const [localPlan] = await db.query(
        `SELECT qp.*, mqt.required, mqt.sampling_size 
         FROM material_qc_templates mqt
         JOIN qc_parameters qp ON qp.id = mqt.parameter_id
         WHERE mqt.material_id = ?`,
        [materialCode]
      );
      
      if (localPlan.length > 0) {
        console.log(`   ✅ Using local inspection plan`);
        return res.json({ success: true, data: localPlan, source: 'local' });
      }
    } catch (localError) {
      console.error('   ❌ No local plan found');
    }
    
    res.status(404).json({ 
      success: false, 
      error: 'Inspection plan not found' 
    });
  }
});

// ============================================
// 5. RECEIVE IN-PROCESS INSPECTION
// ============================================
router.post("/in-process", async (req, res) => {
  const {
    material_id,
    material_name,
    batch_id,
    vendor_id,
    vendor_name,
    production_stage,
    work_order_id,
    planned_date
  } = req.body;

  console.log(`🏭 In-Process receiving: ${material_name} (Stage: ${production_stage})`);

  try {
    const [result] = await db.query(
      `INSERT INTO qc_lots 
       (material_id, material_name, batch_id, vendor_id, vendor_name,
        stage, production_stage, source_type, source_id, status, planned_date)
       VALUES (?, ?, ?, ?, ?, 'PRODUCTION', ?, 'PRODUCTION', ?, 'PENDING', ?)`,
      [
        material_id,
        material_name,
        batch_id,
        vendor_id || null,
        vendor_name || null,
        production_stage || 'In Progress',
        work_order_id || null,
        planned_date || new Date().toISOString().split('T')[0]
      ]
    );

    console.log(`   ✅ Created In-Process Inspection (ID: ${result.insertId})`);
    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'In-Process inspection created successfully'
    });
  } catch (err) {
    console.error("Error creating in-process inspection:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 6. RECEIVE FINAL INSPECTION
// ============================================
router.post("/final", async (req, res) => {
  const {
    material_id,
    material_name,
    batch_id,
    vendor_id,
    vendor_name,
    quantity,
    planned_date
  } = req.body;

  console.log(`✅ Final inspection receiving: ${material_name} (Qty: ${quantity})`);

  try {
    const [result] = await db.query(
      `INSERT INTO qc_lots 
       (material_id, material_name, batch_id, vendor_id, vendor_name,
        stage, source_type, status, planned_date, remarks)
       VALUES (?, ?, ?, ?, ?, 'FINAL', 'FINAL_INSPECTION', 'PENDING', ?, ?)`,
      [
        material_id,
        material_name,
        batch_id,
        vendor_id || null,
        vendor_name || null,
        planned_date || new Date().toISOString().split('T')[0],
        `Final inspection for ${quantity} units`
      ]
    );

    console.log(`   ✅ Created Final Inspection (ID: ${result.insertId})`);
    res.json({ 
      id: result.insertId, 
      success: true,
      message: 'Final inspection created successfully'
    });
  } catch (err) {
    console.error("Error creating final inspection:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 7. UPDATE QC LOT STATUS (for inspection completion)
// ============================================
router.put("/qc-lot/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, decision, inspected_by, remarks } = req.body;

  console.log(`📝 Updating QC Lot ${id} → ${status || decision}`);

  try {
    const finalStatus = status || decision || 'ACCEPTED';
    
    const [result] = await db.query(
      `UPDATE qc_lots 
       SET status = ?, inspected_date = NOW(), inspected_by = ?, remarks = ?
       WHERE id = ?`,
      [finalStatus, inspected_by || 'System', remarks || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'QC Lot not found' 
      });
    }

    console.log(`   ✅ QC Lot ${id} updated to ${finalStatus}`);
    res.json({ 
      success: true, 
      message: `QC Lot ${id} updated to ${finalStatus}` 
    });
  } catch (err) {
    console.error("Error updating QC lot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 8. GET QC LOT BY ID (with vendor details)
// ============================================
router.get("/qc-lot/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT ql.*, 
              ql.vendor_id, ql.vendor_name,
              COUNT(qr.id) as result_count,
              SUM(CASE WHEN qr.pass_fail = 1 THEN 1 ELSE 0 END) as passed_count,
              SUM(CASE WHEN qr.pass_fail = 0 THEN 1 ELSE 0 END) as failed_count,
              COUNT(qd.id) as defect_count
       FROM qc_lots ql
       LEFT JOIN qc_results qr ON qr.lot_id = ql.id
       LEFT JOIN qc_defects qd ON qd.lot_id = ql.id
       WHERE ql.id = ?
       GROUP BY ql.id`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'QC Lot not found' 
      });
    }

    // Try to fetch full vendor details from MM Creation
    let vendorDetails = null;
    if (rows[0].vendor_id) {
      try {
        const MM_CREATION_URL = process.env.MM_CREATION_URL || 'http://localhost:5002';
        const vendorResponse = await axios.get(
          `${MM_CREATION_URL}/api/vendors/${rows[0].vendor_id}`
        );
        vendorDetails = vendorResponse.data;
      } catch (error) {
        console.error('Error fetching vendor details:', error.message);
      }
    }

    res.json({ 
      success: true, 
      data: rows[0],
      vendor_details: vendorDetails
    });
  } catch (err) {
    console.error("Error fetching QC lot:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 9. HEALTH CHECK
// ============================================
router.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    service: "Quality Integration",
    version: "1.0.0"
  });
});

export default router;