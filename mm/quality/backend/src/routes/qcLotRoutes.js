// backend/src/routes/qcLotRoutes.js
import express from 'express';
import db from '../config/db.js';

const router = express.Router();

// ============================================
// GET all QC lots from database
// ============================================
router.get('/', async (req, res) => {
  try {
    const { status, stage, material_id, vendor_id } = req.query;
    
    let query = 'SELECT * FROM qc_lots WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (stage) {
      query += ' AND stage = ?';
      params.push(stage);
    }
    if (material_id) {
      query += ' AND material_id = ?';
      params.push(material_id);
    }
    if (vendor_id) {
      query += ' AND vendor_id = ?';
      params.push(vendor_id);
    }
    
    query += ' ORDER BY id DESC';
    
    const [rows] = await db.query(query, params);
    
    // Calculate summary
    const [summaryRows] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'ACCEPTED_WITH_DEVIATION' THEN 1 ELSE 0 END) as acceptedWithDeviation,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgress
      FROM qc_lots`
    );
    
    res.json({
      success: true,
      data: rows,
      summary: summaryRows[0] || { total: 0, pending: 0, accepted: 0, rejected: 0 },
      message: `Found ${rows.length} lots`
    });
  } catch (error) {
    console.error('❌ Error fetching lots:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [] 
    });
  }
});

// ============================================
// GET QC lot by ID
// ============================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query(
      `SELECT ql.*, 
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
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('❌ Error fetching lot:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// POST create QC lot
// ============================================
// backend/src/routes/qcLotRoutes.js
// Updated POST route WITHOUT remarks

router.post('/', async (req, res) => {
  try {
    const {
      material_id,
      material_name,
      batch_id,
      vendor_id,
      vendor_name,
      location_id,
      stage,
      production_stage,
      source_type,
      source_id,
      inspection_lot_id,
      planned_date
      // remarks ← REMOVE this line
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO qc_lots 
       (material_id, material_name, batch_id, vendor_id, vendor_name, 
        location_id, stage, production_stage, source_type, source_id, inspection_lot_id,
        status, planned_date, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())`,
      [
        material_id,
        material_name,
        batch_id || null,
        vendor_id || null,
        vendor_name || null,
        location_id || 1,
        stage || 'WAREHOUSE',
        production_stage || null,
        source_type || 'MANUAL',
        source_id || null,
        inspection_lot_id || null,
        planned_date || new Date().toISOString().split('T')[0]
      ]
    );
    
    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: 'QC Lot created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating lot:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// PUT update QC lot
// ============================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendor_id, vendor_name, status, remarks } = req.body;
    
    const updates = [];
    const params = [];
    
    if (vendor_id !== undefined) {
      updates.push('vendor_id = ?');
      params.push(vendor_id);
    }
    if (vendor_name !== undefined) {
      updates.push('vendor_name = ?');
      params.push(vendor_name);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (remarks !== undefined) {
      updates.push('remarks = ?');
      params.push(remarks);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }
    
    params.push(id);
    
    const [result] = await db.query(
      `UPDATE qc_lots SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'QC Lot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'QC Lot updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating lot:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// PATCH update status
// ============================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['PENDING', 'IN_PROGRESS', 'ACCEPTED', 'REJECTED', 'ACCEPTED_WITH_DEVIATION'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    const [result] = await db.query(
      `UPDATE qc_lots SET status = ?, inspected_date = NOW() WHERE id = ?`,
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'QC Lot not found'
      });
    }
    
    res.json({
      success: true,
      message: `Status updated to ${status}`
    });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// GET vendors list
// ============================================
router.get('/vendors', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT vendor_id, vendor_name 
       FROM qc_lots 
       WHERE vendor_id IS NOT NULL 
       ORDER BY vendor_name`
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ Error fetching vendors:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      data: [] 
    });
  }
});

// ============================================
// DELETE QC lot
// ============================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db.query(
      `DELETE FROM qc_lots WHERE id = ?`,
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'QC Lot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'QC Lot deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting lot:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;