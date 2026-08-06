import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- THE LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.clear(); // Wipe the security pass
    navigate('/login');   // Send back to login page
  };

  // Helper to style active links like the "Home Page" button
  const getLinkStyle = (path) => ({
    display: 'block',
    padding: '12px 20px',
    color: 'white',
    textDecoration: 'none',
    backgroundColor: location.pathname === path ? '#8a6fc6' : 'transparent',
    borderRadius: location.pathname === path ? '8px' : '0px',
    fontWeight: '500',
    marginBottom: '5px',
    transition: 'background-color 0.2s'
  });

  return (
    <div style={{ 
      width: '260px', 
      height: '100vh',           /* Locks height to the full viewport */
      position: 'sticky',        /* Keeps it pinned in place */
      top: 0,                    /* Sticks to the very top */
      backgroundColor: '#3b2c55', 
      color: 'white', 
      padding: '20px', 
      display: 'flex', 
      flexDirection: 'column', 
      boxSizing: 'border-box',
      flexShrink: 0,
      overflowY: 'auto'          /* Allows sidebar items to scroll internally if screen is short */
    }}>
      
      {/* --- TOP CONTENT --- */}
      <div>
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

      {/* --- BOTTOM CONTENT (LOGOUT BUTTON) --- */}
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(160, 149, 181, 0.3)' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            padding: '12px 20px', 
            backgroundColor: 'transparent', 
            color: '#ffcccc', 
            border: 'none', 
            textAlign: 'left',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '8px',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(217, 83, 79, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {/* Simple Exit Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>

    </div>
  );
};

export default AdminSidebar;