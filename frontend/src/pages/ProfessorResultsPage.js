// import React, { useState, useEffect, useCallback } from 'react'; 
// import { useParams, Link, useNavigate } from 'react-router-dom';
// import { api } from '../api/apiService'; 

// export default function ProfessorResultsPage() {
//   const { quizId } = useParams();
//   const navigate = useNavigate();
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [publishing, setPublishing] = useState(false);
  
//   const formatTimeTaken = (val) => {
//     const seconds = parseInt(val);
//     if (isNaN(seconds)) return 'N/A';
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}m ${secs}s`;
//   };

//   const fetchResults = useCallback(async () => {
//     try {
//       const res = await api.get(`/prof/quiz-results/${quizId}`);
//       setResults(res.data || []);
//     } catch (err) {
//       console.error("Error fetching results", err);
//     } finally {
//       setLoading(false);
//     }
//   }, [quizId]);

  
//   useEffect(() => {
//     fetchResults();
//   }, [fetchResults]);

//   const handlePublish = async () => {
//     if (results.length === 0) return;
//     setPublishing(true);
//     try {
//         const attemptIds = results.map(r => r.attempt_id);
//         await api.post('/prof/publish-results', { attempt_ids: attemptIds });
//         alert("Results Published!");
//         await fetchResults(); 
//     } catch (err) {
//         alert("Error publishing results.");
//     } finally {
//         setPublishing(false);
//     }
//   };

//   const isAllPublished = results.length > 0 && results.every(r => Number(r.is_published) === 1);

//   if (loading) return <main className="main-content"><p style={{padding: '40px', textAlign: 'center'}}>Loading Student Data...</p></main>;

//   return (
//     <main className="main-content">
//       <style>{`
//         .results-table-container table { width: 100%; border-collapse: collapse; margin-top: 15px; }
//         .results-table-container th, .results-table-container td { border: 1px solid #dcdcdc; padding: 12px 16px; text-align: center; font-size: 0.9rem; }
//         .results-table-container th { background-color: #f8f9fa; color: #333; font-weight: 600; }
//         .back-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; font-weight: 600; }
//         .back-btn:hover { background: #f8fafc; transform: translateX(-4px); }
//       `}</style>

//       <div style={styles.headerRow}>
//         <div>
//           <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
//           <h1 style={{ margin: '10px 0 0 0', color: '#2c3e50', fontSize: '1.5rem' }}>Student Quiz Attempts</h1>
//         </div>

//         <button 
//             onClick={handlePublish}
//             disabled={isAllPublished || results.length === 0 || publishing}
//             style={{
//                 ...styles.publishBtn,
//                 ...(isAllPublished ? styles.publishBtnDisabled : {}),
//             }}
//         >
//             {publishing ? 'Publishing...' : (isAllPublished ? 'Results Published ✓' : 'Publish All Results')}
//         </button>
//       </div>

//       <div style={styles.tableCard} className="results-table-container">
//         {results.length === 0 ? (
//             <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No students have attempted this quiz yet.</p>
//         ) : (
//             <table>
//               <thead>
//                 <tr>
//                   <th>Enrollment No</th>
//                   <th>Student Name</th>
//                   <th>Score</th>
//                   <th>Time Taken</th>
//                   <th>Submitted At</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {results.map((r) => (
//                   <tr key={r.attempt_id}>
//                     <td>{r.enrollment_no || 'N/A'}</td>
//                     <td>{r.f_name} {r.l_name}</td>
//                     <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{r.total_score}</td>
//                     <td>{formatTimeTaken(r.duration_seconds || r.time_taken || r.duration)}</td> 
//                     <td>{r.submit_time ? new Date(r.submit_time).toLocaleString() : 'N/A'}</td>
//                     <td>
//                       <span style={{ color: Number(r.is_published) === 1 ? '#16a34a' : '#f59e0b', fontWeight: 'bold' }}>
//                         {Number(r.is_published) === 1 ? 'Published' : 'Hidden'}
//                       </span>
//                     </td>
//                     <td>
//                       <Link to={`/result/${r.attempt_id}`} target="_blank" style={styles.viewBtn}>
//                           View Answer Sheet
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//         )}
//       </div>
//     </main>
//   );
// }

// const styles = {
//   headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' },
//   publishBtn: { backgroundColor: '#667eea', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', transition: 'background 0.3s' },
//   publishBtnDisabled: { backgroundColor: '#22c55e', cursor: 'not-allowed' },
//   tableCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflowX: 'auto' },
//   viewBtn: { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }
// };

//vaidehi
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';


