// frontend/src/pages/Budget.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Budget = () => {
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    accountCode: '500001',
    description: '',
    budgetAmount: ''
  });
  const [rows, setRows] = useState([]);
  const [vsActual, setVsActual] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const res = await api.get('/budgets', {
        params: { year: form.year, month: form.month }
      });
      setRows(res.data);

      const vs = await api.get('/budgets/vs-actual', {
        params: { year: form.year, month: form.month }
      });
      setVsActual(vs.data);
    } catch (e) {
      console.error('load budgets error', e);
      setError('Failed to load budgets');
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
   const amount = Number(form.budgetAmount);

  // 1) Basic validation: must be > 0
  if (Number.isNaN(amount) || amount <= 0) {
    setError('Budget amount must be greater than 0');
    return;
  }

    // UI-level uniqueness check: one budget per (year, month, accountCode)
    const exists = rows.some(
      (b) =>
        Number(b.year) === Number(form.year) &&
        Number(b.month) === Number(form.month) &&
        b.accountCode === form.accountCode
    );
    if (exists) {
      setError(
        `Budget already exists for ${form.accountCode} in ${form.year}-${String(
          form.month
        ).padStart(2, '0')}`
      );
      return;
    }

    try {
      await api.post('/budgets', {
        ...form,
        year: Number(form.year),
        month: Number(form.month),
        budgetAmount: Number(form.budgetAmount)
      });
      setForm((f) => ({ ...f, budgetAmount: '' }));
      await load();
    } catch (err) {
      console.error('save budget error', err);
      setError('Failed to save budget');
    }
  };

  return (
    <div>
      <h2>Budgeting</h2>

      {error && <div className="error-text">{error}</div>}

      <div className="grid-2">
        <div className="card">
          <h3>Set Budget</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group-inline">
              <div>
                <label>Year</label>
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label>Month</label>
                <input
                  type="number"
                  name="month"
                  min="1"
                  max="12"
                  value={form.month}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Account Code</label>
              <input
                name="accountCode"
                value={form.accountCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Office expenses budget"
              />
            </div>

            <div className="form-group">
              <label>Budget Amount</label>
              <input
                type="number"
                name="budgetAmount"
                value={form.budgetAmount}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn-primary" type="submit">
              Save Budget
            </button>
          </form>

          <h4 style={{ marginTop: '1rem' }}>Budgets</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td>{b.accountCode}</td>
                  <td>{b.description || '-'}</td>
                  <td>{Number(b.budgetAmount).toFixed(2)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="3">No budgets yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Budget vs Actual</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Budget</th>
                <th>Actual</th>
                <th>Variance</th>
              </tr>
            </thead>
            <tbody>
              {vsActual.map((r, idx) => (
                <tr key={idx}>
                  <td>{r.accountCode}</td>
                  <td>{r.budgetAmount.toFixed(2)}</td>
                  <td>{r.actualAmount.toFixed(2)}</td>
                  <td>{r.variance.toFixed(2)}</td>
                </tr>
              ))}
              {vsActual.length === 0 && (
                <tr>
                  <td colSpan="4">No data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Budget;