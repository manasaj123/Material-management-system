// frontend/src/pages/QCLotsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import qcLotApi from '../api/qcLotApi';
import QCLotList from '../components/qc/QCLotList';
import QCLotForm from '../components/qc/QCLotForm';

const QCLotsPage = () => {
  const [lots, setLots] = useState([]);
  const [summary, setSummary] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);

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
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
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
      fontSize: '28px',
      fontWeight: 'bold'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6b7280',
      textTransform: 'uppercase',
      marginTop: '4px'
    },
    filterRow: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    },
    filterSelect: {
      padding: '6px 10px',
      fontSize: '13px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white'
    },
    addButton: {
      padding: '10px 20px',
      fontSize: '14px',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#2563eb',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '500'
    },
    cancelButton: {
      padding: '8px 16px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: '#fff',
      color: '#374151',
      cursor: 'pointer',
      marginLeft: '8px'
    },
    message: {
      padding: '10px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '13px'
    },
    successMessage: {
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    formSection: {
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '2px solid #e5e7eb'
    }
  };

  const loadLots = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (stageFilter) params.stage = stageFilter;
      
      const response = await qcLotApi.list(params);
      const result = response.data || {};
      
      let lotsData = [];
      let summaryData = {};
      
      // Extract data from response
      if (result && typeof result === 'object') {
        if (result.data && Array.isArray(result.data)) {
          lotsData = result.data;
        } else if (result.rows && Array.isArray(result.rows)) {
          lotsData = result.rows;
        } else if (result.lots && Array.isArray(result.lots)) {
          lotsData = result.lots;
        } else if (Array.isArray(result)) {
          lotsData = result;
        } else if (Array.isArray(response.data)) {
          lotsData = response.data;
        } else {
          // Try to find any array property
          for (const key of Object.keys(result)) {
            if (Array.isArray(result[key])) {
              lotsData = result[key];
              break;
            }
          }
        }
      }
      
      // Get summary
      if (result.summary) {
        summaryData = result.summary;
      } else {
        summaryData = {
          total: lotsData.length,
          pending: lotsData.filter(l => l.status === 'PENDING').length,
          accepted: lotsData.filter(l => l.status === 'ACCEPTED').length,
          rejected: lotsData.filter(l => l.status === 'REJECTED').length,
          acceptedWithDeviation: lotsData.filter(l => l.status === 'ACCEPTED_WITH_DEVIATION').length,
          inProgress: lotsData.filter(l => l.status === 'IN_PROGRESS').length
        };
      }
      
      lotsData = Array.isArray(lotsData) ? lotsData : [];
      
      setLots(lotsData);
      setSummary(summaryData);
      setError('');
    } catch (err) {
      console.error('❌ Load error:', err);
      setError('Failed to load QC lots: ' + (err.message || 'Unknown error'));
      setLots([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, stageFilter]);

  useEffect(() => {
    loadLots();
  }, [loadLots]);

  const handleCreateLot = async (data) => {
    setError('');
    setSuccess('');
    try {
      const response = await qcLotApi.create(data);
      if (response.data && response.data.success) {
        setSuccess('✅ QC Lot created successfully!');
        setShowForm(false);
        await loadLots();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Creation failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create QC lot');
      console.error('Create error:', err);
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setStageFilter('');
  };

  const safeLots = Array.isArray(lots) ? lots : [];
  
  const statColors = {
    total: '#2563eb',
    pending: '#d97706',
    accepted: '#059669',
    rejected: '#dc2626',
    acceptedWithDeviation: '#7c3aed',
    inProgress: '#8b5cf6'
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔬 QC Lots Management</h2>
        {!showForm && (
          <button style={styles.addButton} onClick={() => setShowForm(true)}>
            + New QC Lot
          </button>
        )}
      </div>

      {error && <div style={{ ...styles.message, ...styles.errorMessage }}>{error}</div>}
      {success && <div style={{ ...styles.message, ...styles.successMessage }}>{success}</div>}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.total }}>{summary.total || safeLots.length}</div>
          <div style={styles.statLabel}>Total Lots</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.pending }}>{summary.pending || 0}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.accepted }}>{summary.accepted || 0}</div>
          <div style={styles.statLabel}>Accepted</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.acceptedWithDeviation }}>{summary.acceptedWithDeviation || 0}</div>
          <div style={styles.statLabel}>Accepted w/ Dev</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.rejected }}>{summary.rejected || 0}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: statColors.inProgress }}>{summary.inProgress || 0}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterRow}>
        <select
          style={styles.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="ACCEPTED_WITH_DEVIATION">Accepted w/ Deviation</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>

        <select
          style={styles.filterSelect}
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
        >
          <option value="">All Stages</option>
          <option value="FIELD">Field</option>
          <option value="WAREHOUSE">Warehouse</option>
          <option value="PRODUCTION">Production</option>
          <option value="FINAL">Final</option>
        </select>

        <button style={{ ...styles.addButton, backgroundColor: '#6b7280', fontSize: '12px' }} onClick={clearFilters}>
          Clear Filters
        </button>
      </div>

      {/* Lot List */}
      <QCLotList 
        lots={safeLots} 
        loading={loading} 
        onRefresh={loadLots} 
      />

      {/* Create Form */}
      {showForm && (
        <div style={styles.formSection}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Create New QC Lot</h3>
            <button style={styles.cancelButton} onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
          <QCLotForm onSave={handleCreateLot} />
        </div>
      )}
    </div>
  );
};

export default QCLotsPage;