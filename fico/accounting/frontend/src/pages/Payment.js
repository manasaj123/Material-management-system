import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const Payment = () => {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    paymentNumber: '',
    type: 'RECEIPT',
    invoiceId: '',
    date: '',
    mode: 'BANK_TRANSFER',
    bankAccountCode: '',
    amount: '',
    tdsAmount: '',
    referenceNumber: '',
    remarks: ''
  });
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // ---- load data ----
  const loadData = async () => {
    const [invRes, payRes] = await Promise.all([
      api.get('/invoices'),
      api.get('/payments')
    ]);
    setInvoices(invRes.data);
    setPayments(payRes.data);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  // ---- small helper to auto-generate reference number ----
  const generateReferenceNumber = () => {
    // simple pattern: REF-YYYYMMDD-HHMMSS-random
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    const rand = Math.floor(Math.random() * 900) + 100; // 3-digit
    return `REF-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When invoice changes, auto-set Type and Amount based on invoice
    if (name === 'invoiceId') {
      const inv = invoices.find((i) => i.id === Number(value));

      if (inv) {
        const nextType = inv.type === 'AP' ? 'PAYMENT' : 'RECEIPT';
        const balance = Number(inv.balanceAmount) || 0;

        setForm((f) => ({
          ...f,
          invoiceId: value,
          // do NOT override user-selected CREDIT/DEBIT if already chosen
          type:
            f.type === 'CREDIT_NOTE' || f.type === 'DEBIT_NOTE'
              ? f.type
              : nextType,
          // auto-fill amount as full balance
          amount: balance.toFixed(2),
          // auto-generate reference if empty
          referenceNumber: f.referenceNumber || generateReferenceNumber()
        }));
      } else {
        setForm((f) => ({
          ...f,
          invoiceId: '',
          type: 'RECEIPT',
          amount: ''
        }));
      }
      return;
    }

    // When user clears referenceNumber, generate one
    if (name === 'referenceNumber' && !value) {
      setForm((f) => ({
        ...f,
        referenceNumber: generateReferenceNumber()
      }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const selectedInvoice = invoices.find(
      (inv) => inv.id === Number(form.invoiceId)
    );
    const amount = Number(form.amount) || 0;

    if (!selectedInvoice) {
      setError('Please select an invoice');
      return;
    }

    const balance = Number(selectedInvoice.balanceAmount) || 0;
    // For normal payments/receipts, do not allow more than balance
    if (
      amount > balance &&
      form.type !== 'CREDIT_NOTE' &&
      form.type !== 'DEBIT_NOTE'
    ) {
      setError('Payment exceeds invoice balance');
      return;
    }

    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      const payload = {
        // paymentNumber is generated in backend
        type: form.type, // includes RECEIPT, PAYMENT, CREDIT_NOTE, DEBIT_NOTE
        invoiceId: Number(form.invoiceId),
        date: form.date,
        mode: form.mode,
        bankAccountCode: form.bankAccountCode,
        amount,
        tdsAmount: Number(form.tdsAmount) || 0,
        referenceNumber:
          form.referenceNumber && form.referenceNumber.trim()
            ? form.referenceNumber.trim()
            : generateReferenceNumber(),
        remarks: form.remarks
      };

      const res = await api.post('/payments', payload);

      setForm((f) => ({
        ...f,
        paymentNumber: res.data.paymentNumber || '',
        invoiceId: '',
        amount: '',
        tdsAmount: '',
        referenceNumber: '',
        remarks: ''
      }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const filteredPayments = payments.filter((p) =>
    typeFilter === 'ALL' ? true : p.type === typeFilter
  );

  const renderTypeText = (t) => {
    if (t === 'CREDIT_NOTE') return 'Credit Note';
    if (t === 'DEBIT_NOTE') return 'Debit Note';
    if (t === 'RECEIPT') return 'Receipt';
    if (t === 'PAYMENT') return 'Payment';
    return t;
  };

  return (
    <div>
      <h2>Payments / Receipts</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Record Payment/Receipt</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleSubmit}>
            {/* Invoice first */}
            <div className="form-group">
              <label>
                Invoice<span className="required-star">*</span>
              </label>
              <select
                name="invoiceId"
                value={form.invoiceId}
                onChange={handleChange}
                required
              >
                <option value="">Select invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} - {inv.partyName} (Bal:{' '}
                    {Number(inv.balanceAmount).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Auto payment number */}
            <div className="form-group">
              <label>Payment No.</label>
              <input
                name="paymentNumber"
                value={form.paymentNumber}
                readOnly
                placeholder="Will be generated from backend"
              />
            </div>

            {/* Type including Credit/Debit Note */}
            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="RECEIPT">Receipt (Customer)</option>
                <option value="PAYMENT">Payment (Vendor)</option>
                <option value="CREDIT_NOTE">Credit Note</option>
                <option value="DEBIT_NOTE">Debit Note</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Date<span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Mode <span className="required-star">*</span>
              </label>
              <select name="mode" value={form.mode} onChange={handleChange}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            <div className="form-group">
              <label>Bank/ Cash Account Code</label>
              <input
                name="bankAccountCode"
                value={form.bankAccountCode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>
                Amount<span className="required-star">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>TDS Amount</label>
              <input
                type="number"
                name="tdsAmount"
                value={form.tdsAmount}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Reference No.</label>
              <input
                name="referenceNumber"
                value={form.referenceNumber}
                onChange={handleChange}
                placeholder="Auto-generated if left blank"
              />
            </div>

            <div className="form-group">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
              />
            </div>

            <button className="btn-primary" type="submit">
              Save Payment
            </button>
          </form>
        </div>

        <div className="card">
          <h3>Recent Payments / Notes</h3>

          
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Type</th>
                <th>Invoice</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Reconciled</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p) => (
                <tr key={p.id}>
                  <td>{p.paymentNumber}</td>
                  <td>{renderTypeText(p.type)}</td>
                  <td>{p.invoiceId}</td>
                  <td>{p.date}</td>
                  <td>{Number(p.amount).toFixed(2)}</td>
                  <td>{p.reconciled ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="6">No records for this filter.</td>
                </tr>
              )}
            </tbody>
            
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payment;
