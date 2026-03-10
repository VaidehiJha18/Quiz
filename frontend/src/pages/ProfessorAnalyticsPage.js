import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/apiService'; 

export default function ProfessorAnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
      total_quizzes: 0,
      total_attempts: 0,
      average_score: 0,
      highest_score: 0,
      lowest_score: 0,
      recent_activity: []
  });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const resA = await api.get('/prof/analytics');
        if (resA.data) setAnalytics(resA.data);
      } catch (err) {
        console.error("Error loading analytics:", err);
      }
    };
    loadAnalytics();
  }, []);

  const handleDownloadReport = async () => {
      setIsExporting(true);
      try {
          const res = await api.get('/prof/export-marks');
          const data = res.data;

          if (!data || data.length === 0) {
              alert("No student data available to download.");
              return;
          }

          const headers = ["Quiz Title", "Enrollment No", "Student Name", "Score", "Submitted Date"];
          const rows = data.map(row => [
              `"${row.quiz_title}"`, 
              row.enrollment_no, 
              `"${row.f_name} ${row.l_name}"`, 
              row.total_score, 
              `"${new Date(row.submit_time).toLocaleString()}"`
          ]);
          
          let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
              
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", "Student_Marks_Report.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

      } catch (err) {
          console.error("Error downloading report:", err);
          alert("Failed to download report.");
      } finally {
          setIsExporting(false);
      }
  };

  return (
    <main className="main-content">
      <style>{`
        /* --- KPI 4-Card Grid --- */
        .analytics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            margin-top: 20px;
        }
        .stat-card {
            background: #fff;
            padding: 25px;
            border-radius: 12px;
            text-align: left;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
        }
        .stat-card::after {
            content: '';
            position: absolute;
            top: 0; right: 0; bottom: 0; width: 4px;
        }
        .stat-card.blue::after { background: #3b82f6; }
        .stat-card.purple::after { background: #8b5cf6; }
        .stat-card.green::after { background: #10b981; }
        .stat-card.orange::after { background: #f59e0b; }

        .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #1e293b;
            margin-top: 10px;
            line-height: 1;
        }
        .stat-label {
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 0.5px;
        }

        /* --- Details & Activity Section --- */
        .details-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
        }
        @media (max-width: 900px) {
            .details-grid { grid-template-columns: 1fr; }
        }
        
        .dashboard-panel {
            background: #fff;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .panel-header {
            font-size: 1.25rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f1f5f9;
        }

        /* --- Recent Activity Feed --- */
        .activity-feed {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .activity-item {
            display: flex;
            align-items: center;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 3px solid #6366f1;
            transition: transform 0.2s;
        }
        .activity-item:hover {
            transform: translateX(4px);
            background: #f1f5f9;
        }
        .activity-icon {
            font-size: 1.5rem;
            margin-right: 15px;
        }
        .activity-details { flex: 1; }
        .activity-name {
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 4px 0;
            font-size: 0.95rem;
        }
        .activity-name span {
            font-weight: 400;
            color: #64748b;
        }
        .activity-time {
            font-size: 0.8rem;
            color: #94a3b8;
            margin: 0;
        }
        .activity-score {
            font-weight: 700;
            color: #4f46e5;
            background: #e0e7ff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
        }

        /* --- Buttons --- */
        .export-btn {
            background-color: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .export-btn:hover { background-color: #059669; transform: translateY(-2px); }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 20px;
          transition: all 0.2s;
        }
        .back-btn:hover { background: #f8fafc; transform: translateX(-4px); }
      `}</style>

      <button onClick={() => navigate(-1)} className="back-btn">← Back to Dashboard</button>

      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{margin: 0}}>Performance Analytics</h1>
        <button onClick={handleDownloadReport} className="export-btn" disabled={isExporting}>
            {isExporting ? '⏳ Generating...' : '📥 Export Full Report'}
        </button>
      </div>

      {/* --- KPI ROW --- */}
      <div className="analytics-grid">
          <div className="stat-card blue">
              <div className="stat-label">Total Student Attempts</div>
              <div className="stat-value">{analytics.total_attempts}</div>
          </div>
          <div className="stat-card purple">
              <div className="stat-label">Overall Average Score</div>
              <div className="stat-value">{analytics.average_score}</div>
          </div>
          <div className="stat-card green">
              <div className="stat-label">Highest Score Achieved</div>
              <div className="stat-value">{analytics.highest_score}</div>
          </div>
          <div className="stat-card orange">
              <div className="stat-label">Lowest Score</div>
              <div className="stat-value">{analytics.lowest_score}</div>
          </div>
      </div>

      {/* --- SECONDARY DASHBOARD ROW --- */}
      <div className="details-grid">
          
          {/* Recent Activity Feed */}
          <div className="dashboard-panel">
              <div className="panel-header">Recent Submissions</div>
              <div className="activity-feed">
                  {analytics.recent_activity.length === 0 ? (
                      <p style={{color: '#64748b', fontStyle: 'italic'}}>No recent activity found.</p>
                  ) : (
                      analytics.recent_activity.map((act, index) => (
                          <div className="activity-item" key={index}>
                              <div className="activity-icon">📝</div>
                              <div className="activity-details">
                                  <p className="activity-name">
                                      {act.f_name} {act.l_name} <span>completed</span> <br/>
                                      <strong>{act.quiz_title}</strong>
                                  </p>
                                  <p className="activity-time">
                                      {new Date(act.submit_time).toLocaleString()}
                                  </p>
                              </div>
                              <div className="activity-score">Score: {act.total_score}</div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Additional Info Box */}
          <div className="dashboard-panel" style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
              <div className="panel-header">Quick Insights</div>
              <p style={{color: '#475569', lineHeight: '1.6'}}>
                  You have published a total of <strong>{analytics.total_quizzes} quizzes</strong> across your courses.
              </p>
              <p style={{color: '#475569', lineHeight: '1.6'}}>
                  Use the <strong>Export Full Report</strong> button at the top of the page to download a complete CSV of all student grades. This file can be directly imported into Microsoft Excel, Google Sheets, or your university's grading software.
              </p>
          </div>

      </div>
    </main>
  );
}