import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-icon">📊</span>
          <span className="sidebar-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/login-events"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-icon">🔍</span>
          <span className="sidebar-text">Login Events</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? 'sidebar-link active' : 'sidebar-link'
          }
        >
          <span className="sidebar-icon">🚨</span>
          <span className="sidebar-text">Alerts</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;