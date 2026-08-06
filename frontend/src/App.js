import React from 'react';
// import { Routes, Route } from 'react-router-dom';
import './App.css';
import QuizResult from './pages/QuizResult';
import AdminManageUsersPage from './pages/AdminManageUsersPage';
import AdminRoute from './components/layout/AdminRoute';
import AdminSystemSetupPage from './pages/AdminSystemSetupPage';
import AdminDashboardHub from './pages/AdminDashboardHub';

// ✅ 1. IMPORT THE NEW LAYOUT COMPONENT
import ProfessorLayout from './components/layout/ProfessorLayout';
import StudentLayout from './components/layout/StudentLayout';

// --- Components ---
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; 
import SignupPage from './pages/SignupPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QuizPage from './pages/QuizPage';
import ViewQuizzesPage from './pages/ViewQuizzesPage';
import ViewQuestionsPage from './pages/ViewQuestionsPage';
import EditQuestionsPage from './pages/EditQuestionsPage';
import ResultsPage from './pages/ResultsPage';
import Quiz from './pages/Quiz';
import GenerateQuizPage from './pages/GenerateQuizPage';
import QuizPreviewPage from './pages/QuizPreviewPage';
import ProfessorResultsPage from './pages/ProfessorResultsPage';
import ProfessorAnalyticsPage from './pages/ProfessorAnalyticsPage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';



function App() {
  return (
    <div className="App">
      <Routes>
        {/* --- Public & Student Routes (remain the same) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/student/results" element={<ResultsPage role="student" />} />
        <Route path="/take-quiz/:token" element={<Quiz />} />

        {/* Quiz Preview Route */}
        <Route path="/professor/preview/:token" element={<QuizPreviewPage />} />
        <Route path="/result/:attemptId" element={<QuizResult />} />
         
        {/* --- Professor Routes --- */}
        <Route path="/professor" element={<ProfessorLayout />}>
          <Route path="dashboard" element={<ProfessorDashboard />} />
          <Route path="quizzes" element={<ViewQuizzesPage />} />
          <Route path="questions" element={<ViewQuestionsPage />} />
          <Route path="/professor/quiz-results/:quizId" element={<ProfessorResultsPage />} />

          <Route path="questions/add" element={<EditQuestionsPage isNew />} />
          <Route path="questions/edit/:questionId" element={<EditQuestionsPage />} />
          <Route path="results" element={<ResultsPage role="professor" />} />     
          <Route path="generate-quiz" element={<GenerateQuizPage />} />
          <Route path="/professor/analytics" element={<ProfessorAnalyticsPage />} />
          <Route path="students" element={<ManageStudentsPage />} />
        </Route>

        {/* ========================================================= */}
        {/* --- Admin Routes (CLEANED, SECURED & MAPPED TO CARD HUB) --- */}
        {/* ========================================================= */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              {/* 🌟 HIGHLIGHT: Replaced old AdminDashboardPage with AdminDashboardHub card hub */}
              <AdminDashboardHub />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <AdminRoute>
              <AdminManageUsersPage />
            </AdminRoute>
          } 
        />
        
        <Route 
          path="/admin/setup" 
          element={
            <AdminRoute>
              <AdminSystemSetupPage />
            </AdminRoute>
          } 
        />

        {/* Single unified 404 catch-all route at the very bottom */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;