// frontend/src/pages/InspectionPlansViewPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InspectionPlansViewPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [source, setSource] = useState('');

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
    searchBox: {
      padding: '10px 16px',
      fontSize: '14px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      width: '300px',
      outline: 'none'
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
    badge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: '#d1fae5',
      color: '#065f46'
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      color: '#6b7280'
    },
    note: {
      backgroundColor: '#fef3c7',
      padding: '12px 16px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '13px',
      color: '#92400e',
      border: '1px solid #f59e0b'
    },
    sourceBadge: {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      marginLeft: '8px'
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError('');
    setSource('');
    try {
      // Try to get from Inspection module first
      const INSPECTION_URL = process.env.REACT_APP_INSPECTION_URL || 'http://localhost:5003';
      const response = await axios.get(`${INSPECTION_URL}/api/inspection-plans`, {
        timeout: 3000
      });
      
      let plansData = [];
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        plansData = response.data.data;
        setSource('Inspection Module');
      } else if (Array.isArray(response.data)) {
        plansData = response.data;
        setSource('Inspection Module');
      } else if (response.data && response.data.plans && Array.isArray(response.data.plans)) {
        plansData = response.data.plans;
        setSource('Inspection Module');
      }
      
      setPlans(Array.isArray(plansData) ? plansData : []);
      
    } catch (err) {
      console.error('Error loading from Inspection module:', err);
      
      // Fallback: Try to get from Quality module's local data
      try {
        const qualityResponse = await axios.get('http://localhost:5004/api/qc/templates', {
          timeout: 3000
        });
        
        let plansData = [];
        if (qualityResponse.data && qualityResponse.data.data && Array.isArray(qualityResponse.data.data)) {
          plansData = qualityResponse.data.data;
          setSource('Quality Module (Local)');
        }
        
        setPlans(Array.isArray(plansData) ? plansData : []);
        
      } catch (qualityErr) {
        console.error('Error loading from Quality module:', qualityErr);
        setError('Failed to load inspection plans from both modules. Using sample data.');
        setSource('Sample Data');
        
        // Use mock data for demo
        setPlans([
          { id: 1, material_code: 'DB4-MAT-001', material_name: 'Raw Rice', master_inspection: 'Moisture Test', sample_size: 5, status: 'Active' },
          { id: 2, material_code: 'DB4-MAT-002', material_name: 'Wheat', master_inspection: 'Purity Test', sample_size: 3, status: 'Active' },
          { id: 3, material_code: 'DB4-MAT-003', material_name: 'Sugar', master_inspection: 'Color Test', sample_size: 2, status: 'Active' },
          { id: 4, material_code: 'DB4-MAT-004', material_name: 'Rice Flour', master_inspection: 'Fineness Test', sample_size: 4, status: 'Active' },
          { id: 5, material_code: 'DB4-MAT-005', material_name: 'Cooking Oil', master_inspection: 'Purity Test', sample_size: 3, status: 'Active' },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = (Array.isArray(plans) ? plans : []).filter(plan => {
    const search = searchTerm.toLowerCase();
    return (
      (plan.material_code || '').toLowerCase().includes(search) ||
      (plan.material_name || '').toLowerCase().includes(search) ||
      (plan.master_inspection || plan.inspection_name || '').toLowerCase().includes(search) ||
      (plan.plan_code || '').toLowerCase().includes(search)
    );
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📋 Inspection Plans (View Only)</h2>
          <p style={styles.subtitle}>
            Reference - Plans are created in Inspection Module
            {source && <span style={styles.sourceBadge}>Source: {source}</span>}
          </p>
        </div>
        <button 
          onClick={loadPlans} 
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={styles.note}>
        ℹ️ This is a read-only view. Inspection plans are created and managed in the <strong>Inspection Module</strong>.
        {source === 'Sample Data' && ' Using sample data for demonstration.'}
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input
          style={styles.searchBox}
          placeholder="Search by material or plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '6px', 
          fontSize: '13px',
          color: '#6b7280'
        }}>
          {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} found
        </span>
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
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading plans...</div>
      ) : filteredPlans.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p>No inspection plans found</p>
          {searchTerm && (
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '8px' }}>
              Try adjusting your search term
            </p>
          )}
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Plan ID</th>
              <th style={styles.th}>Material Code</th>
              <th style={styles.th}>Material Name</th>
              <th style={styles.th}>Master Inspection</th>
              <th style={styles.th}>Sample Size</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan, index) => (
              <tr key={plan.id || index}>
                <td style={styles.td}><strong>#{plan.id || index + 1}</strong></td>
                <td style={styles.td}>{plan.material_code || plan.code || '-'}</td>
                <td style={styles.td}>{plan.material_name || plan.name || '-'}</td>
                <td style={styles.td}>{plan.master_inspection || plan.inspection_name || '-'}</td>
                <td style={styles.td}>{plan.sample_size || plan.sampling_size || '-'}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{plan.status || 'Active'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}