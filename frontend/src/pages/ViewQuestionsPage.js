import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/layout/Dropdown';
import Button from '../components/forms/Button'; 
import { 
  fetchSchools, 
  fetchPrograms, 
  fetchDepartments, 
  fetchCourses, 
  deleteQuestion,       
  api // ✅ Import your raw API instance to call the specific routes
} from '../api/apiService'; 

export default function ViewQuestionsPage() {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [selections, setSelections] = useState({
    school: '', program: '', department: '', semester: '', course: ''
  });

  const [lists, setLists] = useState({
    schools: [], programs: [], departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8], courses: []
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // ✅ NEW STATE: Toggle between 'mine' and 'all'
  const [viewMode, setViewMode] = useState('mine'); 

  // --- LOAD INITIAL DATA ---
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await fetchSchools();
      setLists(prev => ({ ...prev, schools: res.data || [] }));
    } catch (err) { console.error(err); }
  };

  // --- HANDLERS ---
  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
    setSelections({ ...selections, school: schoolId, program: '', department: '', semester: '', course: '' });
    setLists(prev => ({ ...prev, programs: [], departments: [], courses: [] })); 

    if (schoolId) {
      const res = await fetchPrograms(schoolId);
      setLists(prev => ({ ...prev, programs: res.data || [] }));
    }
  };

  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setSelections({ ...selections, program: programId, department: '', semester: '', course: '' });
    setLists(prev => ({ ...prev, departments: [], courses: [] }));

    if (programId) {
      const res = await fetchDepartments(programId);
      setLists(prev => ({ ...prev, departments: res.data || [] }));
    }
  };

  const handleDeptChange = (e) => {
    setSelections({ ...selections, department: e.target.value, semester: '', course: '' });
    setLists(prev => ({ ...prev, courses: [] }));
  };

  const handleSemesterChange = async (e) => {
    const sem = e.target.value;
    setSelections({ ...selections, semester: sem, course: '' });
    
    if (selections.department && sem) {
      const res = await fetchCourses(selections.department, sem);
      setLists(prev => ({ ...prev, courses: res.data || [] }));
    }
  };

  // ✅ NEW: Master fetch function that respects the toggle
  const fetchDisplayQuestions = async (courseId, mode) => {
    if (!courseId) {
      setQuestions([]);
      return;
    }
    
    setLoading(true);
    try {
      let res;
      if (mode === 'mine') {
        // Fetches ONLY questions created by the logged-in professor for this course
        res = await api.get(`/prof/questions?course_id=${courseId}`);
      } else {
        // Fetches ALL questions for this course, regardless of creator
        res = await api.get(`/prof/questions/by_course/${courseId}`);
      }
      
      let data = res.data; 
      
      // Convert dictionary to array if needed
      if (data && typeof data === 'object' && !Array.isArray(data)) {
          data = Object.values(data);
      }
      
      setQuestions(data || []);
    } catch (err) { 
      console.error("Error fetching questions:", err); 
      setQuestions([]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelections({ ...selections, course: courseId });
    fetchDisplayQuestions(courseId, viewMode);
  };

  // ✅ NEW: Toggle handler
  const handleToggleMode = (mode) => {
    setViewMode(mode);
    fetchDisplayQuestions(selections.course, mode);
  };

  const handleDelete = async (question_id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      await deleteQuestion(question_id);
      setQuestions(prev => prev.filter(q => q.question_id !== question_id));
    } catch (error) {
      console.error("Delete failed:", error.response || error.message);
      alert("Failed to delete question");
    }
  };

  const filterHandlers = {
    handleSchoolChange, handleDeptChange, handleProgramChange, handleSemesterChange, handleCourseChange
  };
  
  const isAllSelected = selections.school && selections.program && selections.department && selections.semester && selections.course;
  
  return (
    <main className="main-content" style={styles.mainContainer}>
      
      <div className="header-row" style={styles.headerRow}>
        <h2 className="page-title">Question Bank</h2>
        <Button 
            label="Add Question" 
            onClick={() => navigate('/professor/questions/add')} 
            className="btn btn-primary"
        />
      </div>

      <div className="page-container">
        <Dropdown
          lists={lists} 
          selections={selections} 
          handlers={filterHandlers}
        />
      </div>

      {/* ✅ NEW: Toggle Buttons (Only show if a course is selected) */}
      {isAllSelected ? (
        <>
          {/* Toggle Buttons */}
          <div style={styles.toggleContainer}>
            <button 
              onClick={() => handleToggleMode('mine')} 
              style={viewMode === 'mine' ? styles.activeTab : styles.inactiveTab}
            >
              My Questions
            </button>
            <button 
              onClick={() => handleToggleMode('all')} 
              style={viewMode === 'all' ? styles.activeTab : styles.inactiveTab}
            >
              All Course Questions
            </button>
          </div>

          {/* QUESTIONS TABLE */}
          <div style={styles.tableCard}>
            {loading ? <p style={{padding:'20px', textAlign:'center'}}>Loading...</p> : (
            <table className="custom-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Unit</th> {/* ✅ ADDED HERE ❤️❤️❤️*/}
                  <th style={styles.th}>Question</th>
                  <th style={styles.th}>Option 1</th>
                  <th style={styles.th}>Option 2</th>
                  <th style={styles.th}>Option 3</th>
                  <th style={styles.th}>Option 4</th>
                  <th style={styles.th}>Solution</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q.question_id} style={styles.tableRow}>
                      <td style={styles.td}>{q.question_id}</td>
                      <td style={{...styles.td, fontWeight: 'bold', color: '#667eea'}}>Unit {q.unit || 1}</td> {/*❤️❤️❤️ ✅ ADDED HERE */}
                      <td style={styles.td}>{q.question_txt}</td>
                      <td style={styles.td}>{q.options?.[0]?.option_text || '-'}</td>
                      <td style={styles.td}>{q.options?.[1]?.option_text || '-'}</td>
                      <td style={styles.td}>{q.options?.[2]?.option_text || '-'}</td>
                      <td style={styles.td}>{q.options?.[3]?.option_text || '-'}</td>
                      <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>
                        {q.options?.find(opt => opt.is_correct === 1 || opt.is_correct === true)?.option_text || 'N/A'}
                      </td>
                      <td style={styles.td}>
                        {viewMode === 'mine' ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                              <button onClick={() => navigate(`/professor/questions/edit/${q.question_id}`)} style={styles.editBtn}>Edit</button>
                              <button onClick={() => handleDelete(q.question_id)} style={styles.deleteBtn}>Del</button>
                          </div>
                        ) : (
                          <span style={{color: '#999', fontSize: '0.85rem'}}>Read-Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#777' }}>
                      {viewMode === 'mine' ? "You haven't added any questions for this course yet." : "No questions exist for this course."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </>
      ) : (
        /* ✅ Shown when dropdowns are missing */
        <div style={{ textAlign: 'center', marginTop: '30px', color: '#666' }}>
          <p>Please select all dropdown options to view questions.</p>
        </div>
      )}
    </main>
  );
}

const styles = {
  mainContainer: { padding: '2rem 3rem', width: '100%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '2rem' },
  
  // ✅ NEW TOGGLE STYLES
  toggleContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    marginTop: '10px'
  },
  activeTab: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)'
  },
  inactiveTab: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    border: '1px solid #cbd5e1',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },

  tableCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', width: '100%', overflowX: 'auto', boxSizing: 'border-box' },
  table: { width: '100%', minWidth: '800px', borderCollapse: 'collapse', fontSize: '0.95rem' },
  tableHeaderRow: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea', textAlign: 'left' },
  th: { padding: '16px 12px', fontWeight: '600', color: '#555', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 12px', verticalAlign: 'middle', color: '#333' },
  editBtn: { backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' },
  deleteBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};