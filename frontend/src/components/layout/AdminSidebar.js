import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  // Helper to style active links like the "Home Page" button in your screenshot
  const getLinkStyle = (path) => ({
    display: 'block',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    backgroundColor: location.pathname === path ? '#8a6fc6' : 'transparent', // Matches your active state
    borderRadius: location.pathname === path ? '8px' : '0px',
    fontWeight: '500',
    marginBottom: '5px',
    transition: 'background-color 0.2s'
  });

  return (
    <div style={{ width: '260px', minHeight: '100vh', backgroundColor: '#3b2c55', color: 'white', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px' }}>Quiz Portal</h2>
      
      <p style={{ fontSize: '12px', color: '#a095b5', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '20px' }}>
        NAVIGATION
      </p>
      
      <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 30px 0' }}>
        <li>
          <Link to="/admin/dashboard" style={getLinkStyle('/admin/dashboard')}>
            Dashboard
          </Link>
        </li>
      </ul>

      <p style={{ fontSize: '12px', color: '#a095b5', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '10px', paddingLeft: '20px' }}>
        MANAGEMENT
      </p>

      <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
        <li>
          <Link to="/admin/users" style={getLinkStyle('/admin/users')}>
            Manage Users
          </Link>
        </li>
        <li>
          <Link to="/admin/setup" style={getLinkStyle('/admin/setup')}>
            System Setup
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default AdminSidebar;