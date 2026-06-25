import db from "../config/db.js";

// helper to map DB row to frontend
const mapRow = row => ({
  id: row.id,
  plantCode: row.plant_code,
  origin: row.origin,
  materialCode: row.material_code,
  batchNumber: row.batch_number,
  vendorCode: row.vendor_code,
  resultText: row.result_text,
  usageDecision: row.usage_decision,
  deletedFlag: row.deleted_flag,
  deletedAt: row.deleted_at
});

// GET active lots
export const getActiveLots = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM rm_inspection_lots
       WHERE deleted_flag = 0
       ORDER BY created_at DESC`
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    next(err);
  }
};

// GET recycle-bin lots
export const getDeletedLots = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM rm_inspection_lots
       WHERE deleted_flag = 1
       ORDER BY deleted_at DESC`
    );
    res.json(rows.map(mapRow));
  } catch (err) {
    next(err);
  }
};

// POST create/update (key = plant+origin+material+batch+vendor)
export const upsertLot = async (req, res, next) => {
  try {
    const {
      plantCode,
      materialCode,
      batchNumber,
      vendorCode,
      resultText,
      usageDecision
    } = req.body;

    if (!plantCode || !materialCode || !batchNumber || !vendorCode) {
      return res.status(400).json({
        message:
          "plantCode, materialCode, batchNumber, vendorCode are required"
      });
    }

    const origin = "01";

    const [existing] = await db.query(
      `SELECT id FROM rm_inspection_lots
       WHERE plant_code = ?
         AND origin = ?
         AND material_code = ?
         AND batch_number = ?
         AND vendor_code = ?
         AND deleted_flag = 0`,
      [plantCode, origin, materialCode, batchNumber, vendorCode]
    );

    if (existing.length > 0) {
      const id = existing[0].id;

      await db.query(
        `UPDATE rm_inspection_lots
         SET result_text = ?, usage_decision = ?
         WHERE id = ?`,
        [resultText || null, usageDecision || null, id]
      );

      const [rows] = await db.query(
        "SELECT * FROM rm_inspection_lots WHERE id = ?",
        [id]
      );
      return res.json(mapRow(rows[0]));
    } else {
      const [result] = await db.query(
        `INSERT INTO rm_inspection_lots
           (plant_code, origin, material_code, batch_number,
            vendor_code, result_text, usage_decision)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          plantCode,
          origin,
          materialCode,
          batchNumber,
          vendorCode,
          resultText || null,
          usageDecision || null
        ]
      );

      const [rows] = await db.query(
        "SELECT * FROM rm_inspection_lots WHERE id = ?",
        [result.insertId]
      );
      return res.status(201).json(mapRow(rows[0]));
    }
  } catch (err) {
    next(err);
  }
};

export const softDeleteLot = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE rm_inspection_lots
       SET deleted_flag = 1, deleted_at = NOW()
       WHERE id = ?`,
      [id]
    );
    res.json({ message: "Soft deleted" });
  } catch (err) {
    next(err);
  }
};

export const restoreLot = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      `UPDATE rm_inspection_lots
       SET deleted_flag = 0, deleted_at = NULL
       WHERE id = ?`,
      [id]
    );
    res.json({ message: "Restored" });
  } catch (err) {
    next(err);
  }
};

export const hardDeleteLot = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query(
      "DELETE FROM rm_inspection_lots WHERE id = ?",
      [id]
    );
    res.json({ message: "Hard deleted" });
  } catch (err) {
    next(err);
  }
};
