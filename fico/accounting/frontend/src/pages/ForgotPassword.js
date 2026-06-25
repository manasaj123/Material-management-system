import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    newPassword: '',
  });

  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isStrongPassword = (password) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');

    if (!isStrongPassword(form.newPassword)) {
      setErr('Password not strong enough');

      setTimeout(() => setErr(''), 3000);
      return;
    }

    try {
      const res = await api.post('/auth/reset-password-simple', form);
      setMsg(res.data.message);

      setTimeout(() => {
        setMsg('');
        navigate('/login');
      }, 2000);

    } catch (e) {
      setErr(e.response?.data?.message || 'Error');
      setTimeout(() => setErr(''), 3000);
    }
  };

  return (
    <>
      {/* ===== INTERNAL CSS ===== */}
      <style>{`
        .center-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f4f6f8;
        }

        .card {
          width: 350px;
          padding: 25px;
          border-radius: 10px;
          background: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
        }

        input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 6px;
          outline: none;
        }

        input:focus {
          border-color: #4a90e2;
        }

        .btn-primary {
          width: 100%;
          padding: 10px;
          background: #4a90e2;
          border: none;
          color: white;
          border-radius: 6px;
          cursor: pointer;
        }

        .btn-primary:hover {
          background: #357abd;
        }

        .success-text {
          color: green;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .error-text {
          color: red;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .eye-icon {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #666;
        }

        .eye-icon:hover {
          color: #000;
        }
      `}</style>

      {/* ===== UI ===== */}
      <div className="center-container">
        <div className="card">
          <h2>Reset Password</h2>

          {msg && <div className="success-text">{msg}</div>}
          {err && <div className="error-text">{err}</div>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                required
                style={{ paddingRight: '10px' }}
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button className="btn-primary" type="submit">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;