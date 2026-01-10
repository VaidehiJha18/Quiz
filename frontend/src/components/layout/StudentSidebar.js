const StudentSidebar = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'available', label: 'Available Quizzes', icon: '📝' },
    { id: 'history', label: 'Quiz History', icon: '📚' },
    { id: 'results', label: 'My Results', icon: '📊' }
  ];

  return (
    <div className="student-sidebar">
      <div className="university-header">
        <div className="university-logo">🎓</div>
        <h2>GSFC UNIVERSITY</h2>
        <p className="university-tagline">EDUCATION RE-ENVISIONED</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <div className="nav-icon">{item.icon}</div>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default StudentSidebar;