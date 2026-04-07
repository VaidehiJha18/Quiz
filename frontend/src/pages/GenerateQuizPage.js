import React, { useEffect, useState } from 'react';
import { 
  fetchSchools, fetchPrograms, fetchDepartments, fetchCourses, fetchCourseStats, 
  api // ✅ Added 'api' here so we can send the custom payload with units
} from '../api/apiService'; 
import Button from '../components/forms/Button';
import Dropdown from '../components/layout/Dropdown';

export default function GenerateQuizPage() {
  
  // --- STATE FOR SELECTIONS ---
  const [selections, setSelections] = useState({
    school: '',
    program: '',
    department: '',
    semester: '',
    course: ''
  });

  // --- STATE FOR DATA LISTS ---
  const [lists, setLists] = useState({
    schools: [],
    programs: [],
    departments: [],
    semesters: [1, 2, 3, 4, 5, 6, 7, 8],
    courses: []
  });

  // ✅ 1. NEW STATE FOR UNITS
  const [selectedUnits, setSelectedUnits] = useState([]);
  const availableUnits = [1, 2, 3, 4, 5];

  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [courseStats, setCourseStats] = useState(null);

  // 1. Load School on Mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      const res = await fetchSchools();
      setLists(prev => ({ ...prev, schools: res.data || [] }));
    } catch (err) { console.error("Error loading School:", err); }
  };

  // --- HANDLERS ---
  const handleSchoolChange = async (e) => {
    const schoolId = e.target.value;
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
    
    if (selections.department && sem) {
      const res = await fetchCourses(selections.department, sem);
      setLists(prev => ({ ...prev, courses: res.data || [] }));
    }
  };

  const handleCourseChange = async (e) => {
    const course = e.target.value;
    setSelections({ ...selections, course });
    setSelectedUnits([]); // ✅ Reset units when course changes

    if (!course) {
      setCourseStats(null);
      return;
    }

    try {
      const statsRes = await fetchCourseStats(course);
      setCourseStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch course stats:', err);
      setCourseStats(null);
    }
  };

  // ✅ 2. UNIT TOGGLE HANDLER
  const handleUnitToggle = (unitNumber) => {
      setSelectedUnits(prev => 
          prev.includes(unitNumber) 
              ? prev.filter(u => u !== unitNumber) 
              : [...prev, unitNumber]
      );
  };

  // --- GENERATE QUIZ LOGIC ---
  const handleGenerateQuiz = async () => {
    if (!selections.course) {
        alert("Please select a course first.");
        return;
    }
    setLoading(true);
    try {
        // ✅ 3. USE API.POST TO SEND THE SELECTED UNITS ARRAY
        const res = await api.post('/prof/generate', { 
            course_id: selections.course, 
            units: selectedUnits 
        });

        if (res.status === 201) {
            setGeneratedLink(res.data.quiz_link);
            const usedTeacher = res.data.used_teacher_filter;
            const count = res.data.question_count || 0;
            if (usedTeacher === false) {
                alert(`Quiz generated using course pool with ${count} questions (no teacher-specific questions found).`);
            } else {
                alert(`Quiz generated and saved successfully with ${count} questions.`);
            }
        }
    } catch (error) {
        if (error.response && error.response.status === 403) {
            alert("Session expired. Please log in again.");
        } else {
            console.error("Generation failed:", error);
            alert("Failed to generate quiz. Ensure questions exist for this course and selected units.");
        }
    } finally {
        setLoading(false);
    }
  };

  const filterHandlers = {
    handleSchoolChange,
    handleDeptChange,
    handleProgramChange,
    handleSemesterChange,
    handleCourseChange
  };

  return (
    <main className="main-content" style={styles.mainContainer}>
      
      <h2 style={styles.pageTitle}>Generate Quiz Form</h2>

      {/* GENERATED LINK CARD (Only shows if link exists) */}
      {generatedLink && (
        <div style={styles.successCard}>
            <h3>Generated Quiz Link:</h3>
            <a href={generatedLink} target="_blank" rel="noreferrer" style={styles.link}>
                {generatedLink}
            </a>
            <p style={{marginTop: '10px', color: 'green', fontWeight: 'bold'}}>Status: Link Generated</p>
        </div>
      )}

      <div style={styles.card}>
      <Dropdown
        lists={lists} 
        selections={selections}
        handlers={filterHandlers}
      />

        {/* Course Stats */}
        {courseStats && (
          <div style={{ marginTop: '16px', textAlign: 'center', color: '#333' }}>
            <strong>Course Questions:</strong> {courseStats.total_for_course || 0} • <strong>Your Questions:</strong> {courseStats.teacher_for_course || 0}
          </div>
        )}

        {/* ✅ 4. UNIT CHECKBOXES (Only show if a course is selected) */}
        {selections.course && (
          <div style={{ margin: '20px 0', padding: '15px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '8px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>Select Units to Include (Leave blank for full syllabus):</p>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {availableUnits.map(unit => (
                  <label key={unit} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#333', fontWeight: '500' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedUnits.includes(unit)} 
                      onChange={() => handleUnitToggle(unit)} 
                      style={{ marginRight: '8px', cursor: 'pointer' }}
                    />
                    Unit {unit}
                  </label>
                ))}
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div style={{marginTop: '30px', textAlign: 'center'}}>
            <Button 
                label={loading ? "Generating..." : "Generate Quiz"} 
                onClick={handleGenerateQuiz} 
                className="btn btn-primary"
                style={{width: '200px', fontSize: '1.1rem'}}
                disabled={!selections.course || loading}
            />
        </div>

      </div>
    </main>
  );
}

// --- CSS STYLES ---
const styles = {
  mainContainer: {
    padding: '40px',
    maxWidth: '1000px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  pageTitle: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  card: {
    background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // 2 Columns
    gap: '25px', 
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontWeight: '600',
    color: '#555',
    fontSize: '0.95rem',
    marginLeft: '4px'
  },
  select: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontSize: '1rem',
    backgroundColor: '#f9f9f9',
    width: '100%',
    outline: 'none',
    transition: 'border 0.3s ease',
    cursor: 'pointer'
  },
  successCard: {
    backgroundColor: '#e3f2fd',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '30px',
    textAlign: 'center',
    border: '1px solid #bbdefb'
  },
  link: {
    color: '#0d47a1',
    fontWeight: 'bold',
    wordBreak: 'break-all',
    textDecoration: 'none'
  }
};