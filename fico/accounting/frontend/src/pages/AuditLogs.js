// frontend/src/pages/AuditLogs.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import '../styles/Common.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/audit');
      setLogs(res.data);
    } catch (err) {
      console.error('load audit logs error', err);
      setError(
        err.response?.data?.message || 'Failed to load audit logs'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs().catch(console.error);
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>

      {error && <div className="error-text">{error}</div>}

      <div className="card">
        <div className="form-group-inline" style={{ marginBottom: '10px' }}>
          <button
            className="btn-primary"
            onClick={loadLogs}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Email</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>
                  {log.createdAt
                    ? new Date(log.createdAt).toLocaleString()
                    : ''}
                </td>
                <td>{log.User?.name || '-'}</td>
                <td>{log.User?.email || '-'}</td>
                <td>{log.action}</td>
                <td>{log.entity}</td>
                <td>{log.entityId || '-'}</td>
                <td>{log.ipAddress || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr>
                <td colSpan="7">No audit logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;