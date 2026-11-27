import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fetchCourseRoster, fetchStudentHistory, overrideStudentGrade } from '../api/apiService';
import './ManageStudentsPage.css';

const safeToFixed = (val, digits = 2) => {
    if (val === null || val === undefined || isNaN(Number(val))) return '0.00';
    return Number(val).toFixed(digits);
};

const ManageStudentsPage = () => {
    const navigate = useNavigate();

    // Cascading Dropdown States
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedDivisionId, setSelectedDivisionId] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search Filter State
    const [searchTerm, setSearchTerm] = useState('');

    // Drill-Down Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentHistory, setStudentHistory] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Manual Grade Override State
    const [editingAttemptId, setEditingAttemptId] = useState(null);
    const [tempScore, setTempScore] = useState('');

    // Fetch courses with divisions on mount
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await api.get('/prof/analytics');
                if (res.data && res.data.available_courses && res.data.available_courses.length > 0) {
                    const loaded = res.data.available_courses.map((c) => ({
                        id: String(c.course_id),
                        name: c.course_name,
                        divisions: c.divisions || []
                    }));
                    setCourses(loaded);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error('Failed to fetch courses:', err);
                setCourses([]);
            }
        };

        fetchCourses();
    }, []);

    // Divisions for the selected course
    const currentDivisions = useMemo(() => {
        if (!selectedCourseId || !courses) return [];
        const found = courses.find((c) => String(c.id) === String(selectedCourseId));
        return found ? found.divisions || [] : [];
    }, [courses, selectedCourseId]);

    // Handle course change
    const handleCourseChange = (e) => {
        const newCourseId = e.target.value;
        setSelectedCourseId(newCourseId);
        setSelectedDivisionId('');
        setStudents([]);
        setSearchTerm('');
    };

    // Handle division change
    const handleDivisionChange = (e) => {
        const newDivisionId = e.target.value;
        setSelectedDivisionId(newDivisionId);
        setSearchTerm('');
        if (newDivisionId && selectedCourseId) {
            loadRoster(selectedCourseId, newDivisionId);
        } else {
            setStudents([]);
        }
    };

    const loadRoster = async (courseId, divisionId) => {
        setLoading(true);
        try {
            const res = await fetchCourseRoster(courseId, divisionId);
            setStudents(res.data || []);
        } catch (error) {
            console.error('Failed to load course roster', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter students by search term (enrollment no. or name)
    const filteredStudents = useMemo(() => {
        if (!searchTerm.trim()) return students;
        const term = searchTerm.toLowerCase().trim();
        return students.filter((s) => {
            const enr = (s.enrollment_no || '').toLowerCase();
            const name = (s.student_name || '').toLowerCase();
            return enr.includes(term) || name.includes(term);
        });
    }, [students, searchTerm]);

    const handleStudentClick = async (student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
        loadStudentHistory(student.student_id);
    };

    const loadStudentHistory = async (studentId) => {
        setModalLoading(true);
        try {
            const res = await fetchStudentHistory(studentId, selectedCourseId);
            setStudentHistory(res.data || []);
        } catch (error) {
            console.error('Failed to load history', error);
            setStudentHistory([]);
        } finally {
            setModalLoading(false);
        }
    };

    // Status Badge Component
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Good':
                return <span className="status-badge status-good">Good</span>;
            case 'Average':
                return <span className="status-badge status-average">Average</span>;
            case 'Needs Support':
                return <span className="status-badge status-support">Needs Support</span>;
            default:
                return <span className="status-badge status-na">Not Attempted</span>;
        }
    };

    // Grade Override Handlers
    const handleEditClick = (attemptId, currentScore) => {
        setEditingAttemptId(attemptId);
        setTempScore(currentScore !== null && currentScore !== undefined ? currentScore : '');
    };

    const handleSaveScore = async (attemptId) => {
        try {
            await overrideStudentGrade(attemptId, parseFloat(tempScore));
            setEditingAttemptId(null);
            if (selectedStudent) {
                loadStudentHistory(selectedStudent.student_id);
            }
            if (selectedCourseId && selectedDivisionId) {
                loadRoster(selectedCourseId, selectedDivisionId);
            }
        } catch (error) {
            alert('Failed to update score. Please try again.');
        }
    };

    return (
        <div className="manage-students-container">
            <button onClick={() => navigate(-1)} className="back-btn">
                &larr; Back to Dashboard
            </button>

            <div className="manage-header-card">
                <div className="header-titles">
                    <h1>Manage Students</h1>
                    <p className="subtitle">View division rosters, track quiz attempts, and monitor student performance.</p>
                </div>

                <div className="filter-bar">
                    <div className="filter-group">
                        <label className="filter-label">1. Select Subject</label>
                        <select
                            className="custom-select"
                            value={selectedCourseId}
                            onChange={handleCourseChange}
                        >
                            <option value="">-- Select Subject --</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">2. Select Division</label>
                        <select
                            className="custom-select"
                            value={selectedDivisionId}
                            onChange={handleDivisionChange}
                            disabled={!selectedCourseId || currentDivisions.length === 0}
                        >
                            <option value="">-- Select Division --</option>
                            {currentDivisions.map((d) => (
                                <option key={d.division_id} value={d.division_id}>
                                    {d.division_name || `Division ${d.division}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {!selectedCourseId || !selectedDivisionId ? (
                <div className="empty-state-card">
                    <p>Please select a subject and division to view the student roster.</p>
                </div>
            ) : loading ? (
                <div className="loading-state-card">
                    <p>Loading student roster...</p>
                </div>
            ) : (
                <div className="roster-card">
                    <div className="roster-toolbar">
                        <div className="search-box">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by student name or enrollment number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                                    &times;
                                </button>
                            )}
                        </div>
                        <div className="roster-count">
                            Showing {filteredStudents.length} of {students.length} students
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="roster-table">
                            <thead>
                                <tr>
                                    <th>Enrollment No.</th>
                                    <th>Name</th>
                                    <th>Quizzes Attempted</th>
                                    <th>Course Avg</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center', width: '80px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.student_id}>
                                        <td className="enrollment-cell">
                                            {student.enrollment_no || 'N/A'}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-student-name"
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                {student.student_name}
                                            </button>
                                        </td>
                                        <td className="attempted-cell">
                                            {student.quizzes_attempted_display || `${student.quizzes_attempted || 0} / ${student.total_quizzes || 0}`}
                                        </td>
                                        <td className="avg-cell">
                                            {student.avg_score !== null && student.avg_score !== undefined
                                                ? `${safeToFixed(student.avg_score, 2)} / 10.0`
                                                : '-'}
                                        </td>
                                        <td>
                                            {getStatusBadge(student.status)}
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button 
                                                className="btn-dots" 
                                                title="Actions"
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <span>&#x22EE;</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            {searchTerm ? 'No students matching your search query.' : 'No students found in this division.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Drill-Down Report Card Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3>{selectedStudent?.student_name}</h3>
                                <p className="modal-sub">Enrollment: {selectedStudent?.enrollment_no} {selectedStudent?.email ? `| ${selectedStudent.email}` : ''}</p>
                            </div>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        
                        {modalLoading ? (
                            <div className="modal-loading">Loading student history...</div>
                        ) : (
                            <table className="history-table">
                                <thead>
                                    <tr>
                                        <th>Quiz Title</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                        <th>Max Marks</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentHistory.map((history) => (
                                        <tr key={history.attempt_id}>
                                            <td style={{ fontWeight: 600 }}>{history.quiz_title}</td>
                                            <td>
                                                <span className={`status-text ${history.attempt_status}`}>
                                                    {history.attempt_status}
                                                </span>
                                            </td>
                                            <td>
                                                {editingAttemptId === history.attempt_id ? (
                                                    <input 
                                                        type="number" 
                                                        value={tempScore} 
                                                        onChange={(e) => setTempScore(e.target.value)}
                                                        className="score-input"
                                                        step="0.1"
                                                    />
                                                ) : (
                                                    history.total_score !== null && history.total_score !== undefined 
                                                        ? `${safeToFixed(history.total_score, 1)}`
                                                        : '-'
                                                )}
                                            </td>
                                            <td>{history.total_marks || 10}</td>
                                            <td>
                                                {history.attempt_status === 'submitted' && (
                                                    editingAttemptId === history.attempt_id ? (
                                                        <div className="edit-actions">
                                                            <button className="btn-save" onClick={() => handleSaveScore(history.attempt_id)}>Save</button>
                                                            <button className="btn-cancel" onClick={() => setEditingAttemptId(null)}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button className="btn-edit" onClick={() => handleEditClick(history.attempt_id, history.total_score)}>
                                                            Edit Score
                                                        </button>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {studentHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="empty-state">No quiz attempts recorded.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStudentsPage;
