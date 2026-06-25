import React, { useState } from "react";
import { loginApi } from "../api/authApi";

const styles = {
  container: {
   background: "linear-gradient(45deg, #06143fff, #0d253aff)",
    maxWidth: "320px",
    margin: "80px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
  },
  title: {
    textAlign: "center",
    marginBottom: "16px",
    color: "#fff"
  },
  input: {
    width: "100%",
    padding: "8px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
    marginBottom: "10px"
  },
  passwordInput: {
    width: "100%",
    padding: "8px 40px 8px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  },
  eyeButton: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#666",
    fontSize: "18px",
    padding: "2px",
    lineHeight: "1"
  },
  button: {
    width: "100%",
    padding: "8px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#5b799aff",
    color: "#fff",
    cursor: "pointer"
  },
  error: {
    color: "red",
    marginBottom: "8px",
    textAlign: "center"
  }
};

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Convert email to lowercase
    const lowercaseEmail = email.toLowerCase();
    
    try {
      const data = await loginApi(lowercaseEmail, password);
      localStorage.setItem("token", data.token);
      onLogin(data.token);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div style={styles.passwordWrapper}>
          <input
            style={styles.passwordInput}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            style={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        
        <button style={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;