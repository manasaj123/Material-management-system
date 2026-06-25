// src/services/mrpService.js
const db = require('../config/db');
const MrpRequirement = require('../models/MrpRequirement');

const mrpService = {
  async run(planDate) {
    const [rows] = await db.query(
      `SELECT
         pp.product_id,
         pp.grade_pack_id,
         pp.planned_qty,
         b.material_id,
         b.qty_per_unit
       FROM production_plan pp
       JOIN bom b
         ON pp.product_id = b.product_id
        AND pp.grade_pack_id = b.grade_pack_id
       WHERE pp.plan_date = ?
         AND pp.status = 'final'`,
      [planDate]
    );

    if (!rows.length) {
      await MrpRequirement.deleteByDate(planDate);
      return { inserted: 0, message: 'MRP executed, no requirements' };
    }

    const reqRows = rows.map((r) => ({
      product_id: r.product_id,
      grade_pack_id: r.grade_pack_id,
      material_id: r.material_id,
      required_qty: Number(r.planned_qty) * Number(r.qty_per_unit),
      status: 'open'
    }));

    await MrpRequirement.deleteByDate(planDate);
    await MrpRequirement.insertMany(planDate, reqRows);
    const count = await MrpRequirement.countByDate(planDate);
    return { inserted: count, message: 'MRP executed' };
  }
};

module.exports = mrpService;
