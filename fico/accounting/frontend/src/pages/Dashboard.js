import React, { useEffect, useState } from 'react';
import api from '../api';
import './pagestyle.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalOpenAR: 0,
    totalOpenAP: 0,
    totalPayments: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      const [invRes, payRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/payments')
      ]);

      const invoices = invRes.data;
      const payments = payRes.data;

      let totalOpenAR = 0;
      let totalOpenAP = 0;

      invoices.forEach((i) => {
        if (i.type === 'AR') totalOpenAR += Number(i.balanceAmount);
        if (i.type === 'AP') totalOpenAP += Number(i.balanceAmount);
      });

      setStats({
        totalInvoices: invoices.length,
        totalOpenAR,
        totalOpenAP,
        totalPayments: payments.length
      });
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <div className="dashboard">
      <h2>Finance Dashboard</h2>
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Invoices</span>
          <span className="kpi-value">{stats.totalInvoices}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Open AR</span>
          <span className="kpi-value">₹ {stats.totalOpenAR.toFixed(2)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Open AP</span>
          <span className="kpi-value">₹ {stats.totalOpenAP.toFixed(2)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Payments</span>
          <span className="kpi-value">{stats.totalPayments}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
