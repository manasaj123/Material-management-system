import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Expense = () => {
  const [form, setForm] = useState({
    date: '',
    vendorName: '',
    description: '',
    accountCode: '500001',
    amount: '',
    gstRate: '18',
    tdsRate: '0'
  });

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/expenses');
    setRows(res.data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  // ✅ prevent duplicate account code check (frontend)
  const isDuplicateAccountCode = (code) => {
    return rows.some((r) => r.accountCode === code);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // ❌ block negative amount
    if (name === 'amount') {
      value = value.replace(/[^0-9.]/g, '');
      if (Number(value) < 0) value = '';
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ❌ validation
    if (Number(form.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (isDuplicateAccountCode(form.accountCode)) {
      setError('Account code already used in expense list');
      return;
    }

    try {
      await api.post('/expenses', {
        ...form,
        amount: Number(form.amount),
        gstRate: Number(form.gstRate),
        tdsRate: Number(form.tdsRate) || 0
      });

      setForm((f) => ({
        ...f,
        vendorName: '',
        description: '',
        amount: ''
      }));

      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  return (
    <div>
      <h2>Expenses</h2>

      <div className="grid-2">
        {/* FORM */}
        <div className="card">
          <h3>Record Expense</h3>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Vendor</label>
              <input
                name="vendorName"
                value={form.vendorName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
              />
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
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            {/* ✅ GST DROPDOWN */}
            <div className="form-group-inline">
            <div className="form-group">
              <label>GST %</label>
              <select
                name="gstRate"
                value={form.gstRate}
                onChange={handleChange}
                required
              >
                <option value="5">5%</option>
                <option value="18">18%</option>
                <option value="40">40%</option>
              </select>
            </div>

            <div className="form-group">
              <label>TDS %</label>
              <input
                type="number"
                name="tdsRate"
                value={form.tdsRate}
                onChange={handleChange}
              />
            </div>
            </div>
            <button className="btn-primary" type="submit">
              Save Expense
            </button>
          </form>
        </div>

        {/* TABLE */}
        <div className="card">
          <h3>Recent Expenses</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Account</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.vendorName}</td>
                  <td>{e.accountCode}</td>
                  <td>{Number(e.totalAmount).toFixed(2)}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="4">No expenses yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Expense;