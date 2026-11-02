import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      display: 'block',
      padding: '10px 16px',
      color: '#ffffff',
      textDecoration: 'none',
      backgroundColor: isActive ? '#7b61a8' : 'transparent',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '6px',
      transition: 'background-color 0.2s ease',
      cursor: 'pointer'
    };
  };

  return (
    <aside style={{
      width: '240px',
      height: '100vh',
      backgroundColor: '#3b2c55',
      color: '#ffffff',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      flexShrink: 0
    }}>
      {/* Portal Header */}
      <h2 style={{
        textAlign: 'center',
        margin: '0 0 28px 0',
        fontSize: '22px',
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: '0.5px'
      }}>
        Quiz Portal
      </h2>

      {/* Navigation Section */}
      <div style={{
        fontSize: '11px',
        color: '#a095b5',
        fontWeight: '700',
        letterSpacing: '1px',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        NAVIGATION
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '24px' }}>
        <Link to="/professor/dashboard" style={getLinkStyle('/professor/dashboard')}>
          Home Page
        </Link>
        <Link to="/professor/quizzes" style={getLinkStyle('/professor/quizzes')}>
          View Quiz
        </Link>
        <Link to="/professor/generate-quiz" style={getLinkStyle('/professor/generate-quiz')}>
          Generate Quiz
        </Link>
        {/* Newly Added Exam Paper Generator Feature */}
        <Link to="/professor/generate-paper" style={getLinkStyle('/professor/generate-paper')}>
          Generate Exam Paper
        </Link>
        <Link to="/professor/results" style={getLinkStyle('/professor/results')}>
          Results
        </Link>
      </nav>

      {/* Quick Actions Section */}
      <div style={{
        fontSize: '11px',
        color: '#a095b5',
        fontWeight: '700',
        letterSpacing: '1px',
        textAlign: 'center',
        marginBottom: '10px'
      }}>
        QUICK ACTIONS
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Link to="/professor/students" style={getLinkStyle('/professor/students')}>
          Manage Students
        </Link>
        <Link to="/professor/analytics" style={getLinkStyle('/professor/analytics')}>
          Analytics
        </Link>
      </nav>

      {/* Logout Button */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <button
          type="button"
          onClick={handleLogout}
          style={{
            width: '100%',
            backgroundColor: '#d9415d',
            color: '#ffffff',
            border: 'none',
            padding: '10px 0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;