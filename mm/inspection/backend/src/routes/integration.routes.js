// inspection/backend/src/routes/integration.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ============================================
// 1. RECEIVE MATERIAL FROM INTEGRATION HUB
// ============================================
router.post("/material", (req, res) => {
  const { material_code, material_name } = req.body;

  console.log(
    `🔍 Inspection receiving: ${material_name} (Code: ${material_code})`,
  );

  // Validate code format
  const codeRegex = /^[a-zA-Z0-9\-_]+$/;
  if (!codeRegex.test(material_code)) {
    console.log(`   ❌ Invalid code format: ${material_code}`);
    return res
      .status(400)
      .json({ error: "Code must be alphanumeric, hyphens, or underscores" });
  }

  // Check if material already exists in inspection_lots
  db.query(
    "SELECT id FROM inspection_lots WHERE material = ?",
    [material_code],
    (err, existing) => {
      if (err) {
        console.error("Integration error:", err);
        return res.status(500).json({ error: err.message });
      }

      if (existing && existing.length > 0) {
        console.log(`   ⚠️ Material already exists (ID: ${existing[0].id})`);
        return res.json({ id: existing[0].id, success: true, existing: true });
      }

      // Insert new inspection lot
      db.query(
        `INSERT INTO inspection_lots 
         (material, material_name, batch, lot_created_from, plant, lot_origin, status, created_at) 
         VALUES (?, ?, ?, CURDATE(), ?, 'INTEGRATION', 'PENDING', NOW())`,
        [
          material_code,
          material_name,
          `BATCH-${Date.now()}`,
          "PLANT-01"
        ],
        (err2, result) => {
          if (err2) {
            console.error("Integration error:", err2);
            return res.status(500).json({ error: err2.message });
          }

          console.log(
            `   ✅ Created Inspection record (ID: ${result.insertId})`,
          );
          res.json({ id: result.insertId, success: true });
        },
      );
    },
  );
});

// ============================================
// 2. RECEIVE INSPECTION LOT FROM INTEGRATION HUB
// ============================================
router.post("/inspection-lot", (req, res) => {
  const {
    material_code,
    material_name,
    batch_id,
    vendor_id,
    vendor_name,
    po_id,
    grn_id,
    inspection_plan_id,
    quantity
  } = req.body;

  console.log(`📦 Inspection lot receiving: ${material_name} (Code: ${material_code})`);

  // Check if lot already exists
  db.query(
    "SELECT id FROM inspection_lots WHERE material = ? AND batch = ?",
    [material_code, batch_id || `BATCH-${Date.now()}`],
    (err, existing) => {
      if (err) {
        console.error("Error checking existing lot:", err);
        return res.status(500).json({ error: err.message });
      }

      if (existing && existing.length > 0) {
        console.log(`   ⚠️ Inspection lot already exists (ID: ${existing[0].id})`);
        return res.json({ id: existing[0].id, success: true, existing: true });
      }

      // Insert new inspection lot
      db.query(
        `INSERT INTO inspection_lots 
         (material, material_name, batch, vendor, vendor_name, 
          po_id, grn_id, inspection_plan_id, quantity, 
          lot_created_from, plant, lot_origin, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, 'INTEGRATION', 'PENDING', NOW())`,
        [
          material_code,
          material_name,
          batch_id || `BATCH-${Date.now()}`,
          vendor_id || null,
          vendor_name || null,
          po_id || null,
          grn_id || null,
          inspection_plan_id || null,
          quantity || 0,
          "PLANT-01"
        ],
        (err2, result) => {
          if (err2) {
            console.error("Error creating inspection lot:", err2);
            return res.status(500).json({ error: err2.message });
          }

          console.log(`   ✅ Created Inspection Lot (ID: ${result.insertId})`);

          // Notify Integration Hub to create QC Lot
          const axios = require('axios');
          axios.post('http://localhost:3000/webhook/inspection-lot-created', {
            inspection_lot_id: result.insertId,
            material_code: material_code,
            material_name: material_name,
            batch_id: batch_id,
            vendor_id: vendor_id,
            vendor_name: vendor_name,
            inspection_plan_id: inspection_plan_id
          }).catch(webhookError => {
            console.error('   ⚠️ Failed to notify Integration Hub:', webhookError.message);
          });

          res.json({
            id: result.insertId,
            success: true,
            message: 'Inspection lot created successfully'
          });
        },
      );
    },
  );
});

