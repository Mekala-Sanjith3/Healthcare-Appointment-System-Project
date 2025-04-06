import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api";
import "../../../styles/pages/admin/AdminRegister.css";

const AdminRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    contactNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.department) {
      setError("Please fill in all required fields");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");

    try {
      const requestData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        contactNumber: formData.contactNumber
      };

      await authApi.registerAdmin(requestData);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/admin-login');
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-wrapper">
        <div className="register-left">
          <div className="welcome-content">
            <i className="fas fa-user-shield logo-icon"></i>
            <h1>Healthcare Admin Portal</h1>
            <p>Register to manage healthcare services</p>
          </div>
          <div className="features">
            <div className="feature-item">
              <i className="fas fa-hospital"></i>
              <span>Hospital Management</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-user-md"></i>
              <span>Staff Administration</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-chart-line"></i>
              <span>Analytics Dashboard</span>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-box">
            <div className="register-header">
              <h2>Admin Registration</h2>
              <p>Create your administrator account</p>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">
                  <i className="fas fa-user"></i>
                  Full Name*
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  Email Address*
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  Password*
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i>
                  Confirm Password*
                </label>
                <div className="password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  <i className="fas fa-hospital"></i>
                  Department*
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  placeholder="Enter department name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">
                  <i className="fas fa-phone"></i>
                  Contact Number
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <a href="/admin-login">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-content">
            <i className="fas fa-check-circle"></i>
            <h3>Registration Successful!</h3>
            <p>Redirecting to login page...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegister; 