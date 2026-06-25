import db from "../config/db.js";

export const Vendor = {
  findAll() {
    return db.query("SELECT * FROM vendors ORDER BY id DESC");
  },

  findById(id) {
    return db.query("SELECT * FROM vendors WHERE id = ?", [id]);
  },

  create(data) {
    const { name, type, address, contact, gst_no, bank_details, status, rating } = data;
    return db.query(
      `INSERT INTO vendors 
       (name, type, address, contact, gst_no, bank_details, status, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, type, address, contact, gst_no, bank_details, status || "ACTIVE", rating || 0]
    );
  },

  update(id, data) {
    const { name, type, address, contact, gst_no, bank_details, status, rating } = data;
    return db.query(
      `UPDATE vendors SET 
        name = ?, type = ?, address = ?, contact = ?, 
        gst_no = ?, bank_details = ?, status = ?, rating = ?
       WHERE id = ?`,
      [name, type, address, contact, gst_no, bank_details, status, rating, id]
    );
  },

  remove(id) {
    return db.query("DELETE FROM vendors WHERE id = ?", [id]);
  }
};
