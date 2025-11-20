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


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, deleteQuestion } from '../api/apiService'; 
import Button from '../components/forms/Button'; 

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

      // 🛑 CRITICAL FIX: Convert the backend object to an array 🛑
      if (res.data && typeof res.data === 'object') {
            const questionsArray = Object.values(res.data);
            setQuestions(questionsArray);
            console.log("✅ Questions set as array (questionsArray):", questionsArray.length);
        } else {
            setQuestions([]);
        }

    } catch (err) {
      console.error("❌ Error fetching questions:", err);
      setQuestions([]);
    }
  };

  // 2. Handle Edit Click
  const handleEdit = (id) => {
    // Make sure this path matches your App.js route
    navigate(`/professor/questions/edit/${id}`);
  };

  // 3. Handle Delete Click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(id);
        // Remove from UI immediately
        setQuestions(questions.filter((q) => q.id !== id));
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

  const data = questions.map((q) => {
    const solutionOption = q.options.find(opt => opt.is_correct === 1);
    const optionTexts = q.options.map(opt => opt.option_text);

    return {
      id: q.question_id,
      question_txt: q.question_txt,
      option_1_txt: optionTexts[0] || '',
      option_2_txt: optionTexts[1] || '',
      option_3_txt: optionTexts[2] || '',
      option_4_txt: optionTexts[3] || '',
      solution_text: solutionOption ? solutionOption.option_text : 'N/A',
      actions: (
        <div className="table-actions">
          <Link to={`/professor/questions/edit/${q.question_id}`} className="action-link">Edit</Link>
          <button onClick={() => handleDelete(q.question_id)} className="action-button-delete">Delete</button>
        </div>
      ),
    };
  });

  // 🎯 ADDED CONSOLE LOG HERE: Log the processed data that is passed to the Table component
  console.log("✅ Data processed for Table (data):", data);

  return (
    <main className="main-content">
      <div className="header-row" style={styles.headerRow}>
        <h2 className="page-title">Question Bank</h2>
        <Button 
            label="Add Question" 
            onClick={() => navigate('/professor/questions/add')} 
            className="btn btn-primary"
        />
      </div>

      <div className="card table-container" style={styles.tableContainer}>
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
                  
                  {/* Optional chaining (?.) prevents crashes if options are missing */}
                  <td style={styles.td}>{q.options?.[0] || '-'}</td>
                  <td style={styles.td}>{q.options?.[1] || '-'}</td>
                  <td style={styles.td}>{q.options?.[2] || '-'}</td>
                  <td style={styles.td}>{q.options?.[3] || '-'}</td>
                  
                  <td style={{ ...styles.td, color: 'green', fontWeight: 'bold' }}>
                    {q.correct}
                  </td>

                  {/* ✅ HERE ARE YOUR ACTIONS */}
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleEdit(q.id)}
                        style={styles.editBtn}
                        title="Edit Question"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(q.id)}
                        style={styles.deleteBtn}
                        title="Delete Question"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic' }}>
                  No data found. (Please add a question first)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// Styles object to keep JSX clean
// ... (rest of your component code remains the same)

// REPLACE THE OLD STYLES OBJECT AT THE BOTTOM WITH THIS:
const styles = {
  headerRow: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '20px'
  },
  //  THIS IS THE FIX FOR THE BOX CUTTING OFF
  tableContainer: {
    width: '100%',             // Force the box to fill the screen width
    overflowX: 'auto',         // Add a scrollbar ONLY if the table is too wide
    backgroundColor: '#fff',   // White background
    borderRadius: '10px',      // Rounder corners (looks less "hard")
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', // A softer, modern shadow
    padding: '20px',           // Add padding inside the white box
    boxSizing: 'border-box'    // Ensures padding doesn't break the width
  },
  table: {
    width: '100%',             // Force table to fill the container
    minWidth: '800px',         // Ensures table doesn't squish too much on small screens
    borderCollapse: 'collapse',
    fontSize: '0.9rem' 
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    textAlign: 'left'
  },
  th: {
    padding: '15px 10px',      // More breathing room in headers
    fontWeight: '600',
    color: '#495057',
    whiteSpace: 'nowrap'       // Prevents headers from wrapping weirdly
  },
  tableRow: {
    borderBottom: '1px solid #dee2e6'
  },
  td: {
    padding: '12px 10px',
    verticalAlign: 'middle'
  },
  editBtn: {
    backgroundColor: '#ffc107',
    color: '#212529',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  }
};