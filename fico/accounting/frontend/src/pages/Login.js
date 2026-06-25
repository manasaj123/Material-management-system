import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import api from '../api';
import { saveAuth } from '../utils/auth';
import './pagestyle.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      saveAuth(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  // addedfrontend validations ..
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
 
  // Strong password validation ,..
  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  return (
    <div className="center-container">
      <div className="card">
        <h2>Login</h2>
        {error && <div className="error-text">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
  <label>Password</label>

  <div style={{ position: 'relative' }}>
    <input
      name="password"
      type={showPassword ? 'text' : 'password'}
      value={form.password}
      onChange={handleChange}
      required
      style={{ paddingRight: '10px' }}
    />

    <span
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#666'
      }}
    >
      {showPassword ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
</div>
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
  <Link to="/forgot-password">Forgot Password?</Link>
</div>
          <button className="btn-primary" type="submit">
            Login
          </button>
        </form>

        {/* ⬇️ Register link */}
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <span>New user? </span>
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
