import React, { useState, useEffect } from 'react';
import StudentSidebar from '../components/layout/StudentSidebar';
import StudentQuizCard from '../components/quiz/StudentQuizCard';
import { fetchStudentProfile, fetchStudentDashboard } from '../api/apiService';

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
  min-height: 100vh;
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
  margin-bottom: 3rem;
  padding: 2rem;
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
  padding: 2.5rem 3rem;
  overflow-y: auto;
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
  gap: 2rem;
}

/* Quiz Card */
.quiz-card {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.quiz-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.quiz-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.quiz-card-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.quiz-status-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.quiz-status-badge.available {
  background: #27ae60;
  color: white;
}

.quiz-status-badge.completed {
  background: #95a5a6;
  color: white;
}

.quiz-status-badge.upcoming {
  background: #f39c12;
  color: white;
}

.quiz-card-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.quiz-detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.detail-icon {
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quiz-detail-label {
  font-weight: 600;
  margin-right: 0.25rem;
}

.start-quiz-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.start-quiz-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  box-shadow: none;
}

.start-quiz-btn:disabled:hover {
  transform: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .student-sidebar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .student-dashboard-layout {
    flex-direction: column;
  }

  .student-sidebar {
    width: 100%;
  }

  .quiz-card-details {
    grid-template-columns: 1fr;
  }

  .top-bar-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
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
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: State for Student Profile Data
  const [studentData, setStudentData] = useState({
    name: 'Loading...', 
    id: '...'
  });

  useEffect(() => {
    // 1. Fetch Profile Data
    const loadProfile = async () => {
      try {
        const res = await fetchStudentProfile(); 
        // Safety check: ensure we actually got a name back
        if (res.data && res.data.name) {
             setStudentData(res.data);
        } else if (res.data && res.data.f_name) {
             // Handle case where DB column is f_name instead of name
             setStudentData({ ...res.data, name: res.data.f_name });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        // Optional: Set a default name on error so it doesn't stay stuck on "Loading"
        setStudentData({ name: "Student", id: "N/A" });
      }
    };

    // 2. Fetch Quizzes
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

    loadProfile();
    loadQuizzes();
  }, []);

  const handleStartQuiz = (token) => {
    window.open(`/take-quiz/${token}`, '_blank');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'available':
        if (loading) return <div className="empty-state">Loading your quizzes...</div>;
        if (quizzes.length === 0) return <div className="empty-state">No quizzes found for your semester.</div>;

        return (
          <div className="quiz-cards-container">
            {quizzes.map(quiz => (
              <StudentQuizCard 
                  key={quiz.id} 
                  quiz={{
                    id: quiz.id,
                    title: quiz.quiz_title,
                    questions: quiz.total_questions,
                    duration: `${quiz.duration || 30} minutes`,
                    professor: quiz.teacher,
                    dueDate: quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A',
                    status: 'available',
                    token: quiz.quiz_token 
                  }} 
                  onStartQuiz={() => handleStartQuiz(quiz.quiz_token)} 
              />
            ))}
          </div>
        );
      case 'history':
        return <div className="quiz-cards-container"><div className="empty-state"><h3>Quiz History</h3><p>Your completed quizzes will appear here.</p></div></div>;
      case 'results':
        return <div className="quiz-cards-container"><div className="empty-state"><h3>My Results</h3><p>Your scores will appear here after grading.</p></div></div>;
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
                {/* ✅ Display Real Name from Database */}
                <div className="profile-name">{studentData.name}</div>
                <div className="profile-id">ID: {studentData.id}</div>
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