// backend/src/controllers/prController.js
import db from "../config/db.js";
import { PurchaseRequisition } from "../models/PurchaseRequisition.js";

// helper to ensure MySQL DATE format (YYYY-MM-DD)
const toMysqlDate = (value) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/* ---------------- GET ALL PRs ---------------- */

export const getPRs = async (req, res, next) => {
  try {
    const [rows] = await PurchaseRequisition.findAll();
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

/* ---------------- CREATE PR ---------------- */

export const createPR = async (req, res, next) => {
  const conn = await db.getConnection();

  try {
    const { header, items } = req.body;

    await conn.beginTransaction();

    // last PR no
    const [rows] = await conn.query(`
      SELECT req_no
      FROM purchase_requisitions
      WHERE req_no LIKE 'DB4-PR-%'
      ORDER BY id DESC
      LIMIT 1
    `);

    let nextSeq = 1;

    if (rows.length > 0 && rows[0].req_no) {
      const lastReq = rows[0].req_no;
      const parts = lastReq.split("-");
      if (parts.length === 3 && !isNaN(parts[2])) {
        nextSeq = parseInt(parts[2], 10) + 1;
      }
    }

    const generatedReqNo = `DB4-PR-${String(nextSeq).padStart(3, "0")}`;

    // INSERT HEADER with new fields
    const [headerRes] = await conn.query(
      `
      INSERT INTO purchase_requisitions
        (req_no, req_date, requester, status, uom, batch, plant, purchase_org)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        generatedReqNo,
        toMysqlDate(header.req_date),
        header.requester,
        header.status || "DRAFT",
        header.uom || null,
        header.batch || null,
        header.plant || null,
        header.purchase_org || null
      ]
    );

    const prId = headerRes.insertId;

    // INSERT ITEMS
    for (const item of items || []) {
      if (!item.material_id || !item.qty) continue;

      await conn.query(
        `
        INSERT INTO pr_items
          (pr_id, material_id, qty, required_date, remarks)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          prId,
          item.material_id,
          Number(item.qty),
          toMysqlDate(item.required_date),
          item.remarks || null
        ]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: prId,
      req_no: generatedReqNo
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* ---------------- GET ONE PR (for edit) ---------------- */

export const getPRById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const [[headerRow]] = await PurchaseRequisition.findByIdHeader(id);
    if (!headerRow) {
      return res.status(404).json({ message: "PR not found" });
    }

    const [itemRows] = await PurchaseRequisition.findItemsByPR(id);

    res.json({
      header: headerRow,
      items: itemRows
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------- UPDATE PR ---------------- */

export const updatePR = async (req, res, next) => {
  const conn = await db.getConnection();

  try {
    const id = req.params.id;
    const { header, items } = req.body;

    await conn.beginTransaction();

    // update header
    await conn.query(
      `
      UPDATE purchase_requisitions
      SET req_date = ?,
          requester = ?,
          status = ?,
          uom = ?,
          batch = ?,
          plant = ?,
          purchase_org = ?
      WHERE id = ?
    `,
      [
        toMysqlDate(header.req_date),
        header.requester,
        header.status || "DRAFT",
        header.uom || null,
        header.batch || null,
        header.plant || null,
        header.purchase_org || null,
        id
      ]
    );

    // delete old items
    await conn.query("DELETE FROM pr_items WHERE pr_id = ?", [id]);

    // insert new items
    for (const item of items || []) {
      if (!item.material_id || !item.qty) continue;

      await conn.query(
        `
        INSERT INTO pr_items
          (pr_id, material_id, qty, required_date, remarks)
        VALUES (?, ?, ?, ?, ?)
      `,
        [
          id,
          item.material_id,
          Number(item.qty),
          toMysqlDate(item.required_date),
          item.remarks || null
        ]
      );
    }

    await conn.commit();

    res.json({ message: "PR updated" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* ---------------- DELETE PR ---------------- */

export const deletePR = async (req, res, next) => {
  try {
    const id = req.params.id;

    await db.query("DELETE FROM pr_items WHERE pr_id = ?", [id]);
    const [result] = await db.query(
      "DELETE FROM purchase_requisitions WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PR not found" });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
