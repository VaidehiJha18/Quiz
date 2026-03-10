import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/apiService'; 

export default function ProfessorResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Fetch the big table of results
  const fetchResults = async () => {
    try {
      const res = await api.get(`/prof/quiz-results/${quizId}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Error fetching results", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  // Function to Publish All
  const handlePublish = async () => {
    setPublishing(true);
    try {
        const attemptIds = results.map(r => r.attempt_id);
        await api.post('/prof/publish-results', { attempt_ids: attemptIds });
        alert("Results Published! Students can now see them.");
        
        // Refresh data without reloading the whole page
        await fetchResults(); 
    } catch (err) {
        alert("Error publishing results.");
        console.error(err);
    } finally {
        setPublishing(false);
    }
  };

  // ✅ LOGIC: Check if every single attempt in the array is published
  // If array is empty, it returns false.
  const isAllPublished = results.length > 0 && results.every(r => r.is_published === 1 || r.is_published === true);

  if (loading) return <main className="main-content"><p style={{padding: '40px', textAlign: 'center'}}>Loading Student Data...</p></main>;

  return (
    <main className="main-content">
      {/* ✅ INJECTED CSS TO MATCH YOUR ResultsPage.js TABLE STYLE */}
      <style>{`
        .results-table-container table {
          width: 100%;
          border-collapse: collapse; 
          margin-top: 15px;
        }
        .results-table-container th, 
        .results-table-container td {
          border: 1px solid #dcdcdc; 
          padding: 12px 16px; 
          text-align: center; 
          white-space: nowrap; 
        }
        .results-table-container th {
          background-color: #f8f9fa; 
          color: #333;
          font-weight: 600;
        }
        .results-table-container tr:hover {
          background-color: #f1f5f9; 
        }

        /* ✅ NEW BACK BUTTON STYLES */
        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .back-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
          transform: translateX(-4px); /* Moves it slightly left on hover */
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
      `}</style>

      <div style={styles.headerRow}>
        <div>
          <button onClick={() => navigate(-1)} className="back-btn">
            <span style={{ fontSize: '1.2rem', lineHeight: '1' }}>←</span> Back
          </button>
          <h1 style={{ margin: '10px 0 0 0', color: '#2c3e50' }}>Student Quiz Attempts</h1>
        </div>

        {/* ✅ DYNAMIC BUTTON: Changes color and disables if already published */}
        <button 
            onClick={handlePublish}
            disabled={isAllPublished || results.length === 0 || publishing}
            style={{
                ...styles.publishBtn,
                ...(isAllPublished ? styles.publishBtnDisabled : {}),
                ...(publishing ? styles.publishBtnLoading : {})
            }}
        >
            {publishing ? 'Publishing...' : (isAllPublished ? 'Results Published ✓' : 'Publish All Results')}
        </button>
      </div>

      <div style={styles.tableCard} className="results-table-container">
        {results.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No students have attempted this quiz yet.</p>
        ) : (
            <table>
              <thead>
                <tr>
                  <th>Enrollment No</th>
                  <th>Student Name</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Score</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attempt_id}>
                    <td>{r.enrollment_no || 'N/A'}</td>
                    <td>{r.f_name} {r.l_name}</td>
                    <td>{r.course_name || 'N/A'}</td>
                    <td>Sem {r.sem_no || 'N/A'}</td>
                    <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{r.total_score}</td>
                    <td>{new Date(r.submit_time).toLocaleString()}</td>
                    <td>
                      {r.is_published ? (
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Published</span>
                      ) : (
                          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Hidden</span>
                      )}
                    </td>
                    <td>
                      <Link 
                          to={`/result/${r.attempt_id}`} 
                          target="_blank"
                          style={styles.viewBtn}
                      >
                          View Answer Sheet
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>
    </main>
  );
}

// --- CSS STYLES ---
const styles = {
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '20px',
    width: '100%'
  },
  publishBtn: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
    boxShadow: '0 4px 6px rgba(102, 126, 234, 0.3)',
    transition: 'all 0.2s ease',
  },
  publishBtnDisabled: {
    backgroundColor: '#22c55e', // Green when fully published
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  publishBtnLoading: {
    opacity: 0.7,
    cursor: 'wait'
  },
  tableCard: {
    backgroundColor: '#fff',
    padding: '25px', 
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #eee', 
    width: '100%',             
    boxSizing: 'border-box',   
    overflowX: 'auto'          
  },
  viewBtn: {
    backgroundColor: '#eff6ff',   
    color: '#2563eb',             
    border: '1px solid #bfdbfe',  
    padding: '6px 14px',
    borderRadius: '6px',
    textDecoration: 'none',       
    fontWeight: '600',
    fontSize: '0.85rem',
    display: 'inline-block',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }
};