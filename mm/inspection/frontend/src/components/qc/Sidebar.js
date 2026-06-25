// inspection/frontend/src/components/Sidebar.js
import { Link, useLocation } from "react-router-dom";
import "./componentstyles.css";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="qc-sidebar">
      <h3 className="qc-sidebar-title">Inspection Setup</h3>

      <ul className="qc-sidebar-menu">
        {/* 📊 Overview */}
        <li className="qc-sidebar-section">📊 Overview</li>
        <li className="qc-sidebar-item">
          <Link 
            to="/" 
            className={`qc-sidebar-link ${isActive('/') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
        </li>

        {/* ⚙️ Setup - KEEP THESE */}
        <li className="qc-sidebar-section">⚙️ Setup</li>
        <li className="qc-sidebar-item">
          <Link 
            to="/master-inspections" 
            className={`qc-sidebar-link ${isActive('/master-inspections') ? 'active' : ''}`}
          >
            Master Inspections
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link 
            to="/inspection-methods" 
            className={`qc-sidebar-link ${isActive('/inspection-methods') ? 'active' : ''}`}
          >
            Inspection Methods
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link 
            to="/sampling-procedures" 
            className={`qc-sidebar-link ${isActive('/sampling-procedures') ? 'active' : ''}`}
          >
            Sampling Procedures
          </Link>
        </li>
        <li className="qc-sidebar-item">
          <Link 
            to="/inspection-plans" 
            className={`qc-sidebar-link ${isActive('/inspection-plans') ? 'active' : ''}`}
          >
            Inspection Plans
          </Link>
        </li>

        {/* ❌ REMOVED - Execution pages moved to Quality Module */}
      </ul>
    </div>
  );
}