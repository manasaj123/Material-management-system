import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const TransferPage = () => {
  const [items, setItems] = useState([]);
  const [bins, setBins] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    from_bin_id: '',
    to_bin_id: '',
    item_id: '',
    qty: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadItems(),
      loadBins(),
      loadInventory(),
      loadTransfers()
    ]);
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

  const loadBins = async () => {
    try {
      const res = await axiosClient.get('/warehouse/1/bins');
      setBins(res.data || []);
    } catch (err) {
      console.error('Load bins error:', err);
      setBins([]);
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

  const loadTransfers = async () => {
    try {
      const res = await axiosClient.get('/transfer');
      setTransfers(res.data || []);
    } catch (err) {
      console.error('Load transfers error:', err);
      setTransfers([]);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fromBinId = parseInt(formData.from_bin_id, 10);
    const toBinId = parseInt(formData.to_bin_id, 10);
    const itemId = parseInt(formData.item_id, 10);
    const qty = parseInt(formData.qty, 10);

    // Validation
    if (fromBinId === toBinId) {
      alert('❌ Source and destination bins must be different');
      setLoading(false);
      return;
    }

    if (!qty || qty <= 0) {
      alert('❌ Quantity must be greater than 0');
      setLoading(false);
      return;
    }

    // Check available stock in source bin
    const availableStock = inventory
      .filter(inv => inv.item_id === itemId && inv.bin_id === fromBinId)
      .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);

    if (qty > availableStock) {
      alert(`❌ Only ${availableStock} units available in source bin`);
      setLoading(false);
      return;
    }

    const payload = {
      from_bin_id: fromBinId,
      to_bin_id: toBinId,
      item_id: itemId,
      qty: qty
    };

    console.log('🔄 Transfer payload:', payload);

    try {
      await axiosClient.post('/transfer', payload);
      alert('✅ Stock transferred successfully!');
      
      setFormData({
        from_bin_id: '',
        to_bin_id: '',
        item_id: '',
        qty: ''
      });
      
      await loadData();
    } catch (err) {
      console.error('❌ Transfer error:', err.response?.data || err.message);
      alert('❌ Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Get bins with stock for selected item
  const getBinsWithStock = (itemId) => {
    if (!itemId) return [];
    
    const binsWithStock = inventory
      .filter(inv => inv.item_id === parseInt(itemId, 10) && inv.qty > 0)
      .map(inv => inv.bin_id);
    
    return bins.filter(bin => binsWithStock.includes(bin.id));
  };

  // Get available stock for item in selected bin
  const getAvailableStock = () => {
    if (!formData.item_id || !formData.from_bin_id) return 0;
    
    return inventory
      .filter(inv => 
        inv.item_id === parseInt(formData.item_id, 10) && 
        inv.bin_id === parseInt(formData.from_bin_id, 10)
      )
      .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
  };

  const columns = [
    { key: 'transfer_no', label: 'Transfer No' },
    { 
      key: 'from_bin_id', 
      label: 'From Bin',
      render: (row) => {
        const bin = bins.find(b => b.id === row.from_bin_id);
        return bin ? bin.bin_code : `Bin #${row.from_bin_id}`;
      }
    },
    { 
      key: 'to_bin_id', 
      label: 'To Bin',
      render: (row) => {
        const bin = bins.find(b => b.id === row.to_bin_id);
        return bin ? bin.bin_code : `Bin #${row.to_bin_id}`;
      }
    },
    { 
      key: 'item_id', 
      label: 'Item',
      render: (row) => {
        const item = items.find(i => i.id === row.item_id);
        return item ? `${item.sku} - ${item.name}` : `Item #${row.item_id}`;
      }
    },
    { 
      key: 'qty', 
      label: 'Quantity',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {Number(row.qty).toLocaleString()}
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
    },
    { 
      key: 'transfer_date', 
      label: 'Date',
      render: (row) => new Date(row.transfer_date).toLocaleString('en-IN')
    }
  ];

  const availableStock = getAvailableStock();
  const sourceBins = getBinsWithStock(formData.item_id);

  return (
    <div>
      <div className="page-header">
        <h1>🔄 Stock Transfer</h1>
        <button className="btn btn-primary" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Total Transfers</h3>
          <p className="metric-value">{transfers.length}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p className="metric-value">
            {transfers.filter(t => t.status === 'pending').length}
          </p>
        </div>
        <div className="card">
          <h3>Available Items</h3>
          <p className="metric-value">{items.length}</p>
        </div>
        <div className="card">
          <h3>Available Bins</h3>
          <p className="metric-value">{bins.length}</p>
        </div>
      </div>

      <div className="card">
        <h3>➕ New Stock Transfer</h3>
        <form onSubmit={handleTransfer} style={{ maxWidth: '600px' }}>
          <div className="form-group">
            <label>Item to Transfer *</label>
            <select
              value={formData.item_id}
              onChange={e => setFormData({ 
                ...formData, 
                item_id: e.target.value,
                from_bin_id: '',  // Reset bin selection when item changes
                qty: ''
              })}
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
                    {totalStock > 0 ? ` (${totalStock} total)` : ' (Out of stock)'}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>From Bin *</label>
              <select
                value={formData.from_bin_id}
                onChange={e => setFormData({ 
                  ...formData, 
                  from_bin_id: e.target.value,
                  qty: ''  // Reset quantity when bin changes
                })}
                required
                disabled={!formData.item_id}
              >
                <option value="">
                  {formData.item_id ? 'Select Source Bin' : 'Select item first'}
                </option>
                {sourceBins.map(bin => {
                  const stock = inventory
                    .filter(inv => 
                      inv.item_id === parseInt(formData.item_id, 10) && 
                      inv.bin_id === bin.id
                    )
                    .reduce((sum, inv) => sum + Number(inv.qty || 0), 0);
                  
                  return (
                    <option key={bin.id} value={bin.id}>
                      {bin.bin_code} - {bin.zone} ({stock} units)
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>To Bin *</label>
              <select
                value={formData.to_bin_id}
                onChange={e => setFormData({ ...formData, to_bin_id: e.target.value })}
                required
                disabled={!formData.from_bin_id}
              >
                <option value="">
                  {formData.from_bin_id ? 'Select Destination Bin' : 'Select source first'}
                </option>
                {bins
                  .filter(bin => bin.id !== parseInt(formData.from_bin_id, 10))
                  .map(bin => (
                    <option key={bin.id} value={bin.id}>
                      {bin.bin_code} - {bin.zone}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Quantity * 
              {availableStock > 0 && (
                <small style={{ color: '#27ae60', marginLeft: '0.5rem' }}>
                  ({availableStock} available in source bin)
                </small>
              )}
            </label>
            <input
              type="number"
              value={formData.qty}
              onChange={e => setFormData({ ...formData, qty: e.target.value })}
              min="1"
              max={availableStock || undefined}
              placeholder="Enter quantity to transfer"
              required
              disabled={!formData.from_bin_id}
            />
          </div>

          <button
            type="submit"
            className="btn btn-warning"
            disabled={loading || !formData.item_id || !formData.from_bin_id || !formData.to_bin_id}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Transferring...' : '🔄 Transfer Stock'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 Recent Transfers ({transfers.length})</h3>
        {transfers.length > 0 ? (
          <Table columns={columns} data={transfers} />
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
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Transfers Yet
            </div>
            <small>Create a stock transfer using the form above 👆</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferPage;