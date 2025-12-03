import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1 className="navbar-title">🔐 Security Anomaly Detection</h1>
      </div>

      <div className="navbar-right">
        <div className="user-info">
          <span className="user-icon">👤</span>
          <span className="username">{user?.username}</span>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;