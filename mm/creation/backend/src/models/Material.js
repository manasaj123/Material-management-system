import db from "../config/db.js";

const PLANT_CODE = "DB4";

const generatePartNumber = async () => {
  const [rows] = await db.query(
    "SELECT part_number FROM materials WHERE part_number LIKE ? ORDER BY id DESC LIMIT 1",
    [`${PLANT_CODE}-%`]
  );

  let nextSeq = 1;
  if (rows.length > 0 && rows[0].part_number) {
    const parts = String(rows[0].part_number).split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(3, "0");
  return `${PLANT_CODE}-${seqStr}`;
};

export const Material = {
  findAll() {
    return db.query("SELECT * FROM materials ORDER BY id DESC");
  },

  findById(id) {
    return db.query("SELECT * FROM materials WHERE id = ?", [id]);
  },

  // FIXED: Destructure the rows from the query result
  async findByName(name) {
    console.log('🔍 [findByName] Looking for:', name);
    const [rows] = await db.query(
      "SELECT id, part_name FROM materials WHERE part_name = ?", 
      [name]
    );
    console.log('🔍 [findByName] Found:', rows.length, 'records');
    return rows;
  },

  // FIXED: Destructure the rows from the query result
  async findByNameExcludingId(name, excludeId) {
    console.log('🔍 [findByNameExcludingId] Looking for:', name, 'excluding ID:', excludeId);
    const [rows] = await db.query(
      "SELECT id, part_name FROM materials WHERE part_name = ? AND id != ?", 
      [name, excludeId]
    );
    console.log('🔍 [findByNameExcludingId] Found:', rows.length, 'records');
    return rows;
  },

  async create(data) {
    const part_number = await generatePartNumber();

    return db.query(
      `INSERT INTO materials (
        part_number, part_name, material_name, material_code,
        material_type, job_work_category, uom, color_code,
        part_weight, received_date, storage_location,
        coil_number, heat_number, shelf_life_days, status, qty
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        part_number,
        data.part_name,
        data.material_name,
        data.material_code || null,
        data.material_type,
        data.job_work_category || null,
        data.uom,
        data.color_code || null,
        data.part_weight ?? null,
        data.received_date || null,
        data.storage_location,
        data.coil_number || null,
        data.heat_number || null,
        data.shelf_life_days ?? 0,
        data.status || "Active",
        data.qty ?? null,
      ]
    );
  },

  update(id, data) {
    return db.query(
      `UPDATE materials SET
        part_name = ?,
        material_name = ?,
        material_code = ?,
        material_type = ?,
        job_work_category = ?,
        uom = ?,
        color_code = ?,
        part_weight = ?,
        received_date = ?,
        storage_location = ?,
        coil_number = ?,
        heat_number = ?,
        shelf_life_days = ?,
        status = ?,
        qty = ?
      WHERE id = ?`,
      [
        data.part_name,
        data.material_name,
        data.material_code || null,
        data.material_type,
        data.job_work_category || null,
        data.uom,
        data.color_code || null,
        data.part_weight ?? null,
        data.received_date || null,
        data.storage_location,
        data.coil_number || null,
        data.heat_number || null,
        data.shelf_life_days ?? 0,
        data.status || "Active",
        data.qty ?? null,
        id,
      ]
    );
  },

  async remove(id) {
    const [prRows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM pr_items WHERE material_id = ?",
      [id]
    );
    if (prRows[0].cnt > 0) {
      const err = new Error("Cannot delete material: it is used in Purchase Requisitions");
      err.code = "MATERIAL_IN_USE_PR";
      throw err;
    }

    const [poRows] = await db.query(
      "SELECT COUNT(*) AS cnt FROM po_items WHERE material_id = ?",
      [id]
    );
    if (poRows[0].cnt > 0) {
      const err = new Error("Cannot delete material: it is used in Purchase Orders");
      err.code = "MATERIAL_IN_USE_PO";
      throw err;
    }

    return db.query("DELETE FROM materials WHERE id = ?", [id]);
  },
};