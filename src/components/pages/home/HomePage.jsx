import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../common/Button/button";
import { Card } from "../../common/Card/card";
import "../../../styles/pages/home/HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Header Section */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <div className="heart-icon">❤</div>
            <span className="logo-health">Health</span>
            <span className="logo-care">Care</span>
          </div>
          <nav className="nav-links">
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#testimonials">Testimonials</a>
            <a href="#contact">Contact</a>
            <a href="#portal-section" className="login-btn">Login</a>
          </nav>
        </div>
      </header>

      <div className="home-container">
        {/* Add wave design */}
        <div className="wave-container">
          <div className="wave"></div>
          <div className="wave wave-2"></div>
        </div>
        
        {/* Add floating shapes */}
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>

        {/* Main content starts here */}
        <main className="main-content">
          <h1>
            <span className="gradient-text">Empowering Health</span>, Enriching Lives
          </h1>
          <p className="subtitle">
            <span className="gradient-text">Advanced Healthcare Solutions</span> for a Better Tomorrow
          </p>
          <p className="description">
            Experience world-class healthcare services with cutting-edge technology and compassionate
            care from our team of expert medical professionals.
          </p>
          <div className="button-group">
            <a href="#services" className="btn explore">EXPLORE SERVICES</a>
          </div>

          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-text">Expert Doctors</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-text">Happy Patients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-text">Years Experience</span>
            </div>
          </div>
        </main>

        {/* Add curved divider */}
        <div className="curved-divider">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
          </svg>
        </div>

        {/* Add section divider before About section */}
        <div className="section-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#f8f9fa" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* About Us Section */}
        <section id="about" className="about-section">
          <div className="about-container">
            <h2>About Us</h2>
            <div className="about-content">
              <div className="about-text">
                <h3>Leading Healthcare Provider</h3>
                <p>With over 15 years of excellence in healthcare, we are committed to providing the highest quality medical services to our community. Our state-of-the-art facilities and dedicated team of healthcare professionals ensure that you receive the best care possible.</p>
                <div className="about-features">
                  <div className="about-feature">
                    <i className="fas fa-hospital"></i>
                    <h4>Modern Facilities</h4>
                    <p>Equipped with latest medical technology</p>
                  </div>
                  <div className="about-feature">
                    <i className="fas fa-user-md"></i>
                    <h4>Expert Doctors</h4>
                    <p>Highly qualified medical professionals</p>
                  </div>
                  <div className="about-feature">
                    <i className="fas fa-heart"></i>
                    <h4>Patient Care</h4>
                    <p>Compassionate and personalized attention</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Add section divider after About section */}
        <div className="section-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        {/* Services Section */}
<section id="services" className="services-section">
  <h2 className="section-title">Our Services</h2>
  <div className="services-grid">
    {/* Existing cards with updated buttons */}
    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-heart-pulse"></i>
      </div>
      <h3>Cardiology</h3>
      <p>Expert heart care with advanced diagnostic and treatment services</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Heart Disease Treatment</li>
        <li><i className="fas fa-check"></i> ECG & Echo Tests</li>
        <li><i className="fas fa-check"></i> Blood Pressure Care</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Cardiology" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-brain"></i>
      </div>
      <h3>Neurology</h3>
      <p>Comprehensive care for neurological conditions and disorders</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Brain Disorder Treatment</li>
        <li><i className="fas fa-check"></i> Spine Care</li>
        <li><i className="fas fa-check"></i> Stroke Management</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Neurology" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-bone"></i>
      </div>
      <h3>Orthopedics</h3>
      <p>Specialized care for bones, joints, and musculoskeletal conditions</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Joint Replacement</li>
        <li><i className="fas fa-check"></i> Sports Injuries</li>
        <li><i className="fas fa-check"></i> Fracture Care</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Orthopedic_surgery" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-tooth"></i>
      </div>
      <h3>Dental Care</h3>
      <p>Complete dental solutions for a healthy and beautiful smile</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Dental Implants</li>
        <li><i className="fas fa-check"></i> Root Canal</li>
        <li><i className="fas fa-check"></i> Cosmetic Dentistry</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Dentistry" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-eye"></i>
      </div>
      <h3>Ophthalmology</h3>
      <p>Advanced eye care and vision correction treatments</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Cataract Surgery</li>
        <li><i className="fas fa-check"></i> Vision Correction</li>
        <li><i className="fas fa-check"></i> Glaucoma Treatment</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Ophthalmology" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-stethoscope"></i>
      </div>
      <h3>General Medicine</h3>
      <p>Primary healthcare services for all age groups</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Regular Checkups</li>
        <li><i className="fas fa-check"></i> Vaccinations</li>
        <li><i className="fas fa-check"></i> Health Screening</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Internal_medicine" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    {/* New Service Cards */}
    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-lungs"></i>
      </div>
      <h3>Pulmonology</h3>
      <p>Specialized care for respiratory system and lung diseases</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Asthma Treatment</li>
        <li><i className="fas fa-check"></i> COPD Management</li>
        <li><i className="fas fa-check"></i> Sleep Disorders</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Pulmonology" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>

    <div className="service-card">
      <div className="service-icon">
        <i className="fas fa-notes-medical"></i>
      </div>
      <h3>Nephrology</h3>
      <p>Expert care for kidney diseases and related conditions</p>
      <ul className="service-features">
        <li><i className="fas fa-check"></i> Kidney Disease Treatment</li>
        <li><i className="fas fa-check"></i> Dialysis Services</li>
        <li><i className="fas fa-check"></i> Transplant Care</li>
      </ul>
      <a href="https://en.wikipedia.org/wiki/Nephrology" target="_blank" rel="noopener noreferrer" className="service-btn">Learn More</a>
    </div>
  </div>
