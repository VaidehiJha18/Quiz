import React, { useEffect, useState } from 'react';
import Table from '../components/ui/Table'; 
import Dropdown from '../components/layout/Dropdown';
import { 
  fetchSchools, 
  fetchPrograms, 
  fetchDepartments, 
  fetchCourses, 
  fetchQuizzes,
  api 
} from '../api/apiService';

export default function ResultsPage({ role }) {
  const [selections, setSelections] = useState({
    school: '', program: '', department: '', semester: '', course: ''
  });

  const [lists, setLists] = useState({
    schools: [], programs: [], departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8], courses: []
  });

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  
  const [results, setResults] = useState([]); 
  const [pendingStudents, setPendingStudents] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false); // ✅ Added state for publishing loader
  const [viewMode, setViewMode] = useState('submitted');

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await fetchSchools();
        setLists(prev => ({ ...prev, schools: res.data || [] }));
      } catch (err) { console.error("Error loading schools:", err); }
    };
    loadInitialData();
  }, []);

  // --- FILTER HANDLERS ---
  const handleSchoolChange = async (e) => {
    const id = e.target.value;
    setSelections({ ...selections, school: id, program: '', department: '', semester: '', course: '' });
    if (id) {
      const res = await fetchPrograms(id);
      setLists(prev => ({ ...prev, programs: res.data || [] }));
    }
  };

  const handleProgramChange = async (e) => {
    const id = e.target.value;
    setSelections({ ...selections, program: id, department: '', semester: '', course: '' });
    if (id) {
      const res = await fetchDepartments(id);
      setLists(prev => ({ ...prev, departments: res.data || [] }));
    }
  };

  const handleDeptChange = (e) => setSelections({ ...selections, department: e.target.value, semester: '', course: '' });

  const handleSemesterChange = async (e) => {
    const sem = e.target.value;
    setSelections({ ...selections, semester: sem, course: '' });
    if (selections.department && sem) {
      const res = await fetchCourses(selections.department, sem);
      setLists(prev => ({ ...prev, courses: res.data || [] }));
    }
  };

  const handleCourseChange = async (e) => {
    const courseId = e.target.value;
    setSelections({ ...selections, course: courseId });
    setSelectedQuizId('');
    setResults([]);
    setPendingStudents([]);

    if (courseId) {
      try {
        const res = await fetchQuizzes(courseId); 
        setQuizzes(res.data || []);
      } catch (err) { console.error(err); }
    }
  };

  const handleQuizChange = async (e) => {
    const quizId = e.target.value;
    setSelectedQuizId(quizId);
    
    if (quizId) {
        setLoading(true);
        try {
            const resResults = await api.get(`/prof/quiz-results/${quizId}`);
            setResults(resResults.data || []);
            
            const resPending = await api.get(`/prof/quiz-pending-students/${quizId}`);
            setPendingStudents(resPending.data || []);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
      if (!window.confirm("Are you sure you want to delete this student's result? They will be able to take the quiz again.")) return;

      try {
          await api.delete(`/prof/attempts/${attemptId}`);
          alert("Result deleted successfully.");
          handleQuizChange({ target: { value: selectedQuizId } });
      } catch (err) {
          console.error(err);
          alert("Failed to delete result.");
      }
  };

  // ✅ BROUGHT BACK THE PUBLISH FUNCTION
  const handlePublish = async () => {
    setPublishing(true);
    try {
        const attemptIds = results.map(r => r.attempt_id);
        await api.post('/prof/publish-results', { attempt_ids: attemptIds });
        alert("Results Published! Students can now see them.");
        
        // Refresh the table to show updated status
        handleQuizChange({ target: { value: selectedQuizId } });
    } catch (err) {
        alert("Error publishing results.");
        console.error(err);
    } finally {
        setPublishing(false);
    }
  };

  // ✅ Check if all are published so we can disable the button
  const isAllPublished = results.length > 0 && results.every(r => r.is_published === 1 || r.is_published === true);

  const filterHandlers = { handleSchoolChange, handleDeptChange, handleProgramChange, handleSemesterChange, handleCourseChange };

  // --- SUBMITTED TABLE COLUMNS ---
  const submittedColumns = [
    { Header: 'Attempt ID', accessor: 'attemptId' },
    { Header: 'Enrollment No.', accessor: 'enrollmentNo' },
    { Header: 'Name', accessor: 'name' },
    { Header: 'Final Score', accessor: 'score' },
    { Header: 'Submitted At', accessor: 'endTime' },
    { Header: 'Status', accessor: 'status' }, // ✅ Added Status Column
    { Header: 'Response', accessor: 'responseLink' },
    ...(role !== 'student' ? [{ Header: 'Actions', accessor: 'actions' }] : [])
  ];

  const submittedData = results.map((r) => ({
    attemptId: r.attempt_id || '-',
    enrollmentNo: r.enrollment_no || 'N/A',
    name: `${r.f_name} ${r.l_name}`,
    score: r.total_score !== null ? (
      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{r.total_score}</span>
    ) : 'N/A',
    endTime: r.submit_time ? new Date(r.submit_time).toLocaleString() : '-',
    
    // ✅ Logic to display Hidden vs Published
    status: r.is_published ? (
      <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Published</span>
    ) : (
      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Hidden</span>
    ),

    responseLink: (
      <a href={`/result/${r.attempt_id}`} target="_blank" rel="noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
        View Answer Sheet
      </a>
    ),
    
    actions: role !== 'student' && (
      <button 
        onClick={() => handleDeleteAttempt(r.attempt_id)}
        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Delete
      </button>
    )
  }));

  // --- MISSING STUDENTS TABLE COLUMNS ---
  const pendingColumns = [
      { Header: 'Enrollment No.', accessor: 'enrollmentNo' },
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Status', accessor: 'status' }
  ];

  const pendingData = pendingStudents.map((s) => ({
      enrollmentNo: s.enrollment_no,
      name: `${s.f_name} ${s.l_name}`,
      email: s.email,
      status: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Not Attempted</span>
  }));

  return (
    <main className="main-content">
      <style>{`
        .results-table-container table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .results-table-container th, .results-table-container td { border: 1px solid #dcdcdc; padding: 12px 16px; text-align: left; white-space: nowrap; }
        .results-table-container th { background-color: #f8f9fa; color: #333; font-weight: 600; }
        .results-table-container tr:hover { background-color: #f1f5f9; }
        
        .toggle-btn { padding: 10px 20px; border: none; font-weight: bold; cursor: pointer; transition: all 0.2s; }
        .toggle-active { background-color: #667eea; color: white; border-radius: 20px; box-shadow: 0 2px 8px rgba(102,126,234,0.4); }
        .toggle-inactive { background-color: transparent; color: #64748b; }
      `}</style>
      
      <div className="top-bar">
        <h1>{role === 'student' ? 'Your Results' : 'Quiz Responses & Tracking'}</h1>
      </div>

      <div style={styles.card}>
        <Dropdown lists={lists} selections={selections} handlers={filterHandlers} />

        {selections.course && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                <label style={{ fontWeight: 'bold', marginRight: '15px', color: '#333' }}>Select Quiz:</label>
                <select 
                    value={selectedQuizId} 
                    onChange={handleQuizChange}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', minWidth: '300px' }}
                >
                    <option value="">-- Choose a Quiz --</option>
                    {quizzes.map(q => (
                        <option key={q.id || q.quiz_id} value={q.id || q.quiz_id}>
                            {q.quiz_title || q.title}
                        </option>
                    ))}
                </select>
            </div>
        )}
      </div>

      {selectedQuizId && (
        <div style={styles.tableCard} className="results-table-container">
          
          {/* ✅ TABS AND PUBLISH BUTTON CONTAINER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    className={`toggle-btn ${viewMode === 'submitted' ? 'toggle-active' : 'toggle-inactive'}`}
                    onClick={() => setViewMode('submitted')}
                  >
                      Submitted ({results.length})
                  </button>
                  
                  {role !== 'student' && (
                      <button 
                        className={`toggle-btn ${viewMode === 'missing' ? 'toggle-active' : 'toggle-inactive'}`}
                        onClick={() => setViewMode('missing')}
                      >
                          Missing Submissions ({pendingStudents.length})
                      </button>
                  )}
              </div>

              {/* ✅ PUBLISH ALL BUTTON (Only visible on 'Submitted' tab for professors) */}
              {role !== 'student' && viewMode === 'submitted' && (
                  <button 
                      onClick={handlePublish}
                      disabled={isAllPublished || results.length === 0 || publishing}
                      style={{
                          backgroundColor: isAllPublished ? '#22c55e' : '#667eea', // Turns green when published
                          color: 'white',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: '600',
                          cursor: isAllPublished || publishing ? 'not-allowed' : 'pointer',
                          opacity: publishing ? 0.7 : 1,
                          boxShadow: isAllPublished ? 'none' : '0 4px 6px rgba(102, 126, 234, 0.3)'
                      }}
                  >
                      {publishing ? 'Publishing...' : (isAllPublished ? 'Results Published ✓' : 'Publish All Results')}
                  </button>
              )}
          </div>

          {loading ? (
              <p>Loading data...</p>
          ) : viewMode === 'submitted' ? (
              results.length > 0 ? <Table columns={submittedColumns} data={submittedData} /> : <p>No students have submitted this quiz yet.</p>
          ) : (
              pendingStudents.length > 0 ? <Table columns={pendingColumns} data={pendingData} /> : <p style={{color: 'green', fontWeight: 'bold'}}>Everyone has completed the quiz!</p>
          )}

        </div>
      )}
    </main>
  );
}

const styles = {
  card: { background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' },
  tableCard: { backgroundColor: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '20px', border: '1px solid #eee', width: '100%', boxSizing: 'border-box', overflowX: 'auto' }
};