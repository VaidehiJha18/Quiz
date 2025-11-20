import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import { fetchQuestions, deleteQuestion } from '../api/apiService';

export default function ViewQuestionsPage() {
  const [questions, setQuestions] = useState([]);

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

  useEffect(() => {
    loadQuestions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      await deleteQuestion(id);
      loadQuestions();
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
    // ✅ Use the 'main-content' class here
    <main className="main-content">
      <div className="page-header">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          Question Bank
        </h2>
        <Link to="/professor/questions/add" className="btn btn-primary">
          Add Question
        </Link>
      </div>
      <div className="dashboard-card">
        <Table columns={columns} data={data} />
      </div>
    </main>
  );
}