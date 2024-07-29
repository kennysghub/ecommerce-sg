import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, AuthResponse } from '../api/AuthService';
import { useAuth } from '../context/AuthContext';
const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setIsAuthenticated } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response: AuthResponse = await signUp(name, email, password);
      console.log('Signed up successfully', response);
      localStorage.setItem('token', response.token);
      setIsAuthenticated(true);
      navigate('/home');
    } catch (err) {
      setError('Failed to sign up');
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Sign Up</h2>
        {error && <p className="auth-error">{error}</p>}
        <div className="auth-field">
          <label htmlFor="name" className="auth-label">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="email" className="auth-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
