
import axios from 'axios';

// const API_BASE_URL = 'http://localhost:5000/'; // Flask backend URL
 const API_BASE_URL = '/'; 
const API_URL = 'http://localhost:5000/api/questions'; //Vaidehi Changes
// Generic API service
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


// Auth endpoints
export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/signup', data); 

// Quiz endpoints
export const fetchQuizzes = () => api.get('/quizzes');
export const fetchQuizById = (id) => api.get(`/quizzes/${id}`);
export const submitQuiz = (id, data) => api.post(`/quizzes/${id}/submit`, data);

// Professor endpoints
export const fetchQuestions = () => api.get('/prof/questions');
export const addQuestion = (data) => api.post('/prof/add_questions', data);
export const updateQuestion = (id, data) => api.put(`/prof/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/prof/questions/${id}`);
export const fetchQuestionById = (id) => api.get(`/prof/questions/${id}`);//Vaidehi Changes
