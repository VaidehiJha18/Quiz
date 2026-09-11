import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTeacherCourses, generateCustomExamPaper, uploadPaperDocument, fetchQuestionsByCourse } from '../api/apiService';
import './GenerateCustomPaperPage.css';

export default function GenerateCustomPaperPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  // Initial states start completely blank / unselected
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examType, setExamType] = useState('');
  const [endSemMarks, setEndSemMarks] = useState(40);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [paperTitle, setPaperTitle] = useState('');

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Bank Picker Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterMarks, setFilterMarks] = useState('ALL');

  // Starts with no questions until the professor chooses the configuration
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Mid-Sem Blueprint Generator (20 Marks)
  const getMidSemBlueprint = () => [
    {
      question_number: 'Q.1',
      instructions: 'Attempt all questions.',
      total_section_marks: 5,
      sub_parts: ['a.', 'b.', 'c.', 'd.', 'e.'].map((lbl) => ({
        sub_label: lbl, marks: 1, type: 'MCQ', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: ''
      })),
      or_sub_parts: []
    },
    {
      question_number: 'Q.2',
      instructions: 'Answer all questions.',
      total_section_marks: 5,
      sub_parts: [
        { sub_label: 'a.', marks: 3, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'b.', marks: 2, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ],
      or_sub_parts: [
        { sub_label: 'a.', marks: 3, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'b.', marks: 2, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ]
    },
    {
      question_number: 'Q.3',
      instructions: 'Answer all questions.',
      total_section_marks: 5,
      sub_parts: [
        { sub_label: 'a.', marks: 5, type: 'Descriptive', units: ['2'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ],
      or_sub_parts: [
        { sub_label: 'a.', marks: 5, type: 'Descriptive', units: ['2'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ]
    },
    {
      question_number: 'Q.4',
      instructions: 'Answer all questions.',
      total_section_marks: 5,
      sub_parts: [
        { sub_label: 'a.', marks: 5, type: 'Descriptive', units: ['2', '3'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ],
      or_sub_parts: []
    }
  ];

  // End-Sem Blueprint Generator (40 Marks: 5 x 8M or 60 Marks: 5 x 12M)
  const getEndSemBlueprint = (totalTarget = 40) => {
    const is40 = Number(totalTarget) === 40;
    const secWeight = is40 ? 8 : 12;
    const markA = is40 ? 2 : 3;
    const markB = is40 ? 2 : 3;
    const markC = is40 ? 4 : 6;

    return [1, 2, 3, 4, 5].map((num) => ({
      question_number: `Q.${num}`,
      instructions: 'Attempt all questions.',
      total_section_marks: secWeight,
      sub_parts: [
        { sub_label: 'a.', marks: markA, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'b.', marks: markB, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'c.', marks: markC, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ],
      or_sub_parts: [
        { sub_label: 'd.', marks: markA, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'e.', marks: markB, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
        { sub_label: 'f.', marks: markC, type: 'Descriptive', units: [`${num}`], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
      ]
    }));
  };

  // Only load the assigned course list; do not auto-select any course
  useEffect(() => {
    fetchTeacherCourses()
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch((err) => console.error('Error fetching courses:', err));
  }, []);

  const handleCourseChange = (e) => {
    const cid = e.target.value;
    setSelectedCourse(cid);

    const found = courses.find((c) => String(c.id) === String(cid));
    if (cid && examType) {
      const label = examType === 'mid_sem' ? 'Mid Semester Examination' : 'End Semester Examination';
      setPaperTitle(found ? `${found.course_name} - ${label}` : label);
      setQuestions(examType === 'mid_sem' ? getMidSemBlueprint() : getEndSemBlueprint(endSemMarks));
    } else {
      setPaperTitle('');
      setQuestions([]);
    }
  };

  const handleExamTypeChange = (e) => {
    const val = e.target.value;
    setExamType(val);

    const found = courses.find((c) => String(c.id) === String(selectedCourse));
    if (val && selectedCourse) {
      const label = val === 'mid_sem' ? 'Mid Semester Examination' : 'End Semester Examination';
      setPaperTitle(found ? `${found.course_name} - ${label}` : label);
      setQuestions(val === 'mid_sem' ? getMidSemBlueprint() : getEndSemBlueprint(endSemMarks));
    } else {
      setPaperTitle('');
      setQuestions([]);
    }
  };

  const handleEndSemMarksChange = (e) => {
    const val = Number(e.target.value);
    setEndSemMarks(val);
    if (examType === 'end_sem' && selectedCourse) {
      setQuestions(getEndSemBlueprint(val));
    }
  };

  // Add extra question block (e.g., Q.5, Q.6)
  const handleAddQuestionBlock = () => {
    const nextQNum = questions.length + 1;
    setQuestions([
      ...questions,
      {
        question_number: `Q.${nextQNum}`,
        instructions: 'Attempt all questions.',
        total_section_marks: 8,
        sub_parts: [
          { sub_label: 'a.', marks: 2, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' },
          { sub_label: 'b.', marks: 6, type: 'Descriptive', units: ['1'], mode: 'auto', manual_text: '', selected_qid: null, selected_preview: '' }
        ],
        or_sub_parts: []
      }
    ]);
  };

  const handleRemoveQuestionBlock = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  // Open Database Bank Modal
  const openBankPicker = async (qIdx, pIdx, isOr = false) => {
    if (!selectedCourse) {
      alert('Please select a course first.');
      return;
    }
    setPickerTarget({ qIdx, pIdx, isOr });
    const part = isOr ? questions[qIdx].or_sub_parts[pIdx] : questions[qIdx].sub_parts[pIdx];
    setFilterMarks(part.marks ? String(part.marks) : 'ALL');
    setFilterUnit(part.units?.[0] || 'ALL');

    try {
      const res = await fetchQuestionsByCourse(selectedCourse);
      setBankQuestions(res.data || []);
      setModalOpen(true);
    } catch (err) {
      alert('Failed to load course question bank.');
    }
  };

  const selectBankQuestion = (q) => {
    if (!pickerTarget) return;
    const { qIdx, pIdx, isOr } = pickerTarget;
    const updated = [...questions];
    const target = isOr ? updated[qIdx].or_sub_parts[pIdx] : updated[qIdx].sub_parts[pIdx];
    target.mode = 'bank';
    target.selected_qid = q.id;
    target.selected_preview = q.question_txt;
    target.marks = q.marks || target.marks;
    target.type = q.question_type || target.type;
    setQuestions(updated);
    setModalOpen(false);
  };

  // Ingestion Uploader
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !selectedCourse) {
      alert('Please select a Course and choose a file to upload.');
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('course_id', selectedCourse);

    try {
      const res = await uploadPaperDocument(fd);
      alert(`Success! Extracted and saved ${res.data.questions_saved} questions into the course bank.`);
      setUploadFile(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const currentConfiguredMarks = questions.reduce((sum, q) => sum + Number(q.total_section_marks || 0), 0);

const handleGenerate = async () => {
    if (!selectedCourse) {
      setErrorMsg('Please select a Course first.');
      return;
    }
    if (!examType) {
      setErrorMsg('Please select an Exam Type Blueprint.');
      return;
    }
    if (!questions || questions.length === 0) {
      setErrorMsg('Please configure at least one question block.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const payload = {
      course_id: Number(selectedCourse),
      paper_title: paperTitle || (examType === 'mid_sem' ? 'Mid Semester Examination' : 'End Semester Examination'),
      exam_type: examType,
      academic_year: academicYear || '2025-2026',
      total_marks: Number(currentConfiguredMarks || (examType === 'mid_sem' ? 20 : 40)),
      questions: questions
    };

    console.log("Submitting Paper Payload:", payload);

    try {
      const res = await generateCustomExamPaper(payload);
      if (res.data && res.data.paper_id) {
        navigate(`/professor/paper-preview/${res.data.paper_id}`);
      }
    } catch (err) {
      const backendError = err.response?.data?.error || 'Generation failed. Please try again.';
      setErrorMsg(backendError);
      console.error("Generation error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="paper-gen-page">
      {/* Top Banner */}
      <div className="top-banner">
        <div>
          <h2>Examination Blueprint & Paper Generator</h2>
          <p>Design institutional exam papers with manual entry, question bank selection, or auto-randomization</p>
        </div>

        <div className="quick-upload-card">
          <span className="upload-title">📥 Multi-Format Question Ingestion</span>
          <p className="upload-desc">Upload Word (.docx), PDF (.pdf), or CSV files to sync question pool</p>
          <div className="upload-row">
            <input
              type="file"
              accept=".docx,.pdf,.csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
            />
            <button onClick={handleFileUpload} disabled={uploading} className="btn-upload">
              {uploading ? 'Processing...' : 'Upload & Sync'}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && <div className="error-alert">{errorMsg}</div>}

      {/* 1. Examination Details */}
      <div className="glass-card meta-card">
        <h3 className="section-title">1. Examination Details</h3>
        <div className="meta-grid">
          <div className="form-group">
            <label>Course:</label>
            <select value={selectedCourse} onChange={handleCourseChange}>
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.course_code || 'BTCS'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Exam Type Blueprint:</label>
            <select value={examType} onChange={handleExamTypeChange}>
              <option value="">-- Select Exam Blueprint --</option>
              <option value="mid_sem">Mid Semester Exam (20 Marks)</option>
              <option value="end_sem">End Semester Exam</option>
            </select>
          </div>

          {examType === 'end_sem' && (
            <div className="form-group">
              <label>End-Sem Total Marks:</label>
              <select value={endSemMarks} onChange={handleEndSemMarksChange}>
                <option value="40">40 Marks Blueprint (5 Questions x 8M)</option>
                <option value="60">60 Marks Blueprint (5 Questions x 12M)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Academic Session:</label>
            <input
              type="text"
              value={academicYear}
              placeholder="e.g. 2025-2026"
              onChange={(e) => setAcademicYear(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Paper Title / Course Header:</label>
            <input
              type="text"
              value={paperTitle}
              placeholder="Auto-fills upon selection"
              onChange={(e) => setPaperTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 2. Question Blocks Configuration */}
      <div className="glass-card">
        <div className="blueprint-header-bar">
          <h3 className="section-title">2. Question Blocks & Sub-Question Architecture</h3>
          <span className="marks-badge">Configured Marks: {currentConfiguredMarks} Marks</span>
        </div>

        {questions.length === 0 ? (
          <div className="empty-blueprint-placeholder">
            <p>Please select a <strong>Course</strong> and an <strong>Exam Blueprint</strong> above to load the question layout.</p>
          </div>
        ) : (
          <>
            {questions.map((qBlock, qIdx) => (
              <div key={qIdx} className="question-accordion-block">
                <div className="block-head-row">
                  <span className="qnum-tag">{qBlock.question_number}</span>
                  <input
                    className="input-instructions"
                    value={qBlock.instructions}
                    placeholder="Instructions..."
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[qIdx].instructions = e.target.value;
                      setQuestions(updated);
                    }}
                  />
                  <div className="block-marks-indicator">
                    Weight: <strong>{qBlock.total_section_marks} Marks</strong>
                  </div>
                  <button
                    type="button"
                    className="delete-block-btn"
                    title="Remove question block"
                    onClick={() => handleRemoveQuestionBlock(qIdx)}
                  >
                    ✕
                  </button>
                </div>

                {/* Sub-parts List */}
                <div className="sub-parts-list">
                  {qBlock.sub_parts.map((part, pIdx) => (
                    <div key={pIdx} className="sub-part-item">
                      <div className="sub-part-meta">
                        <span className="sub-badge">{part.sub_label}</span>
                        <select
                          value={part.type}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[qIdx].sub_parts[pIdx].type = e.target.value;
                            setQuestions(updated);
                          }}
                        >
                          <option value="Descriptive">Descriptive</option>
                          <option value="MCQ">MCQ</option>
                        </select>

                        <span className="marks-pill">{part.marks} Marks</span>

                        <div className="mode-switch-group">
                          <button
                            type="button"
                            className={`mode-btn ${part.mode === 'auto' ? 'active' : ''}`}
                            onClick={() => {
                              const updated = [...questions];
                              updated[qIdx].sub_parts[pIdx].mode = 'auto';
                              setQuestions(updated);
                            }}
                          >
                            🎲 Auto
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${part.mode === 'bank' ? 'active' : ''}`}
                            onClick={() => openBankPicker(qIdx, pIdx, false)}
                          >
                            📚 Bank
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${part.mode === 'manual' ? 'active' : ''}`}
                            onClick={() => {
                              const updated = [...questions];
                              updated[qIdx].sub_parts[pIdx].mode = 'manual';
                              setQuestions(updated);
                            }}
                          >
                            ✍️ Type
                          </button>
                        </div>
                      </div>

                      {part.mode === 'auto' && (
                        <div className="mode-body auto-info">
                          <span>Will draw random {part.marks}M question from Unit(s):</span>
                          <input
                            type="text"
                            value={part.units?.join(',') || '1'}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].sub_parts[pIdx].units = e.target.value.split(',').map((u) => u.trim());
                              setQuestions(updated);
                            }}
                          />
                        </div>
                      )}

                      {part.mode === 'bank' && (
                        <div className="mode-body bank-info">
                          {part.selected_qid ? (
                            <p className="selected-preview-text">
                              <strong>Selected Question #{part.selected_qid}:</strong> {part.selected_preview}
                            </p>
                          ) : (
                            <span className="empty-warning">No question selected yet. Click "Bank" to pick.</span>
                          )}
                        </div>
                      )}

                      {part.mode === 'manual' && (
                        <div className="mode-body manual-info">
                          <textarea
                            rows="2"
                            placeholder="Type question text with LaTeX ($E=mc^2$) here..."
                            value={part.manual_text}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[qIdx].sub_parts[pIdx].manual_text = e.target.value;
                              setQuestions(updated);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* OR Choices Branch */}
                  {qBlock.or_sub_parts?.length > 0 && (
                    <div className="or-choice-container">
                      <div className="or-choice-divider">--- OR CHOICE OPTION ---</div>
                      {qBlock.or_sub_parts.map((part, pIdx) => (
                        <div key={pIdx} className="sub-part-item or-item">
                          <div className="sub-part-meta">
                            <span className="sub-badge or-badge">{part.sub_label}</span>
                            <select
                              value={part.type}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[qIdx].or_sub_parts[pIdx].type = e.target.value;
                                setQuestions(updated);
                              }}
                            >
                              <option value="Descriptive">Descriptive</option>
                              <option value="MCQ">MCQ</option>
                            </select>
                            <span className="marks-pill">{part.marks} Marks</span>

                            <div className="mode-switch-group">
                              <button
                                type="button"
                                className={`mode-btn ${part.mode === 'auto' ? 'active' : ''}`}
                                onClick={() => {
                                  const updated = [...questions];
                                  updated[qIdx].or_sub_parts[pIdx].mode = 'auto';
                                  setQuestions(updated);
                                }}
                              >
                                🎲 Auto
                              </button>
                              <button
                                type="button"
                                className={`mode-btn ${part.mode === 'bank' ? 'active' : ''}`}
                                onClick={() => openBankPicker(qIdx, pIdx, true)}
                              >
                                📚 Bank
                              </button>
                              <button
                                type="button"
                                className={`mode-btn ${part.mode === 'manual' ? 'active' : ''}`}
                                onClick={() => {
                                  const updated = [...questions];
                                  updated[qIdx].or_sub_parts[pIdx].mode = 'manual';
                                  setQuestions(updated);
                                }}
                              >
                                ✍️ Type
                              </button>
                            </div>
                          </div>

                          {part.mode === 'auto' && (
                            <div className="mode-body auto-info">
                              <span>Will draw random {part.marks}M question from Unit(s):</span>
                              <input
                                type="text"
                                value={part.units?.join(',') || '1'}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].or_sub_parts[pIdx].units = e.target.value.split(',').map((u) => u.trim());
                                  setQuestions(updated);
                                }}
                              />
                            </div>
                          )}

                          {part.mode === 'bank' && (
                            <div className="mode-body bank-info">
                              {part.selected_qid ? (
                                <p className="selected-preview-text">
                                  <strong>Selected Question #{part.selected_qid}:</strong> {part.selected_preview}
                                </p>
                              ) : (
                                <span className="empty-warning">No question selected yet. Click "Bank" to pick.</span>
                              )}
                            </div>
                          )}

                          {part.mode === 'manual' && (
                            <div className="mode-body manual-info">
                              <textarea
                                rows="2"
                                placeholder="Type question text with LaTeX ($E=mc^2$) here..."
                                value={part.manual_text}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  updated[qIdx].or_sub_parts[pIdx].manual_text = e.target.value;
                                  setQuestions(updated);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Dynamic Add Question Block Button */}
            <div className="blueprint-bottom-actions">
              <button type="button" onClick={handleAddQuestionBlock} className="add-block-btn">
                + Add Question Block (Q.{questions.length + 1})
              </button>
            </div>
          </>
        )}

        <div className="action-footer-bar">
          <button className="btn-secondary" onClick={() => navigate('/professor/dashboard')}>
            ← Back to Dashboard
          </button>
          <button className="btn-generate-main" onClick={handleGenerate} disabled={loading || questions.length === 0}>
            {loading ? 'Compiling Paper...' : '⚡ Generate Final Question Paper'}
          </button>
        </div>
      </div>

      {/* Database Question Picker Modal */}
      {modalOpen && (
        <div className="bank-modal-overlay">
          <div className="bank-modal-content">
            <div className="modal-top">
              <h3>Select Question from Course Bank</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <div className="modal-filters">
              <span>Filter Unit:</span>
              <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)}>
                <option value="ALL">All Units</option>
                {['1', '2', '3', '4', '5'].map((u) => (
                  <option key={u} value={u}>Unit {u}</option>
                ))}
              </select>

              <span>Filter Marks:</span>
              <select value={filterMarks} onChange={(e) => setFilterMarks(e.target.value)}>
                <option value="ALL">All Marks</option>
                {[1, 2, 3, 4, 5, 6, 8].map((m) => (
                  <option key={m} value={m.toString()}>{m} Marks</option>
                ))}
              </select>
            </div>

            <div className="modal-question-list">
              {bankQuestions
                .filter((q) => (filterUnit === 'ALL' || q.unit === filterUnit))
                .filter((q) => (filterMarks === 'ALL' || String(q.marks) === filterMarks))
                .map((q) => (
                  <div key={q.id} className="modal-q-card">
                    <div className="q-card-header">
                      <span className="q-badge">Unit {q.unit}</span>
                      <span className="q-badge marks">{q.marks} Marks</span>
                      <span className="q-badge bloom">{q.bloom_level || 'Understand'}</span>
                    </div>
                    <p className="q-text-body">{q.question_txt}</p>
                    <button className="btn-select-q" onClick={() => selectBankQuestion(q)}>
                      Select This Question ✓
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}