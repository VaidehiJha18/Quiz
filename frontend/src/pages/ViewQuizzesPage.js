import React, { useEffect, useState } from 'react';
import { fetchQuizzes, deleteQuiz, fetchDivisions, publishQuiz } from '../api/apiService';

export default function ViewQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Modal State (From Publish Logic) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [publishing, setPublishing] = useState(false);

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
      // Update UI
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
    window.location.href = `/take-quiz/${token}`;
  };

  // --- Publish Handlers ---  ❤️❤️❤️❤️❤️
  const handlePublishClick = async (quiz) => {
    setSelectedQuiz(quiz);
    setAvailableDivisions([]); // Reset
    setSelectedDivision('');
    setTimeLimit(quiz.duration || 10); // Default to existing duration or 10
    setIsModalOpen(true);

    // Fetch valid divisions for this specific course & teacher
    try {
        // Note: Ensure your quiz object has course_id. 
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

    setPublishing(true);
    try {
        await publishQuiz(selectedQuiz.id, {
            time_limit: parseInt(timeLimit),
            division_ids: [parseInt(selectedDivision)] 
        });
        
        alert("Quiz Published Successfully!");
        setIsModalOpen(false);
        loadQuizzes(); // Refresh list to show updated status
    } catch (err) {
        console.error("Publish failed:", err);
        alert("Failed to publish quiz.");
    } finally {
        setPublishing(false);
    }
  };   // ❤️❤️❤️❤️❤️

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading quizzes...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content" style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#333' }}>
          All Your Generated Quizzes
        </h1>

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: '8px', marginBottom: '20px', color: '#c33' }}>
            {error}
          </div>
        )}

        {quizzes.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>No quizzes found</p>
            <button
              onClick={() => window.location.href = '/professor/generate-quiz'}
              style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
            >
              Generate New Quiz
            </button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={headerStyle}>Quiz Title</th>
                    <th style={headerStyle}>Teacher</th>
                    <th style={headerStyle}>School</th>
                    <th style={headerStyle}>Department</th>
                    <th style={headerStyle}>Program</th>
                    <th style={headerStyle}>Semester</th>
                    <th style={headerStyle}>Course</th>
                    <th style={headerStyle}>Qs</th>
                    <th style={headerStyle}>Status</th>
                    <th style={headerStyle}>Quiz Link</th>
                    <th style={headerStyle}>Generated On</th>
                    <th style={headerStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz, index) => (
                    <tr key={quiz.id} style={{ backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={cellStyle}>{quiz.quiz_title || quiz.title || 'Untitled'}</td>
                      <td style={cellStyle}>{quiz.teacher || '-'}</td>
                      <td style={cellStyle}>{quiz.school || '-'}</td>
                      <td style={cellStyle}>{quiz.department || '-'}</td>
                      <td style={cellStyle}>{quiz.program || '-'}</td>
                      <td style={cellStyle}>{quiz.semester || '-'}</td>
                      <td style={cellStyle}>{quiz.course || quiz.course_id || '-'}</td>
                      <td style={{ ...cellStyle, textAlign: 'center' }}>
                         {quiz.total_questions || quiz.totalQuestions || 0}
                      </td>
                      <td style={cellStyle}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: quiz.status === 'Published' ? '#d1fae5' : '#fef3c7',
                          color: quiz.status === 'Published' ? '#065f46' : '#92400e'
                        }}>
                          {quiz.status || 'Active'}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <a 
                          href={`/take-quiz/${quiz.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Open Quiz
                        </a>
                      </td>
                      <td style={cellStyle}>{formatDate(quiz.created_at)}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {/* Publish Button */}
                          <button
                            onClick={() => handlePublishClick(quiz)}
                            disabled={quiz.status === 'Published'}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: quiz.status === 'Published' ? '#9ca3af' : '#22c55e',
                              color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer',
                              fontSize: '12px', fontWeight: '500'
                            }}
                          >
                            {quiz.status === 'Published' ? 'Published' : 'Publish'}
                          </button>

                          {/* Preview Button */}
                          <button
                            onClick={() => handleReviewEdit(quiz.token)}
                            style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                          >
                            Preview
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(quiz.id)}
                            style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
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
        
        {/* Action Buttons */}
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button
            onClick={() => window.location.href = '/professor/generate-quiz'}
            style={{ padding: '12px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
            >
            Generate New Quiz
            </button>
            <button
            onClick={() => window.location.href = '/professor/dashboard'}
            style={{ padding: '12px 24px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: 'pointer' }}
            >
            Back to Home
            </button>
        </div>

        {/* --- Publish Modal --- */}
        {isModalOpen && selectedQuiz && (
            <div style={modalOverlayStyle}>
                <div style={modalContentStyle}>
                    <h2 style={{marginTop:0}}>Publish Quiz</h2>
                    <p style={{color:'#666', fontSize:'14px'}}>Configure settings for: <strong>{selectedQuiz.quiz_title}</strong></p>
                    
                    <div style={infoGridStyle}>
                        <div style={infoItemStyle}><label>School:</label> <span>{selectedQuiz.school}</span></div>
                        <div style={infoItemStyle}><label>Department:</label> <span>{selectedQuiz.department}</span></div>
                        <div style={infoItemStyle}><label>Program:</label> <span>{selectedQuiz.program}</span></div>
                        <div style={infoItemStyle}><label>Semester:</label> <span>{selectedQuiz.semester}</span></div>
                        <div style={infoItemStyle}><label>Course:</label> <span>{selectedQuiz.course}</span></div>
                    </div>

                    <hr style={{margin:'20px 0', border:'0', borderTop:'1px solid #eee'}}/>

                    <div style={{marginBottom:'15px'}}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Time Limit (Minutes)</label>
                        <input 
                            type="number" 
                            value={timeLimit} 
                            onChange={(e) => setTimeLimit(e.target.value)}
                            style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                        />
                    </div>

                    <div style={{marginBottom:'20px'}}>
                        <label style={{display:'block', marginBottom:'5px', fontWeight:'bold'}}>Select Division</label>
                        <select 
                            value={selectedDivision} 
                            onChange={(e) => setSelectedDivision(e.target.value)}
                            style={{width:'100%', padding:'8px', borderRadius:'4px', border:'1px solid #ccc'}}
                        >
                            <option value="">-- Select Division --</option>
                            {availableDivisions.length > 0 ? (
                                availableDivisions.map(div => (
                                    <option key={div.id} value={div.id}>{div.division}</option>
                                ))
                            ) : (
                                <option disabled>No divisions found for you in this course</option>
                            )}
                        </select>
                        <p style={{fontSize:'12px', color:'#888', marginTop:'5px'}}>
                            * Only showing divisions you are assigned to teach for this course.
                        </p>
                    </div>

                    <div style={{display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            style={{padding:'8px 16px', backgroundColor:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer'}}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmPublish}
                            disabled={publishing}
                            style={{padding:'8px 16px', backgroundColor:'#22c55e', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                        >
                            {publishing ? 'Publishing...' : 'Confirm Publish'}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}

// Styles
const headerStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151', position: 'sticky', top: 0, backgroundColor: '#f3f4f6', zIndex: 10, boxShadow: '0 2px 2px -1px rgba(0, 0, 0, 0.1)' };
const cellStyle = { padding: '12px 16px', fontSize: '13px', color: '#4b5563' };
const modalOverlayStyle = { position: 'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000 };
const modalContentStyle = { backgroundColor:'white', padding:'30px', borderRadius:'8px', width:'500px', maxWidth:'90%', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' };
const infoGridStyle = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', backgroundColor:'#f9fafb', padding:'15px', borderRadius:'6px', fontSize:'13px' };
const infoItemStyle = { display:'flex', flexDirection:'column', gap:'2px' };