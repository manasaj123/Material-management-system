import db from "../config/db.js";

export const Vendor = {
  findAll() {
    return db.query("SELECT * FROM vendors ORDER BY id DESC");
  },

  findById(id) {
    return db.query("SELECT * FROM vendors WHERE id = ?", [id]);
  },

  create(data) {
    const { 
      name, 
      material_type, 
      job_work_category,
      address, 
      location, 
      contact, 
      gst_no, 
      bank_details, 
      qms_certification, 
      status, 
      rating 
    } = data;
    
    return db.query(
      `INSERT INTO vendors 
       (name, material_type, job_work_category, address, location, contact, gst_no, bank_details, qms_certification, status, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, 
        material_type, 
        job_work_category || null,
        address, 
        location, 
        contact, 
        gst_no, 
        bank_details, 
        qms_certification || null, 
        status || "ACTIVE", 
        rating || 0
      ]
    );
  },

  update(id, data) {
    const { 
      name, 
      material_type, 
      job_work_category,
      address, 
      location, 
      contact, 
      gst_no, 
      bank_details, 
      qms_certification, 
      status, 
      rating 
    } = data;
    
    return db.query(
      `UPDATE vendors SET 
        name = ?, 
        material_type = ?, 
        job_work_category = ?,
        address = ?, 
        location = ?, 
        contact = ?, 
        gst_no = ?, 
        bank_details = ?, 
        qms_certification = ?, 
        status = ?, 
        rating = ?
       WHERE id = ?`,
      [
        name, 
        material_type, 
        job_work_category || null,
        address, 
        location, 
        contact, 
        gst_no, 
        bank_details, 
        qms_certification || null, 
        status, 
        rating, 
        id
      ]
    );
  },

  remove(id) {
    return db.query("DELETE FROM vendors WHERE id = ?", [id]);
  }
};