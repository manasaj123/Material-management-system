import db from "../config/db.js";

export const Invoice = {
  createHeader(data, conn = db) {
    const {
      invoice_no,
      invoice_date,
      vendor_id,
      po_id,
      total_amount,
      status,
      invoice_type,
      gr_based,
      payment_blocked
    } = data;

    return conn.query(
      `INSERT INTO vendor_invoices
       (invoice_no, invoice_date, vendor_id, po_id, total_amount,
        status, invoice_type, gr_based, payment_blocked)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice_no,
        invoice_date,
        vendor_id,
        po_id,
        total_amount,
        status,
        invoice_type,
        gr_based ? 1 : 0,
        payment_blocked ? 1 : 0
      ]
    );
  },

  createItem(item, invoiceId, conn = db) {
    const { po_item_id, material_id, qty, price, tax_percent } = item;

    return conn.query(
      `INSERT INTO invoice_items
       (invoice_id, po_item_id, material_id, qty, price, tax_percent)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        po_item_id,
        material_id,
        qty,
        price,
        tax_percent
      ]
    );
  },

  findAll() {
    return db.query(
      `SELECT inv.*, v.name vendor_name, po.po_no
       FROM vendor_invoices inv
       LEFT JOIN vendors v ON inv.vendor_id = v.id
       LEFT JOIN purchase_orders po ON inv.po_id = po.id
       ORDER BY inv.id DESC`
    );
  }
};