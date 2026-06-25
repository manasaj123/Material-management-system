import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const CycleCountPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [bins, setBins] = useState([]);
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pendingCounts, setPendingCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    warehouse_id: '1',
    bin_id: '',
    item_id: '',
    scheduled_date: new Date().toISOString().split('T')[0]
  });

  const [countInput, setCountInput] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadWarehouses(),
      loadBins(),
      loadItems(),
      loadInventory(),
      loadPendingCounts()
    ]);
  };

  const loadWarehouses = async () => {
    try {
      const res = await axiosClient.get('/warehouse');
      setWarehouses(res.data || []);
    } catch (err) {
      console.error('Load warehouses error:', err);
      setWarehouses([]);
    }
  };

  const loadBins = async () => {
    try {
      const res = await axiosClient.get('/warehouse/1/bins');
      setBins(res.data || []);
    } catch (err) {
      console.error('Load bins error:', err);
      setBins([]);
    }
  };

  const loadItems = async () => {
    try {
      const res = await axiosClient.get('/item');
      setItems(res.data || []);
    } catch (err) {
      console.error('Load items error:', err);
      setItems([]);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await axiosClient.get('/inventory');
      setInventory(res.data || []);
    } catch (err) {
      console.error('Load inventory error:', err);
      setInventory([]);
    }
  };

  const loadPendingCounts = async () => {
    try {
      const res = await axiosClient.get('/cycle-counts/pending');
      setPendingCounts(res.data || []);
    } catch (err) {
      console.error('Load cycle counts error:', err);
      setPendingCounts([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        warehouse_id: parseInt(formData.warehouse_id, 10),
        bin_id: parseInt(formData.bin_id, 10),
        item_id: parseInt(formData.item_id, 10),
        scheduled_date: formData.scheduled_date
      };

      await axiosClient.post('/cycle-counts', payload);
      alert('✅ Cycle count task created');
      
      setFormData({
        warehouse_id: '1',
        bin_id: '',
        item_id: '',
        scheduled_date: new Date().toISOString().split('T')[0]
      });
      
      await loadData();
    } catch (err) {
      console.error('Create cycle count error:', err.response?.data || err.message);
      alert('❌ Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    const qty = Number(countInput[id] || 0);
    
    if (Number.isNaN(qty) || qty < 0) {
      alert('❌ Enter a valid quantity (0 or greater)');
      return;
    }

    if (!window.confirm(`Complete count with quantity: ${qty}?`)) return;

    try {
      await axiosClient.post(`/cycle-counts/${id}/complete`, { 
        counted_qty: qty 
      });
      
      alert('✅ Cycle count completed and inventory adjusted');
      
      const newInput = { ...countInput };
      delete newInput[id];
      setCountInput(newInput);
      
      await loadData();
    } catch (err) {
      console.error('Complete cycle count error:', err.response?.data || err.message);
      alert('❌ Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  // Get items that have inventory in selected bin
  const getItemsInBin = () => {
    if (!formData.bin_id) return [];
    
    const itemIds = inventory
      .filter(inv => inv.bin_id === parseInt(formData.bin_id, 10))
      .map(inv => inv.item_id);
    
    return items.filter(item => itemIds.includes(item.id));
  };

  // Get expected quantity for comparison
  const getExpectedQty = (itemId, binId) => {
    return inventory
      .filter(inv => inv.item_id === itemId && inv.bin_id === binId)
      .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
  };

  const columns = [
    { 
      key: 'id', 
      label: 'Count ID',
      render: (row) => `#${row.id}`
    },
    { 
      key: 'warehouse_name', 
      label: 'Warehouse',
      render: (row) => {
        const warehouse = warehouses.find(w => w.id === row.warehouse_id);
        return warehouse?.name || `Warehouse #${row.warehouse_id}`;
      }
    },
    { 
      key: 'bin_code', 
      label: 'Bin',
      render: (row) => {
        const bin = bins.find(b => b.id === row.bin_id);
        return bin?.bin_code || `Bin #${row.bin_id}`;
      }
    },
    { 
      key: 'item', 
      label: 'Item',
      render: (row) => {
        const item = items.find(i => i.id === row.item_id);
        return item ? `${item.sku} - ${item.name}` : `Item #${row.item_id}`;
      }
    },
    {
      key: 'expected_qty',
      label: 'Expected',
      render: (row) => {
        const expected = getExpectedQty(row.item_id, row.bin_id);
        return (
          <span style={{ fontWeight: 'bold', color: '#7f8c8d' }}>
            {expected}
          </span>
        );
      }
    },
    { 
      key: 'scheduled_date', 
      label: 'Scheduled',
      render: (row) => new Date(row.scheduled_date).toLocaleDateString('en-IN')
    },
    {
      key: 'count',
      label: 'Counted Qty',
      render: (row) => (
        <input
          type="number"
          min="0"
          style={{ width: '90px' }}
          value={countInput[row.id] ?? ''}
          onChange={(e) =>
            setCountInput({ ...countInput, [row.id]: e.target.value })
          }
          placeholder="Enter count"
        />
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (row) => (
        <button
          className="btn btn-success"
          onClick={() => handleComplete(row.id)}
          disabled={!countInput[row.id] && countInput[row.id] !== '0'}
        >
          ✅ Complete
        </button>
      )
    }
  ];

  const itemsInSelectedBin = getItemsInBin();

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Cycle Counting</h1>
        <button className="btn btn-primary" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Pending Counts</h3>
          <p className="metric-value">{pendingCounts.length}</p>
        </div>
        <div className="card">
          <h3>Available Bins</h3>
          <p className="metric-value">{bins.length}</p>
        </div>
        <div className="card">
          <h3>Total Items</h3>
          <p className="metric-value">{items.length}</p>
        </div>
        <div className="card">
          <h3>Inventory Records</h3>
          <p className="metric-value">{inventory.length}</p>
        </div>
      </div>

      <div className="card">
        <h3>➕ Create Cycle Count Task</h3>
        <form onSubmit={handleCreate} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label>Warehouse *</label>
            <select
              value={formData.warehouse_id}
              onChange={(e) =>
                setFormData({ ...formData, warehouse_id: e.target.value })
              }
              required
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} - {wh.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Bin *</label>
            <select
              value={formData.bin_id}
              onChange={(e) =>
                setFormData({ 
                  ...formData, 
                  bin_id: e.target.value,
                  item_id: ''  // Reset item when bin changes
                })
              }
              required
            >
              <option value="">Select Bin to Count</option>
              {bins.map((bin) => {
                const itemCount = inventory.filter(
                  inv => inv.bin_id === bin.id
                ).length;
                
                return (
                  <option 
                    key={bin.id} 
                    value={bin.id}
                    disabled={itemCount === 0}
                  >
                    {bin.bin_code} - {bin.zone} 
                    {itemCount > 0 ? ` (${itemCount} items)` : ' (Empty)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Item *</label>
            <select
              value={formData.item_id}
              onChange={(e) =>
                setFormData({ ...formData, item_id: e.target.value })
              }
              required
              disabled={!formData.bin_id}
            >
              <option value="">
                {formData.bin_id ? 'Select Item in Bin' : 'Select bin first'}
              </option>
              {itemsInSelectedBin.map((item) => {
                const qty = getExpectedQty(item.id, parseInt(formData.bin_id, 10));
                return (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name} (Expected: {qty})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Scheduled Date *</label>
            <input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Creating...' : '➕ Create Cycle Count Task'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Pending Cycle Counts ({pendingCounts.length})</h3>
        {pendingCounts.length > 0 ? (
          <Table columns={columns} data={pendingCounts} />
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Pending Cycle Counts
            </div>
            <small>Create a cycle count task using the form above 👆</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleCountPage;