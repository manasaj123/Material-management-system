import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({});
  const [recentGrn, setRecentGrn] = useState([]);
  const [recentPicks, setRecentPicks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadMetrics(),
      loadGrns(),
      loadPicks(),
      loadInventory(),
      loadBins()
    ]);
    setLoading(false);
  };

  const loadMetrics = async () => {
    try {
      const response = await axiosClient.get('/report/metrics');
      setMetrics(response.data || {});
    } catch (error) {
      console.error('Metrics load failed:', error);
      setMetrics({});
    }
  };

  const loadGrns = async () => {
    try {
      const response = await axiosClient.get('/grn/pending');
      setRecentGrn(response.data || []);
    } catch (error) {
      console.error('GRN load failed:', error);
      setRecentGrn([]);
    }
  };

  const loadPicks = async () => {
    try {
      const response = await axiosClient.get('/pickpack/pending');
      setRecentPicks(response.data || []);
    } catch (error) {
      console.error('Picks load failed:', error);
      setRecentPicks([]);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await axiosClient.get('/inventory');
      setInventory(response.data || []);
    } catch (error) {
      console.error('Inventory load failed:', error);
      setInventory([]);
    }
  };

  const loadBins = async () => {
    try {
      const response = await axiosClient.get('/warehouse/1/bins');
      setBins(response.data || []);
    } catch (error) {
      console.error('Bins load failed:', error);
      setBins([]);
    }
  };

  const safeNumber = (value) => Number(value || 0);

  // Calculate real-time metrics
  const totalInventoryQty = inventory.reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
  const totalPendingItems = recentGrn.reduce((sum, g) => sum + Number(g.total_items || 0), 0);
  const totalPendingPicks = recentPicks.reduce((sum, p) => sum + Number(p.qty_required || 0), 0);
  
  const occupiedBins = bins.filter(bin => Number(bin.current_usage || 0) > 0).length;
  const binUtilization = bins.length > 0 ? (occupiedBins / bins.length) * 100 : 0;

  // Top items by quantity
  const itemQuantities = inventory.reduce((acc, inv) => {
    const existing = acc.find(item => item.item_id === inv.item_id);
    if (existing) {
      existing.qty += Number(inv.qty || 0);
    } else {
      acc.push({
        item_id: inv.item_id,
        sku: inv.sku,
        name: inv.name,
        qty: Number(inv.qty || 0)
      });
    }
    return acc;
  }, []);

  const topItems = itemQuantities
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Mock weekly performance data (replace with real data from backend)
  const chartData = [
    { name: 'Mon', putaway: 45, pick: 28, receiving: 120 },
    { name: 'Tue', putaway: 52, pick: 35, receiving: 150 },
    { name: 'Wed', putaway: 38, pick: 42, receiving: 90 },
    { name: 'Thu', putaway: 60, pick: 48, receiving: 180 },
    { name: 'Fri', putaway: 55, pick: 52, receiving: 160 }
  ];

  // Status distribution for pie chart
  const statusData = [
    { name: 'Pending GRNs', value: recentGrn.length, color: '#e67e22' },
    { name: 'Pending Picks', value: recentPicks.length, color: '#3498db' },
    { name: 'Completed', value: safeNumber(metrics.total_grns) - recentGrn.length, color: '#27ae60' }
  ].filter(item => item.value > 0);

  const grnColumns = [
    { key: 'grn_no', label: 'GRN No' },
    { 
      key: 'received_date', 
      label: 'Date',
      render: (row) => new Date(row.received_date).toLocaleDateString('en-IN')
    },
    { 
      key: 'total_items', 
      label: 'Items',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {Number(row.total_items).toLocaleString()}
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        <span style={{ 
          color: row.status === 'pending' ? '#e67e22' : '#27ae60',
          fontWeight: 'bold'
        }}>
          {row.status === 'pending' ? '⏳ Pending' : '✅ Complete'}
        </span>
      )
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📊 Warehouse Dashboard</h1>
        <button
          className="btn btn-primary"
          onClick={loadAllData}
          disabled={loading}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="card metric-card">
          <h3>📦 Total Inventory</h3>
          <p className="metric-value">{totalInventoryQty.toLocaleString()}</p>
          <p className="metric-label">units in stock</p>
        </div>

        <div className="card metric-card">
          <h3>📥 Pending GRNs</h3>
          <p className="metric-value">{recentGrn.length}</p>
          <p className="metric-label">{totalPendingItems.toLocaleString()} items to receive</p>
        </div>

        <div className="card metric-card">
          <h3>📤 Pending Picks</h3>
          <p className="metric-value">{recentPicks.length}</p>
          <p className="metric-label">{totalPendingPicks.toLocaleString()} units to pick</p>
        </div>

        <div className="card metric-card">
          <h3>🗄️ Bin Utilization</h3>
          <p className="metric-value">{binUtilization.toFixed(1)}%</p>
          <p className="metric-label">{occupiedBins} of {bins.length} bins used</p>
        </div>

        <div className="card metric-card">
          <h3>⏱️ Put-away Time</h3>
          <p className="metric-value">{safeNumber(metrics.avg_putaway_time).toFixed(1)} min</p>
          <p className="metric-label" style={{ 
            color: metrics.avg_putaway_time > 30 ? '#e74c3c' : '#27ae60' 
          }}>
            Target: &lt; 30 min
          </p>
        </div>

        <div className="card metric-card">
          <h3>🎯 Pick Accuracy</h3>
          <p className="metric-value">{safeNumber(metrics.pick_accuracy).toFixed(1)}%</p>
          <p className="metric-label" style={{ 
            color: metrics.pick_accuracy < 99 ? '#e74c3c' : '#27ae60' 
          }}>
            Target: &gt; 99%
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Weekly Performance */}
        <div className="card">
          <h3>📈 Weekly Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
              <XAxis dataKey="name" stroke="#7f8c8d" />
              <YAxis stroke="#7f8c8d" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #ddd',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="receiving"
                stroke="#9b59b6"
                name="Receiving"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="putaway"
                stroke="#3498db"
                name="Put-away"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="pick"
                stroke="#27ae60"
                name="Picks"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card">
          <h3>📊 Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Items */}
      <div className="card">
        <h3>🏆 Top 5 Items by Quantity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={topItems}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
            <XAxis dataKey="sku" stroke="#7f8c8d" />
            <YAxis stroke="#7f8c8d" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="qty" fill="#3498db" name="Quantity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent GRNs Table */}
      <div className="card">
        <h3>📥 Recent Pending GRNs ({recentGrn.length})</h3>
        {recentGrn.length > 0 ? (
          <Table columns={grnColumns} data={recentGrn.slice(0, 10)} />
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#7f8c8d',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              No Pending GRNs
            </div>
            <small>All goods receipts have been processed</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;