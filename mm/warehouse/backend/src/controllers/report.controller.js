const db = require('../config/db');


module.exports = {
  getMetrics: async (req, res) => {
    try {
      
      const avgPutaway = 25.5;  
      const pickAcc = 98.7;
      
      res.json({
        avg_putaway_time: avgPutaway,
        pick_accuracy: pickAcc,
        total_grns: 42,
        space_utilization: 78
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

