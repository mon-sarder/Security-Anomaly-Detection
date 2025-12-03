import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;