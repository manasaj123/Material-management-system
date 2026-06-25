import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const PickPackPage = () => {
  const [pendingPicks, setPendingPicks] = useState([]);
  const [items, setItems] = useState([]);
  const [bins, setBins] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    pick_no: '',
    order_id: '',
    item_id: '',
    qty_picked: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadPicks(),
      loadItems(),
      loadBins(),
      loadInventory()
    ]);
  };

  const loadPicks = async () => {
    try {
      const response = await axiosClient.get('/pickpack/pending');
      setPendingPicks(response.data || []);
    } catch (error) {
      console.error('Picks load error:', error);
      setPendingPicks([]);
    }
  };

  const loadItems = async () => {
    try {
      const response = await axiosClient.get('/item');
      setItems(response.data || []);
    } catch (error) {
      console.error('Items load error:', error);
      setItems([]);
    }
  };

  const loadBins = async () => {
    try {
      const response = await axiosClient.get('/warehouse/1/bins');
      setBins(response.data || []);
    } catch (error) {
      console.error('Bins load error:', error);
      setBins([]);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await axiosClient.get('/inventory');
      setInventory(response.data || []);
    } catch (error) {
      console.error('Inventory load error:', error);
      setInventory([]);
    }
  };

  const handleCreatePick = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate Pick No format
    if (formData.pick_no && !/^[A-Z0-9\-]+$/i.test(formData.pick_no.trim())) {
      alert('❌ Pick No can only contain letters, numbers, and dashes');
      setLoading(false);
      return;
    }

    // Validate Order ID format
    if (!/^[A-Z0-9\-]+$/i.test(formData.order_id.trim())) {
      alert('❌ Order ID can only contain letters, numbers, and dashes');
      setLoading(false);
      return;
    }

    // Validate quantity
    const qty = parseInt(formData.qty_picked, 10);
    if (!qty || qty <= 0) {
      alert('❌ Quantity must be greater than 0');
      setLoading(false);
      return;
    }

    // Check available stock
    const itemId = parseInt(formData.item_id, 10);
    const availableStock = inventory
      .filter(inv => inv.item_id === itemId)
      .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);

    if (qty > availableStock) {
      alert(`❌ Only ${availableStock} units available for this item`);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        pick_no: formData.pick_no.trim().toUpperCase() || `PICK${Date.now()}`,
        order_id: formData.order_id.trim().toUpperCase(),
        item_id: itemId,
        qty_picked: qty
      };

      await axiosClient.post('/pickpack', payload);
      alert(`✅ Pick ${payload.pick_no} created!`);
      
      setFormData({ pick_no: '', order_id: '', item_id: '', qty_picked: '' });
      await loadData();
    } catch (error) {
      console.error('❌ Create pick error:', error.response?.data || error.message);
      alert('❌ Failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePack = async (pickId, pickNo) => {
    if (!window.confirm(`Mark pick ${pickNo} as packed and deduct from inventory?`)) return;

    try {
      await axiosClient.put(`/pickpack/${pickId}/packed`);
      alert(`✅ Pick ${pickNo} packed and inventory updated!`);
      await loadData();
    } catch (error) {
      console.error('Pack error:', error.response?.data || error.message);
      alert('❌ Pack failed: ' + (error.response?.data?.error || error.message));
    }
  };

  const columns = [
    { key: 'pick_no', label: 'Pick No' },
    { key: 'order_id', label: 'Order ID' },
    { 
      key: 'item_id', 
      label: 'Item',
      render: (row) => {
        const item = items.find(i => i.id === row.item_id);
        return item ? `${item.sku} - ${item.name}` : `Item #${row.item_id}`;
      }
    },
    { 
      key: 'qty_required', 
      label: 'Quantity',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {Number(row.qty_required || 0).toLocaleString()}
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
          {row.status === 'pending' ? '📦 Pending' : '✅ Packed'}
        </span>
      )
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) =>
        row.status === 'pending' ? (
          <button
            className="btn btn-success"
            onClick={() => handlePack(row.id, row.pick_no)}
          >
            📦 Pack
          </button>
        ) : (
          <span style={{ color: '#27ae60' }}>✅ Packed</span>
        )
    }
  ];

  const totalPendingQty = pendingPicks.reduce(
    (sum, pick) => sum + Number(pick.qty_required || 0),
    0
  );

  const itemsWithStock = items.filter(item => {
    const stock = inventory
      .filter(inv => inv.item_id === item.id)
      .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
    return stock > 0;
  });

  return (
    <div>
      <div className="page-header">
        <h1>📤 Pick & Pack</h1>
        <button
          className="btn btn-primary"
          onClick={loadData}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Pending Picks</h3>
          <p className="metric-value">{pendingPicks.length}</p>
        </div>
        <div className="card">
          <h3>Total Units</h3>
          <p className="metric-value">{totalPendingQty}</p>
        </div>
        <div className="card">
          <h3>Items in Stock</h3>
          <p className="metric-value">{itemsWithStock.length}</p>
        </div>
        <div className="card">
          <h3>Available Bins</h3>
          <p className="metric-value">{bins.length}</p>
        </div>
      </div>

      <div className="card">
        <h3>➕ Create Pick Order</h3>
        <form onSubmit={handleCreatePick} style={{ maxWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Pick No <small style={{ color: '#7f8c8d' }}>(auto if blank)</small></label>
              <input
                value={formData.pick_no}
                onChange={e => setFormData({ ...formData, pick_no: e.target.value })}
                placeholder="PICK-001"
                pattern="[A-Za-z0-9\-]*"
                title="Only letters, numbers, and dashes"
              />
              <small style={{ color: '#7f8c8d' }}>Format: PICK-001</small>
            </div>
            <div className="form-group">
              <label>Order ID *</label>
              <input
                value={formData.order_id}
                onChange={e => setFormData({ ...formData, order_id: e.target.value })}
                placeholder="ORD-001"
                pattern="[A-Za-z0-9\-]*"
                title="Only letters, numbers, and dashes"
                required
              />
              <small style={{ color: '#7f8c8d' }}>Format: ORD-001</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Item *</label>
              <select
                value={formData.item_id}
                onChange={e => setFormData({ ...formData, item_id: e.target.value })}
                required
              >
                <option value="">Select Item</option>
                {items.map(item => {
                  const totalStock = inventory
                    .filter(inv => inv.item_id === item.id)
                    .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
                  
                  return (
                    <option 
                      key={item.id} 
                      value={item.id} 
                      disabled={totalStock === 0}
                    >
                      {item.sku} - {item.name} 
                      {totalStock > 0 ? ` (${totalStock} in stock)` : ' (Out of stock)'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                value={formData.qty_picked}
                onChange={e => setFormData({ ...formData, qty_picked: e.target.value })}
                min="1"
                placeholder="Enter quantity"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Creating...' : '➕ Create Pick Order'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Pending Pick Orders ({pendingPicks.length})</h3>
        {pendingPicks.length > 0 ? (
          <Table columns={columns} data={pendingPicks} />
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Pending Picks
            </div>
            <small>Create a pick order using the form above 👆</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PickPackPage;