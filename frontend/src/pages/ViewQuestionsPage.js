// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import Table from '../components/ui/Table';
// import { fetchQuestions, deleteQuestion } from '../api/apiService';

// export default function ViewQuestionsPage() {
//   const [questions, setQuestions] = useState([]);

//   const loadQuestions = async () => {
//     try {
//       const res = await fetchQuestions();
//       setQuestions(res.data);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this question?')) {
//       await deleteQuestion(id);
//       loadQuestions();
//     }
//   };

 

  
//   const columns = [
//     { Header: 'ID', accessor: 'id' },
//     { Header: 'Question', accessor: 'text' },
//     { Header: 'Option_1', accessor: 'options' },
//     { Header: 'Option_2', accessor: 'options' },
//     { Header: 'Option_3', accessor: 'options' },
//     { Header: 'Option_4', accessor: 'options' },
//     { Header: 'Solution', accessor: 'is_correct' },
//     { Header: 'Actions', accessor: 'actions' },
//   ];

//   const data = questions.map((q) => ({
//     id: q.id,
//     text: q.text,
//     actions: (
//       <div className="table-actions">
//         <Link to={`/professor/questions/edit/${q.id}`} className="action-link">Edit</Link>
//         <button onClick={() => handleDelete(q.id)} className="action-button-delete">Delete</button>
//       </div>
//     ),
//   }));

//   return (
//     // ✅ Use the 'main-content' class here
//     <main className="main-content">
//       <div className="page-header">
//         <h2 className="page-title" style={{ marginBottom: 0 }}>
//           Question Bank
//         </h2>
//         <Link to="/professor/questions/add" className="btn btn-primary">
//           Add Question
//         </Link>
//       </div>
//       <div className="dashboard-card">
//         <Table columns={columns} data={data} />
//       </div>
//     </main>
//   );
// }


// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fetchQuestions, deleteQuestion } from '../api/apiService'; 
// import Button from '../components/forms/Button'; 

// export default function ViewQuestionsPage() {
//   const [questions, setQuestions] = useState([]);
//   const navigate = useNavigate();

//   // 1. Fetch Data on Load
//   useEffect(() => {
//     loadQuestions();
//   }, []);

//   const loadQuestions = async () => {
//     try {
//       const res = await fetchQuestions();
      
//       // 🔍 DEBUGGING: Check your browser console (F12) to see what the API returns
//       console.log("API Response:", res);

//       // SAFE DATA HANDLING:
//       // If your backend returns the array directly in res.data:
//       if (Array.isArray(res.data)) {
//         setQuestions(res.data);
//       } 
//       // If your backend returns { questions: [...] } inside res.data:
//       else if (res.data && Array.isArray(res.data.questions)) {
//         setQuestions(res.data.questions);
//       } 
//       else {
//         setQuestions([]); // Fallback to empty if format is unexpected
//       }

//     } catch (err) {
//       console.error("Failed to load questions", err);
//     }
//   };

//   // 2. Handle Edit Click
//   const handleEdit = (id) => {
//     // Make sure this path matches your App.js route
//     navigate(`/professor/questions/edit/${id}`);
//   };

//   // 3. Handle Delete Click
//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this question?")) {
//       try {
//         await deleteQuestion(id);
//         // Remove from UI immediately
//         setQuestions(questions.filter((q) => q.id !== id));
//       } catch (err) {
//         alert("Failed to delete question. Check console for details.");
//         console.error(err);
//       }
//     }
//   };

//   return (
//     <main className="main-content">
//       <div className="header-row" style={styles.headerRow}>
//         <h2 className="page-title">Question Bank</h2>
//         <Button 
//             label="Add Question" 
//             onClick={() => navigate('/professor/questions/add')} 
//             className="btn btn-primary"
//         />
//       </div>

//       <div className="card table-container" style={styles.tableContainer}>
//         <table className="custom-table" style={styles.table}>
//           <thead>
//             <tr style={styles.tableHeaderRow}>
//               <th style={styles.th}>ID</th>
//               <th style={styles.th}>Question</th>
//               <th style={styles.th}>Option 1</th>
//               <th style={styles.th}>Option 2</th>
//               <th style={styles.th}>Option 3</th>
//               <th style={styles.th}>Option 4</th>
//               <th style={styles.th}>Solution</th>
//               <th style={styles.th}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {questions.length > 0 ? (
//               questions.map((q) => (
//                 <tr key={q.id} style={styles.tableRow}>
//                   <td style={styles.td}>{q.id}</td>
//                   <td style={styles.td}>{q.text}</td>
                  
