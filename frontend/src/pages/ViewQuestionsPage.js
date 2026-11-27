import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/layout/Dropdown';
import Button from '../components/forms/Button'; 
import { 
  fetchSchools, 
  fetchPrograms, 
  fetchDepartments, 
  fetchCourses, 
  deleteQuestion,       
  api 
} from '../api/apiService'; 

export default function ViewQuestionsPage() {
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selections, setSelections] = useState({
    school: '', program: '', department: '', semester: '', course: ''
  });

  const [lists, setLists] = useState({
    schools: [], programs: [], departments: [], semesters: [1, 2, 3, 4, 5, 6, 7, 8], courses: []
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('mine'); 

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await fetchSchools();
      setLists(prev => ({ ...prev, schools: res.data || [] }));
    } catch (err) { console.error(err); }
  };

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

  const fetchDisplayQuestions = async (courseId, mode) => {
    if (!courseId) {
      setQuestions([]);
      return;
    }
    
    setLoading(true);
    try {
      let res;
      if (mode === 'mine') {
        res = await api.get(`/prof/questions?course_id=${courseId}`);
      } else {
        res = await api.get(`/prof/questions/by_course/${courseId}`);
      }
      
      let data = res.data; 
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selections.course) {
      alert("Please select a Course from the dropdowns before bulk uploading.");
      e.target.value = null; 
      return;
    }

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      alert("Please upload a valid CSV file.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('course_id', selections.course);

    try {
      const res = await api.post('/prof/questions/bulk-upload', formData);
      alert(`Success! ${res.data.inserted_count} questions added.`);
      fetchDisplayQuestions(selections.course, viewMode);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Upload failed: ${error.response?.data?.message || "An error occurred."}`);
    } finally {
      setIsUploading(false);
      e.target.value = null;
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
        
        {/* ✅ BEAUTIFUL NEW UI: Action Buttons Group */}
        <div style={styles.actionGroup}>
          
          {/* 1. The Template Button (Outlined Purple) */}
          <a 
            href="/Question_Template.csv" 
            download 
            style={styles.templateLinkBtn}
          >
            📋 Get CSV Template
          </a>
          
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          
          {/* 2. The Bulk Upload Button (Solid Deep Purple) */}
          <button 
            style={styles.bulkBtn}
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : '📤 Bulk Upload'}
          </button>

          {/* 3. The Original Manual Button */}
          <Button 
              label="➕ Add Manually" 
              onClick={() => navigate('/professor/questions/add')} 
              className="btn btn-primary"
          />
        </div>
      </div>

      <div className="page-container">
        <Dropdown
          lists={lists} 
          selections={selections} 
          handlers={filterHandlers}
        />
      </div>

      {isAllSelected ? (
        <>
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

          <div style={styles.tableCard}>
            {loading ? <p style={{padding:'20px', textAlign:'center'}}>Loading...</p> : (
            <table className="custom-table" style={styles.table}>
  <thead>
    <tr style={styles.tableHeaderRow}>
      <th style={styles.th}>ID</th>
      <th style={styles.th}>Unit</th> 
      <th style={styles.th}>Type</th>
      <th style={{ ...styles.th, width: '45%' }}>Question</th>
      <th style={styles.th}>Details / Options</th>
      <th style={styles.th}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {questions.length > 0 ? (
      questions.map((q) => {
        // Check if question is MCQ or Descriptive
        const isMCQ = q.question_type === 'MCQ' || (q.options && q.options.length > 0);

        return (
          <tr key={q.question_id || q.id} style={styles.tableRow}>
            {/* ID Column */}
            <td style={styles.td}>{q.question_id || q.id}</td>
            
            {/* Unit Column */}
            <td style={{ ...styles.td, fontWeight: 'bold', color: '#667eea' }}>
              Unit {q.unit || 1}
            </td>

            {/* Type Badge Column */}
            <td style={styles.td}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                backgroundColor: isMCQ ? '#e0e7ff' : '#fef3c7',
                color: isMCQ ? '#3730a3' : '#92400e',
                display: 'inline-block'
              }}>
                {q.question_type || (isMCQ ? 'MCQ' : 'Descriptive')}
              </span>
            </td>

            {/* Question Text Column */}
            <td style={{ ...styles.td, fontWeight: '500', color: '#1e293b', lineHeight: '1.5' }}>
              {q.question_txt || q.text}
            </td>

            {/* Options / Solution Column */}
            <td style={styles.td}>
              {isMCQ ? (
                /* MCQ Options Grid */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', maxWidth: '350px' }}>
                  {q.options?.map((opt, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.78rem',
                        backgroundColor: (opt.is_correct === 1 || opt.is_correct === true) ? '#dcfce7' : '#f8fafc',
                        border: (opt.is_correct === 1 || opt.is_correct === true) ? '1px solid #86efac' : '1px solid #e2e8f0',
                        color: (opt.is_correct === 1 || opt.is_correct === true) ? '#166534' : '#334155',
                        fontWeight: (opt.is_correct === 1 || opt.is_correct === true) ? 'bold' : 'normal'
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {opt.option_text || opt.text || opt} {(opt.is_correct === 1 || opt.is_correct === true) ? '✓' : ''}
                    </div>
                  ))}
                </div>
              ) : (
                /* Descriptive Question Indicator */
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
                  Theory Question
                </span>
              )}
            </td>

            {/* Actions Column */}
            <td style={styles.td}>
              {viewMode === 'mine' ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => navigate(`/professor/questions/edit/${q.question_id || q.id}`)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(q.question_id || q.id)} style={styles.deleteBtn}>Del</button>
                </div>
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Read-Only</span>
              )}
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#777' }}>
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
  
  // ✅ NEW: Upgraded UI Styles for the Action Buttons
  actionGroup: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center' 
  },
  templateLinkBtn: { 
    display: 'inline-block',
    padding: '8px 16px',
    border: '2px solid #7f56da', // Deep purple border
    color: '#7f56da',
    borderRadius: '8px',         // Beautiful rectangular shape with slight rounding
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
  },
  bulkBtn: { 
    backgroundColor: '#7f56da',  // Rich purple to match the theme
    color: '#fff', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '0.9rem',
    boxShadow: '0 4px 6px rgba(127, 86, 218, 0.3)', // Soft purple shadow
    transition: 'all 0.2s ease',
  },

  toggleContainer: { display: 'flex', gap: '10px', marginBottom: '15px', marginTop: '10px' },
  activeTab: { backgroundColor: '#667eea', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)' },
  inactiveTab: { backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  tableCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', width: '100%', overflowX: 'auto', boxSizing: 'border-box' },
  table: { width: '100%', minWidth: '800px', borderCollapse: 'collapse', fontSize: '0.95rem' },
  tableHeaderRow: { backgroundColor: '#f8f9fa', borderBottom: '2px solid #eaeaea', textAlign: 'left' },
  th: { padding: '16px 12px', fontWeight: '600', color: '#555', whiteSpace: 'nowrap' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 12px', verticalAlign: 'middle', color: '#333' },
  editBtn: { backgroundColor: '#ffc107', color: '#212529', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '5px' },
  deleteBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};