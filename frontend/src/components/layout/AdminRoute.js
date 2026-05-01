import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  // 1. Look for the EXACT key your LoginPage saves
  const userRole = localStorage.getItem('userRole'); 

  // 2. If nobody is logged in, kick them back to the login screen
  if (!userRole) {
    console.warn("Access Denied: No user logged in.");
    return <Navigate to="/login" replace />;
  }

  // 3. Security Check: Is this person actually an Admin?
  // Your login page saves the word 'admin', so we check for that exact string!
  if (userRole !== 'admin') {
    console.warn(`Access Denied: User role '${userRole}' is not authorized for Admin pages.`);
    
    // If it's a student or professor, send them to their own dashboard
    return <Navigate to={userRole === 'student' ? "/student/dashboard" : "/professor/dashboard"} replace />;
  }

  // 4. If they pass all checks, let them render the page!
  return children;
};

export default AdminRoute;