//                   {/* Optional chaining (?.) prevents crashes if options are missing */}
//                   <td style={styles.td}>{q.options?.[0] || '-'}</td>
//                   <td style={styles.td}>{q.options?.[1] || '-'}</td>
//                   <td style={styles.td}>{q.options?.[2] || '-'}</td>
//                   <td style={styles.td}>{q.options?.[3] || '-'}</td>
                  
//                   <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>
//                     {q.correct}
//                   </td>

//                   {/* ✅ HERE ARE YOUR ACTIONS */}
//                   <td style={styles.td}>
//                     <div style={{ display: 'flex', gap: '5px' }}>
//                       <button 
//                         onClick={() => handleEdit(q.id)}
//                         style={styles.editBtn}
//                         title="Edit Question"
//                       >
//                         Edit
//                       </button>
//                       <button 
//                         onClick={() => handleDelete(q.id)}
//                         style={styles.deleteBtn}
//                         title="Delete Question"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="8" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
//                   No data found. (Please add a question first)
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </main>
//   );
// }

// // Styles object to keep JSX clean
// // ... (rest of your component code remains the same)

// // REPLACE THE OLD STYLES OBJECT AT THE BOTTOM WITH THIS:
// const styles = {
//   headerRow: {
//     display: 'flex', 
//     justifyContent: 'space-between', 
//     alignItems: 'center', 
//     marginBottom: '20px'
//   },
//   //  THIS IS THE FIX FOR THE BOX CUTTING OFF
//   tableContainer: {
//     width: '100%',             // Force the box to fill the screen width
//     overflowX: 'auto',         // Add a scrollbar ONLY if the table is too wide
//     backgroundColor: '#fff',   // White background
//     borderRadius: '10px',      // Rounder corners (looks less "hard")
//     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // A softer, modern shadow
//     padding: '20px',           // Add padding inside the white box
//     boxSizing: 'border-box'    // Ensures padding doesn't break the width
//   },
//   table: {
//     width: '100%',             // Force table to fill the container
//     minWidth: '800px',         // Ensures table doesn't squish too much on small screens
//     borderCollapse: 'collapse',
//     fontSize: '0.9rem' 
//   },
//   tableHeaderRow: {
//     backgroundColor: '#f8f9fa',
//     borderBottom: '2px solid #dee2e6',
//     textAlign: 'left'
//   },
//   th: {
//     padding: '15px 10px',      // More breathing room in headers
//     fontWeight: '600',
//     color: '#495057',
//     whiteSpace: 'nowrap'       // Prevents headers from wrapping weirdly
//   },
//   tableRow: {
//     borderBottom: '1px solid #dee2e6'
//   },
//   td: {
//     padding: '12px 10px',
//     verticalAlign: 'middle'
//   },
//   editBtn: {
//     backgroundColor: '#ffc107',
//     color: '#212529',
//     border: 'none',
//     padding: '6px 12px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '0.85rem',
//     fontWeight: 'bold'
//   },
//   deleteBtn: {
//     backgroundColor: '#dc3545',
//     color: '#fff',
//     border: 'none',
//     padding: '6px 12px',
//     borderRadius: '4px',
//     cursor: 'pointer',
//     fontSize: '0.85rem',
//     fontWeight: 'bold'
//   }
// };

//pri
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Import the functions we added in Step 2
import { 
  fetchSchools, fetchPrograms, fetchDepartments, fetchCourses, 
  fetchQuestionsByCourse, deleteQuestion 
} from '../api/apiService'; 
import Button from '../components/forms/Button'; 

