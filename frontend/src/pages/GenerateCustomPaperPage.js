import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  uploadCourseSyllabus,
  fetchTeacherCourses, 
  generateCustomExamPaper, 
  uploadPaperDocument, 
  fetchQuestionsByCourse,
  generatePaperAIQuestions,
  generateAIQuestions
} from '../api/apiService';
import './GenerateCustomPaperPage.css';

export default function GenerateCustomPaperPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  
  // Initial form states
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examType, setExamType] = useState('');
  const [endSemMarks, setEndSemMarks] = useState(40);
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [paperTitle, setPaperTitle] = useState('');

  // Standard Upload state
  const [docFile, setDocFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Multi-PDF AI Question Ingestion State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [ingesting, setIngesting] = useState(false);

  // Ingestion Hub Modal states
  const [showIngestionModal, setShowIngestionModal] = useState(false);
  const [ingestTab, setIngestTab] = useState('ai'); // 'ai' or 'document'
  
  // ✅ Quantity starts blank so no '05' or pre-filled value shows up
  const [numQuestions, setNumQuestions] = useState('');
  const [questionType, setQuestionType] = useState('MIXED'); 
  const [selectedUnit, setSelectedUnit] = useState('AUTO');

  // Syllabus Upload State
  const [showSyllabusModal, setShowSyllabusModal] = useState(false);
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);

  // Bank Picker Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterMarks, setFilterMarks] = useState('ALL');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [extractedAIQuestions, setExtractedAIQuestions] = useState([]);

  useEffect(() => {
    fetchTeacherCourses()
      .then((res) => {
        setCourses(res.data || []);
      })
      .catch((err) => console.error('Error fetching courses:', err));
  }, []);

  // Question Blueprint Layout State
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);

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

  // End-Sem Blueprint Generator (40 or 60 Marks)
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

  // Syllabus Upload Handler
  const handleUploadSyllabus = async () => {
    if (!syllabusFile || !selectedCourse) {
      alert("Please select a Course and upload a syllabus file.");
      return;
    }
    setUploadingSyllabus(true);
    const formData = new FormData();
    formData.append('file', syllabusFile);
    formData.append('course_id', selectedCourse);

    try {
      const res = await uploadCourseSyllabus(formData);
      alert(res.data.message || "Syllabus successfully parsed & saved into DB!");
      setShowSyllabusModal(false);
      setSyllabusFile(null);
    } catch (err) {
      alert(err.response?.data?.error || "Syllabus upload failed.");
    } finally {
      setUploadingSyllabus(false);
    }
  };

  // Handlers for File Selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleAIIngest = async () => {
    if (selectedFiles.length === 0 || !selectedCourse) {
      alert("Please select a Course and upload at least one PDF/PPT file.");
      return;
    }
    setIngesting(true);

    const countToSend = numQuestions ? Number(numQuestions) : 5;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    formData.append('course_id', selectedCourse);
    formData.append('unit', selectedUnit); 
    formData.append('question_type', questionType);
    formData.append('num_questions', countToSend);
    try {
      const res = await generatePaperAIQuestions(formData);
      const questionsList = res.data.questions || [];

      if (questionsList.length > 0) {
        setExtractedAIQuestions(questionsList);
        setShowIngestionModal(false);
        setShowReviewModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "AI Ingestion failed.");
    } finally {
      setIngesting(false);
    }
  };

  const handleApproveAndSyncBlueprint = async () => {
    if (questions.length > 0 && extractedAIQuestions.length > 0) {
      const updatedQuestions = [...questions];
      let aiIndex = 0;

      updatedQuestions.forEach((qBlock) => {
        qBlock.sub_parts.forEach((part) => {
          if (aiIndex < extractedAIQuestions.length) {
            const aiQ = extractedAIQuestions[aiIndex];
            part.mode = 'manual';
            part.manual_text = aiQ.question_txt;
            part.marks = aiQ.marks || part.marks;
            part.units = [String(aiQ.unit || '1')];
            aiIndex++;
          }
        });
      });

      setQuestions(updatedQuestions);
      alert(`Approved! Questions synced and auto-filled into your exam paper layout.`);
    }
    setShowReviewModal(false);
    setSelectedFiles([]);
  };

  const handleDocUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleSync = async () => {
    if (!docFile || !selectedCourse) {
      alert("Please select a Course and choose a file to sync.");
      return;
    }

    const formData = new FormData();
    formData.append('file', docFile);
    formData.append('course_id', selectedCourse);

    try {
      setUploading(true);
      const res = await uploadPaperDocument(formData);
      alert(`Success! Saved ${res.data.questions_saved} questions into the course bank.`);
      setDocFile(null);
      setShowIngestionModal(false);
    } catch (err) {
      alert(err.response?.data?.error || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Blueprint Controls
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

  const openBankPicker = async (qIdx, pIdx, isOr = false) => {
    if (!selectedCourse) {
      alert('Please select a course first.');
      return;
    }
    setPickerTarget({ qIdx, pIdx, isOr });
    setFilterMarks('ALL');
    setFilterUnit('ALL');

    try {
      const res = await fetchQuestionsByCourse(selectedCourse);
      const data = Array.isArray(res.data) ? res.data : Object.values(res.data || {});
      setBankQuestions(data);
      setModalOpen(true);
    } catch (err) {
      alert('Failed to load course question bank.');
    }
  };

  // Select Question & Lock into Blueprint
  const selectBankQuestion = (q) => {
    if (!pickerTarget) return;
    const { qIdx, pIdx, isOr } = pickerTarget;
    const updated = [...questions];
    const target = isOr ? updated[qIdx].or_sub_parts[pIdx] : updated[qIdx].sub_parts[pIdx];

    target.mode = 'bank';
    target.selected_qid = q.id || q.question_id;
    target.selected_preview = q.question_txt || q.text;
    target.manual_text = q.question_txt || q.text;
    
    setQuestions(updated);
    setModalOpen(false);
  };

  // Total marks computation helper
  const calculateTotalMarks = () => {
    return questions.reduce((sum, q) => sum + Number(q.total_section_marks || 0), 0);
  };

  const currentConfiguredMarks = calculateTotalMarks();

  const handleGenerate = async () => {
    setErrorMsg('');
    setShowErrorModal(false);

    if (!selectedCourse) {
      setErrorMsg('Please select a course before generating the question paper.');
      setShowErrorModal(true);
      return;
    }

    if (!examType) {
      setErrorMsg('Please select an exam blueprint type.');
      setShowErrorModal(true);
      return;
    }

    if (!questions || questions.length === 0) {
      setErrorMsg('Please configure at least one question block.');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    const payload = {
      course_id: Number(selectedCourse),
      paper_title: paperTitle,
      exam_type: examType,
      academic_year: academicYear,
      total_marks: calculateTotalMarks(),
      questions: questions
    };

    try {
      const res = await generateCustomExamPaper(payload);
      navigate(`/professor/paper-preview/${res.data.paper_id}`);
    } catch (err) {
      const backendError =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Cannot generate paper: Please verify that sufficient questions are available in the Question Bank.';
      setErrorMsg(backendError);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-gen-page">
      {/* 🌟 Professional Top Action Bar */}
      <div className="clean-paper-header">
        <div className="header-info">
          <h2>Examination Blueprint & Paper Generator</h2>
          <p>Configure institutional schemas, allocate questions, or type custom items with LaTeX formulas.</p>
        </div>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn-header-outline"
            onClick={() => setShowSyllabusModal(true)}
          >
            📘 Syllabus Reference
          </button>
          <button 
            type="button" 
            className="btn-header-primary"
            onClick={() => setShowIngestionModal(true)}
          >
            ➕ Ingest / Import Questions
          </button>
        </div>
      </div>

      {/* 1. Examination Details */}
      <div className="glass-card meta-card">
        <h3 className="section-title">Examination Details</h3>
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
          <h3 className="section-title">Question Blocks & Sub-Question Architecture</h3>
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
                            Auto
                          </button>
                          <button
                            type="button"
                            className={`mode-btn ${part.mode === 'bank' ? 'active' : ''}`}
                            onClick={() => openBankPicker(qIdx, pIdx, false)}
                          >
                            Bank
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
                            Type
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
                                Auto
                              </button>
                              <button
                                type="button"
                                className={`mode-btn ${part.mode === 'bank' ? 'active' : ''}`}
                                onClick={() => openBankPicker(qIdx, pIdx, true)}
                              >
                                Bank
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
                                Type
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

            <div className="blueprint-bottom-actions">
              <button type="button" onClick={handleAddQuestionBlock} className="add-block-btn">
                + Add Question Block (Q.{questions.length + 1})
              </button>
            </div>
          </>
        )}

        <div className="action-footer-bar">
          <button className="btn-secondary" onClick={() => navigate('/professor/dashboard')}>
            Back to Dashboard
          </button>
          <button className="btn-generate-main" onClick={handleGenerate} disabled={loading || questions.length === 0}>
            {loading ? 'Compiling Paper...' : 'Generate Final Question Paper'}
          </button>
        </div>
      </div>

      {/* 🌟 Unified Question Ingestion Hub Modal */}
      {showIngestionModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-dialog unified-ingest-dialog">
            <div className="custom-modal-header modal-header-flex">
              <h4>Question Ingestion Hub</h4>
              <button className="modal-close-x" onClick={() => setShowIngestionModal(false)}>✕</button>
            </div>

            <div className="ingest-modal-tabs">
              <button 
                type="button" 
                className={`ingest-tab-btn ${ingestTab === 'ai' ? 'active' : ''}`}
                onClick={() => setIngestTab('ai')}
              >
                Multi-File AI Generator
              </button>
              <button 
                type="button" 
                className={`ingest-tab-btn ${ingestTab === 'document' ? 'active' : ''}`}
                onClick={() => setIngestTab('document')}
              >
                Document Sync (.docx, .csv)
              </button>
            </div>

            <div className="custom-modal-body">
              {ingestTab === 'ai' ? (
                /* Tab 1: AI Multi-File Generator */
                <div className="modal-tab-content">
                  <p className="tab-hint">Upload lecture presentations or notes to extract curriculum-aligned questions automatically.</p>
                  
                  <div className="modal-grid-inputs">
                    <div>
                      <label>Target Unit</label>
                      <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)}>
                        <option value="AUTO">AI Auto-Detect Across Syllabus</option>
                        {[1, 2, 3, 4, 5].map((u) => (
                          <option key={u} value={u}>Unit {u}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label>Question Type</label>
                      <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                        <option value="MIXED">Mixed (MCQ & Descriptive)</option>
                        <option value="MCQ">MCQ Only</option>
                        <option value="Descriptive">Descriptive Only</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label>Question Quantity</label>
                      {/* ✅ Controlled input with blank default and placeholder */}
                      <input 
                        type="number" 
                        min="1" 
                        max="30" 
                        placeholder="e.g. 5"
                        value={numQuestions} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setNumQuestions(val === '' ? '' : Math.max(1, Math.min(30, Number(val))));
                        }} 
                      />
                    </div>
                  </div>

                  <div className="doc-drop-zone">
                    <input type="file" id="modal-ai-files" multiple onChange={handleFileChange} />
                    <label htmlFor="modal-ai-files" className="doc-drop-label">
                      <span className="drop-icon">📁</span>
                      <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : "Select PDF / PPTX slide decks"}</span>
                    </label>
                  </div>

                  <button 
                    type="button" 
                    className="btn-primary-block"
                    onClick={handleAIIngest} 
                    disabled={ingesting || selectedFiles.length === 0}
                  >
                    {ingesting ? "Analyzing & Generating..." : "Generate AI Questions"}
                  </button>
                </div>
              ) : (
                /* Tab 2: Document Ingestion */
                <div className="modal-tab-content">
                  <p className="tab-hint">Upload a formatted question paper or spreadsheet to bulk sync into the course bank.</p>
                  <div className="doc-drop-zone">
                    <input type="file" id="modal-doc-upload" accept=".docx,.pdf,.csv" onChange={handleDocUpload} />
                    <label htmlFor="modal-doc-upload" className="doc-drop-label">
                      <span className="drop-icon">📄</span>
                      <span>{docFile ? docFile.name : "Select .docx, .pdf, or .csv file"}</span>
                    </label>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary-block"
                    onClick={handleSync} 
                    disabled={uploading || !docFile}
                  >
                    {uploading ? "Syncing Questions..." : "Upload & Sync to Course Bank"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
              {bankQuestions.length === 0 ? (
                <p style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                  No questions found in the database for this course. Try importing questions!
                </p>
              ) : (
                bankQuestions
                  .filter((q) => (filterUnit === 'ALL' || String(q.unit || 1) === String(filterUnit)))
                  .filter((q) => (filterMarks === 'ALL' || String(q.marks || 1) === String(filterMarks)))
                  .map((q) => (
                    <div key={q.id || q.question_id} className="question-card">
                      <div className="q-card-header">
                        <span className="badge unit">Unit {q.unit || 1}</span>
                        <span className="badge marks">{q.marks || 1} Marks</span>
                        <span 
                          className="badge type" 
                          style={{ 
                            backgroundColor: q.question_type === 'MCQ' ? '#e0e7ff' : '#fef3c7',
                            color: q.question_type === 'MCQ' ? '#3730a3' : '#92400e',
                            fontWeight: 'bold' 
                          }}
                        >
                          {q.question_type || (q.marks === 1 ? 'MCQ' : 'Descriptive')}
                        </span>
                      </div>

                      <p className="q-text">{q.question_txt || q.text}</p>

                      {q.question_type === 'MCQ' && q.options && q.options.length > 0 && (
                        <div className="mcq-options-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
                          {q.options.map((opt, idx) => (
                            <div key={idx} className={`option-box ${opt.is_correct ? 'correct' : ''}`}>
                              {String.fromCharCode(65 + idx)}. {opt.option_text || opt.text || opt} {opt.is_correct ? '✓' : ''}
                            </div>
                          ))}
                        </div>
                      )}

                      <button 
                        type="button"
                        className="btn-select-q" 
                        onClick={() => selectBankQuestion(q)}
                        style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginTop: '12px' }}
                      >
                        Select This Question ✓
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extracted AI Questions Review Modal */}
      {showReviewModal && (
        <div className="bank-modal-overlay">
          <div className="bank-modal-content">
            <div className="modal-top">
              <h3>Review Extracted Questions & Detected Units</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>

            <div className="modal-question-list">
              <table className="review-table">
                <thead>
                  <tr>
                    <th style={{ width: '6%' }}>#</th>
                    <th style={{ width: '64%' }}>Question & Options</th>
                    <th style={{ width: '15%' }}>Detected Unit</th>
                    <th style={{ width: '15%' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {extractedAIQuestions.map((q, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                      <td className="q-text-cell">
                        <p className="q-title">{q.question_txt}</p>
                        
                        {q.question_type === 'MCQ' && q.options && q.options.length > 0 && (
                          <div className="mcq-options-grid">
                            {q.options.map((opt, optIdx) => (
                              <div 
                                key={optIdx} 
                                className={`option-pill ${optIdx === q.correct_index ? 'correct' : ''}`}
                              >
                                {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.correct_index && '✓'}
                              </div>
                            ))}
                          </div>
                        )}

                        {q.rationale && (
                          <div className="rationale-box">
                            <strong>Rationale:</strong> {q.rationale}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge unit-badge">Unit {q.unit || '1'}</span>
                      </td>
                      <td>
                        <span className={`badge type-badge ${q.question_type === 'MCQ' ? 'mcq' : 'descriptive'}`}>
                          {q.question_type || 'Descriptive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="modal-actions-bar">
              <button className="btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
              <button className="btn-ai-ingest" onClick={handleApproveAndSyncBlueprint}>
                Approve & Sync to Blueprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Centered Professional Alert Modal */}
      {showErrorModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-dialog">
            <div className="custom-modal-header">
              <h4>System Notification</h4>
            </div>
            <div className="custom-modal-body">
              <p>{errorMsg}</p>
            </div>
            <div className="custom-modal-footer">
              <button
                type="button"
                className="btn-modal-dismiss"
                onClick={() => setShowErrorModal(false)}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Syllabus Modal */}
      {showSyllabusModal && (
        <div className="bank-modal-overlay">
          <div className="bank-modal-content" style={{ width: '520px' }}>
            <div className="modal-top">
              <h3>Upload Syllabus Reference</h3>
              <button className="modal-close" onClick={() => setShowSyllabusModal(false)}>✕</button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                Upload the official course syllabus (PDF or DOCX). AI will extract unit titles and topics into MySQL so question auto-tagging automatically matches your exact course structure.
              </p>
              <input 
                type="file" 
                accept=".pdf,.docx,.doc" 
                onChange={(e) => setSyllabusFile(e.target.files[0])} 
                style={{ width: '100%' }}
              />
              <div className="modal-actions-bar" style={{ marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => setShowSyllabusModal(false)}>Cancel</button>
                <button className="btn-ai-ingest" onClick={handleUploadSyllabus} disabled={uploadingSyllabus}>
                  {uploadingSyllabus ? "Parsing & Saving..." : "Save Syllabus to DB"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}