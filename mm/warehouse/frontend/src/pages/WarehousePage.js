import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const ZONE_OPTIONS = ['A', 'B', 'C', 'DH', 'FR'];

const WarehousePage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [bins, setBins] = useState([]);
  
  const [newBin, setNewBin] = useState({
    bin_code: '',
    capacity: 1000,
    zone: 'A'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const whRes = await axiosClient.get('/warehouse');
      setWarehouses(whRes.data || []);

      const binRes = await axiosClient.get('/warehouse/1/bins');
      console.log('BIN API response:', binRes.data);
      
      const validBins = (binRes.data || []).filter(bin => bin.capacity > 0);
      setBins(validBins);
    } catch (error) {
      console.error('Load error:', error);
      setWarehouses([]);
      setBins([]);
    }
  };

  const binColumns = [
    { key: 'bin_code', label: 'Bin Code' },
    { key: 'zone', label: 'Zone' },
    { key: 'capacity', label: 'Capacity' },
    {
      label: 'Usage',
      render: (bin) => {
        const usage = Number(bin.current_usage) || 0;
        const capacity = Number(bin.capacity) || 1;
        const percent = Math.round((usage / capacity) * 100);
        
        let color = '#4caf50'; // Green
        if (percent >= 90) color = '#f44336'; // Red
        else if (percent >= 70) color = '#ff9800'; // Orange
        
        return (
          <div>
            <div>{usage.toLocaleString()}</div>
            <small style={{ color, fontWeight: 'bold' }}>{percent}%</small>
          </div>
        );
      }
    }
  ];

  const handleAddBin = async (e) => {
    e.preventDefault();
    
    if (!newBin.bin_code.trim()) {
      alert('Bin Code is required');
      return;
    }
    
    const binCodePattern = /^[A-Z0-9\-]+$/i;
    if (!binCodePattern.test(newBin.bin_code.trim())) {
      alert('Bin Code can only contain letters, numbers, and dashes');
      return;
    }
    
    if (newBin.capacity <= 0) {
      alert('Capacity must be greater than 0');
      return;
    }

    try {
      await axiosClient.post('/warehouse/1/bins', {
        bin_code: newBin.bin_code.trim().toUpperCase(),
        capacity: Number(newBin.capacity),
        zone: newBin.zone
      });
      setNewBin({ bin_code: '', capacity: 1000, zone: 'A' });
      await loadData(); 
    } catch (err) {
      console.error('Add bin error:', err.response?.data || err.message);
      alert('Failed to add bin: ' + (err.response?.data?.error || err.message));
    }
  };

  // Calculate total capacity and usage
  const totalCapacity = bins.reduce((sum, bin) => sum + Number(bin.capacity || 0), 0);
  const totalUsage = bins.reduce((sum, bin) => sum + Number(bin.current_usage || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>🏭 Warehouse Layout & Bins</h1>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Total Warehouses</h3>
          <p className="metric-value">{warehouses.length}</p>
        </div>
        <div className="card">
          <h3>Active Bins</h3>
          <p className="metric-value">{bins.length}</p>
        </div>
        <div className="card">
          <h3>Total Capacity</h3>
          <p className="metric-value">{totalCapacity.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Total Usage</h3>
          <p className="metric-value">{totalUsage.toLocaleString()}</p>
        </div>
      </div>

      <div className="card">
        <h3>Add Bin</h3>
        <form onSubmit={handleAddBin} className="inline-form">
          <div className="form-group">
            <label>Bin Code</label>
            <input
              value={newBin.bin_code}
              onChange={e => setNewBin({ ...newBin, bin_code: e.target.value })}
              placeholder="e.g., A-01, B-002"
              required
            />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={newBin.capacity}
              onChange={e => setNewBin({ ...newBin, capacity: Number(e.target.value) || 0 })}
              min="1"
              step="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Zone</label>
            <select
              value={newBin.zone}
              onChange={e => setNewBin({ ...newBin, zone: e.target.value })}
              required
            >
              {ZONE_OPTIONS.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-warning">
            Add Bin
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Bin Management</h3>
        <Table columns={binColumns} data={bins} />
      </div>
    </div>
  );
};

export default WarehousePage;