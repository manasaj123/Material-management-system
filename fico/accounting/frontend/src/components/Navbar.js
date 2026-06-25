import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import './styles.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">FICO Accounting</span>
      </div>
      <div className="navbar-right">
        {user && (
          <span className="navbar-user">
            {user.name} ({user.role})
          </span>
        )}
        <button className="navbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
