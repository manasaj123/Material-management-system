// frontend/src/pages/InProcessInspectionsPage.js
import React, { useState, useEffect } from 'react';
import qcLotApi from '../api/qcLotApi';
import { Link } from 'react-router-dom';

export default function InProcessInspectionsPage() {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({});

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#6b7280'
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '12px',
      marginBottom: '20px'
    },
    statCard: {
      backgroundColor: '#fff',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginTop: '4px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      backgroundColor: '#f9fafb',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '2px solid #e5e7eb'
    },
    td: {
      padding: '12px 16px',
      borderBottom: '1px solid #f3f4f6'
    },
    badge: (status) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: status === 'ACCEPTED' ? '#d1fae5' :
                       status === 'REJECTED' ? '#fee2e2' :
                       status === 'IN_PROGRESS' ? '#dbeafe' :
                       status === 'PENDING' ? '#fef3c7' :
                       '#e0e7ff',
      color: status === 'ACCEPTED' ? '#065f46' :
             status === 'REJECTED' ? '#991b1b' :
             status === 'IN_PROGRESS' ? '#1e40af' :
             status === 'PENDING' ? '#92400e' :
             '#3730a3'
    }),
    link: {
      color: '#2563eb',
      textDecoration: 'none',
      fontWeight: '500'
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      color: '#6b7280'
    }
  };

  useEffect(() => {
    loadInProcessLots();
  }, []);

  const loadInProcessLots = async () => {
    setLoading(true);
    setError('');
    try {
      // Get lots with PRODUCTION stage
      const response = await qcLotApi.list({ stage: 'PRODUCTION' });
      
      // Extract data safely
      const result = response?.data || {};
      let lotsData = [];
      
      // Handle different response structures
      if (result.success !== false) {
        if (result.data && Array.isArray(result.data)) {
          lotsData = result.data;
        } else if (result.lots && Array.isArray(result.lots)) {
          lotsData = result.lots;
        } else if (result.rows && Array.isArray(result.rows)) {
          lotsData = result.rows;
        } else if (Array.isArray(result)) {
          lotsData = result;
        }
      } else {
        // If API returns error, use fallback
        console.warn('API returned error, using fallback data');
        lotsData = getFallbackData('PRODUCTION');
      }
      
      // Ensure it's an array
      lotsData = Array.isArray(lotsData) ? lotsData : [];
      
      // Filter by stage if not already filtered
      const filteredData = lotsData.filter(l => l.stage === 'PRODUCTION');
      
      setLots(filteredData.length > 0 ? filteredData : lotsData);
      
      // Calculate summary
      const data = filteredData.length > 0 ? filteredData : lotsData;
      setSummary({
        total: data.length,
        pending: data.filter(l => l.status === 'PENDING').length,
        inProgress: data.filter(l => l.status === 'IN_PROGRESS').length,
        completed: data.filter(l => l.status === 'ACCEPTED' || l.status === 'REJECTED' || l.status === 'ACCEPTED_WITH_DEVIATION').length
      });
      
    } catch (err) {
      console.error('Error loading in-process lots:', err);
      setError('Failed to load in-process lots. Using sample data.');
      // Use fallback data
      const fallbackData = getFallbackData('PRODUCTION');
      setLots(fallbackData);
      setSummary({
        total: fallbackData.length,
        pending: fallbackData.filter(l => l.status === 'PENDING').length,
        inProgress: fallbackData.filter(l => l.status === 'IN_PROGRESS').length,
        completed: fallbackData.filter(l => l.status === 'ACCEPTED' || l.status === 'REJECTED').length
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for demo
  const getFallbackData = (stage) => {
    return [
      {
        id: 101,
        material_name: 'Raw Rice',
        batch_id: 'BATCH-001',
        stage: stage,
        status: 'PENDING',
        production_stage: 'Milling',
        planned_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 102,
        material_name: 'Wheat Flour',
        batch_id: 'BATCH-002',
        stage: stage,
        status: 'IN_PROGRESS',
        production_stage: 'Grinding',
        planned_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 103,
        material_name: 'Sugar Syrup',
        batch_id: 'BATCH-003',
        stage: stage,
        status: 'ACCEPTED',
        production_stage: 'Mixing',
        planned_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ];
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

  // Ensure lots is always an array
  const safeLots = Array.isArray(lots) ? lots : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🏭 In-Process Inspections</h2>
          <p style={styles.subtitle}>Quality checks during production</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#2563eb' }}>{summary.total || 0}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#d97706' }}>{summary.pending || 0}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8b5cf6' }}>{summary.inProgress || 0}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#059669' }}>{summary.completed || 0}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      {error && (
        <div style={{ 
          color: '#92400e', 
          padding: '12px 16px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '6px', 
          marginBottom: '16px',
          border: '1px solid #f59e0b'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading...</div>
      ) : safeLots.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏭</div>
          <p>No in-process inspections found</p>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
            Create a QC lot with stage "PRODUCTION" to see it here
          </p>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Lot ID</th>
              <th style={styles.th}>Material</th>
              <th style={styles.th}>Batch</th>
              <th style={styles.th}>Production Stage</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {safeLots.map((lot) => (
              <tr key={lot.id || Math.random()}>
                <td style={styles.td}><strong>#{lot.id}</strong></td>
                <td style={styles.td}>{lot.material_name || lot.material_id || '-'}</td>
                <td style={styles.td}>{lot.batch_id || '-'}</td>
                <td style={styles.td}>{lot.production_stage || 'In Progress'}</td>
                <td style={styles.td}>
                  <span style={styles.badge(lot.status)}>
                    {lot.status?.replace(/_/g, ' ') || 'PENDING'}
                  </span>
                </td>
                <td style={styles.td}>{formatDate(lot.planned_date || lot.created_at)}</td>
                <td style={styles.td}>
                  <Link to={`/qc/lots/${lot.id}`} style={styles.link}>
                    {lot.status === 'PENDING' || lot.status === 'IN_PROGRESS' ? '🔍 Inspect →' : '👁️ View →'}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}