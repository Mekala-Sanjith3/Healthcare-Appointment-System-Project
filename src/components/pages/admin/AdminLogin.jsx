import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../common/Button/button";
import { Input } from "../../common/Input/input";
import { authApi } from "../../../services/api";
import "../../../styles/pages/admin/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await authApi.login({
        ...credentials,
        role: "ADMIN"
      });
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('userRole', response.role);
      localStorage.setItem('userData', JSON.stringify({
        id: response.userId,
        email: response.email,
        role: response.role
      }));
      
      navigate('/admin');
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="welcome-content">
            <i className="fas fa-user-shield logo-icon"></i>
            <h1>Welcome Back, Admin</h1>
            <p>Access your dashboard to manage the healthcare system</p>
          </div>
          <div className="features">
            <div className="feature-item">
              <i className="fas fa-users-cog"></i>
              <span>Manage Users</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <span>System Analytics</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-robot"></i>
              <span>AI Management</span>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2>Admin Login</h2>
              <p>Please enter your credentials</p>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  Password
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#" className="forgot-password">
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Logging in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt"></i>
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <a href="/admin-register" className="register-link">
                  <i className="fas fa-user-plus"></i>
                  Register here
                </a>
              </p>
              <div className="divider">or</div>
              <p>Need help?</p>
              <a href="#" className="support-link">
                <i className="fas fa-headset"></i>
                Contact Support
              </a>
            </div>

            <div className="security-note">
              <i className="fas fa-shield-alt"></i>
              <p>Your administrative access is protected by secure authentication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 