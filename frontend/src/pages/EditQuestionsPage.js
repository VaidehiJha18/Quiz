import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FormInput from '../components/forms/FormInput';
import Button from '../components/forms/Button';
import axios from 'axios'; //Vaidehi Changes
import { 
    addQuestion, 
    updateQuestion, 
    fetchQuestionById,
    fetchTeacherCourses,  //  ❤️❤️❤️❤️❤️
    generateAIQuestions
} from '../api/apiService'; //vaidehi changes


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
  
  // ❤️❤️❤️❤️❤️❤️
  // 👈 AI GENERATOR STATES & HANDLERS HERE
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiFile, setAiFile] = useState(null);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiUnit, setAiUnit] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedAIQuestions, setSelectedAIQuestions] = useState({});
  const [aiCourse, setAiCourse] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAiFile(e.target.files[0]);
    }
  };

  const handleRunAIGenerator = async () => {
  // Check aiCourse state, fall back to formData.course_id
  const selectedCourse = aiCourse || formData?.course_id;

  if (!aiFile) {
    alert("Please upload a PDF or PPTX file first.");
    return;
  }

  if (!selectedCourse) {
    alert("Please select a course first from the dropdown.");
    return;
  }

  const formDataToSend = new FormData();
  formDataToSend.append('file', aiFile);
  formDataToSend.append('course_id', selectedCourse);
  formDataToSend.append('num_questions', aiNumQuestions);
  formDataToSend.append('unit', aiUnit);
  formDataToSend.append('save_to_db', 'true');

  setIsGenerating(true);
  try {
    const res = await generateAIQuestions(formDataToSend);
    if (res.status === 200 && res.data.questions) {
      setGeneratedQuestions(res.data.questions);
      const initialSelections = {};
      res.data.questions.forEach((_, idx) => {
        initialSelections[idx] = true;
      });
      setSelectedAIQuestions(initialSelections);
    }
  } catch (err) {
    console.error("AI Generation failed:", err);
    alert("Failed to generate AI questions: " + (err.response?.data?.error || err.message));
  } finally {
    setIsGenerating(false);
  }
};

  const handleToggleSelectQuestion = (idx) => {
    setSelectedAIQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleImportSelectedQuestions = () => {
    const questionsToImport = generatedQuestions.filter((_, idx) => selectedAIQuestions[idx]);
    if (questionsToImport.length === 0) {
      alert("Please select at least one question to import.");
      return;
    }

    alert(`Successfully imported ${questionsToImport.length} questions to your Question Bank!`);
    
    setShowAIModal(false);
    setGeneratedQuestions([]);
    setAiFile(null);
    navigate('/professor/questions'); // Redirect to question bank list
  };
  // ❤️❤️❤️❤️❤️❤️


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
        {/* 👈 ADD BUTTON IN HEADER ROW ❤️❤️*/}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="page-title" style={{ margin: 0 }}>
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              // Automatically set aiCourse to whichever course is currently selected on the page
              if (formData.course_id) {
                setAiCourse(formData.course_id);
              }
              setShowAIModal(true);
            }}
          >
            ✨ Auto-Generate with AI
          </button>
        </div>
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

      {/* ❤️❤️👈 ADD AI GENERATOR MODAL HERE BEFORE </main> */}
      {showAIModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', width: '800px', maxHeight: '90vh', overflowY: 'auto',
            borderRadius: '12px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1e293b' }}>✨ AI Question Generator (PDF / PPT)</h3>
              <button 
                type="button"
                onClick={() => setShowAIModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Target Parameters Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
              {/* 1. Upload Document */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Upload Document (PDF / PPTX):</label>
                <input type="file" accept=".pdf,.ppt,.pptx" onChange={handleFileChange} />
              </div>
              
              {/* 2. SELECT COURSE DROPDOWN */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>
                  Select Course:
                </label>
                <select 
                  value={aiCourse} 
                  onChange={(e) => setAiCourse(e.target.value)} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                >
                  <option value="">-- Select Course --</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. SELECT UNIT DROPDOWN */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Target Unit:</label>
                <select value={aiUnit} onChange={(e) => setAiUnit(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px' }}>
                  <option value={1}>Unit 1</option>
                  <option value={2}>Unit 2</option>
                  <option value={3}>Unit 3</option>
                  <option value={4}>Unit 4</option>
                  <option value={5}>Unit 5</option>
                </select>
              </div>

              {/* 4. Number of MCQs */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px' }}>Number of MCQs:</label>
                <input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={aiNumQuestions} 
                  onChange={(e) => setAiNumQuestions(e.target.value)} 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                />
              </div>

              {/* Generate Button (Full Row) */}
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={handleRunAIGenerator}
                  disabled={isGenerating}
                  style={{
                    width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff',
                    border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isGenerating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isGenerating ? "Analyzing Document & Generating..." : "Generate MCQs"}
                </button>
              </div>
            </div>

            {/* Real-time Generated MCQs Preview & Rationales */}
            {generatedQuestions.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '12px' }}>Preview Generated Questions & Rationales:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  {generatedQuestions.map((q, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        border: selectedAIQuestions[idx] ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '8px', padding: '16px', backgroundColor: selectedAIQuestions[idx] ? '#eff6ff' : '#fff'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={!!selectedAIQuestions[idx]} 
                          onChange={() => handleToggleSelectQuestion(idx)} 
                          style={{ marginTop: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{idx + 1}. {q.question_txt}</p>
                          
                          {/* Display Options */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            {q.options && q.options.map((opt, optIdx) => (
                              <div 
                                key={optIdx} 
                                style={{
                                  padding: '6px 10px', borderRadius: '4px', fontSize: '13px',
                                  backgroundColor: optIdx === q.correct_index ? '#dcfce7' : '#f1f5f9',
                                  color: optIdx === q.correct_index ? '#166534' : '#334155',
                                  fontWeight: optIdx === q.correct_index ? 'bold' : 'normal'
                                }}
                              >
                                {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correct_index && "✓"}
                              </div>
                            ))}
                          </div>

                          {/* Display Rationale */}
                          {q.rationale && (
                            <div style={{ padding: '8px 12px', backgroundColor: '#fef3c7', borderRadius: '4px', fontSize: '12px', color: '#92400e' }}>
                              💡 <strong>Rationale:</strong> {q.rationale}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Import Action Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <button 
                    type="button"
                    onClick={() => setShowAIModal(false)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleImportSelectedQuestions}
                    style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Import Selected to Question Pool
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}