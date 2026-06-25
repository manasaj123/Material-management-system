import db from "../config/db.js";

export const listParameters = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM qc_parameters ORDER BY id`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const getMaterialTemplate = async (req, res, next) => {
  try {
    const { materialId } = req.params;
    
    // ✅ FIX: Validate materialId
    if (!materialId || isNaN(materialId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid material ID. Please provide a valid number." 
      });
    }

    const materialIdNum = Number(materialId);
    
    // Join with qc_parameters to get parameter details
    const [rows] = await db.query(
      `SELECT 
        mt.id,
        mt.material_id,
        mt.parameter_id,
        mt.required,
        mt.sampling_size,
        p.name AS parameter_name,
        p.unit,
        p.lower_spec_limit,
        p.upper_spec_limit
       FROM material_qc_templates mt
       LEFT JOIN qc_parameters p ON mt.parameter_id = p.id
       WHERE mt.material_id = ?
       ORDER BY mt.id`,
      [materialIdNum]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (err) {
    next(err);
  }
};

export const saveMaterialTemplate = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    const { materialId } = req.params;
    
    // ✅ FIX: Validate materialId
    if (!materialId || isNaN(materialId)) {
      await conn.release();
      return res.status(400).json({ 
        success: false,
        message: "Invalid material ID. Please provide a valid number." 
      });
    }

    const materialIdNum = Number(materialId);
    const { params } = req.body;
    
    if (!Array.isArray(params)) {
      await conn.release();
      return res.status(400).json({ 
        success: false,
        message: "Params must be an array" 
      });
    }
    
    await conn.beginTransaction();
    
    // Delete existing template for this material
    await conn.query(
      'DELETE FROM material_qc_templates WHERE material_id = ?',
      [materialIdNum]
    );
    
    // Insert new template entries
    for (const param of params) {
      // If param has parameter_id, use it directly
      // Otherwise, we need to create/get the parameter first
      let parameterId = param.parameter_id;
      
      if (!parameterId && param.parameter_name) {
        // Check if parameter exists
        const [existing] = await conn.query(
          'SELECT id FROM qc_parameters WHERE name = ?',
          [param.parameter_name]
        );
        
        if (existing.length > 0) {
          parameterId = existing[0].id;
          // Update existing parameter
          await conn.query(
            `UPDATE qc_parameters 
             SET unit = ?, lower_spec_limit = ?, upper_spec_limit = ?
             WHERE id = ?`,
            [
              param.unit || null,
              param.lower_spec_limit || null,
              param.upper_spec_limit || null,
              parameterId
            ]
          );
        } else {
          // Create new parameter
          const [result] = await conn.query(
            `INSERT INTO qc_parameters (name, unit, lower_spec_limit, upper_spec_limit)
             VALUES (?, ?, ?, ?)`,
            [
              param.parameter_name,
              param.unit || null,
              param.lower_spec_limit || null,
              param.upper_spec_limit || null
            ]
          );
          parameterId = result.insertId;
        }
      }
      
      if (parameterId) {
        await conn.query(
          `INSERT INTO material_qc_templates 
           (material_id, parameter_id, required, sampling_size)
           VALUES (?, ?, ?, ?)`,
          [
            materialIdNum,
            parameterId,
            param.required ? 1 : 0,
            param.sampling_size || 1
          ]
        );
      }
    }
    
    await conn.commit();
    res.json({ 
      success: true,
      message: 'Template saved successfully', 
      count: params.length 
    });
  } catch (err) {
    await conn.rollback();
    console.error("Save template error:", err);
    next(err);
  } finally {
    if (conn) conn.release();
  }
};

export const listAllTemplates = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        mt.material_id, 
        COUNT(*) as parameter_count
       FROM material_qc_templates mt
       GROUP BY mt.material_id
       ORDER BY mt.material_id`
    );
    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
};