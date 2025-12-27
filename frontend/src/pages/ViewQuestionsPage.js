import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/layout/Dropdown';
import Button from '../components/forms/Button'; 
import { Link } from 'react-router-dom';
import { 
  fetchSchools, 
  fetchPrograms, 
  fetchDepartments, 
  fetchCourses, 
  fetchQuestionsByCourse, 
  deleteQuestion,       
  // fetchQuestions,
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

const handleCourseChange = async (e) => {
  const courseId = e.target.value;
  setSelections({ ...selections, course: courseId });
  
  if (courseId) {
    setLoading(true);
    try {
      const res = await fetchQuestionsByCourse(courseId);
      
      console.log("API Response Status:", res.status);
      console.log("API Response Data:", res.data);
      
      let data = res.data; 
      
      // If the data is an object (dictionary with ID keys), convert it to an array of values
      if (data && typeof data === 'object' && !Array.isArray(data)) {
          data = Object.values(data);
      }
      
      setQuestions(data || []);

    } catch (err) { 
      console.error("Error fetching questions by course:", err); 
      setQuestions([]);
    }
    finally { 
      setLoading(false); 
    }
  } else {
    setQuestions([]);
  }
};

const handleDelete = async (question_id) => {
  if (!window.confirm("Delete this question?")) return;
  if (!window.confirm("Are you sure you want to delete this question?")) return;

  try {
    console.log("Deleting question with ID:", question_id);

    await deleteQuestion(question_id);

    setQuestions(prev =>
      prev.filter(q => q.question_id !== question_id)
    );

  } catch (error) {
    console.error("Delete failed:", error.response || error.message);
    alert("Failed to delete question");
  }
};

  const filterHandlers = {
    handleSchoolChange,
    handleDeptChange,
    handleProgramChange,
    handleSemesterChange,
    handleCourseChange
  };

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

      {/* --- FILTER CARD (UPDATED LAYOUT) --- */}
        <div className="page-container">
          <Dropdown
            lists={lists} 
            selections={selections} 
            handlers={filterHandlers}
          />
        {/* ✅ GRID LAYOUT END */}
      </div>

      {/* --- QUESTIONS TABLE --- */}
      <div style={styles.tableCard}>
        {loading ? <p style={{padding:'20px', textAlign:'center'}}>Loading...</p> : (
        <table className="custom-table" style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>ID</th>
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
                  <td style={styles.td}>{q.question_txt}</td>
                  <td style={styles.td}>{q.options?.[0]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[1]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[2]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[3]?.option_text || '-'}</td>
                  <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>
                    {q.options?.find(opt => opt.is_correct === 1)?.option_text || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => navigate(`/professor/questions/edit/${q.question_id}`)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(q.question_id)} style={styles.deleteBtn}>Del</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#777' }}>
                  {selections.course ? "No questions found." : "Please select a Course to view questions."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>
    </main>
  );
}

const styles = {
  // Add these new styles
  mainContainer: {
    padding: '2rem 3rem',
    width: '100%'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '2rem'
  },
  
  // TABLE STYLES
  tableCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    width: '100%',
    overflowX: 'auto',
    boxSizing: 'border-box'
  },
  table: { width: '100%', minWidth: '800px', borderCollapse: 'collapse', fontSize: '0.95rem' },
  tableHeaderRow: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea', textAlign: 'left' },
  th: { padding: '16px 12px', fontWeight: '600', color: '#555', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 12px', verticalAlign: 'middle', color: '#333' },
  editBtn: { backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' },
  deleteBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};