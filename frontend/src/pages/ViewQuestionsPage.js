import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchSchools, fetchPrograms, fetchDepartments, fetchCourses, 
  fetchQuestionsByCourse, deleteQuestion 
} from '../api/apiService'; 
import Button from '../components/forms/Button'; 
import { Link } from 'react-router-dom';

export default function ViewQuestionsPage() {
 const [questions, setQuestions] = useState([]);
 const navigate = useNavigate();

 // 1. Fetch Data on Load
 useEffect(() => {
  loadQuestions();
 }, []);

 const loadQuestions = async () => {
  try {
   const res = await fetchQuestions();
   console.log("✅ Data received from API (res.data):", res.data);

   // Priyanka Chnages
   if (res.data && typeof res.data === 'object') {
      const questionsArray = Object.values(res.data);
      setQuestions(questionsArray);
      console.log("✅ Questions set as array (questionsArray):", questionsArray.length);
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
        // Handle both array and dict formats
        const data = Array.isArray(res.data) ? res.data : (res.data.questions || []);
        setQuestions(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    } else {
      setQuestions([]);
    }
  };

  } catch (err) {
   console.error("❌ Error fetching questions:", err);
   setQuestions([]);
  }
 };

 // 2. Handle Edit Click
 const handleEdit = (id) => {
  // Make sure this path matches your App.js route
  navigate(`/professor/questions/edit/${id}`);//vaidehi changes
 };

 // 3. Handle Delete Click
 const handleDelete = async (id) => {

  if (window.confirm("Are you sure you want to delete this question?")) {
   try {
    await deleteQuestion(id);
    setQuestions(prevQuestions => prevQuestions.filter((question) => question.question_id !== id));
   } catch (err) {
    alert("Failed to delete question. Check console for details.");
    console.error(err);
   }
  }
 };

 const columns = [
  { Header: 'ID', accessor: 'id' },
  { Header: 'Question', accessor: 'question_txt' },
  { Header: 'Option_1', accessor: 'option_1_txt' },
  { Header: 'Option_2', accessor: 'option_2_txt' },
  { Header: 'Option_3', accessor: 'option_3_txt' },
  { Header: 'Option_4', accessor: 'option_4_txt' },
  { Header: 'Solution', accessor: 'solution_text' },
  { Header: 'Actions', accessor: 'actions' },
 ];

 const data = questions.map((question) => {
  const solutionOption = question.options.find(opt => opt.is_correct === 1);
  const optionTexts = question.options.map(opt => opt.option_text);

  return {
   id: question.question_id,
   question_txt: question.question_txt,
   option_1_txt: optionTexts[0] || '',
   option_2_txt: optionTexts[1] || '',
   option_3_txt: optionTexts[2] || '',
   option_4_txt: optionTexts[3] || '',
   solution_text: solutionOption ? solutionOption.option_text : 'N/A',
   actions: (
    <div className="table-actions">
     <Link to={`/prof/questions/edit/${question.question_id}`} className="action-link">Edit</Link>
     <button onClick={() => handleDelete(question.question_id)} className="action-button-delete">Delete</button>
    </div>
   ),
  const handleDelete = async (id) => {
    if (window.confirm("Delete this question?")) {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    }
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
      <div style={styles.filterCard}>
        <h3 style={{marginBottom: '20px', color: '#444'}}></h3>
        
        {/* ✅ GRID LAYOUT START */}
        <div style={styles.gridContainer}>
            
            {/* Row 1: School & Department */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Select School:</label>
                <select style={styles.select} value={selections.school} onChange={handleSchoolChange}>
                    <option value="">Select a school</option>
                    {lists.schools.map(item => <option key={item.id} value={item.id}>{item.school_name}</option>)}
                </select>
            </div>

            <div style={styles.inputGroup}>
                 <label style={styles.label}>Select Department:</label>
                 <select style={styles.select} value={selections.department} onChange={handleDeptChange} disabled={!selections.program}>
                    <option value="">Select a department</option>
                    {lists.departments.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
            </div>

            {/* Row 2: Program & Semester */}
            <div style={styles.inputGroup}>
                <label style={styles.label}>Select Program:</label>
                <select style={styles.select} value={selections.program} onChange={handleProgramChange} disabled={!selections.school}>
                    <option value="">Select a program</option>
                    {lists.programs.map(item => <option key={item.id} value={item.id}>{item.program_name}</option>)}
                </select>
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>Select Semester:</label>
                <select style={styles.select} value={selections.semester} onChange={handleSemesterChange} disabled={!selections.department}>
                    <option value="">Select a semester</option>
                    {lists.semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
            </div>

            {/* Row 3: Course (Full Width) */}
            <div style={{...styles.inputGroup, gridColumn: '1 / -1'}}>
                <label style={styles.label}>Select Course:</label>
                <select style={styles.select} value={selections.course} onChange={handleCourseChange} disabled={!selections.semester}>
                    <option value="">Select a course</option>
                    {lists.courses.map(item => <option key={item.id} value={item.id}>{item.course_name}</option>)}
                </select>
            </div>

        </div>
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
                <tr key={q.id} style={styles.tableRow}>
                  <td style={styles.td}>{q.id}</td>
                  <td style={styles.td}>{q.text}</td>
                  <td style={styles.td}>{q.options?.[0]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[1]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[2]?.option_text || '-'}</td>
                  <td style={styles.td}>{q.options?.[3]?.option_text || '-'}</td>
                  <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>
                    {q.options?.find(opt => opt.is_correct === 1)?.option_text || 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => navigate(`/professor/questions/edit/${q.id}`)} style={styles.editBtn}>Edit</button>
                        <button onClick={() => handleDelete(q.id)} style={styles.deleteBtn}>Del</button>
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

// --- UPDATED STYLES ---
const styles = {
  mainContainer: {
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  headerRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '25px' 
  },
  
  // FILTER CARD STYLES
  filterCard: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    marginBottom: '30px',
    width: '100%',
    boxSizing: 'border-box'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2 Columns
    gap: '20px', 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: '0.9rem',
    marginLeft: '2px'
  },
  select: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    width: '100%',
    outline: 'none',
    cursor: 'pointer'
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