import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../components/forms/FormInput';
import Button from '../components/forms/Button';
import { 
    addQuestion, 
    updateQuestion, 
    fetchQuestionById,
    fetchTeacherCourses  //  ❤️❤️❤️❤️❤️
} from '../api/apiService'; //vaidehi changes

import axios from 'axios'; //Vaidehi Changes
export default function EditQuestionPage({ isNew }) {
  const { questionId } = useParams();
  const navigate = useNavigate(); //prii

  const [formData, setFormData] = useState({ 
    text: '', 
    options: ['', '', '', ''], 
    correct: '',
    course_id: '',
    unit: 1    //  ❤️❤️❤️❤️❤️
  });

  const [courses, setCourses] = useState([]); // 👈 Store courses list ❤️❤️❤️❤️❤️

  // 1. Load Courses & Question Data
  useEffect(() => {
    // A. Fetch the teacher's courses    ❤️❤️❤️❤️❤️
    const loadCourses = async () => {
        try {
            const res = await fetchTeacherCourses();
            setCourses(res.data);
        } catch (err) {
            console.error("Error loading courses:", err);
        }
    };
    loadCourses();

    // B. Load Question if editing
    if (!isNew && questionId) {
      const loadQuestion = async () => {
        try {
          const res = await fetchQuestionById(questionId);
          const q = res.data;
          if (q) {
            const loadedOptions = q.options || [];
            while (loadedOptions.length < 4) loadedOptions.push("");
            
            setFormData({
                text: q.text,
                options: loadedOptions,
                correct: q.correct,
                course_id: q.course_id || '', // Load saved course if available
                unit: q.unit || 1, // Load saved unit if available❤️❤️❤️
            });
        }
        } catch (err) {
          console.error("Error loading question:", err);
        }
      };
      loadQuestion();
    }
  }, [isNew, questionId]);

  // 2. Input Handlers
  const handleTextChange = (e) => {
    setFormData({ ...formData, text: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectChange = (e) => {
    setFormData({ ...formData, correct: e.target.value });
  };

  const handleCourseChange = (e) => {
      setFormData({ ...formData, course_id: e.target.value });
  };  //  ❤️❤️❤️❤️❤️

  // 3. Updated Handle Submit (Strict Validation)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const cleanOptions = formData.options.filter(opt => opt.trim() !== "");

    if(cleanOptions.length < 2) {
        alert("Please provide at least 2 options.");
        return;
    }
    if(formData.correct === '') {
        alert("Please select which option is the correct answer.");
        return;
    }
    if(!formData.course_id) {
        alert("Please select a course for this question.");
        return;
    }      //  ❤️❤️❤️❤️❤️
    // ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
    const dataToSend = {
        text: formData.text, 
        options: cleanOptions, 
        correct_index: formData.correct, 
        course_id: formData.course_id,    //  ❤️❤️❤️❤️❤️
        question_type: 'MCQ',
        unit: formData.unit, // ✅ Use the dynamic unit from state❤️❤️❤️ 
        marks: 1, 
    };

    try {
        if (isNew) {
            await addQuestion(dataToSend); 
            alert("Question saved successfully!");
            navigate('/professor/questions'); // Redirect after save
        } else {
            // Call update API and include course_id so mapping is updated
            const res = await updateQuestion(questionId, dataToSend);
            if (res && res.status === 200) {
                alert('Question updated successfully!');
                navigate('/professor/questions');
            } else {
                alert('Failed to update question.');
            }
        }    //  ❤️❤️❤️❤️❤️
    } catch (error) {
        console.error("Failed to add question:", error.response ? error.response.data : error.message);
        alert("Error saving question. Please try again.");
    }
    // ⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜⬜
  };

  return (
    // ✅ THIS IS THE LINE THAT CENTERS THE CARD
    <main className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      
      <div className="card form-container">
        <form onSubmit={handleSubmit}>
          <h2 className="page-title">
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>

          {/* ✅ 1. COURSE SELECTION DROPDOWN */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Select Course
            </label>
            <select
              value={formData.course_id}
              onChange={handleCourseChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff'
              }}
            >
              <option value="">-- Choose a Course --</option>
              {courses.map(course => (
                  <option key={course.id} value={course.id}>
                      {course.course_name}
                  </option>
              ))}
            </select>
          </div>       

          {/* ✅ 2. UNIT SELECTION DROPDOWN */}
          <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Select Unit
              </label>
              <select 
                  value={formData.unit} 
                  onChange={(e) => setFormData({ ...formData, unit: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', backgroundColor: '#fff' }}
              >
                  {[1, 2, 3, 4, 5].map(u => (
                      <option key={u} value={u}>Unit {u}</option>
                  ))}
              </select>
          </div>

          {/* Question Text */}
          <FormInput 
            label="Question Text" 
            name="text" 
            value={formData.text} 
            onChange={handleTextChange} 
            required 
          />

          <h4 style={{marginTop: '20px', marginBottom: '10px'}}>Options</h4>
          
          {/* Options Input Fields */}
          {formData.options.map((option, index) => (
            <FormInput
              key={index}
              label={`Option ${index + 1}`}
              name={`option-${index}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required 
            />
          ))}

          {/* Correct Answer Dropdown */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Correct Answer
            </label>
            <select
              value={formData.correct}
              onChange={handleCorrectChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                backgroundColor: '#fff'
              }}
            >
              <option value="">-- Select Correct Answer --</option>
              
              {/* Options 1-4 Dropdown */}
              {formData.options.map((_, index) => (
                 <option key={index} value={index}>
                    Option {index + 1}
                 </option>
              ))}
            </select>
          </div>

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