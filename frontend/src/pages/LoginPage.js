import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../api/apiService'; // ✅ Import apiService

// --- Reusable Components (Keep these inside this file or import them) ---
const FormInput = ({ label, type, name, value, onChange, placeholder, icon }) => (
    <div className="form-input-group">
        <label htmlFor={name}>{label}</label>
        <div className="form-input-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">{/* Icon paths */}</svg>
        </div>
        <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required />
    </div>
);
//prii
const MessageDisplay = ({ message, type }) => {
    if (!message) return null;
    // ✅ FIX: Added backticks (`) inside the curly braces
    return <div className={`message-display ${type}`}>{message}</div>;
};
//prii
// --- Main LoginPage Component ---
export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            // ✅ Use apiService instead of fetch
            const response = await loginUser(formData);

            if (response.status === 200) {
                setMessage({ type: 'success', text: "Login successful! Redirecting..." });
                setTimeout(() => {
                    if (response.data.user?.role === 'professor') {
                        navigate('/professor/dashboard');
                    } else {
                        navigate('/student/dashboard');
                    }
                }, 1500);
            }
        } catch (err) {
            console.error("Login error:", err);
            const errorMessage = err.response?.data?.message || "Invalid credentials. Try again.";
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card form-card">
                <h2>Login</h2>
                <MessageDisplay message={message?.text} type={message?.type} />
                <form onSubmit={handleSubmit} noValidate>
                    <FormInput label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Enter your email" icon="email" />
                    <FormInput label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" icon="password" />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="form-toggle-text">
                    Don't have an account?{' '}
                    <Link to="/signup">
                        <span>Sign up here</span>
                    </Link>
                </p>
            </div>
        </div>
    );
}
