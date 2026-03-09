// import React, { useEffect, useState } from 'react';
// import Table from '../components/ui/Table'; 
// import Dropdown from '../components/layout/Dropdown';
// import { 
//   fetchSchools, 
//   fetchPrograms, 
//   fetchDepartments, 
//   fetchCourses, 
//   fetchQuizzes 
// } from '../api/apiService';

// export default function ResultsPage({ role }) {
//   // --- FILTER STATE ---
//   const [selections, setSelections] = useState({
//     school: '', program: '', department: '', semester: '', course: ''
//   });

//   const [lists, setLists] = useState({
//     schools: [], 
//     programs: [],
//     departments: [],
//     semesters: [1, 2, 3, 4, 5, 6, 7, 8],
//     courses: []
//   });

//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // --- INITIAL LOAD ---
//   useEffect(() => {
//     const loadInitialData = async () => {
//       try {
//         const res = await fetchSchools();
//         setLists(prev => ({ ...prev, schools: res.data || [] }));
//       } catch (err) {
//         console.error("Error loading schools:", err);
//       }
//     };
//     loadInitialData();
//   }, []);

//   // --- FILTER HANDLERS ---
//   const handleSchoolChange = async (e) => {
//     const id = e.target.value;
//     setSelections({ ...selections, school: id, program: '', department: '', semester: '', course: '' });
//     if (id) {
//       const res = await fetchPrograms(id);
//       setLists(prev => ({ ...prev, programs: res.data || [] }));
//     }
//   };

//   const handleProgramChange = async (e) => {
//     const id = e.target.value;
//     setSelections({ ...selections, program: id, department: '', semester: '', course: '' });
//     if (id) {
//       const res = await fetchDepartments(id);
//       setLists(prev => ({ ...prev, departments: res.data || [] }));
//     }
//   };

//   const handleDeptChange = (e) => {
//     setSelections({ ...selections, department: e.target.value, semester: '', course: '' });
//   };

//   const handleSemesterChange = async (e) => {
//     const sem = e.target.value;
//     setSelections({ ...selections, semester: sem, course: '' });
//     if (selections.department && sem) {
//       const res = await fetchCourses(selections.department, sem);
//       setLists(prev => ({ ...prev, courses: res.data || [] }));
//     }
//   };

//   const handleCourseChange = async (e) => {
//     const courseId = e.target.value;
//     setSelections({ ...selections, course: courseId });
    
//     // Fetch results for this specific course
//     if (courseId) {
//       setLoading(true);
//       try {
//         const res = await fetchQuizzes(courseId); // Replace with your results API
//         setResults(res.data || []);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   const filterHandlers = {
//     handleSchoolChange,
//     handleDeptChange,
//     handleProgramChange,
//     handleSemesterChange,
//     handleCourseChange
//   };

//   // --- TABLE CONFIG ---
//   const columns = [
//     { Header: 'Quiz Title', accessor: 'title' },
//     { Header: role === 'student' ? 'Score' : 'Student & Score', accessor: 'scoreDisplay' },
//   ];

//   const data = results.map((r) => ({
//     title: r.title,
//     scoreDisplay: role === 'student' ? r.score : `${r.studentName || 'N/A'} - ${r.score}`,
//   }));

//   return (
//     <main className="main-content">
//       <div className="top-bar">
//         <h1>{role === 'student' ? 'Your Results' : 'All Student Results'}</h1>
//       </div>

//       <div style={styles.card}>
//         <Dropdown
//           lists={lists} 
//           selections={selections}
//           handlers={filterHandlers}
//         />
//       </div>

//       <div className="dashboard-card">
//         {loading ? <p>Loading results...</p> : <Table columns={columns} data={data} />}
//       </div>
//     </main>
//   );
// }

// const styles = {
//   card: {
//     background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
//     padding: '20px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//     marginBottom: '20px'
//   },
// };

