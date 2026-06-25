import db from "../config/db.js";

export const GRN = {
  createHeader(data) {
    const { grn_no, grn_date, po_id, vendor_id, location_id, status } = data;
    return db.query(
      `INSERT INTO grn_headers
       (grn_no, grn_date, po_id, vendor_id, location_id, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [grn_no, grn_date, po_id, vendor_id, location_id, status || "POSTED"]
    );
  },

  createItem(item, grnId) {
    const {
      po_item_id,
      material_id,
      received_qty,
      accepted_qty,
      rejected_qty,
      batch_id
    } = item;
    return db.query(
      `INSERT INTO grn_items
       (grn_id, po_item_id, material_id, received_qty, accepted_qty, rejected_qty, batch_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [grnId, po_item_id, material_id, received_qty, accepted_qty, rejected_qty, batch_id]
    );
  }
};