</section>


        {/* Why Choose Us Section */}
        <section className="why-choose-us">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <h3>Expert Doctors</h3>
              <p>World-class healthcare professionals with years of experience in their specialties</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-laptop-medical"></i>
              </div>
              <h3>Advanced Technology</h3>
              <p>State-of-the-art medical equipment and innovative treatment solutions</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-ambulance"></i>
              </div>
              <h3>24/7 Emergency Care</h3>
              <p>Round-the-clock emergency services with rapid response teams</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-flask"></i>
              </div>
              <h3>Modern Laboratories</h3>
              <p>Advanced diagnostic facilities with precise and quick results</p>
            </div>
          </div>
        </section>

        {/* Healthcare Portal Section */}
        <section id="portal-section" className="portal-section">
          <h2>Access Your Healthcare Portal</h2>
          <div className="portal-cards">
            <div className="portal-card">
              <h3>Patient Portal</h3>
              <ul>
                <li>View Medical Records</li>
                <li>Schedule Appointments</li>
                <li>Message Your Doctor</li>
                <li>Access Lab Results</li>
              </ul>
              <button className="portal-btn" onClick={() => navigate('/patient-login')}>Login</button>
            </div>
            <div className="portal-card">
              <h3>Doctor Portal</h3>
              <ul>
                <li>Access Patient Records</li>
                <li>Manage Schedule</li>
                <li>View Lab Results</li>
                <li>Telemedicine Console</li>
              </ul>
              <button className="portal-btn" onClick={() => navigate('/doctor-login')}>Login</button>
            </div>
            <div className="portal-card">
              <h3>Admin Portal</h3>
              <ul>
                <li>System Management</li>
                <li>User Administration</li>
                <li>Analytics Dashboard</li>
                <li>Resource Planning</li>
              </ul>
              <button className="portal-btn" onClick={() => navigate('/admin-login')}>Login</button>
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials-section">
          <div className="container">
            <h2 className="section-title">Patient Testimonials</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="quote"><i className="fas fa-quote-left"></i></div>
                <p>Outstanding medical care and professional staff. The doctors are highly knowledgeable++ and caring.</p>
                <div className="author">- Pavan</div>
              </div>
              <div className="testimonial-card">
                <div className="quote"><i className="fas fa-quote-left"></i></div>
                <p>The online appointment system is so convenient. I can manage my healthcare needs efficiently.</p>
                <div className="author">- Sanjith</div>
              </div>
              <div className="testimonial-card">
                <div className="quote"><i className="fas fa-quote-left"></i></div>
                <p>Excellent facilities and prompt service. The staff is always ready to help with a smile.</p>
                <div className="author">- Vamsee Krishna</div>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-info">
                <div className="footer-logo">
                  <i className="fas fa-heartbeat"></i> HealthCare
                </div>
                <p>Providing Quality Healthcare Services</p>
                <div className="social-links">
                  <a href="#"><i className="fab fa-facebook"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-linkedin"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
              <div className="footer-links">
                <h3>Quick Links</h3>
                <a href="#about">About Us</a>
                <a href="#services">Services</a>
                <a href="#contact">Contact</a>
                <a href="#privacy">Privacy Policy</a>
              </div>
              <div className="footer-contact">
                <h3>Contact Us</h3>
                <p><i className="fas fa-phone"></i> +91 100-100-100-100</p>
                <p><i className="fas fa-envelope"></i> info@healthcare.com</p>
                <p><i className="fas fa-map-marker-alt"></i>Guntur City</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 HealthCare System. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;