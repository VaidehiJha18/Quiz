import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ✅ Import Link for redirection
import Table from '../components/ui/Table'; 
import Dropdown from '../components/layout/Dropdown';
import { 
  fetchSchools, 
  fetchPrograms, 
  fetchDepartments, 
  fetchCourses, 
  fetchQuizzes 
} from '../api/apiService';

export default function ResultsPage({ role }) {
  // --- FILTER STATE ---
  const [selections, setSelections] = useState({
    school: '', program: '', department: '', semester: '', course: ''
  });

  const [lists, setLists] = useState({
    schools: [], 
    programs: [],
    departments: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    courses: []
  });

  const [results, setResults] = useState([]); // This stores Quizzes, not student attempts
  const [loading, setLoading] = useState(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const res = await fetchSchools();
        setLists(prev => ({ ...prev, schools: res.data || [] }));
      } catch (err) {
        console.error("Error loading schools:", err);
      }
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

  const handleDeptChange = (e) => {
    setSelections({ ...selections, department: e.target.value, semester: '', course: '' });
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

    // Fetch QUIZZES for this specific course
    if (courseId) {
      setLoading(true);
      try {
        const res = await fetchQuizzes(courseId); 
        setResults(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filterHandlers = {
    handleSchoolChange,
    handleDeptChange,
    handleProgramChange,
    handleSemesterChange,
    handleCourseChange
  };

  // --- TABLE CONFIGURATION FOR QUIZZES ---
  const columns = [
    { Header: 'Quiz ID', accessor: 'id' },
    { Header: 'Quiz Title', accessor: 'title' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Created On', accessor: 'createdAt' },
    { Header: 'Action', accessor: 'action' }, // ✅ The Redirect Column
  ];

  const data = results.map((r) => ({
    id: r.id || r.quiz_id,
    title: r.quiz_title || r.title || 'N/A',
    status: (
      <span style={{ color: r.quiz_status === 'Published' ? 'green' : '#f39c12', fontWeight: 'bold' }}>
        {r.quiz_status || r.status || 'Active'}
      </span>
    ),
    createdAt: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'N/A',
    
    // ✅ This button redirects the professor to the detailed student grades page
    action: (
      <Link 
        to={`/professor/quiz-results/${r.id || r.quiz_id}`} 
        style={styles.actionButton}
      >
        View Student Grades
      </Link>
    )
  }));

  return (
    <main className="main-content">
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
          text-align: left; 
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
      `}</style>

      <div className="top-bar">
        <h1>{role === 'student' ? 'Your Results' : 'Course Quizzes'}</h1>
      </div>

      <div style={styles.card}>
        <Dropdown
          lists={lists} 
          selections={selections}
          handlers={filterHandlers}
        />
      </div>

      {selections.course && (
        <div style={styles.tableCard} className="results-table-container">
          <h3 style={{marginBottom: '15px', color: '#333'}}>Quizzes for Selected Course</h3>
          {loading ? <p>Loading quizzes...</p> : <Table columns={columns} data={data} />}
        </div>
      )}

      {!selections.course && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          <p>Please select all dropdown options to view the quizzes.</p>
        </div>
      )}

    </main>
  );
}

const styles = {
  card: {
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  tableCard: {
    backgroundColor: '#fff',
    padding: '25px', 
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginTop: '20px',
    border: '1px solid #eee', 
    width: '100%',             
    boxSizing: 'border-box',   
    overflowX: 'auto'          
  },
  actionButton: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '500',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  }
};