export default function ViewQuestionsPage() {
  const navigate = useNavigate();
  
  // 1. Holds the selected IDs
  const [selections, setSelections] = useState({
    school: '',
    program: '',
    department: '',
    semester: '',
    course: ''
  });

  // 2. Holds the lists of data for the dropdowns
  const [lists, setLists] = useState({
    schools: [],
    programs: [],
    departments: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    courses: []
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 3. Load Schools when page opens
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await fetchSchools();
      setLists(prev => ({ ...prev, schools: res.data || [] }));
    } catch (err) { console.error("Error loading schools:", err); }
  };

  // --- HANDLERS FOR DROPDOWN CLICKS ---

  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
    // Reset all lower dropdowns
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
    
    // Fetch courses only if Dept AND Semester are picked
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
        setQuestions(res.data || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    } else {
      setQuestions([]);
    }
  };

  const handleEdit = (id) => navigate(`/professor/questions/edit/${id}`);
  
  const handleDelete = async (id) => {
    if (window.confirm("Delete this question?")) {
      await deleteQuestion(id);
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  return (
    <main className="main-content">
      <div className="header-row" style={styles.headerRow}>
        <h2 className="page-title">Question Bank</h2>
        <Button label="Add Question" onClick={() => navigate('/professor/questions/add')} className="btn btn-primary"/>
      </div>

      {/* DROPDOWN CARD */}
      <div className="card" style={styles.filterContainer}>
        <h4 style={{marginBottom: '15px', color: '#555'}}>Filter Questions</h4>
        <div style={styles.filterGrid}>
            
            {/* 1. School */}
            <select style={styles.select} value={selections.school} onChange={handleSchoolChange}>
                <option value="">Select School</option>
                {lists.schools.map(item => (
                    <option key={item.id} value={item.id}>{item.school_name}</option>
                ))}
            </select>

            {/* 2. Program */}
            <select style={styles.select} value={selections.program} onChange={handleProgramChange} disabled={!selections.school}>
                <option value="">Select Program</option>
                {lists.programs.map(item => (
                    <option key={item.id} value={item.id}>{item.program_name}</option>
                ))}
            </select>

            {/* 3. Department */}
            <select style={styles.select} value={selections.department} onChange={handleDeptChange} disabled={!selections.program}>
                <option value="">Select Department</option>
                {lists.departments.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                ))}
            </select>

            {/* 4. Semester */}
            <select style={styles.select} value={selections.semester} onChange={handleSemesterChange} disabled={!selections.department}>
                <option value="">Select Semester</option>
                {lists.semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>

            {/* 5. Course */}
            <select style={styles.select} value={selections.course} onChange={handleCourseChange} disabled={!selections.semester}>
                <option value="">Select Course</option>
                {lists.courses.map(item => (
                    <option key={item.id} value={item.id}>{item.course_name}</option>
                ))}
            </select>

        </div>
      </div>

      {/* QUESTIONS TABLE */}
      {selections.course ? (
          <div className="card" style={styles.tableContainer}>
            {loading ? <p style={{padding:'20px', textAlign:'center'}}>Loading...</p> : (
            <table className="custom-table" style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th>ID</th><th>Question</th><th>Opt 1</th><th>Opt 2</th><th>Opt 3</th><th>Opt 4</th><th>Correct</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q.id} style={styles.tableRow}>
                      <td style={styles.td}>{q.id}</td>
                      <td style={styles.td}>{q.text}</td>
                      <td style={styles.td}>{q.options?.[0]}</td>
                      <td style={styles.td}>{q.options?.[1]}</td>
                      <td style={styles.td}>{q.options?.[2]}</td>
                      <td style={styles.td}>{q.options?.[3]}</td>
                      <td style={{ ...styles.td, color: 'green' }}>{q.correct}</td>
                      <td style={styles.td}>
                         <button onClick={() => handleEdit(q.id)} style={styles.editBtn}>Edit</button>
                         <button onClick={() => handleDelete(q.id)} style={styles.deleteBtn}>Del</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" style={{padding:'20px', textAlign:'center'}}>No questions found.</td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
      ) : (
          <div style={{textAlign: 'center', marginTop: '30px', color: '#888'}}>Please select a Course first.</div>
      )}
    </main>
  );
}

const styles = {
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  filterContainer: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '25px', width: '100%' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' },
  select: { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', width: '100%' },
  tableContainer: { width: '100%', backgroundColor: '#fff', borderRadius: '12px', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeaderRow: { backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #eee' },
  tableRow: { borderBottom: '1px solid #f0f0f0' },
  td: { padding: '10px' },
  editBtn: { marginRight: '5px', cursor: 'pointer' },
  deleteBtn: { color: 'red', cursor: 'pointer' }
};