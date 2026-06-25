import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import '../pages/style.css';

const ReportsPage = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await axiosClient.get('/report/metrics');
      console.log('📊 Metrics API response:', response.data);
      setMetrics(response.data);
    } catch (error) {
      console.error('Metrics error:', error);
      setMetrics({});
    }
  };

  const safeNumber = (v) => Number(v || 0);

  return (
    <div>
      <div className="page-header">
        <h1>📈 Reports & Analytics</h1>
        <button className="btn btn-primary" onClick={loadMetrics}>
          🔄 Refresh
        </button>
      </div>
      
      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>📥 Total GRNs</h3>
          <p className="metric-value">
            {safeNumber(metrics.total_grns)}
          </p>
          <p className="metric-label">goods receipts</p>
        </div>

        <div className="card metric-card">
          <h3>⏱️ Avg Putaway Time</h3>
          <p className="metric-value">
            {metrics.avg_putaway_time > 0
              ? safeNumber(metrics.avg_putaway_time).toFixed(1) + ' min'
              : '—'}
          </p>
          <p className="metric-label" style={{
            color: metrics.avg_putaway_time > 30 ? '#e74c3c' : 
                   metrics.avg_putaway_time > 0 ? '#27ae60' : '#95a5a6'
          }}>
            {metrics.avg_putaway_time > 0 ? 'Target: < 30 min' : 'No completed putaways'}
          </p>
        </div>

        <div className="card metric-card">
          <h3>🎯 Pick Accuracy</h3>
          <p className="metric-value">
            {metrics.pick_accuracy != null
              ? safeNumber(metrics.pick_accuracy).toFixed(1) + '%'
              : 'N/A'}
          </p>
          <p className="metric-label" style={{
            color: metrics.pick_accuracy < 99 ? '#e74c3c' : '#27ae60'
          }}>
            Target: &gt; 99%
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default ReportsPage;