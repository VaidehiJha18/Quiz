import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/signup', data);

export const fetchQuizzes = () => api.get('/quizzes');
export const fetchQuizById = (id) => api.get(`/quizzes/${id}`);
export const submitQuiz = (id, data) => api.post(`/quizzes/${id}/submit`, data);

export const fetchQuestions = () => api.get('/prof/questions');
export const addQuestion = (data) => api.post('/prof/add_questions', data);
export const updateQuestion = (id, data) => api.put(`/prof/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/prof/questions/${id}`);
export const fetchQuestionById = (id) => api.get(`/prof/questions/${id}`);

export const fetchSchools = () => api.get('/prof/schools');
export const fetchPrograms = (schoolId) => api.get(`/prof/programs?school_id=${schoolId}`);
export const fetchDepartments = (programId) => api.get(`/prof/departments?program_id=${programId}`);
export const fetchCourses = (deptId, semester) => api.get(`/prof/courses?dept_id=${deptId}&semester=${semester}`);
export const fetchQuestionsByCourse = (courseId) => api.get(`/prof/questions?course_id=${courseId}`);
