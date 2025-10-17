import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import { fetchQuestions, deleteQuestion } from '../api/apiService';

export default function ViewQuestionsPage() {
  const [questions, setQuestions] = useState([]);

  const loadQuestions = async () => {
    try {
      const res = await fetchQuestions();
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
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
    { Header: 'Question', accessor: 'text' },
    { Header: 'Actions', accessor: 'actions' },
  ];

  const data = questions.map((q) => ({
    id: q.id,
    text: q.text,
    actions: (
      <div className="table-actions">
        <Link to={`/professor/questions/edit/${q.id}`} className="action-link">Edit</Link>
        <button onClick={() => handleDelete(q.id)} className="action-button-delete">Delete</button>
      </div>
    ),
  }));

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