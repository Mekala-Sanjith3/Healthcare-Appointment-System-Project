import React from 'react';
import '../../styles/pages/AdvancedFeatures.css';

const AdvancedFeatures = () => {
  return (
    <div className="advanced-features-container">
      <h1 className="page-title">Advanced Architectural Features</h1>
      
      <section className="feature-section">
        <h2>API Gateway</h2>
        <div className="feature-content">
          <div className="feature-description">
            <p>
              Our healthcare system implements an API Gateway as a single entry point for all client requests.
              The API Gateway handles cross-cutting concerns such as:
            </p>
            <ul>
              <li>Authentication and authorization</li>
              <li>Request routing to appropriate services</li>
              <li>Rate limiting to prevent abuse</li>
              <li>Request/response logging and monitoring</li>
              <li>Error handling and response normalization</li>
            </ul>
            <p>
              This architecture enables us to evolve our backend services independently while maintaining
              a consistent API for frontend clients.
            </p>
          </div>
          <div className="feature-diagram">
            <img src="/images/api-gateway-diagram.png" alt="API Gateway Architecture" 
              onError={(e) => e.target.style.display = 'none'} />
            <div className="diagram-placeholder">
              <div className="diagram-box client">Client Applications</div>
              <div className="diagram-arrow">↓</div>
              <div className="diagram-box gateway">API Gateway</div>
              <div className="diagram-arrow-container">
                <div className="diagram-arrow-multiple">↙</div>
                <div className="diagram-arrow-multiple">↓</div>
                <div className="diagram-arrow-multiple">↘</div>
              </div>
              <div className="diagram-service-container">
                <div className="diagram-box service">Auth<br/>Service</div>
                <div className="diagram-box service">Doctor<br/>Service</div>
                <div className="diagram-box service">Patient<br/>Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="feature-section">
        <h2>Microservices Architecture</h2>
        <div className="feature-content">
          <div className="feature-description">
            <p>
              Our system is designed with a microservices architecture in mind, where each domain functionality 
              is isolated into its own independently deployable service:
            </p>
            <ul>
              <li><strong>Authentication Service</strong>: Handles user registration, login, and token management</li>
              <li><strong>Doctor Service</strong>: Manages doctor profiles, availability, and specialties</li>
              <li><strong>Patient Service</strong>: Manages patient profiles and medical history</li>
              <li><strong>Appointment Service</strong>: Handles scheduling, rescheduling, and cancellation</li>
              <li><strong>Medical Records Service</strong>: Manages patient medical records</li>
              <li><strong>Payment Service</strong>: Processes payments and billing</li>
              <li><strong>Admin Service</strong>: Provides administrative functionality</li>
            </ul>
            <p>
              Each service has its own responsibilities, data storage, and business logic, enabling:
            </p>
            <ul>
              <li>Independent development and deployment</li>
              <li>Technology diversity (using the best tool for each job)</li>
              <li>Improved fault isolation and resilience</li>
              <li>Better scalability for specific components under high load</li>
            </ul>
          </div>
        </div>
      </section>
      
      <section className="feature-section">
        <h2>Load Balancing</h2>
        <div className="feature-content">
          <div className="feature-description">
            <p>
              To ensure high availability and performance, our API Gateway implements load balancing to distribute
              traffic across multiple service instances:
            </p>
            <ul>
              <li><strong>Health Checks</strong>: Continuously monitors service health</li>
              <li><strong>Load Distribution</strong>: Distributes requests using round-robin algorithm</li>
              <li><strong>Failover</strong>: Automatically routes traffic away from failed instances</li>
              <li><strong>Sticky Sessions</strong>: Maintains session affinity where needed</li>
            </ul>
            <p>
              This approach allows us to scale horizontally by adding more service instances during peak usage periods,
              ensuring consistent performance and reliability.
            </p>
          </div>
          <div className="feature-diagram">
            <div className="diagram-placeholder">
              <div className="diagram-box client">Client</div>
              <div className="diagram-arrow">↓</div>
              <div className="diagram-box gateway">Load Balancer</div>
              <div className="diagram-arrow-container">
                <div className="diagram-arrow-multiple">↙</div>
                <div className="diagram-arrow-multiple">↓</div>
                <div className="diagram-arrow-multiple">↘</div>
              </div>
              <div className="diagram-service-container">
                <div className="diagram-box service">Server<br/>Instance 1</div>
                <div className="diagram-box service">Server<br/>Instance 2</div>
                <div className="diagram-box service">Server<br/>Instance 3</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdvancedFeatures; 