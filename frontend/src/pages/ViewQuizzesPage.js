import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuizzes, deleteQuiz, fetchDivisions, publishQuiz } from '../api/apiService';

export default function ViewQuizzesPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal State (Publish & Scheduling Logic) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [publishing, setPublishing] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  
  // Scheduling State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchQuizzes();
      console.log('Fetched quizzes:', res.data); 
      setQuizzes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch quizzes:", err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      alert('Quiz deleted successfully!');
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const handleReviewEdit = (token) => {
    if (!token) {
        alert("Error: This quiz has no token.");
        return;
    }
    navigate(`/professor/preview/${token}`);
  };

  // --- Publish Handlers --- 
  const handlePublishClick = async (quiz) => {
    setSelectedQuiz(quiz);
    setPublishTitle(quiz.quiz_title || quiz.title || ''); 
    setAvailableDivisions([]); 
    setSelectedDivision('');
    setTimeLimit(quiz.duration || 10);
    setStartTime('');
    setEndTime('');

    setIsModalOpen(true);

    try {
        if(quiz.course_id || quiz.course) {
            const res = await fetchDivisions(quiz.course_id); 
            setAvailableDivisions(res.data || []);
        }
    } catch (err) {
        console.error("Error fetching divisions:", err);
        alert("Could not load divisions for this course.");
    }
  };

  const handleConfirmPublish = async () => {
    if (!selectedDivision) {
        alert("Please select a division.");
        return;
    }
    if (!publishTitle.trim()) {
        alert("Please enter a Quiz Name/Title.");
        return;
    }
    if (!startTime || !endTime) {
        alert("Please select both a Start Time and End Time.");
        return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
        alert("Start time must be before end time.");
        return;
    }

    setPublishing(true);
    try {
        await publishQuiz(selectedQuiz.id, {
            time_limit: parseInt(timeLimit),
            division_ids: [parseInt(selectedDivision)],
            quiz_title: publishTitle,
            start_time: startTime,
            end_time: endTime
        });
        
        alert("Quiz Scheduled & Published Successfully!");
        setIsModalOpen(false);
        loadQuizzes();
    } catch (err) {
        console.error("Publish failed:", err);
        // Extract the specific backend error message (e.g. 409 conflict message)
        const errorMessage = err.response?.data?.message || "Failed to publish quiz. Please try again.";
        alert(errorMessage);
    } finally {
        setPublishing(false);
    }
  };

  // ✅ Correct local time formatter
  const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  // Parse date string without forcing UTC 'Z'
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

  // Helper to display Start to End window
  const formatScheduleWindow = (start, end) => {
    if (!start || !end) return <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unscheduled</span>;
    return (
      <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
        <div style={{ color: '#166534' }}><strong>Start:</strong> {formatDate(start)}</div>
        <div style={{ color: '#991b1b' }}><strong>End:</strong> {formatDate(end)}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="main-content" style={{ padding: '40px 20px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>Loading quizzes...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ padding: '30px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
              All Your Generated Quizzes
            </h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
              Review, schedule, publish, and manage all generated quizzes across your courses.
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/professor/generate-quiz'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              fontSize: '14px', 
              fontWeight: '600', 
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
          >
            + Generate New Quiz
          </button>
        </div>

        {error && (
          <div style={{ padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px', color: '#991b1b', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '18px', color: '#475569', marginBottom: '20px', fontWeight: '500' }}>No quizzes found</p>
            <button
              onClick={() => window.location.href = '/professor/generate-quiz'}
              style={{ padding: '12px 24px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
              Generate Your First Quiz
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={headerStyle}>Quiz Title</th>
                    <th style={headerStyle}>Teacher</th>
                    <th style={headerStyle}>School</th>
                    <th style={headerStyle}>Department</th>
                    <th style={headerStyle}>Program</th>
                    <th style={headerStyle}>Semester</th>
                    <th style={headerStyle}>Course</th>
                    <th style={headerStyle}>Division</th>
                    <th style={{ ...headerStyle, textAlign: 'center' }}>Qs</th>
                    <th style={headerStyle}>Status</th>
                    <th style={headerStyle}>Scheduled Window</th>
                    <th style={headerStyle}>Generated On</th>
                    <th style={{ ...headerStyle, textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, index) => (
                    <tr 
                      key={quiz.id} 
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', 
                        borderBottom: '1px solid #f1f5f9'
                      }}
                    >
                      <td style={{ ...cellStyle, fontWeight: '600', color: '#0f172a' }}>
                        {quiz.quiz_title || quiz.title || 'Untitled Quiz'}
                      </td>
                      <td style={cellStyle}>{quiz.teacher || '-'}</td>
                      <td style={cellStyle}>{quiz.school || '-'}</td>
                      <td style={cellStyle}>{quiz.department || '-'}</td>
                      <td style={cellStyle}>{quiz.program || '-'}</td>
                      <td style={cellStyle}>{quiz.semester || '-'}</td>
                      <td style={cellStyle}>{quiz.course || quiz.course_id || '-'}</td>
                      <td style={cellStyle}>
                        <span style={{ 
                          padding: '3px 10px', 
                          backgroundColor: quiz.published_divisions && quiz.published_divisions !== 'Not Assigned' ? '#e0f2fe' : '#f1f5f9',
                          color: quiz.published_divisions && quiz.published_divisions !== 'Not Assigned' ? '#0369a1' : '#64748b',
                          borderRadius: '20px',
                          fontWeight: '600',
                          fontSize: '12px',
                          display: 'inline-block'
                        }}>
                          {quiz.published_divisions || 'Not Assigned'}
                        </span>
                      </td>
                      <td style={{ ...cellStyle, textAlign: 'center', fontWeight: '600', color: '#334155' }}>
                         {quiz.total_questions || quiz.totalQuestions || 0}
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: quiz.status === 'Published' ? '#dcfce7' : '#fef3c7',
                          color: quiz.status === 'Published' ? '#15803d' : '#b45309',
                          display: 'inline-block'
                        }}>
                          {quiz.status || 'Active'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        {formatScheduleWindow(quiz.start_time, quiz.end_time)}
                      </td>
                      <td style={cellStyle}>{formatDate(quiz.created_at)}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handlePublishClick(quiz)}
                            disabled={quiz.status === 'Published' && quiz.start_time && quiz.end_time}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: (quiz.status === 'Published' && quiz.start_time && quiz.end_time) ? '#cbd5e1' : '#16a34a',
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: (quiz.status === 'Published' && quiz.start_time && quiz.end_time) ? 'not-allowed' : 'pointer',
                              fontSize: '12px', 
                              fontWeight: '600'
                            }}
                          >
                            {(quiz.status === 'Published' && quiz.start_time && quiz.end_time) ? 'Published' : 'Publish'}
                          </button>

                          <button
                            onClick={() => handleReviewEdit(quiz.token)}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#2563eb', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
                              fontWeight: '600' 
                            }}
                          >
                            Preview
                          </button>

                          <button
                            onClick={() => handleDelete(quiz.id)}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#dc2626', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontSize: '12px', 
                              fontWeight: '600' 
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Navigation Button */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
            <button
            onClick={() => window.location.href = '/professor/dashboard'}
            style={{ padding: '12px 24px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}
            >
            Back to Home
            </button>
        </div>

        {/* --- Publish & Schedule Modal --- */}
        {isModalOpen && selectedQuiz && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: '700' }}>
                        Schedule & Publish Quiz
                      </h2>
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        style={{ border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
                      >
                        ✕
                      </button>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px 0' }}>
                      Configure schedule and division settings for: <strong style={{ color: '#0f172a' }}>{selectedQuiz.quiz_title}</strong>
                    </p>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Quiz Title</label>
                        <input 
                            type="text" 
                            value={publishTitle}
                            onChange={(e) => setPublishTitle(e.target.value)}
                            placeholder="e.g., Midterm Exam: Unit 1"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={labelStyle}>Time Limit (Minutes)</label>
                        <input 
                            type="number" 
                            value={timeLimit} 
                            onChange={(e) => setTimeLimit(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div>
                          <label style={labelStyle}>Start Time</label>
                          <input 
                              type="datetime-local" 
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              style={inputStyle}
                              required
                          />
                      </div>

                      <div>
                          <label style={labelStyle}>End Time</label>
                          <input 
                              type="datetime-local" 
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              style={inputStyle}
                              required
                          />
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Target Division</label>
                        <select 
                            value={selectedDivision} 
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">-- Select Division --</option>
                            {availableDivisions.length > 0 ? (
                                availableDivisions.map(div => (
                                    <option key={div.id} value={div.id}>{div.division}</option>
                                ))
                            ) : (
                                <option disabled>No divisions assigned for this course</option>
                            )}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            style={{ padding: '9px 18px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmPublish}
                            disabled={publishing}
                            style={{ padding: '9px 18px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                            {publishing ? 'Publishing...' : 'Confirm & Publish'}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </main>
  );
}

// --- Inline Styles ---
const headerStyle = { 
  padding: '14px 16px', 
  fontSize: '12px', 
  fontWeight: '700', 
  color: '#475569', 
  textTransform: 'uppercase', 
  letterSpacing: '0.05em' 
};

const cellStyle = { 
  padding: '14px 16px', 
  fontSize: '13px', 
  color: '#334155',
  verticalAlign: 'middle'
};

const modalOverlayStyle = { 
  position: 'fixed', 
  top: 0, 
  left: 0, 
  right: 0, 
  bottom: 0, 
  backgroundColor: 'rgba(15, 23, 42, 0.6)', 
  backdropFilter: 'blur(4px)',
  display: 'flex', 
  justifyContent: 'center', 
  alignItems: 'center', 
  zIndex: 1000 
};

const modalContentStyle = { 
  backgroundColor: 'white', 
  padding: '28px', 
  borderRadius: '12px', 
  width: '520px', 
  maxWidth: '90%', 
  maxHeight: '90vh', 
  overflowY: 'auto', 
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
};

const labelStyle = { 
  display: 'block', 
  marginBottom: '6px', 
  fontWeight: '600', 
  fontSize: '13px',
  color: '#1e293b' 
};

const inputStyle = { 
  width: '100%', 
  padding: '9px 12px', 
  borderRadius: '6px', 
  border: '1px solid #cbd5e1', 
  fontSize: '13px',
  boxSizing: 'border-box',
  outline: 'none',
  backgroundColor: '#ffffff'
};