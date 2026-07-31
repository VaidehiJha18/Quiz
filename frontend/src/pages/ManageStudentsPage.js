import React, { useState, useEffect } from 'react';
import { fetchTeacherCourses, fetchCourseRoster, fetchStudentHistory, overrideStudentGrade } from '../api/apiService';
import './ManageStudentsPage.css';

const ManageStudentsPage = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [students, setStudents] = useState([]);
    
    // Drill-Down Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentHistory, setStudentHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Manual Grade Override State
    const [editingAttemptId, setEditingAttemptId] = useState(null);
    const [tempScore, setTempScore] = useState('');

    useEffect(() => {
        // Fetch the professor's assigned courses on load
        fetchTeacherCourses().then(res => setCourses(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadRoster();
        } else {
            setStudents([]); // Clear table if no course selected
        }
    }, [selectedCourse]);

    const loadRoster = async () => {
        try {
            const res = await fetchCourseRoster(selectedCourse);
            setStudents(res.data);
        } catch (error) {
            console.error("Failed to load course roster", error);
        }
    };

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
        loadStudentHistory(student.student_id);
    };

    const loadStudentHistory = async (studentId) => {
        try {
            const res = await fetchStudentHistory(studentId, selectedCourse);
            setStudentHistory(res.data);
        } catch (error) {
            console.error("Failed to load history", error);
        }
    };

    // --- Performance Badge Helper ---
    const getProgressBadge = (score) => {
        if (score === null || score === undefined) return <span className="badge badge-gray">N/A</span>;
        
        // Convert to percentage logic if your scores are out of 100, otherwise adjust this logic based on total marks
        const numScore = parseFloat(score); 
        if (numScore >= 75) return <span className="badge badge-green">Good ({numScore})</span>;
        if (numScore >= 50) return <span className="badge badge-yellow">Average ({numScore})</span>;
        return <span className="badge badge-red">At Risk ({numScore})</span>;
    };

    // --- Grade Override Handlers ---
    const handleEditClick = (attemptId, currentScore) => {
        setEditingAttemptId(attemptId);
        setTempScore(currentScore);
    };

    const handleSaveScore = async (attemptId) => {
        try {
            await overrideStudentGrade(attemptId, parseFloat(tempScore));
            setEditingAttemptId(null);
            loadStudentHistory(selectedStudent.student_id); // Refresh history
            loadRoster(); // Refresh averages in the background
        } catch (error) {
            alert("Failed to update score. Please try again.");
        }
    };

    return (
        <div className="manage-students-container">
            <h2>Academic Performance & Tracking</h2>
            
            <div className="controls-bar">
                <select 
                    value={selectedCourse} 
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="course-select"
                >
                    <option value="">-- Select a Course to View Roster --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.course_name}</option>
                    ))}
                </select>
            </div>

            {selectedCourse ? (
                <table className="roster-table">
                    <thead>
                        <tr>
                            <th>Enrollment No.</th>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Avg. Score</th>
                            <th>Direct Communication</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.student_id}>
                                <td>{student.enrollment_no || 'N/A'}</td>
                                <td>
                                    {/* Clickable name for drill-down */}
                                    <button className="btn-link" onClick={() => handleStudentClick(student)}>
                                        {student.student_name}
                                    </button>
                                </td>
                                <td>{student.email}</td>
                                <td>{getProgressBadge(student.avg_score)}</td>
                                <td>
                                    {/* MailTo implementation */}
                                    <a href={`mailto:${student.email}?subject=${encodeURIComponent('Regarding your performance in course')}`} className="btn-email">
                                        ✉️ Email Student
                                    </a>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr><td colSpan="5" className="empty-state">No students found for this course.</td></tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <div className="empty-state-card">
                    <p>Please select a course from the dropdown above to view the student roster and performance.</p>
                </div>
            )}

            {/* --- Drill-Down Report Card Modal --- */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{selectedStudent?.student_name}'s Report Card</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Quiz Title</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                    <th>Max Marks</th>
                                    <th>Actions (Override)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentHistory.map((history) => (
                                    <tr key={history.attempt_id}>
                                        <td>{history.quiz_title}</td>
                                        <td>
                                            <span className={`status-text ${history.attempt_status}`}>
                                                {history.attempt_status}
                                            </span>
                                        </td>
                                        <td>
                                            {/* Inline Editing UI */}
                                            {editingAttemptId === history.attempt_id ? (
                                                <input 
                                                    type="number" 
                                                    value={tempScore} 
                                                    onChange={(e) => setTempScore(e.target.value)}
                                                    className="score-input"
                                                    step="0.01"
                                                />
                                            ) : (
                                                history.total_score !== null ? history.total_score : '-'
                                            )}
                                        </td>
                                        <td>{history.total_marks}</td>
                                        <td>
                                            {history.attempt_status === 'submitted' && (
                                                editingAttemptId === history.attempt_id ? (
                                                    <div className="edit-actions">
                                                        <button className="btn-save" onClick={() => handleSaveScore(history.attempt_id)}>Save</button>
                                                        <button className="btn-cancel" onClick={() => setEditingAttemptId(null)}>Cancel</button>
                                                    </div>
                                                ) : (
                                                    <button className="btn-edit" onClick={() => handleEditClick(history.attempt_id, history.total_score)}>
                                                        ✏️ Edit Score
                                                    </button>
                                                )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {studentHistory.length === 0 && (
                                    <tr><td colSpan="5" className="empty-state">No quiz attempts recorded.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudentsPage;