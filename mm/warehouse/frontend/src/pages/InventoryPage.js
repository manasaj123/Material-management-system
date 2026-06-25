import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import Table from '../components/common/Table';
import '../pages/style.css';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    unit: 'PCS',
    expiry_days: 0
  });

  useEffect(() => {
    loadItems();
    loadInventory();
  }, []);

  const loadItems = async () => {
    try {
      const response = await axiosClient.get('/item');
      setItems(response.data || []);
    } catch (err) {
      console.error('Items load failed:', err.response?.data || err.message);
      setItems([]);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await axiosClient.get('/inventory');
      setInventory(response.data || []);
    } catch (error) {
      console.error('Inventory load failed:', error.response?.data || error.message);
      setInventory([]);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate SKU format (alphanumeric and dash only)
    if (!/^[A-Z0-9\-]+$/i.test(formData.sku.trim())) {
      alert('❌ SKU can only contain letters, numbers, and dashes');
      setLoading(false);
      return;
    }

    // Validate Name (letters, numbers, spaces only)
    if (!/^[A-Za-z0-9\s]+$/.test(formData.name.trim())) {
      alert('❌ Name can only contain letters, numbers, and spaces');
      setLoading(false);
      return;
    }

    // Validate expiry days
    const expiryDays = parseInt(formData.expiry_days, 10);
    if (expiryDays < 0) {
      alert('❌ Expiry days cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        unit: formData.unit || 'PCS',
        expiry_days: expiryDays
      };

      await axiosClient.post('/item', payload);
      alert(`✅ Item ${payload.sku} added successfully!`);
      
      setFormData({ sku: '', name: '', unit: 'PCS', expiry_days: 0 });
      await loadItems();
      await loadInventory();
    } catch (err) {
      console.error('Add item failed:', err.response?.data || err.message);
      alert('❌ Failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId, sku) => {
    if (!window.confirm(`Delete item ${sku}? This cannot be undone.`)) return;

    try {
      await axiosClient.delete(`/item/${itemId}`);
      alert(`✅ Item ${sku} deleted successfully!`);
      await loadItems();
    } catch (err) {
      console.error('Delete item failed:', err.response?.data || err.message);
      alert('❌ Failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const itemColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Name' },
    { key: 'unit', label: 'Unit' },
    { 
      key: 'expiry_days', 
      label: 'Shelf Life',
      render: (row) => row.expiry_days > 0 ? `${row.expiry_days} days` : 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          className="btn btn-danger"
          onClick={() => handleDeleteItem(row.id, row.sku)}
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
        >
          🗑️ Delete
        </button>
      )
    }
  ];

  const inventoryColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Item' },
    { 
      key: 'qty', 
      label: 'Quantity',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
          {Number(row.qty).toLocaleString()}
        </span>
      )
    },
    { key: 'bin_code', label: 'Bin Location' },
    { 
      key: 'expiry_date', 
      label: 'Expiry Date',
      render: (row) => {
        if (!row.expiry_date) return <span style={{ color: '#95a5a6' }}>No Expiry</span>;
        
        const expiryDate = new Date(row.expiry_date);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        let color = '#27ae60'; // Green
        if (daysUntilExpiry < 0) color = '#e74c3c'; // Red (expired)
        else if (daysUntilExpiry <= 7) color = '#e67e22'; // Orange (expiring soon)
        else if (daysUntilExpiry <= 30) color = '#f39c12'; // Yellow
        
        return (
          <div>
            <div>{expiryDate.toLocaleDateString('en-IN')}</div>
            <small style={{ color, fontWeight: 'bold' }}>
              {daysUntilExpiry < 0 
                ? `Expired ${Math.abs(daysUntilExpiry)} days ago` 
                : `${daysUntilExpiry} days left`}
            </small>
          </div>
        );
      }
    }
  ];

  // Calculate metrics
  const totalItems = items.length;
  const totalStock = inventory.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const uniqueItemsInStock = new Set(inventory.map(item => item.sku)).size;

  return (
    <div>
      <div className="page-header">
        <h1>📋 Items & 📦 Inventory</h1>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            loadItems();
            loadInventory();
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div className="metrics-grid">
        <div className="card">
          <h3>Total Items</h3>
          <p className="metric-value">{totalItems}</p>
        </div>
        <div className="card">
          <h3>Total Stock</h3>
          <p className="metric-value">{totalStock.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Items in Stock</h3>
          <p className="metric-value">{uniqueItemsInStock}</p>
        </div>
        <div className="card">
          <h3>Stock Records</h3>
          <p className="metric-value">{inventory.length}</p>
        </div>
      </div>

      <div className="card">
        <h3>➕ Add New Item</h3>
        <form onSubmit={handleAddItem} style={{ maxWidth: '600px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>SKU *</label>
              <input
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                placeholder="ITEM-001"
                pattern="[A-Za-z0-9\-]*"
                title="Only letters, numbers, and dashes"
                required
              />
              <small style={{ color: '#7f8c8d' }}>Letters, numbers, dash only</small>
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Widget A"
                pattern="[A-Za-z0-9\s]*"
                title="Only letters, numbers, and spaces"
                required
              />
              <small style={{ color: '#7f8c8d' }}>Letters, numbers, spaces only</small>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Unit</label>
              <select
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="PCS">PCS (Pieces)</option>
                <option value="KG">KG (Kilograms)</option>
                <option value="LTR">LTR (Liters)</option>
                <option value="BOX">BOX</option>
                <option value="CTN">CTN (Carton)</option>
                <option value="PKT">PKT (Packet)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Shelf Life (Days)</label>
              <input
                type="number"
                value={formData.expiry_days}
                onChange={e => setFormData({ ...formData, expiry_days: e.target.value })}
                min="0"
                placeholder="0 = No expiry"
              />
              <small style={{ color: '#7f8c8d' }}>0 = Non-perishable</small>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? '⏳ Adding...' : '➕ Add Item'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>📋 All Items ({items.length})</h3>
        {items.length > 0 ? (
          <Table columns={itemColumns} data={items} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
            No items yet. Add one above! ☝️
          </div>
        )}
      </div>

      <div className="card">
        <h3>📦 Current Stock - FIFO Order ({inventory.length} records)</h3>
        {inventory.length > 0 ? (
          <Table columns={inventoryColumns} data={inventory} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>
            No stock available. Receive items via GRN! 📥
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;