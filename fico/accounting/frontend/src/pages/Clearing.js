// frontend/src/pages/Clearing.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Clearing = () => {
  const [form, setForm] = useState({
    invoiceId: '',
    paymentId: '',
    clearedAmount: '',
    clearingDate: '',
    remainingAmount: ''
  });

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clearings, setClearings] = useState([]);
  const [error, setError] = useState('');
  const [partyFilter, setPartyFilter] = useState('');

  useEffect(() => {
    loadClearings();
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const res = await api.get('/invoices/open'); // Only unpaid/partly paid
      setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPayments = async (invoiceId) => {
    if (!invoiceId) return;
    try {
      const res = await api.get(`/payments/for-invoice/${invoiceId}`);
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // helper to get currently selected invoice object
  const getSelectedInvoice = () =>
    invoices.find((inv) => String(inv.id) === String(form.invoiceId));

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // When invoice changes: load payments and reset related fields
      if (name === 'invoiceId') {
        loadPayments(value);
        updated.paymentId = '';
        updated.clearedAmount = '';

        const inv = invoices.find((inv) => String(inv.id) === String(value));
        updated.remainingAmount = inv ? inv.balanceAmount : '';
      }

      // When cleared amount changes: recompute remaining
      if (name === 'clearedAmount') {
        const inv = getSelectedInvoice();
        const cleared = Number(value) || 0;
        if (inv) {
          const remaining = Number(inv.balanceAmount || 0) - cleared;
          updated.remainingAmount = remaining >= 0 ? remaining : 0;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        invoiceId: form.invoiceId,
        paymentId: form.paymentId,
        clearedAmount: Number(form.clearedAmount),
        clearingDate: form.clearingDate,
        remainingAmount: Number(form.remainingAmount)
      };

      await api.post('/clearings', payload);

      // Reset & reload
      setForm({
        invoiceId: '',
        paymentId: '',
        clearedAmount: '',
        clearingDate: '',
        remainingAmount: ''
      });
      loadClearings();
      loadInvoices();
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Clearing failed');
    }
  };

  const loadClearings = async () => {
    try {
      const res = await api.get(`/clearings?party=${partyFilter}`);
      setClearings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCleared = clearings.reduce(
    (sum, c) => sum + Number(c.clearedAmount || 0),
    0
  );

  return (
    <div>
      <h2>Manual Clearing (Invoice-Payment Matching)</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Create Clearing</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Open Invoice <span className="required-star">*</span>
              </label>
              <select
                name="invoiceId"
                value={form.invoiceId}
                onChange={handleChange}
                required
              >
                <option value="">Select Open Invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.partyName} - Bal: ₹
                    {inv.balanceAmount}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Payment <span className="required-star">*</span>
              </label>
              <select
                name="paymentId"
                value={form.paymentId}
                onChange={handleChange}
                required
              >
                <option value="">Select Payment</option>
                {payments.map((pay) => (
                  <option key={pay.id} value={pay.id}>
                    {pay.paymentNumber} - ₹{pay.amount}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Cleared Amount <span className="required-star">*</span>
              </label>
              <input
                type="number"
                name="clearedAmount"
                value={form.clearedAmount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Clearing Date <span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="clearingDate"
                value={form.clearingDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Remaining Invoice Balance</label>
              <input
                type="number"
                name="remainingAmount"
                value={form.remainingAmount}
                readOnly
              />
            </div>

            <button className="btn-primary" type="submit">
              Clear Entry
            </button>
          </form>
        </div>

        <div className="card">
          <div className="form-group">
            <label>Filter by Party</label>
            <input
              type="text"
              placeholder="Enter party name"
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && loadClearings()}
            />
            <button className="btn-secondary" onClick={loadClearings}>
              Filter
            </button>
          </div>

          <h3>Clearing History</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Payment</th>
                <th>Cleared</th>
                <th>Date</th>
                <th>Invoice Remaining</th>
              </tr>
            </thead>
            <tbody>
              {clearings.map((clearing) => (
                <tr key={clearing.id}>
                  <td>
                    {clearing.Invoice?.invoiceNumber} -{' '}
                    {clearing.Invoice?.partyName}
                  </td>
                  <td>{clearing.Payment?.paymentNumber}</td>
                  <td>₹{Number(clearing.clearedAmount).toFixed(2)}</td>
                  <td>{clearing.clearingDate}</td>
                  <td>₹{Number(clearing.remainingAmount).toFixed(2)}</td>
                </tr>
              ))}
              {clearings.length === 0 && (
                <tr>
                  <td colSpan="5">No clearings found.</td>
                </tr>
              )}
              {clearings.length > 0 && (
                <tr className="table-total">
                  <td colSpan="2">
                    <strong>Total Cleared</strong>
                  </td>
                  <td>
                    <strong>₹{totalCleared.toFixed(2)}</strong>
                  </td>
                  <td colSpan="2"></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clearing;