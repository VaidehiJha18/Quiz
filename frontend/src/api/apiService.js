// src/api/apiService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/'; // Flask backend URL

// Generic API service
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Auth endpoints
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

// Quiz endpoints
export const fetchQuizzes = () => api.get('/quizzes');
export const fetchQuizById = (id) => api.get(`/quizzes/${id}`);
export const submitQuiz = (id, data) => api.post(`/quizzes/${id}/submit`, data);

// Professor endpoints
export const fetchQuestions = () => api.get('/prof/questions');
export const addQuestion = (data) => api.post('/prof/add_questions', data);
export const updateQuestion = (id, data) => api.put(`/prof/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/prof/questions/${id}`);


// --- Dropdown API Calls (Add these to the bottom of apiService.js) ---

// 1. Get Schools
export const fetchSchools = () => api.get('/prof/schools');

// 2. Get Programs (linked to School)
export const fetchPrograms = (schoolId) => api.get(`/prof/programs?school_id=${schoolId}`);

// 3. Get Departments (linked to Program)
export const fetchDepartments = (programId) => api.get(`/prof/departments?program_id=${programId}`);

// 4. Get Courses (linked to Dept & Semester)
export const fetchCourses = (deptId, semester) => api.get(`/prof/courses?dept_id=${deptId}&semester=${semester}`);

// 5. Get Questions (linked to Course)
export const fetchQuestionsByCourse = (courseId) => api.get(`/prof/questions?course_id=${courseId}`);
