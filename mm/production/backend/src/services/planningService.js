const Forecast = require('../models/Forecast');
const ProductionPlan = require('../models/ProductionPlan');

const planningService = {
  async generatePlanFromForecast(period, planDate) {
    const forecastRows = await Forecast.findByPeriod(period);
    if (!forecastRows.length) return { inserted: 0 };

    const planRows = forecastRows.map((f) => ({
      shift: 1,
      product_id: f.product_id,
      grade_pack_id: f.grade_pack_id,
      planned_qty: f.forecast_qty,
      status: 'final'
    }));

    await ProductionPlan.upsertMany(planDate, planRows);
    return { inserted: planRows.length };
  }
};

module.exports = planningService;