import React, { useEffect, useState } from 'react';
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

  const [results, setResults] = useState([]);
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

    // Fetch results for this specific course
    if (courseId) {
      setLoading(true);
      try {
        const res = await fetchQuizzes(courseId); // Replace with your results API
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

  // --- TABLE CONFIG ---
  // const columns = [
  //   { Header: 'Quiz Title', accessor: 'title' },
  //   { Header: role === 'student' ? 'Score' : 'Student & Score', accessor: 'scoreDisplay' },
  // ];
  //priyanka
  const columns = [
    { Header: 'Quiz ID', accessor: 'quizId' },
    { Header: 'Attempt ID', accessor: 'attemptId' },
    { Header: 'Quiz Title', accessor: 'title' },
    { Header: 'Enrollment No.', accessor: 'enrollmentNo' },
    { Header: 'Final Score', accessor: 'score' },
    { Header: 'Start Time', accessor: 'startTime' },
    { Header: 'End Time', accessor: 'endTime' },
    { Header: 'Status', accessor: 'status' },
    { Header: 'Response', accessor: 'responseLink' }, // Special handling for link
  ];


  // const data = results.map((r) => ({
  //   title: r.title,
  //   scoreDisplay: role === 'student' ? r.score : `${r.studentName || 'N/A'} - ${r.score}`,
  // }));
    const data = results.map((r) => ({
    quizId: r.quizId || 'N/A',
    attemptId: r.attemptId || '-',
    title: r.title || 'N/A',
    enrollmentNo: r.enrollmentNo || 'N/A',
    score: r.score || 'N/A',
    startTime: r.startTime || '-',
    endTime: r.endTime || '-',
    
    // Status Logic: Turns green if 'Attempted', red otherwise
    status: (
      <span style={{ color: r.status === 'Attempted' ? 'green' : 'red', fontWeight: 'bold' }}>
        {r.status || 'Not Attempted'}
      </span>
    ),
    
    // Link Logic: Shows a clickable link if responseLink exists in DB
    responseLink: r.responseLink ? (
      <a href={r.responseLink} target="_blank" rel="noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>
        View Response
      </a>
    ) : (
      <span style={{ color: '#999' }}>N/A</span>
    )
  }));
// Priyanka
  // //priyanka
  //   const data = results.map((r) => ({
  //   quizId: r.quizId,
  //   attemptId: r.attemptId || '-',
  //   title: r.title, // Maps 'title' from API to 'title' column
  //   enrollmentNo: r.enrollmentNo,
  //   score: r.score,
  //   startTime: r.startTime,
  //   endTime: r.endTime,
  //   status: r.status, // You can add custom rendering here if needed (e.g., colors)
  //   responseLink: r.responseLink // Assuming API sends a link or ID
  // }));
  //🍜🍜🍜

  return (
    <main className="main-content">
         <style>{`
        .results-table-container table {
          width: 100%;
          border-collapse: collapse; /* This merges double borders into single solid lines */
          margin-top: 15px;
        }
        .results-table-container th, 
        .results-table-container td {
          border: 1px solid #dcdcdc; /* Adds the dividing lines between all columns and rows */
          padding: 12px 16px; /* Adds comfortable spacing inside the cells */
          text-align: left; /* Aligns text neatly to the left */
          white-space: nowrap; /* Prevents text from squishing onto multiple lines */
        }
        .results-table-container th {
          background-color: #f8f9fa; /* Gives the header row a nice soft gray background */
          color: #333;
          font-weight: 600;
        }
        .results-table-container tr:hover {
          background-color: #f1f5f9; /* Adds a subtle highlight effect when hovering over a row */
        }
      `}</style>
      <div className="top-bar">
        <h1>{role === 'student' ? 'Your Results' : 'All Student Results'}</h1>
      </div>

      <div style={styles.card}>
        <Dropdown
          lists={lists} 
          selections={selections}
          handlers={filterHandlers}
        />
      </div>


      {/* <div className="dashboard-card">
        {loading ? <p>Loading results...</p> : <Table columns={columns} data={data} />}
      </div> */}
{/* Priyanka */}
      {selections.course && (
        <div style={styles.tableCard} className="results-table-container">
          <h3 style={{marginBottom: '15px', color: '#333'}}>Results for Selected Course</h3>
          {loading ? <p>Loading results...</p> : <Table columns={columns} data={data} />}
        </div>
      )}

      {!selections.course && (
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          <p>Please select all dropdown options to view the results card.</p>
        </div>
      )}

    </main>
  );
}
// Priyanka
const styles = {
  card: {
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  //Priyanka
  tableCard: {
    backgroundColor: '#fff',
    padding: '25px', 
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    marginTop: '20px',
    border: '1px solid #eee', 
    width: '100%',             // Ensures it spans exactly as wide as the filter card
    boxSizing: 'border-box',   // Prevents padding from causing overflow
    overflowX: 'auto'          // Adds horizontal scroll if the table gets too wide
  }
};