import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../services/realtimeApi";
import "../../../styles/pages/patient/PatientRegister.css";

const PatientRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    bloodGroup: "",
    dateOfBirth: "",
    gender: "",
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

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.dateOfBirth || !formData.gender) {
      setError("Please fill in all required fields");
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
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
    // Strong password validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!strongPasswordRegex.test(formData.password)) {
      setError("Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character");
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
      const age = calculateAge(formData.dateOfBirth);
      const requestData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber || null,
        address: formData.address || null,
        bloodGroup: formData.bloodGroup || null,
        age: age,
        gender: formData.gender
      };
      const response = await authApi.registerPatient(requestData);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/patient-login');
      }, 2000);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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
            <i className="fas fa-user-plus logo-icon"></i>
            <h1>Join Our Healthcare Platform</h1>
            <p>Create your account for personalized healthcare services</p>
          </div>
          <div className="features">
            <div className="feature-item">
              <i className="fas fa-calendar-plus"></i>
              <span>Easy Appointment Booking</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-video"></i>
              <span>Telemedicine Services</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-robot"></i>
              <span>AI Health Recommendations</span>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-box">
            <div className="register-header">
              <h2>Patient Registration</h2>
              <p>Create your patient account</p>
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
                <label htmlFor="phoneNumber">
                  <i className="fas fa-phone"></i>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i>
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bloodGroup">
                  <i className="fas fa-tint"></i>
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  <i className="fas fa-calendar"></i>
                  Date of Birth*
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">
                  <i className="fas fa-venus-mars"></i>
                  Gender*
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className={`btn-primary ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus"></i>
                    Register
                  </>
                )}
              </button>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <a href="/patient-login">Login here</a>
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

export default PatientRegister;