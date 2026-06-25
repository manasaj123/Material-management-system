import db from "../config/db.js";

export const Batch = {
  create(data) {
    const { batch_no, material_id, mfg_date, expiry_date, source_type, source_id } = data;
    return db.query(
      `INSERT INTO batches
       (batch_no, material_id, mfg_date, expiry_date, source_type, source_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [batch_no, material_id, mfg_date, expiry_date, source_type, source_id]
    );
  }
};
