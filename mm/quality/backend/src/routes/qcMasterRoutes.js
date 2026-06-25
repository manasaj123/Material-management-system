// backend/src/routes/qcMasterRoutes.js
import express from 'express';

const router = express.Router();

// ============================================
// GET all QC parameters
// ============================================
router.get('/parameters', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: [
        { id: 1, name: 'Moisture', unit: '%', upper_spec_limit: 14.0 },
        { id: 2, name: 'Foreign Matter', unit: '%', upper_spec_limit: 1.0 },
        { id: 3, name: 'Damaged', unit: '%', upper_spec_limit: 2.0 }
      ] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET QC templates
// ============================================
router.get('/templates', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: [] 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// GET template by material
// ============================================
router.get('/templates/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;
    res.json({ 
      success: true, 
      data: { material_id: materialId, parameters: [] } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// POST create/update template
// ============================================
router.post('/templates/:materialId', async (req, res) => {
  try {
    const { materialId } = req.params;
    res.json({ 
      success: true, 
      message: `Template saved for material ${materialId}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;