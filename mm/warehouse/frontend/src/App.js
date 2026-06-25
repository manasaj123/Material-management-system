import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import GrnPage from './pages/GrnPage';
import WarehousePage from './pages/WarehousePage';
import InventoryPage from './pages/InventoryPage';
import PickPackPage from './pages/PickPackPage';
import TransferPage from './pages/TransferPage';
import ReportsPage from './pages/ReportsPage';
import CycleCountPage from './pages/CycleCountPage';
import './pages/style.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/grn" element={<GrnPage />} />
              <Route path="/warehouse" element={<WarehousePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/transfer" element={<TransferPage />} />
              <Route path="/pickpack" element={<PickPackPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/cycle-counts" element={<CycleCountPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
