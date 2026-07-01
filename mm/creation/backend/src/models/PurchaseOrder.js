import db from "../config/db.js";

export const PurchaseOrder = {
  createHeader(data) {
    const {
      po_no,
      po_date,
      vendor_id,
      status,
      payment_terms,
      currency,
      freight_charges,
    } = data;
    return db.query(
      `INSERT INTO purchase_orders
       (po_no, po_date, vendor_id, status, payment_terms, currency, freight_charges)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        po_no,
        po_date,
        vendor_id,
        status || "OPEN",
        payment_terms,
        currency || "INR",
        freight_charges || 0,
      ],
    );
  },

  createItem(item, poId) {
    const {
      material_id,
      batch_no,
      qty,
      price,
      tax_percent,
      expiry_date,
      delivery_date,
    } = item;
    return db.query(
      `INSERT INTO po_items
       (po_id, material_id, batch_no, qty, price, tax_percent, expiry_date, delivery_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poId,
        material_id,
        batch_no || null,
        qty,
        price,
        tax_percent || 0,
        expiry_date || null,
        delivery_date || null,
      ],
    );
  },

  findAll() {
    return db.query(
      `SELECT
         po.*,
         v.name AS vendor_name,
         IFNULL(SUM(pi.qty * pi.price), 0) AS item_total,
         IFNULL(SUM(pi.qty * pi.price * pi.tax_percent / 100), 0) AS tax_total,
         IFNULL(po.freight_charges, 0) AS freight_charges,
         IFNULL(SUM(pi.qty * pi.price), 0) + 
         IFNULL(SUM(pi.qty * pi.price * pi.tax_percent / 100), 0) + 
         IFNULL(po.freight_charges, 0) AS gross_amount,
         COUNT(DISTINCT pi.batch_no) AS batch_count
       FROM purchase_orders po
       LEFT JOIN vendors v ON po.vendor_id = v.id
       LEFT JOIN po_items pi ON po.id = pi.po_id
       GROUP BY po.id
       ORDER BY po.id DESC`,
    );
  },

  findById(id) {
    return db.query(
      `SELECT po.*, v.name AS vendor_name
       FROM purchase_orders po
       LEFT JOIN vendors v ON po.vendor_id = v.id
       WHERE po.id = ?`,
      [id],
    );
  },

  findItems(id) {
    return db.query(
      `SELECT pi.*,
              m.part_name AS material_name,
              m.part_number AS sku,
              m.uom,
              m.shelf_life_days AS expiry_days
       FROM po_items pi
       LEFT JOIN materials m ON pi.material_id = m.id
       WHERE pi.po_id = ?`,
      [id],
    );
  },
};
