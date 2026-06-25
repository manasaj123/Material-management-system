// backend/src/models/PurchaseRequisition.js
import db from "../config/db.js";

export const PurchaseRequisition = {
  createHeader(data) {
    const {
      req_no,
      req_date,
      requester,
      status,
      uom,
      batch,
      plant,
      purchase_org
    } = data;
    return db.query(
      `INSERT INTO purchase_requisitions
        (req_no, req_date, requester, status, uom, batch, plant, purchase_org)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req_no,
        req_date,
        requester,
        status || "DRAFT",
        uom,
        batch,
        plant,
        purchase_org
      ]
    );
  },

  createItem(item, prId) {
    const { material_id, qty, required_date, remarks } = item;
    return db.query(
      `INSERT INTO pr_items
         (pr_id, material_id, qty, required_date, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [prId, material_id, qty, required_date, remarks]
    );
  },

  findAll() {
    return db.query(
      `SELECT 
         pr.*,
         COUNT(pi.id) AS item_count,
         COALESCE(SUM(pi.qty), 0) AS total_qty
       FROM purchase_requisitions pr
       LEFT JOIN pr_items pi ON pr.id = pi.pr_id
       GROUP BY pr.id
       ORDER BY pr.id DESC`
    );
  },

  findByIdHeader(id) {
    return db.query(
      `SELECT 
         pr.*,
         COUNT(pi.id) AS item_count,
         COALESCE(SUM(pi.qty), 0) AS total_qty
       FROM purchase_requisitions pr
       LEFT JOIN pr_items pi ON pr.id = pi.pr_id
       WHERE pr.id = ?
       GROUP BY pr.id`,
      [id]
    );
  },

  findItemsByPR(id) {
    return db.query(
      `SELECT *
       FROM pr_items
       WHERE pr_id = ?`,
      [id]
    );
  }
};
