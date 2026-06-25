const Metric = require('../models/Metric');

const metricsService = {
  async daily(planDate) {
    const row = await Metric.daily(planDate);
    if (!row) {
      return {
        plan_date: planDate,
        total_planned: 0,
        total_actual: 0,
        total_wastage: 0,
        yield_percent: 0
      };
    }
    return row;
  }
};

module.exports = metricsService;
