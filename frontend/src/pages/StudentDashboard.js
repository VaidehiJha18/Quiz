import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import StudentSidebar from '../components/layout/StudentSidebar';
import StudentQuizCard from '../components/quiz/StudentQuizCard';
import { fetchStudentProfile, fetchStudentDashboard, api } from '../api/apiService'; 

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
}

/* Dashboard Layout */
.student-dashboard-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fda085 100%);
}

/* Sidebar */
.student-sidebar {
  width: 380px;
  background: linear-gradient(180deg, #5b4a8f 0%, #3e2d5c 100%);
  color: white;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
}

.university-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

.university-logo {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  margin: 0 auto 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.university-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.university-tagline {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
  letter-spacing: 1px;
}

/* Sidebar Navigation */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex-grow: 1;
}

.sidebar-nav-item {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sidebar-nav-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(5px);
}

.sidebar-nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
}

.nav-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Main Content */
.student-main-content {
  flex: 1;
  padding: 1.5rem 1rem;
  overflow-y: visible !important;
  height: auto !important;
}

/* Top Bar */
.dashboard-top-bar {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem 2.5rem;
  border-radius: 20px;
  margin-bottom: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.top-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.page-title-section h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 400;
}

.student-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-info {
  text-align: left;
}

.profile-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.profile-id {
  font-size: 0.85rem;
  color: #7f8c8d;
}

/* Quiz Cards Container */
.quiz-cards-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* History Toggle Switch */
.history-toggle-container {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.25);
  padding: 6px;
  border-radius: 30px;
  width: fit-content;
  backdrop-filter: blur(10px);
}

