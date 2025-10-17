import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../components/forms/FormInput';
import Button from '../components/forms/Button';
import { addQuestion, updateQuestion, fetchQuestions } from '../api/apiService';

export default function EditQuestionPage({ isNew }) {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ text: '', options: '', correct: '' });

  useEffect(() => {
    if (!isNew && questionId) {
      const loadQuestion = async () => {
        try {
          const res = await fetchQuestions();
          const q = res.data.find((item) => item.id === parseInt(questionId));
          if (q) {
            setFormData({
              text: q.text,
              options: q.options.join(', '),
              correct: q.correct,
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadQuestion();
    }
  }, [isNew, questionId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      text: formData.text,
      options: formData.options.split(',').map((opt) => opt.trim()),
      correct: formData.correct,
    };
    try {
      if (isNew) {
        await addQuestion(payload);
      } else {
        await updateQuestion(questionId, payload);
      }
      alert('Question saved successfully!');
      navigate('/professor/question');
    } catch (err) {
      alert('Error saving question.');
    }
  };

  return (
    // ✅ Use the 'main-content' class here
    <main className="main-content">
      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <h2 className="page-title">
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>
          <FormInput label="Question Text" name="text" value={formData.text} onChange={handleChange} />
          <FormInput label="Options (comma separated)" name="options" value={formData.options} onChange={handleChange} />
          <FormInput label="Correct Answer" name="correct" value={formData.correct} onChange={handleChange} />
          <Button
            type="submit"
            label="Save Question"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
          />
        </form>
      </div>
    </main>
  );
}