export default function ProfessorResultsPage() {
  // Dropdown States
  const [schools, setSchools] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  // Selected Filter IDs
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('4');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState('');

  // Results & Audit States
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  // 1. Initial Metadata Load
  useEffect(() => {
    axios.get('/prof/schools').then(res => setSchools(res.data || [])).catch(() => {});
    axios.get('/prof/programs').then(res => setPrograms(res.data || [])).catch(() => {});
    axios.get('/prof/departments').then(res => setDepartments(res.data || [])).catch(() => {});
    axios.get('/prof/my-courses').then(res => {
      setCourses(res.data || []);
      if (res.data && res.data.length > 0) setSelectedCourse(res.data[0].id);
    }).catch(() => {});
    axios.get('/prof/quizzes').then(res => {
      setQuizzes(res.data || []);
      if (res.data && res.data.length > 0) setSelectedQuiz(res.data[0].id);
    }).catch(() => {});
  }, []);

  // 2. Fetch Quiz Results Table with Proctoring Metrics
  const fetchResults = useCallback(async (quizId) => {
    if (!quizId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/prof/quiz-results/${quizId}`);
      setResults(res.data || []);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedQuiz) {
      fetchResults(selectedQuiz);
    }
  }, [selectedQuiz, fetchResults]);

  // 3. Open Violation Snapshots Modal
  const openAuditModal = async (attemptId) => {
    setAuditLoading(true);
    try {
      const res = await axios.get(`/prof/api/quiz/attempt/${attemptId}`);
      setSelectedAudit(res.data?.violations || []);
    } catch (err) {
      alert('Failed to load violation snapshots.');
    } finally {
      setAuditLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return 'In Progress / N/A';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar Navigation */}
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ padding: '30px 40px', flex: 1 }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '20px' }}>
            Quiz Responses & Tracking
          </h2>

          {/* Filter Options Container (matches screenshot) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            marginBottom: '24px'
          }}>
            <h4 style={{ textAlign: 'center', margin: '0 0 16px 0', color: '#475569' }}>Filter Options</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Select School:</label>
                <select
                  value={selectedSchool}
                  onChange={e => setSelectedSchool(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value="">School of Technology</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.school_name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Select Program:</label>
                <select
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value="">Bachelors of Technology</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.program_name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Select Department:</label>
                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value="">Computer Science & Engineering</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.dept_name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Select Semester:</label>
                <select
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                >
                  <option value="4">Semester 4</option>
                  <option value="6">Semester 6</option>
                  <option value="8">Semester 8</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Select Course:</label>
              <select
                value={selectedCourse}
                onChange={e => setSelectedCourse(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
              >
                <option value="">Database Management System</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
              </select>
            </div>

            {/* Quiz Selector Row */}
            <div style={{
              background: '#eef2ff',
              padding: '12px 20px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}>
              <strong>Select Quiz:</strong>
              <select
                value={selectedQuiz}
                onChange={e => setSelectedQuiz(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '300px' }}
              >
                {quizzes.map(q => <option key={q.id} value={q.id}>{q.quiz_title}</option>)}
              </select>
            </div>
          </div>

          {/* Submissions Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              background: '#3b82f6',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              Submitted ({results.length})
            </span>
          </div>

          {/* Main Proctoring & Results Table */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            border: '1px solid #e2e8f0'
          }}>
            {loading ? (
              <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Loading quiz responses...</p>
            ) : results.length === 0 ? (
              <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No submissions found for this quiz.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} cellPadding="14">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '13px' }}>
                    <th>Attempt ID</th>
                    <th>Enrollment No.</th>
                    <th>Name</th>
                    <th>Score</th>
                    <th>Time Taken</th>
                    <th>Violations Count</th>
                    <th>Violations Triggered</th>
                    <th>Audit Evidence</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row) => {
                    const count = row.violation_count || 0;
                    return (
                      <tr key={row.attempt_id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13.5px' }}>
                        <td>{row.attempt_id}</td>
                        <td>{row.enrollment_no || 'N/A'}</td>
                        <td><strong>{row.name}</strong></td>
                        <td style={{ color: '#2563eb', fontWeight: 'bold' }}>
                          {parseFloat(row.final_score).toFixed(2)}
                        </td>
                        <td>
                          <strong>{formatDuration(row.duration_seconds)}</strong>
                        </td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            background: count >= 3 ? '#fee2e2' : count > 0 ? '#fef3c7' : '#ecfdf5',
                            color: count >= 3 ? '#b91c1c' : count > 0 ? '#b45309' : '#047857'
                          }}>
                            {count} / 3 Strikes
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px', fontSize: '12px', color: '#475569' }}>
                          {row.violations_triggered || 'None'}
                        </td>
                        <td>
                          <button
                            onClick={() => openAuditModal(row.attempt_id)}
                            disabled={count === 0}
                            style={{
                              padding: '6px 12px',
                              background: count > 0 ? '#7c3aed' : '#cbd5e1',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: count > 0 ? 'pointer' : 'not-allowed',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                          >
                            📷 View Snapshots ({count})
                          </button>
                        </td>
                        <td style={{ color: '#64748b' }}>{row.submitted_at}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Snapshot Evidence Viewer Modal */}
      {selectedAudit && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '750px',
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Candidate Violation Photographs</h3>
              <button
                onClick={() => setSelectedAudit(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {auditLoading ? (
              <p>Loading evidence photos...</p>
            ) : selectedAudit.length === 0 ? (
              <p style={{ color: '#64748b' }}>No violation snapshots recorded for this attempt.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {selectedAudit.map((v, idx) => (
                  <div key={idx} style={{
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                    background: '#f8fafc'
                  }}>
                    <img
                      src={v.snapshot}
                      alt={`Strike ${idx + 1}`}
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                      Strike {idx + 1}: {v.type.replace(/_/g, ' ')}
                    </div>
                    <small style={{ color: '#64748b', fontSize: '11px' }}>
                      {new Date(v.timestamp).toLocaleTimeString()}
                    </small>
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedAudit(null)}
                style={{
                  padding: '10px 20px',
                  background: '#6b46c1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}