.history-toggle-btn {
  border: none;
  background: transparent;
  padding: 8px 18px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-toggle-btn.active {
  background: white;
  color: #3e2d5c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* History Card */
.history-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.history-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.history-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
}

.history-info p {
  color: #4a5568;
  font-size: 0.95rem;
  margin-top: 4px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 1024px) {
  .student-sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .student-dashboard-layout {
    flex-direction: column;
    height: auto !important;
    overflow-y: auto !important;
  }

  .student-sidebar {
    width: 100%;
    height: auto !important;
    padding: 1.5rem;
  }

  .top-bar-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .history-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [historyFilter, setHistoryFilter] = useState('ALL'); // 'ALL' | 'COMPLETED' | 'MISSED'
  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [studentData, setStudentData] = useState({
    name: 'Loading...', 
    id: '...'
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchStudentProfile(); 
        if (res.data) {
             setStudentData({ 
                 ...res.data, 
                 name: res.data.username || res.data.name || res.data.f_name || 'Student'
             });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setStudentData({ name: "Student", id: "N/A" });
      }
    };

    const loadQuizzes = async () => {
      try {
        const res = await fetchStudentDashboard();
        setQuizzes(res.data || []); 
      } catch (err) {
        console.error("Error loading quizzes:", err);
      } finally {
        setLoading(false);
      }
    };

    const loadHistory = async () => {
        try {
            const res = await api.get('/student/my-history');
            setHistory(res.data || []);
        } catch (err) {
            console.error("Error loading history:", err);
        }
    };

    loadProfile();
    loadQuizzes();
    loadHistory();
  }, []);

  const handleStartQuiz = (token) => {
    window.open(`/take-quiz/${token}`, '_blank');
  };

  // Format ISO strings into clean local time range
  const formatTimeSlot = (startTime, endTime) => {
    if (!startTime || !endTime) return 'Flexible Window';
    
    const start = new Date(startTime);
    const end = new Date(endTime);

    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const startStr = start.toLocaleTimeString('en-IN', timeOptions);
    const endStr = end.toLocaleTimeString('en-IN', timeOptions);

    return `${startStr} - ${endStr}`;
  };

  // Filter history records based on selected toggle pill
  const filteredHistory = history.filter(item => {
    const status = (item.status || '').toLowerCase();
    if (historyFilter === 'COMPLETED') return status === 'completed';
    if (historyFilter === 'MISSED') return status === 'missed';
    return true; // 'ALL'
  });

  const renderContent = () => {
    switch(activeTab) {
      case 'available':
        if (loading) return <div className="empty-state" style={{ color: 'white' }}>Loading your quizzes...</div>;
        if (quizzes.length === 0) return <div className="empty-state" style={{ color: 'white' }}>No active scheduled quizzes available at this time.</div>;

        return (
          <div className="quiz-cards-container">
            {quizzes.map(quiz => (
              <StudentQuizCard 
                  key={quiz.id} 
                  quiz={{
                    id: quiz.id,
                    title: quiz.quiz_title,
                    questions: quiz.total_questions,
                    duration: formatTimeSlot(quiz.start_time, quiz.end_time), // Displays Start - End Time
                    professor: quiz.teacher || 'Prof. Unknown',               // Displays Professor Name
                    dueDate: quiz.start_time ? new Date(quiz.start_time).toLocaleDateString() : 'Today',
                    status: quiz.computed_status || 'available',
                    token: quiz.quiz_token 
                  }} 
                  onStartQuiz={() => handleStartQuiz(quiz.quiz_token)} 
              />
            ))}
          </div>
        );

      case 'history':
        return (
            <div className="quiz-cards-container">
                {/* Header & Sub-Toggle Pills */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                  <h2 style={{ color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>Quiz History</h2>
                  
                  {/* Filter Switch */}
                  <div className="history-toggle-container">
                    <button 
                      className={`history-toggle-btn ${historyFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setHistoryFilter('ALL')}
                    >
                      All ({history.length})
                    </button>
                    <button 
                      className={`history-toggle-btn ${historyFilter === 'COMPLETED' ? 'active' : ''}`}
                      onClick={() => setHistoryFilter('COMPLETED')}
                    >
                      Completed ({history.filter(h => h.status === 'Completed').length})
                    </button>
                    <button 
                      className={`history-toggle-btn ${historyFilter === 'MISSED' ? 'active' : ''}`}
                      onClick={() => setHistoryFilter('MISSED')}
                    >
                      Missed ({history.filter(h => h.status === 'Missed').length})
                    </button>
                  </div>
                </div>

                {filteredHistory.length === 0 ? (
                  <div className="empty-state" style={{ color: 'white', fontSize: '1.1rem', marginTop: '1rem' }}>
                    No {historyFilter.toLowerCase()} quizzes found.
                  </div>
                ) : (
                  filteredHistory.map((h, index) => (
                    <div 
                      key={h.attempt_id || `missed-${index}`} 
                      className="history-card" 
                      style={{
                        borderLeft: h.status === 'Missed' ? '6px solid #e74c3c' : '6px solid #2ecc71'
                      }}
                    >
                        <div className="history-info">
                            <h3>{h.quiz_title}</h3>
                            <p><strong>Professor:</strong> {h.teacher || 'N/A'}</p>
                            <p style={{ fontSize: '0.85rem', color: '#718096' }}>
                              {h.status === 'Missed' 
                                ? `Expired Slot: ${new Date(h.submit_time).toLocaleString()}` 
                                : `Submitted On: ${new Date(h.submit_time).toLocaleString()}`}
                            </p>
                        </div>

                        <div>
                            {h.status === 'Missed' ? (
                                <span style={{
                                    background: '#fadbd8',
                                    color: '#78281f',
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    fontSize: '0.88rem',
                                    display: 'inline-block'
                                }}>
                                    ❌ Missed / Expired
                                </span>
                            ) : h.is_published ? (
                                <Link 
                                    to={`/result/${h.attempt_id}`}
                                    className="btn-primary"
                                >
                                    📊 View Result
                                </Link>
                            ) : (
                                <span style={{
                                    background: '#e2e8f0',
                                    color: '#4a5568',
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    fontSize: '0.88rem',
                                    display: 'inline-block'
                                }}>
                                    ⏳ Result Pending
                                </span>
                            )}
                        </div>
                    </div>
                  ))
                )}
            </div>
        );

      case 'results':
        return (
          <div className="quiz-cards-container">
            <div className="empty-state" style={{ color: 'white' }}>
              <h3>Performance Analytics</h3>
              <p>Detailed performance charts coming soon.</p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="student-dashboard-layout">
      <StudentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="student-main-content">
        <div className="dashboard-top-bar">
          <div className="top-bar-content">
            <div className="page-title-section">
              <h1>Student Quiz Portal</h1>
              <p className="page-subtitle">Take quizzes and track your performance</p>
            </div>
            
            <div className="student-profile">
              <div className="profile-avatar">
                {studentData.name ? studentData.name.charAt(0) : 'S'}
              </div>
              <div className="profile-info">
              <div className="profile-name">{studentData.name || studentData.username}</div>
              <div className="profile-id">
                 ID: {
                    studentData.enrollment_no 
                    ? String(studentData.enrollment_no).slice(-4) 
                    : (studentData.user_id || studentData.id || 'N/A')
                  }
              </div>
              </div>
            </div>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default StudentDashboard;