// ============================================
// 3. GET INSPECTION PLAN FOR QUALITY MODULE
// ============================================
router.get("/inspection-plan/:materialCode", (req, res) => {
  const { materialCode } = req.params;

  console.log(`🔍 Fetching inspection plan for: ${materialCode}`);

  // Get plan from inspection_plans table
  db.query(
    `SELECT 
      ip.id as plan_id,
      ip.plan_code,
      ip.plan_name,
      ip.material_code,
      ip.sampling_procedure_id,
      ip.status,
      sp.procedure_name,
      sp.sample_size,
      sp.acceptance_number,
      sp.rejection_number
    FROM inspection_plans ip
    LEFT JOIN sampling_procedures sp ON sp.id = ip.sampling_procedure_id
    WHERE ip.material_code = ? AND ip.status = 'ACTIVE'
    LIMIT 1`,
    [materialCode],
    (err, plan) => {
      if (err) {
        console.error("Error fetching plan:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!plan || plan.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No active inspection plan found for this material'
        });
      }

      // Get parameters for this plan
      db.query(
        `SELECT 
          im.id as master_id,
          im.inspection_code,
          im.inspection_name,
          im.unit,
          im.lower_limit,
          im.upper_limit,
          im.target_value,
          im.status as master_status,
          ipd.required,
          ipd.sort_order
        FROM inspection_plan_details ipd
        JOIN inspection_master im ON im.id = ipd.inspection_master_id
        WHERE ipd.plan_id = ?
        ORDER BY ipd.sort_order ASC`,
        [plan[0].plan_id],
        (err2, parameters) => {
          if (err2) {
            console.error("Error fetching parameters:", err2);
            return res.status(500).json({ success: false, error: err2.message });
          }

          res.json({
            success: true,
            data: {
              plan: plan[0],
              parameters: parameters || []
            }
          });
        }
      );
    }
  );
});

// ============================================
// 4. GET ALL INSPECTION PLANS
// ============================================
router.get("/inspection-plans", (req, res) => {
  db.query(
    `SELECT 
      ip.*,
      sp.procedure_name as sampling_procedure_name,
      sp.sample_size,
      COUNT(ipd.id) as parameter_count
    FROM inspection_plans ip
    LEFT JOIN sampling_procedures sp ON sp.id = ip.sampling_procedure_id
    LEFT JOIN inspection_plan_details ipd ON ipd.plan_id = ip.id
    GROUP BY ip.id
    ORDER BY ip.created_at DESC`,
    (err, plans) => {
      if (err) {
        console.error("Error fetching plans:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      res.json({
        success: true,
        data: plans || []
      });
    }
  );
});

// ============================================
// 5. GET INSPECTION LOT BY ID
// ============================================
router.get("/inspection-lot/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT * FROM inspection_lots WHERE id = ?`,
    [id],
    (err, lot) => {
      if (err) {
        console.error("Error fetching lot:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (!lot || lot.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Inspection lot not found'
        });
      }

      res.json({
        success: true,
        data: lot[0]
      });
    }
  );
});

// ============================================
// 6. UPDATE INSPECTION LOT STATUS
// ============================================
router.put("/inspection-lot/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, completed_date } = req.body;

  db.query(
    `UPDATE inspection_lots 
     SET status = ?, completed_date = ? 
     WHERE id = ?`,
    [status, completed_date || new Date(), id],
    (err, result) => {
      if (err) {
        console.error("Error updating lot:", err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: 'Inspection lot not found'
        });
      }

      res.json({
        success: true,
        message: `Status updated to ${status}`
      });
    }
  );
});

module.exports = router;