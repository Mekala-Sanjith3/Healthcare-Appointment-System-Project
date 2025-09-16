import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../services/realtimeApi";
import ReCAPTCHA from "react-google-recaptcha";
import "../../../styles/pages/admin/AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    if (!captchaToken) {
      setError("Please complete the CAPTCHA verification");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Attempting login with credentials:", { ...credentials, role: "ADMIN" });
      const response = await authApi.login({
        ...credentials,
        role: "ADMIN",
        captchaToken
      });
      
      console.log("Login successful:", response);
      
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
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
      // Reset captcha on error
      recaptchaRef.current.reset();
      setCaptchaToken("");
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
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
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
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
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

              <div className="captcha-container">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your site key in production
                  onChange={handleCaptchaChange}
                />
              </div>

              <button 
                type="submit" 
                className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading || !captchaToken}
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