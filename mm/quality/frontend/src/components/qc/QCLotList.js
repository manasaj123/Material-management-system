// frontend/src/components/qc/QCLotList.js
import React from 'react';
import { Link } from 'react-router-dom';

const QCLotList = ({ lots, loading, onRefresh }) => {
  // ✅ Ensure lots is always an array
  const safeLots = Array.isArray(lots) ? lots : [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        Loading QC lots...
      </div>
    );
  }

  if (safeLots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
        <p>No QC lots found. Create a new QC lot to get started.</p>
      </div>
    );
  }

  const styles = {
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '13px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    th: {
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: '2px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      fontWeight: '600',
      color: '#374151'
    },
    td: {
      padding: '10px 12px',
      borderBottom: '1px solid #f3f4f6'
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '500'
    },
    badge: (status) => ({
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      display: 'inline-block',
      textTransform: 'uppercase',
      backgroundColor: 
        status === 'ACCEPTED' ? '#d1fae5' :
        status === 'REJECTED' ? '#fee2e2' :
        status === 'ACCEPTED_WITH_DEVIATION' ? '#fef3c7' :
        status === 'IN_PROGRESS' ? '#dbeafe' :
        '#e0e7ff',
      color:
        status === 'ACCEPTED' ? '#065f46' :
        status === 'REJECTED' ? '#991b1b' :
        status === 'ACCEPTED_WITH_DEVIATION' ? '#92400e' :
        status === 'IN_PROGRESS' ? '#1e40af' :
        '#3730a3'
    })
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Lot ID</th>
            <th style={styles.th}>Material</th>
            <th style={styles.th}>Vendor</th>
            <th style={styles.th}>Batch</th>
            <th style={styles.th}>Stage</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Created</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {safeLots.map((lot) => (
            <tr key={lot.id || Math.random()}>
              <td style={styles.td}><strong>{lot.id || '-'}</strong></td>
              <td style={styles.td}>{lot.material_name || lot.material_id || '-'}</td>
              <td style={styles.td}>{lot.vendor_name || lot.vendor_id || '-'}</td>
              <td style={styles.td}>{lot.batch_id || '-'}</td>
              <td style={styles.td}>{lot.stage || 'WAREHOUSE'}</td>
              <td style={styles.td}>
                <span style={styles.badge(lot.status)}>
                  {lot.status?.replace(/_/g, ' ') || 'PENDING'}
                </span>
              </td>
              <td style={styles.td}>{formatDate(lot.created_at || lot.planned_date)}</td>
              <td style={styles.td}>
                {lot.status === 'PENDING' || lot.status === 'IN_PROGRESS' ? (
                  <Link style={styles.link} to={`/qc/lots/${lot.id}`}>
                    🔍 Inspect →
                  </Link>
                ) : (
                  <Link style={styles.link} to={`/qc/lots/${lot.id}`}>
                    👁️ View →
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QCLotList;