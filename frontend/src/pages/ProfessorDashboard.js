// ❤️❤️❤️
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card'; 
import { api } from '../api/apiService'; // Removed fetchQuestions
// import { fetchQuestions, api } from '../api/apiService'; 

export default function ProfessorDashboard() {
  const [questionCount, setQuestionCount] = useState(0);
  const [analytics, setAnalytics] = useState({
      total_quizzes: 0,
      total_attempts: 0,
      total_questions: 0 // ✅ Added question count to analytics state
  });

  useEffect(() => {
    const loadData = async () => {
      // 1. Load basic analytics for the quick-stats row
      try {
        const resA = await api.get('/prof/analytics');
        if (resA.data) {
            setAnalytics({
                total_quizzes: resA.data.total_quizzes || 0,
                total_attempts: resA.data.total_attempts || 0,
                total_questions: resA.data.total_questions || 0 // ✅ Read specific teacher's questions
            });
        }
      } catch (err) { console.error(err); }
    };
    
    loadData();
  }, []);

  return (
    <main className="main-content">
      <style>{`
        /* --- 3-Column Quick Stats Row --- */
        .quick-stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 35px;
        }
        .stat-box {
            padding: 25px;
            border-radius: 12px;
            color: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: transform 0.2s ease;
        }
        .stat-box:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0,0,0,0.15);
        }
        .stat-box.purple { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
        .stat-box.blue   { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
        .stat-box.orange { background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%); }
        
        .stat-num {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1;
            margin-bottom: 8px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .stat-label {
            font-size: 1.1rem;
            font-weight: 600;
            opacity: 0.9;
        }

        /* --- Buttons --- */
        .analytics-btn { background-color: #10b981; color: white; }
        .analytics-btn:hover { background-color: #059669; }
      `}</style>

      <div className="top-bar">
        <h1>Professor Dashboard</h1>
      </div>

      {/* --- QUICK STATS ROW --- */}
      <div className="quick-stats-row">
          <div className="stat-box purple">
              <div className="stat-num">{analytics.total_quizzes}</div>
              <div className="stat-label">Quizzes Conducted</div>
          </div>
          <div className="stat-box blue">
              <div className="stat-num">{analytics.total_questions}</div>
              <div className="stat-label">Questions in Bank</div>
          </div>
          <div className="stat-box orange">
              <div className="stat-num">{analytics.total_attempts}</div>
              <div className="stat-label">Total Student Attempts</div>
          </div>
      </div>

      {/* --- ACTION CARDS --- */}
      <div className="dashboard-grid">
        <Card className="card card-left-align">
          <h3>Manage Questions</h3>
          <p>Add, edit, or remove questions from your personal question bank.</p>
          <Link to="/professor/questions" className="btn btn-primary" style={{marginTop: '10px'}}>
            View Questions
          </Link>
        </Card>

        <Card className="card card-left-align">
          <h3>View Quizzes</h3>
          <p>See all active quizzes, manage settings, and get shareable links.</p>
          <Link to="/professor/quizzes" className="btn btn-primary" style={{marginTop: '10px'}}>
            View Quizzes
          </Link>
        </Card>

        <Card className="card card-left-align">
          <h3>View Detailed Results</h3>
          <p>Review individual student performance and publish final grades.</p>
          <Link to="/professor/results" className="btn btn-accent" style={{marginTop: '10px'}}>
            View Results
          </Link>
        </Card>

        <Card className="card card-left-align">
          <h3>Analytics & Reports</h3>
          <p>View class performance averages and download Excel/CSV reports.</p>
          <Link to="/professor/analytics" className="btn analytics-btn" style={{marginTop: '10px'}}>
            Open Analytics
          </Link>
        </Card>
      </div>
    </main>
  );
}