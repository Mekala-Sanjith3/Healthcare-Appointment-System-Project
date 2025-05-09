import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../../services/api";
import "../../../styles/pages/doctor/DoctorRegister.css";

const DoctorRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    qualification: "",
    experience: "",
    clinicAddress: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
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

  const validateStep2 = () => {
    if (!formData.specialization || !formData.qualification || !formData.experience) {
      setError("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const requestData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        clinicAddress: formData.clinicAddress || null
      };

      const response = await authApi.registerDoctor(requestData);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/doctor-login');
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
            <i className="fas fa-user-md logo-icon"></i>
            <h1>Join Our Healthcare Platform</h1>
            <p>Create your account to provide healthcare services</p>
          </div>
          <div className="features">
            <div className="feature-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Manage Appointments</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-user-injured"></i>
              <span>Patient Management</span>
            </div>
            <div className="feature-item">
              <i className="fas fa-clock"></i>
              <span>Flexible Schedule</span>
            </div>
          </div>
        </div>

        <div className="register-right">
          <div className="register-box">
            <div className="register-header">
              <h2>Doctor Registration</h2>
              <p>Step {step} of 2</p>
            </div>

            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: step === 1 ? '50%' : '100%' }}
              ></div>
            </div>

            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && (
                <div className="form-step">
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
                </div>
              )}

              {step === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="specialization">
                      <i className="fas fa-stethoscope"></i>
                      Specialization*
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      placeholder="Enter your specialization"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="qualification">
                      <i className="fas fa-graduation-cap"></i>
                      Qualification*
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      required
                      placeholder="Enter your qualification"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experience">
                      <i className="fas fa-briefcase"></i>
                      Years of Experience*
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="Years of experience"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="clinicAddress">
                      <i className="fas fa-hospital"></i>
                      Clinic Address
                    </label>
                    <textarea
                      id="clinicAddress"
                      name="clinicAddress"
                      value={formData.clinicAddress}
                      onChange={handleChange}
                      placeholder="Enter your clinic address"
                      rows="3"
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                {step === 2 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNextStep}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : step === 1 ? (
                    "Next"
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>

            <div className="register-footer">
              <p>
                Already have an account?{" "}
                <a href="/doctor-login">Login here</a>
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

export default DoctorRegister; 