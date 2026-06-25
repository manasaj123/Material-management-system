const Capacity = require('../models/Capacity');
const ProductionPlan = require('../models/ProductionPlan');

const capacityService = {
  async suggestCapacity(planDate) {
    const plan = await ProductionPlan.findByDate(planDate);
    if (!plan.length) return { rows: [] };

    const byShift = {};
    for (const row of plan) {
      if (!byShift[row.shift]) byShift[row.shift] = 0;
      byShift[row.shift] += Number(row.planned_qty || 0);
    }

    const rows = Object.entries(byShift).map(([shift, qty]) => ({
      line_id: 1,
      shift: Number(shift),
      available_hours: Math.min(8, Math.ceil(qty / 1000))
    }));

    await Capacity.upsertMany(planDate, rows);
    return { rows };
  }
};

module.exports = capacityService;
