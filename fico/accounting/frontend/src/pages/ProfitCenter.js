import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const ProfitCenter = () => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: ''
  });

  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/profit-centers');
    setRows(res.data);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  // ✅ Validation rules
  const isValidCode = (value) => /^[A-Z0-9-]+$/i.test(value);
  const isValidName = (value) => /^[A-Za-z\s]+$/.test(value);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔒 Block invalid characters while typing
    if (name === 'code') {
      value = value.replace(/[^a-zA-Z0-9-]/g, '');
    }

    if (name === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 🔴 Validation before API call
    if (!isValidCode(form.code)) {
      setError('Code allows only letters, numbers, and dash (-)');
      return;
    }

    if (!isValidName(form.name)) {
      setError('Name allows only letters and spaces');
      return;
    }

    try {
      await api.post('/profit-centers', form);

      setForm({
        code: '',
        name: '',
        description: ''
      });

      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profit center');
    }
  };

  return (
    <div>
      <h2>Profit Centers</h2>

      <div className="grid-2">
        {/* CREATE FORM */}
        <div className="card">
          <h3>Create</h3>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Code</label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. PC-001"
                required
              />
            </div>

            <div className="form-group">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sales Department"
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

            <button className="btn-primary" type="submit">
              Save
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="card">
          <h3>List</h3>

          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan="2">No profit centers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfitCenter;