import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const BankReconciliation = () => {
  const [statements, setStatements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [importForm, setImportForm] = useState({
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX1234',
    statementDate: '',
    rowsText: ''
  });
  const [reconForm, setReconForm] = useState({
    bankStatementId: '',
    paymentId: ''
  });
  const [error, setError] = useState('');

  const loadData = async () => {
    const [stmtRes, payRes] = await Promise.all([
      api.get('/bank'),
      api.get('/payments')
    ]);
    setStatements(stmtRes.data);
    setPayments(payRes.data);
  };

  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const handleImportChange = (e) => {
    setImportForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleReconChange = (e) => {
    setReconForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const parseRows = () => {
    // expect lines: date,description,debit,credit,balance
    const lines = importForm.rowsText.split('\n').filter(Boolean);
    return lines.map((line) => {
      const [txnDate, description, debit, credit, balance] = line.split(',');
      return {
        txnDate,
        description,
        debit: Number(debit) || 0,
        credit: Number(credit) || 0,
        balance: Number(balance) || 0
      };
    });
  };

  const handleImport = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const rows = parseRows();
      await api.post('/bank/import', {
        bankName: importForm.bankName,
        accountNumber: importForm.accountNumber,
        statementDate: importForm.statementDate,
        rows
      });
      setImportForm((f) => ({ ...f, rowsText: '' }));
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed');
    }
  };

  const handleReconcile = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/bank/reconcile', {
        bankStatementId: Number(reconForm.bankStatementId),
        paymentId: Number(reconForm.paymentId)
      });
      setReconForm({ bankStatementId: '', paymentId: '' });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Reconciliation failed');
    }
  };

  return (
    <div>
      <h2>Bank Reconciliation</h2>
      <div className="grid-2">
        <div className="card">
          <h3>Import Statement (CSV lines)</h3>
          {error && <div className="error-text">{error}</div>}
          <form onSubmit={handleImport}>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                name="bankName"
                value={importForm.bankName}
                onChange={handleImportChange}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                name="accountNumber"
                value={importForm.accountNumber}
                onChange={handleImportChange}
              />
            </div>
            <div className="form-group">
              <label>Statement Date</label>
              <input
                type="date"
                name="statementDate"
                value={importForm.statementDate}
                onChange={handleImportChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Rows (date,description,debit,credit,balance)</label>
              <textarea
                name="rowsText"
                value={importForm.rowsText}
                onChange={handleImportChange}
                rows={6}
              />
            </div>
            <button className="btn-primary" type="submit">
              Import
            </button>
          </form>
        </div>
        <div className="card">
          <h3>Reconcile</h3>
          <form onSubmit={handleReconcile}>
            <div className="form-group">
              <label>Bank Line</label>
              <select
                name="bankStatementId"
                value={reconForm.bankStatementId}
                onChange={handleReconChange}
                required
              >
                <option value="">Select</option>
                {statements
                  .filter((s) => !s.matched)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.txnDate} {s.description} (Amt:{' '}
                      {s.debit > 0 ? s.debit : s.credit})
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Payment</label>
              <select
                name="paymentId"
                value={reconForm.paymentId}
                onChange={handleReconChange}
                required
              >
                <option value="">Select</option>
                {payments
                  .filter((p) => !p.reconciled)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.paymentNumber} {p.type} (Amt: {p.amount})
                    </option>
                  ))}
              </select>
            </div>
            <button className="btn-primary" type="submit">
              Reconcile
            </button>
          </form>

          <h4 style={{ marginTop: '1rem' }}>Imported Lines</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Matched</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((s) => (
                <tr key={s.id}>
                  <td>{s.txnDate}</td>
                  <td>{s.description}</td>
                  <td>{s.debit}</td>
                  <td>{s.credit}</td>
                  <td>{s.matched ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {statements.length === 0 && (
                <tr>
                  <td colSpan="5">No statements yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BankReconciliation;
