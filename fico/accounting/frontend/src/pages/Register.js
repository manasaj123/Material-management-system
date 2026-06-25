import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './pagestyle.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ACCOUNTANT',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // ✅ Strong password validation
  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ✅ password validation before API call
    if (!isStrongPassword(form.password)) {
      setError(
        'Password must be 8+ chars, include uppercase, lowercase, number & special character'
      );
      return;
    }

    try {
      await api.post('/auth/register', form);

      setSuccess('Registered successfully. Redirecting to login...');

      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);

      if (msg === 'Email already registered') {
        setTimeout(() => navigate('/login'), 1000);
      }
    }
  };

  return (
    <div className="center-container">
      <div className="card">
        <h2>Register</h2>

        {error && <div className="error-text">{error}</div>}
        {success && <div className="success-text">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div className="form-group">
            <label>Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* EMAIL */}
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

          {/* PASSWORD */}
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
                  color: '#555',
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* ROLE */}
          <div className="form-group">
            <label>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
              <option value="AUDITOR">AUDITOR</option>
              <option value="VIEWER">VIEWER</option>
            </select>
          </div>

          <button className="btn-primary" type="submit">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;