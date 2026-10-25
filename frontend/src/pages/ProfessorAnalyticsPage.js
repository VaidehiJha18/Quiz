import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/apiService';

const safeToFixed = (val, digits = 2) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '0.00';
  return Number(val).toFixed(digits);
};

export default function ProfessorAnalyticsPage() {
  const navigate = useNavigate();

  // Filters State
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('all');

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Selected Course Object
  const currentCourse = useMemo(() => {
    if (!selectedCourseId || !courses) return null;
    return courses.find((c) => String(c.id) === String(selectedCourseId)) || null;
  }, [courses, selectedCourseId]);

  // Divisions for currently selected course
  const currentDivisions = useMemo(() => {
    return currentCourse ? currentCourse.divisions || [] : [];
  }, [currentCourse]);

  // Selected Division Object
  const currentDivision = useMemo(() => {
    if (!selectedDivisionId || !currentDivisions) return null;
    return currentDivisions.find((d) => String(d.division_id) === String(selectedDivisionId)) || null;
  }, [currentDivisions, selectedDivisionId]);

  // Quizzes for currently selected division
  const currentQuizzes = useMemo(() => {
    return currentDivision ? currentDivision.quizzes || [] : [];
  }, [currentDivision]);

  // Load analytics for specific course, division & quiz
  const loadAnalytics = async (courseId, divisionId, quizId) => {
    if (!courseId || !divisionId) {
      setAnalytics(null);
      return;
    }
    setLoading(true);
    try {
      const params = { course_id: courseId, division_id: divisionId };
      if (quizId && quizId !== 'all') params.quiz_id = quizId;

      const res = await api.get('/prof/analytics', { params });
      if (res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load: Fetch Available Courses from the API without preselecting
  useEffect(() => {
    const fetchCoursesList = async () => {
      try {
        const res = await api.get('/prof/analytics');
        if (res.data && res.data.available_courses && res.data.available_courses.length > 0) {
          const loaded = res.data.available_courses.map((c) => ({
            id: String(c.course_id),
            name: c.course_name,
            divisions: c.divisions || [],
            quizzes: c.quizzes || []
          }));
          setCourses(loaded);
        } else {
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching courses list:', err);
        setCourses([]);
      }
    };

    fetchCoursesList();
  }, []);

  // Filter change handlers
  const handleCourseChange = (e) => {
    const newCourseId = e.target.value;
    setSelectedCourseId(newCourseId);
    setSelectedDivisionId('');
    setSelectedQuizId('all');
    setAnalytics(null);
  };

  const handleDivisionChange = (e) => {
    const newDivisionId = e.target.value;
    setSelectedDivisionId(newDivisionId);
    setSelectedQuizId('all');
    if (newDivisionId && selectedCourseId) {
      loadAnalytics(selectedCourseId, newDivisionId, 'all');
    } else {
      setAnalytics(null);
    }
  };

  const handleQuizChange = (e) => {
    const newQuizId = e.target.value;
    setSelectedQuizId(newQuizId);
    if (selectedCourseId && selectedDivisionId) {
      loadAnalytics(selectedCourseId, selectedDivisionId, newQuizId);
    }
  };

  // CSV Export handler
  const handleDownloadReport = async () => {
    if (!selectedCourseId || !selectedDivisionId) {
      alert('Please select a subject and division first.');
      return;
    }
    setIsExporting(true);
    try {
      const params = { 
        course_id: selectedCourseId,
        division_id: selectedDivisionId
      };
      if (selectedQuizId && selectedQuizId !== 'all') params.quiz_id = selectedQuizId;

      const res = await api.get('/prof/export-marks', { params });
      const data = res.data;

      if (!data || data.length === 0) {
        alert('No student data available to download.');
        return;
      }

      const headers = ['Quiz Title', 'Course', 'Enrollment No', 'Student Name', 'Score', 'Submitted Date'];
      const rows = data.map((row) => [
        `"${row.quiz_title || ''}"`,
        `"${row.course || ''}"`,
        `"${row.enrollment_no || ''}"`,
        `"${row.student_name || `${row.f_name || ''} ${row.l_name || ''}`.trim()}"`,
        row.total_score,
        `"${row.submit_time ? new Date(row.submit_time).toLocaleString() : ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.map((e) => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Student_Marks_${selectedCourseId}_Div${selectedDivisionId}_${selectedQuizId !== 'all' ? `Quiz_${selectedQuizId}` : 'Report'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report.');
    } finally {
      setIsExporting(false);
    }
  };

  // Safe data accessors
  const gradeDistribution = analytics?.grade_distribution || [];
  const supportStudents = analytics?.students_needing_support || [];
  const progressionList = analytics?.progression || [];
  const toughestQ = analytics?.toughest_question || null;
  const easiestQ = analytics?.easiest_question || null;
  const totalInDistribution = analytics?.distribution_total || analytics?.total_attempts || 1;

  const maxHistogramCount = useMemo(() => {
    if (gradeDistribution.length === 0) return 1;
    return Math.max(...gradeDistribution.map((b) => b.count), 1);
  }, [gradeDistribution]);

  return (
    <main className="main-content">
      <style>{`
        .analytics-container {
          max-width: 1250px;
          margin: 0 auto;
          padding: 10px 0 40px 0;
        }

        .analytics-header-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          margin-bottom: 24px;
        }
        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 20px;
        }
        .header-titles h1 {
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          color: #475569;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 7px 14px;
          border-radius: 20px;
          margin-bottom: 14px;
          transition: all 0.2s;
        }
        .back-btn:hover { background: #e2e8f0; transform: translateX(-3px); }

        .export-btn {
          background: #059669;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .export-btn:hover { background: #047857; }
        .export-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding-top: 18px;
          border-top: 1px solid #f1f5f9;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 250px;
        }
        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .custom-select {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          background-color: #f8fafc;
          color: #1e293b;
          font-size: 0.95rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }
        .custom-select:focus {
          border-color: #4f46e5;
          background-color: #ffffff;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }
        .kpi-card {
          background: #ffffff;
          padding: 22px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 4px;
        }
        .kpi-card.blue::before { background: #3b82f6; }
        .kpi-card.purple::before { background: #8b5cf6; }
        .kpi-card.green::before { background: #10b981; }
        .kpi-card.amber::before { background: #f59e0b; }

        .kpi-label {
          color: #64748b;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          margin-bottom: 8px;
        }
        .kpi-value {
          font-size: 2.1rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
          margin: 6px 0;
        }
        .kpi-subtext {
          font-size: 0.82rem;
          color: #94a3b8;
          font-weight: 500;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 950px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        .panel-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .panel-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 18px;
        }

        .histogram-container {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .histogram-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .histogram-bracket {
          width: 90px;
          font-size: 0.82rem;
          font-weight: 700;
          color: #334155;
          text-align: right;
        }
        .histogram-bar-track {
          flex: 1;
          height: 28px;
          background: #f1f5f9;
          border-radius: 6px;
          overflow: hidden;
        }
        .histogram-bar-fill {
          height: 100%;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
        }
        .histogram-count {
          width: 75px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .difficulty-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .diff-card {
          padding: 16px;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
        .diff-card.toughest {
          background: #fef2f2;
          border-color: #fecaca;
        }
        .diff-card.easiest {
          background: #f0fdf4;
          border-color: #bbf7d0;
        }
        .diff-badge {
          display: inline-block;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .toughest .diff-badge {
          background: #fee2e2;
          color: #b91c1c;
        }
        .easiest .diff-badge {
          background: #dcfce7;
          color: #15803d;
        }
        .diff-question-txt {
          font-size: 0.92rem;
          color: #1e293b;
          font-weight: 600;
          margin: 0;
          line-height: 1.45;
        }

        .progression-card {
          margin-bottom: 24px;
        }
        .svg-chart-container {
          width: 100%;
          overflow-x: auto;
        }

        .support-card {
          background: #ffffff;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #fecaca;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.05);
          margin-bottom: 24px;
        }
        .support-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .support-table th, .support-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
        }
        .support-table th {
          background: #fff1f2;
          color: #881337;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.78rem;
          letter-spacing: 0.5px;
        }
        .support-table tr:hover {
          background: #fff5f5;
        }
        .btn-view-sheet {
          display: inline-block;
          background: #4f46e5;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          text-decoration: none;
        }
        .btn-view-sheet:hover {
          background: #4338ca;
        }
        .score-badge-low {
          background: #fee2e2;
          color: #b91c1c;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .select-prompt {
          text-align: center;
          padding: 60px 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px dashed #cbd5e1;
          color: #64748b;
          font-size: 1.05rem;
          font-weight: 600;
        }
        .loading-state {
          text-align: center;
          padding: 40px;
          color: #64748b;
          font-size: 1rem;
          font-weight: 600;
        }
        .empty-text {
          color: #64748b;
          font-style: italic;
          padding: 10px 0;
          margin: 0;
        }
      `}</style>

      <div className="analytics-container">
        <button onClick={() => navigate(-1)} className="back-btn">
          &larr; Back to Dashboard
        </button>

        <div className="analytics-header-card">
          <div className="header-top">
            <div className="header-titles">
              <h1>Performance Analytics</h1>
            </div>
            <button 
              onClick={handleDownloadReport} 
              className="export-btn" 
              disabled={isExporting || !selectedCourseId || !selectedDivisionId}
            >
              {isExporting ? 'Exporting...' : 'Export CSV Marks'}
            </button>
          </div>

          <div className="filter-bar">
            <div className="filter-group">
              <label className="filter-label">1. Select Subject</label>
              <select
                className="custom-select"
                value={selectedCourseId}
                onChange={handleCourseChange}
              >
                <option value="">-- Select Subject --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">2. Select Division</label>
              <select
                className="custom-select"
                value={selectedDivisionId}
                onChange={handleDivisionChange}
                disabled={!selectedCourseId || currentDivisions.length === 0}
              >
                <option value="">-- Select Division --</option>
                {currentDivisions.map((d) => (
                  <option key={d.division_id} value={d.division_id}>
                    {d.division_name || `Division ${d.division}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">3. Select Quiz</label>
              <select
                className="custom-select"
                value={selectedQuizId}
                onChange={handleQuizChange}
                disabled={!selectedDivisionId || currentQuizzes.length === 0}
              >
                <option value="all">All Quizzes</option>
                {currentQuizzes.map((q, idx) => (
                  <option key={q.quiz_id || q.id} value={q.quiz_id || q.id}>
                    {q.quiz_title || `Quiz ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!selectedCourseId || !selectedDivisionId ? (
          <div className="select-prompt">Please select a subject and division to view performance analytics.</div>
        ) : loading && !analytics ? (
          <div className="loading-state">Loading analytics...</div>
        ) : (
          analytics && (
            <>
              {/* KPI Cards */}
              <div className="kpi-grid">
                <div className="kpi-card blue">
                  <div className="kpi-label">Student Turnout</div>
                  <div className="kpi-value">{analytics.turnout_display || `${analytics.total_attempts || 0} Submissions`}</div>
                  <div className="kpi-subtext">{analytics.total_attempts || 0} total submissions</div>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-label">Class Average Score</div>
                  <div className="kpi-value">
                    {safeToFixed(analytics.average_score, 2)}{' '}
                    <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>/ 10.0</span>
                  </div>
                  <div className="kpi-subtext">
                    Min: {safeToFixed(analytics.lowest_score, 1)} | Max: {safeToFixed(analytics.highest_score, 1)}
                  </div>
                </div>

                {/* In All Quizzes, Avg Time Taken is replaced with Students Needing Support */}
                {selectedQuizId === 'all' ? (
                  <div className="kpi-card amber">
                    <div className="kpi-label">Students Needing Support</div>
                    <div className="kpi-value" style={{ color: (analytics.at_risk_count || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                      {analytics.at_risk_count ?? 0} <span style={{ fontSize: '1.1rem' }}>Students</span>
                    </div>
                    <div className="kpi-subtext">Scoring below 50% course average</div>
                  </div>
                ) : (
                  <>
                    <div className="kpi-card green">
                      <div className="kpi-label">Avg Time Taken</div>
                      <div className="kpi-value">
                        {analytics.avg_duration_formatted || '0m 0s'}{' '}
                        <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                          / {analytics.time_limit_minutes || 20}m
                        </span>
                      </div>
                      <div className="kpi-subtext">Within 20-minute window</div>
                    </div>

                    <div className="kpi-card amber">
                      <div className="kpi-label">Students Needing Support</div>
                      <div className="kpi-value" style={{ color: (analytics.at_risk_count || 0) > 0 ? '#dc2626' : '#16a34a' }}>
                        {analytics.at_risk_count ?? 0} <span style={{ fontSize: '1.1rem' }}>Students</span>
                      </div>
                      <div className="kpi-subtext">Scoring below 50% (&lt; 5.0 marks)</div>
                    </div>
                  </>
                )}
              </div>

              {/* Grade Distribution & Question Insights */}
              <div className="charts-grid">
                <div className="panel-card">
                  <div className="panel-title">Grade Distribution</div>

                  <div className="histogram-container">
                    {gradeDistribution.length > 0 ? (
                      gradeDistribution.map((bracket, idx) => {
                        const pctOfTotal =
                          totalInDistribution > 0
                            ? Math.round((bracket.count / totalInDistribution) * 100)
                            : 0;
                        const barWidthPct =
                          maxHistogramCount > 0 ? (bracket.count / maxHistogramCount) * 100 : 0;

                        return (
                          <div className="histogram-row" key={idx}>
                            <div className="histogram-bracket">{bracket.bracket}</div>
                            <div className="histogram-bar-track">
                              <div
                                className="histogram-bar-fill"
                                style={{
                                  width: `${Math.max(barWidthPct, bracket.count > 0 ? 8 : 0)}%`,
                                  backgroundColor: bracket.color
                                }}
                              >
                                {bracket.count > 0 && (
                                  <span style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 'bold' }}>
                                    {pctOfTotal}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="histogram-count">
                              {bracket.count} {bracket.count === 1 ? 'student' : 'students'}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="empty-text">No grade distribution available.</p>
                    )}
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-title">Question Difficulty Insights</div>

                  <div className="difficulty-container">
                    {toughestQ ? (
                      <div className="diff-card toughest">
                        <div className="diff-badge">
                          Toughest Question: Only {toughestQ.correct_pct}% Correct
                        </div>
                        <p className="diff-question-txt">
                          "{toughestQ.question_txt}"
                        </p>
                      </div>
                    ) : (
                      <p className="empty-text">No question data available.</p>
                    )}

                    {easiestQ && (
                      <div className="diff-card easiest">
                        <div className="diff-badge">
                          Easiest Question: {easiestQ.correct_pct}% Correct
                        </div>
                        <p className="diff-question-txt">
                          "{easiestQ.question_txt}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progression Line Chart (Only shown in All Quizzes mode) */}
              {selectedQuizId === 'all' && progressionList.length > 1 && (
                <div className="panel-card progression-card">
                  <div className="panel-title">Quiz-over-Quiz Progression</div>

                  <div className="svg-chart-container">
                    <svg viewBox="0 0 700 180" style={{ width: '100%', height: 'auto', maxHeight: '200px' }}>
                      <line x1="50" y1="30" x2="650" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                      <line x1="50" y1="75" x2="650" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                      <line x1="50" y1="120" x2="650" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                      <line x1="50" y1="150" x2="650" y2="150" stroke="#e2e8f0" strokeWidth="1.5" />

                      <text x="35" y="34" fontSize="11" fill="#94a3b8" textAnchor="end">10.0</text>
                      <text x="35" y="79" fontSize="11" fill="#94a3b8" textAnchor="end">7.0</text>
                      <text x="35" y="124" fontSize="11" fill="#94a3b8" textAnchor="end">4.0</text>
                      <text x="35" y="154" fontSize="11" fill="#94a3b8" textAnchor="end">0.0</text>

                      {(() => {
                        const count = progressionList.length;
                        const stepX = 600 / (count - 1);
                        const points = progressionList.map((p, i) => {
                          const x = 50 + i * stepX;
                          const scoreVal = Number(p.average_score || 0);
                          const y = 150 - (scoreVal / 10) * 120;
                          return `${x},${y}`;
                        }).join(' ');

                        return (
                          <>
                            <polyline
                              fill="none"
                              stroke="#6366f1"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                            />
                            {progressionList.map((p, i) => {
                              const x = 50 + i * stepX;
                              const scoreVal = Number(p.average_score || 0);
                              const y = 150 - (scoreVal / 10) * 120;
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={y} r="6" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
                                  <text x={x} y={y - 12} fontSize="12" fontWeight="bold" fill="#1e293b" textAnchor="middle">
                                    {safeToFixed(p.average_score, 2)}
                                  </text>
                                  <text x={x} y="172" fontSize="11" fontWeight="600" fill="#64748b" textAnchor="middle">
                                    {p.short_label}
                                  </text>
                                </g>
                              );
                            })}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>
              )}

              {/* Students Needing Support Section */}
              <div className="support-card">
                <div className="panel-title" style={{ color: '#991b1b', marginBottom: '14px' }}>
                  {selectedQuizId === 'all' 
                    ? 'Students Needing Support (< 50% Average)' 
                    : 'Students Needing Support (< 50%)'}
                </div>

                {supportStudents.length === 0 ? (
                  <p className="empty-text" style={{ padding: '10px 0' }}>No students scored below 50%.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="support-table">
                      <thead>
                        {selectedQuizId === 'all' ? (
                          <tr>
                            <th>Enrollment No.</th>
                            <th>Student Name</th>
                            <th>Average Score</th>
                            <th>Past Quiz Scores</th>
                          </tr>
                        ) : (
                          <tr>
                            <th>Enrollment No.</th>
                            <th>Student Name</th>
                            <th>Score</th>
                            <th>Time Taken</th>
                            <th>Submitted At</th>
                            <th>Action</th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {supportStudents.map((student, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600', color: '#334155' }}>
                              {student.enrollment_no || 'N/A'}
                            </td>
                            <td>
                              <strong>{student.name}</strong>
                            </td>
                            {selectedQuizId === 'all' ? (
                              <>
                                <td style={{ fontWeight: '600', color: '#1e293b' }}>
                                  {safeToFixed(student.avg_score, 2)} / 10.0
                                </td>
                                <td style={{ color: '#475569', fontSize: '0.9rem' }}>
                                  {student.past_scores || '-'}
                                </td>
                              </>
                            ) : (
                              <>
                                <td style={{ fontWeight: '600', color: '#1e293b' }}>
                                  {safeToFixed(student.score, 2)} / 10.0
                                </td>
                                <td>{student.duration_formatted}</td>
                                <td>{student.submit_time}</td>
                                <td>
                                  <a
                                    href={`/result/${student.attempt_id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-view-sheet"
                                  >
                                    View Answer Sheet
                                  </a>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}
