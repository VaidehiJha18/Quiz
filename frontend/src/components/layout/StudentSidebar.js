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
    <div className="student-sidebar">
      {/* Header Section */}
      <div className="university-header">
        <div className="university-logo">🎓</div>
        <h2>GSFC UNIVERSITY</h2>
        <p className="university-tagline">EDUCATION RE-ENVISIONED</p>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {/* Mapped Menu Items */}
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

        {/* Logout Button (Pushed to bottom) */}
        <button 
          className="sidebar-nav-item logout-btn" 
          onClick={handleLogout}
          style={{ 
            marginTop: 'auto', 
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