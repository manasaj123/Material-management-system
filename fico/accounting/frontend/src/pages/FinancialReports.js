import React, { useEffect, useState } from 'react';
import api from '../api';

const FinancialReports = () => {
  const [reports, setReports] = useState({
    pl: [],
    bs: [],
    summary: {}
  });
  const [period, setPeriod] = useState('2026-04');
  const [reportType, setReportType] = useState('current');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, [period, reportType]);

  const loadReports = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await api.get(`/financial-reports/${period}?type=${reportType}`);
    console.log('financial-reports response:', res.data); // <--- add this
    setReports(res.data);
  } catch (err) {
    console.error('financial-reports error:', err);       // <--- and this
    setError('Failed to load reports');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container">
      
      {/* 🔥 INTERNAL CSS */}
      <style>{`
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        h2 {
          margin-bottom: 15px;
        }

        .card {
          background: #fff;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }

        .form-group-inline {
          display: flex;
          gap: 15px;
          align-items: end;
          flex-wrap: wrap;
        }

        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }

        select {
          padding: 6px;
          border-radius: 5px;
          border: 1px solid #ccc;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-primary:disabled {
          background: #aaa;
        }

        .error-text {
          color: red;
          margin-bottom: 10px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .summary-cards {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .summary-card {
          flex: 1;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }

        .summary-card.success {
          background: #d4edda;
        }

        .summary-value {
          font-size: 18px;
          font-weight: bold;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th, .table td {
          padding: 8px;
          border-bottom: 1px solid #ddd;
        }

        .amount-right {
          text-align: right;
        }

        .positive {
          color: green;
        }

        .negative {
          color: red;
        }
      `}</style>

      <h2>Financial Reports</h2>
      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <div className="form-group-inline">
          <div>
            <label>Period</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="2026-04">Apr 2026</option>
              <option value="2026-03">Mar 2026</option>
              <option value="2026-Q1">Q1 2026</option>
              
              <option value="2026-01">Jan 2026 YTD</option>
            </select>
          </div>
          <div>
            <label>Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="current">Current Period</option>
              <option value="ytd">Year To Date</option>
            </select>
          </div>
          <button className="btn-primary" onClick={loadReports} disabled={loading}>
            {loading ? 'Loading...' : 'Generate'}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Profit & Loss */}
        <div className="card">
          <h3>Profit & Loss {period} ({reportType.toUpperCase()})</h3>

          <div className="summary-cards">
            <div className="summary-card">
              <h4>Revenue</h4>
              <div className="summary-value">₹{reports.summary?.revenue?.toFixed(2) || 0}</div>
            </div>
            <div className="summary-card">
              <h4>Expenses</h4>
              <div className="summary-value">₹{reports.summary?.expenses?.toFixed(2) || 0}</div>
            </div>
            <div className="summary-card success">
              <h4>Net Profit</h4>
              <div className="summary-value">₹{reports.summary?.netProfit?.toFixed(2) || 0}</div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th className="amount-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {reports.pl?.map((row, index) => (
                <tr key={row.accountName || index}>
                  <td>{row.accountName}</td>
                  <td className={`amount-right ${row.type === 'revenue' ? 'positive' : 'negative'}`}>
                    {row.type === 'revenue' ? '+' : '-'}₹{Math.abs(Number(row.amount)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Balance Sheet 
        <div className="card">
          <h3>Balance Sheet {period}</h3>

          <div className="summary-cards">
            <div className="summary-card">
              <h4>Assets</h4>
              <div className="summary-value">₹{reports.summary?.assets?.toFixed(2) || 0}</div>
            </div>
            <div className="summary-card">
              <h4>Liabilities</h4>
              <div className="summary-value">₹{reports.summary?.liabilities?.toFixed(2) || 0}</div>
            </div>
            <div className="summary-card">
              <h4>Equity</h4>
              <div className="summary-value">₹{reports.summary?.equity?.toFixed(2) || 0}</div>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Account</th>
                <th className="amount-right">Balance</th>
              </tr>
            </thead> 
            <tbody>
              {reports.bs?.map((row) => (
                <tr key={row.accountNumber}>
                  <td>{row.category}</td>
                  <td>{row.accountName}</td>
                  <td className="amount-right">₹{Number(row.balance).toFixed(2)}</td>
                </tr>
              ))}
            </tbody> 
          </table>
        </div> */}
      </div>
    </div>
  );
};

export default FinancialReports;