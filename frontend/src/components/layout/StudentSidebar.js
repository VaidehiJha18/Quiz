import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentSidebar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // 1. Optional: Clear any stored tokens if you use localStorage
    // localStorage.removeItem('token'); 
    
    // 2. Redirect to Home Page
    navigate('/'); 
  };

  const navItems = [
    { id: 'available', label: 'Available Quizzes', icon: '📝' },
    { id: 'history', label: 'Quiz History', icon: '📚' },
    { id: 'results', label: 'My Results', icon: '📊' }
  ];

  return (
    <div className="student-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Section */}
      <div className="university-header">
        <div className="university-logo">🎓</div>
        <h2>GSFC UNIVERSITY</h2>
        <p className="university-tagline">EDUCATION RE-ENVISIONED</p>
      </div>

      {/* Navigation Links Wrapper */}
      <nav 
        className="sidebar-nav" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flexGrow: 1, 
          justifyContent: 'space-between' /* ✅ This is the magic property that forces separation */
        }}
      >
        {/* Top items grouped together */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <div className="nav-icon">{item.icon}</div>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Logout Button (Pushed to absolute bottom) */}
        <button 
          className="sidebar-nav-item logout-btn" 
          onClick={handleLogout}
          style={{ 
            marginTop: '1rem', /* Safe spacing for split-screen */
            background: 'rgba(255, 99, 71, 0.15)', // Light Red background
            border: '1px solid rgba(255, 99, 71, 0.3)' 
          }}
        >
          <div className="nav-icon">🚪</div>
          Logout
        </button>
      </nav>
    </div>
  );
};

export default StudentSidebar;