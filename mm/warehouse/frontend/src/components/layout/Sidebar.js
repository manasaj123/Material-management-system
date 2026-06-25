import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../layout/style.css';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: ' Dashboard', icon: '📊' },
    { path: '/warehouse', label: ' Warehouse', icon: '🏭' },
    { path: '/grn', label: ' GRN', icon: '📥' },
    { path: '/inventory', label: ' Inventory', icon: '📦' },
    { path: '/pickpack', label: ' Pick/Pack', icon: '📤' },
    { path: '/transfer', label: ' Transfer', icon: '🔄' },
    { path: '/reports', label: ' Reports', icon: '📈' },
    { path: '/cycle-counts', label: ' Cycle Counts', icon: '🔍' }
  ];

  return (
    <aside className="sidebar">
      <nav>
        {menuItems.map(item => (
          <Link 
            key={item.path}
            to={item.path}
            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span style={{ marginRight: '10px' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
