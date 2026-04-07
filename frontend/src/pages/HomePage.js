import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './HomePage.css'; // import the CSS file

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="homepage">
        <div className="card">
          <h2>Welcome to Quiz Portal</h2>
          <p>Login or Sign Up to continue</p>
          <div className="buttons">
            <Link to="/login" className="btn login-btn">Login</Link>
            <Link to="/Signup" className="btn signup-btn">Sign Up</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
