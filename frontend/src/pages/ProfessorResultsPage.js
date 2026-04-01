import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/apiService'; 

export default function ProfessorResultsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  
  const formatTimeTaken = (val) => {
    const seconds = parseInt(val);
    if (isNaN(seconds)) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const fetchResults = useCallback(async () => {
    try {
      const res = await api.get(`/prof/quiz-results/${quizId}`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Error fetching results", err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handlePublish = async () => {
    if (results.length === 0) return;
    setPublishing(true);
    try {
        const attemptIds = results.map(r => r.attempt_id);
        await api.post('/prof/publish-results', { attempt_ids: attemptIds });
        alert("Results Published!");
        await fetchResults(); 
    } catch (err) {
        alert("Error publishing results.");
    } finally {
        setPublishing(false);
    }
  };

  const isAllPublished = results.length > 0 && results.every(r => Number(r.is_published) === 1);

  if (loading) return <main className="main-content"><p style={{padding: '40px', textAlign: 'center'}}>Loading Student Data...</p></main>;

  return (
    <main className="main-content">
      <style>{`
        .results-table-container table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .results-table-container th, .results-table-container td { border: 1px solid #dcdcdc; padding: 12px 16px; text-align: center; font-size: 0.9rem; }
        .results-table-container th { background-color: #f8f9fa; color: #333; font-weight: 600; }
        .back-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .back-btn:hover { background: #f8fafc; transform: translateX(-4px); }
      `}</style>

      <div style={styles.headerRow}>
        <div>
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
          <h1 style={{ margin: '10px 0 0 0', color: '#2c3e50', fontSize: '1.5rem' }}>Student Quiz Attempts</h1>
        </div>

        <button 
            onClick={handlePublish}
            disabled={isAllPublished || results.length === 0 || publishing}
            style={{
                ...styles.publishBtn,
                ...(isAllPublished ? styles.publishBtnDisabled : {}),
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
                  <th>Score</th>
                  <th>Time Taken</th>
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
                    <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{r.total_score}</td>
                    <td>{formatTimeTaken(r.duration_seconds || r.time_taken || r.duration)}</td> 
                    <td>{r.submit_time ? new Date(r.submit_time).toLocaleString() : 'N/A'}</td>
                    <td>
                      <span style={{ color: Number(r.is_published) === 1 ? '#16a34a' : '#f59e0b', fontWeight: 'bold' }}>
                        {Number(r.is_published) === 1 ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/result/${r.attempt_id}`} target="_blank" style={styles.viewBtn}>
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

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' },
  publishBtn: { backgroundColor: '#667eea', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s' },
  publishBtnDisabled: { backgroundColor: '#22c55e', cursor: 'not-allowed' },
  tableCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflowX: 'auto' },
  viewBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }
};
