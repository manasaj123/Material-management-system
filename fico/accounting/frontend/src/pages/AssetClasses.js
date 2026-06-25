// frontend/src/pages/AssetClasses.js
import React, { useEffect, useState } from 'react';
import api from '../api';

const initialForm = {
  code: '',
  name: '',
  assetType: 'TANGIBLE',
  depreciationArea: '',
  usefulLifeYears: '',
  glAccountAsset: '',
  glAccountAccumDep: '',
  glAccountExpense: '',
  isActive: true,
};

const AssetClasses = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/asset-classes');
      setRows(res.data || []);
    } catch (err) {
      console.error('AssetClasses load error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to load asset classes');
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'usefulLifeYears'
          ? Number(value || 0)
          : value,
    }));
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({
      code: r.code || '',
      name: r.name || '',
      assetType: r.assetType || 'TANGIBLE',
      depreciationArea: r.depreciationArea || '',
      usefulLifeYears: r.usefulLifeYears || '',
      glAccountAsset: r.glAccountAsset || '',
      glAccountAccumDep: r.glAccountAccumDep || '',
      glAccountExpense: r.glAccountExpense || '',
      isActive: !!r.isActive,
    });
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const payload = { ...form };
      if (editingId) {
        await api.put(`/asset-classes/${editingId}`, payload);
        setSuccess('Asset class updated');
      } else {
        await api.post('/asset-classes', payload);
        setSuccess('Asset class created');
      }
      setForm(initialForm);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error('AssetClasses save error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this asset class?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/asset-classes/${id}`);
      setSuccess('Asset class deleted');
      await load();
    } catch (err) {
      console.error('AssetClasses delete error', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="ac-page">
      <style>{`
        .ac-page {
          padding: 16px;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: #f5f5f7;
        }
        .ac-title {
          margin-bottom: 12px;
          font-size: 20px;
          font-weight: 600;
        }
        .ac-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 12px 16px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
          margin-bottom: 16px;
        }
        .ac-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 8px 16px;
        }
        .ac-form-grid label {
          display: block;
          font-size: 12px;
          color: #555;
          margin-bottom: 2px;
        }
        .ac-form-grid input,
        .ac-form-grid select {
          width: 100%;
          padding: 6px 8px;
          font-size: 13px;
          border-radius: 4px;
          border: 1px solid #d0d7de;
        }
        .ac-form-actions {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }
        .ac-form-actions button {
          padding: 6px 10px;
          font-size: 13px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          background: #2563eb;
          color: #fff;
        }
        .ac-form-actions button[type="button"] {
          background: #9ca3af;
        }
        .ac-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 13px;
        }
        .ac-table th,
        .ac-table td {
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
        }
        .ac-table thead {
          background: #f3f4f6;
        }
        .ac-table button {
          padding: 3px 6px;
          font-size: 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          margin-right: 4px;
          background: #2563eb;
          color: #fff;
        }
        .ac-table button:last-child {
          background: #ef4444;
        }
        .ac-error {
          margin-bottom: 8px;
          padding: 6px 8px;
          font-size: 13px;
          color: #b91c1c;
          background: #fee2e2;
          border-radius: 4px;
        }
        .ac-success {
          margin-bottom: 8px;
          padding: 6px 8px;
          font-size: 13px;
          color: #166534;
          background: #dcfce7;
          border-radius: 4px;
        }
      `}</style>

      <h2 className="ac-title">Asset Classes</h2>
      {error && <div className="ac-error">{error}</div>}
      {success && <div className="ac-success">{success}</div>}

      <div className="ac-card">
        <form onSubmit={handleSubmit} className="ac-form-grid">
          <div>
            <label>Code *</label>
            <input
              name="code"
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Asset Type</label>
            <select
              name="assetType"
              value={form.assetType}
              onChange={handleChange}
            >
              <option value="TANGIBLE">Tangible</option>
              <option value="INTANGIBLE">Intangible</option>
            </select>
          </div>
          <div>
            <label>Depreciation Area</label>
            <input
              name="depreciationArea"
              value={form.depreciationArea}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Useful Life (years)</label>
            <input
              type="number"
              name="usefulLifeYears"
              value={form.usefulLifeYears}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Asset G/L</label>
            <input
              name="glAccountAsset"
              value={form.glAccountAsset}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Accumulated Dep. G/L</label>
            <input
              name="glAccountAccumDep"
              value={form.glAccountAccumDep}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Expense G/L</label>
            <input
              name="glAccountExpense"
              value={form.glAccountExpense}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
              />{' '}
              Active
            </label>
          </div>
          <div className="ac-form-actions">
            <button type="submit">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="ac-card">
        <table className="ac-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Asset G/L</th>
              <th>Accum Dep.</th>
              <th>Expense G/L</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.code}</td>
                <td>{r.name}</td>
                <td>{r.assetType}</td>
                <td>{r.glAccountAsset}</td>
                <td>{r.glAccountAccumDep}</td>
                <td>{r.glAccountExpense}</td>
                <td>{r.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <button type="button" onClick={() => handleEdit(r)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(r.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan="8">No asset classes yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetClasses; 