import React, { useState, useEffect } from 'react';
import '../../../styles/pages/patient/PaymentModal.css';
import Payment from '../../../models/Payment';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  appointmentData,
  doctorDetails, 
  onPaymentComplete 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Payment form state
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    // Insurance fields
    insuranceProvider: '',
    policyNumber: '',
    memberId: '',
    // Billing address
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  // Calculate appointment cost based on doctor specialization and appointment type
  const calculateAppointmentCost = () => {
    const basePrice = 100; // Base consultation price
    
    // Adjust price based on specialization (if available)
    let specializationMultiplier = 1.0;
    if (doctorDetails && doctorDetails.specialization) {
      switch(doctorDetails.specialization) {
        case 'Cardiology':
        case 'Neurology':
        case 'Oncology':
          specializationMultiplier = 1.5;
          break;
        case 'Pediatrics':
        case 'Family Medicine':
        case 'General Medicine':
          specializationMultiplier = 1.0;
          break;
        case 'Dermatology':
        case 'Psychiatry':
          specializationMultiplier = 1.3;
          break;
        default:
          specializationMultiplier = 1.2;
      }
    }
    
    // Adjust price based on appointment type
    let appointmentTypeMultiplier = 1.0;
    if (appointmentData && appointmentData.appointmentType) {
      switch(appointmentData.appointmentType) {
        case 'Emergency':
          appointmentTypeMultiplier = 1.5;
          break;
        case 'Consultation':
          appointmentTypeMultiplier = 1.0;
          break;
        case 'Follow-up':
          appointmentTypeMultiplier = 0.8;
          break;
        default:
          appointmentTypeMultiplier = 1.0;
      }
    }
    
    const calculatedPrice = basePrice * specializationMultiplier * appointmentTypeMultiplier;
    return Math.round(calculatedPrice);
  };

  const cost = calculateAppointmentCost();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '') // Remove existing spaces
        .replace(/\D/g, '') // Remove non-digits
        .slice(0, 16); // Limit to 16 digits
      
      // Add spaces every 4 digits
      const parts = [];
      for (let i = 0; i < formattedValue.length; i += 4) {
        parts.push(formattedValue.substring(i, i + 4));
      }
      const formatted = parts.join(' ');
      
      setFormData({ ...formData, [name]: formatted });
      return;
    }
    
    // For CVV, only allow digits and max 4 digits
    if (name === 'cvv') {
      const digits = value.replace(/\D/g, '').slice(0, 4);
      setFormData({ ...formData, [name]: digits });
      return;
    }
    
    // For expiry month and year, limit to 2 digits
    if (name === 'expiryMonth' || name === 'expiryYear') {
      const digits = value.replace(/\D/g, '').slice(0, 2);
      setFormData({ ...formData, [name]: digits });
      return;
    }
    
    // For other fields, just update the value
    setFormData({ ...formData, [name]: value });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setPaymentError('');
  };

  const validatePaymentForm = () => {
    // Reset errors
    setPaymentError('');
    
    if (paymentMethod === 'CARD') {
      // Validate card payment
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        setPaymentError('Please enter a valid card number');
        return false;
      }
      
      if (!formData.cardholderName) {
        setPaymentError('Please enter the cardholder name');
        return false;
      }
      
      if (!formData.expiryMonth || !formData.expiryYear) {
        setPaymentError('Please enter a valid expiry date');
        return false;
      }
      
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
      
      if (parseInt(formData.expiryYear) < currentYear || 
          (parseInt(formData.expiryYear) === currentYear && parseInt(formData.expiryMonth) < currentMonth)) {
        setPaymentError('Card has expired');
        return false;
      }
      
      if (!formData.cvv || formData.cvv.length < 3) {
        setPaymentError('Please enter a valid CVV');
        return false;
      }
    } else if (paymentMethod === 'INSURANCE') {
      // Validate insurance payment
      if (!formData.insuranceProvider) {
        setPaymentError('Please select an insurance provider');
        return false;
      }
      
      if (!formData.policyNumber) {
        setPaymentError('Please enter your policy number');
        return false;
      }
      
      if (!formData.memberId) {
        setPaymentError('Please enter your member ID');
        return false;
      }
    }
    
    return true;
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validatePaymentForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a payment record
      const paymentDetails = new Payment({
        appointmentId: appointmentData?.id || `appointment_${Date.now()}`,
        patientId: appointmentData?.patientId,
        doctorId: appointmentData?.doctorId,
        amount: cost,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethod: paymentMethod,
        transactionId: `txn_${Date.now()}${Math.floor(Math.random() * 10000)}`,
        cardDetails: paymentMethod === 'CARD' ? {
          lastFourDigits: formData.cardNumber.replace(/\s/g, '').slice(-4),
          cardType: getCardType(formData.cardNumber),
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear
        } : null,
        insurance: paymentMethod === 'INSURANCE' ? {
          provider: formData.insuranceProvider,
          policyNumber: formData.policyNumber,
          memberId: formData.memberId
        } : null
      });
      
      // Store payment in localStorage for development purposes
      const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
      existingPayments.push(paymentDetails);
      localStorage.setItem('payments', JSON.stringify(existingPayments));
      
      // Show success message
      setShowSuccess(true);
      
      // Call the onPaymentComplete callback
      if (onPaymentComplete) {
        onPaymentComplete(paymentDetails);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardType = (cardNumber) => {
    // Remove all non-digit characters
    const number = cardNumber.replace(/\D/g, '');
    
    // Check card type based on prefix and length
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'MasterCard';
    if (/^3[47]/.test(number)) return 'American Express';
    if (/^6(?:011|5)/.test(number)) return 'Discover';
    return 'Unknown';
  };

  if (!isOpen) return null;

  // Success screen
  if (showSuccess) {
    return (
      <div className="payment-modal">
        <div className="payment-modal-content">
          <div className="payment-modal-header">
            <h2>Payment Successful</h2>
            <button className="close-btn" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="payment-success">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Payment Complete!</h3>
            <p>Your payment of ${cost}.00 has been successfully processed.</p>
            <p>A receipt has been sent to your email.</p>
            <p className="appointment-confirmation">
              Your appointment with {doctorDetails?.name || 'the doctor'} on{' '}
              {appointmentData?.appointmentDate} at {appointmentData?.appointmentTime} has been confirmed.
            </p>
            <button className="view-appointment-btn" onClick={onClose}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <div className="payment-modal-header">
          <h2>Complete Payment</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="payment-modal-body">
          <div className="appointment-summary">
            <h3>Appointment Summary</h3>
            <div className="summary-details">
              <div className="summary-item">
                <span className="item-label">Doctor:</span>
                <span className="item-value">{doctorDetails?.name || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Specialization:</span>
                <span className="item-value">{doctorDetails?.specialization || 'General Medicine'}</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Date:</span>
                <span className="item-value">{appointmentData?.appointmentDate || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Time:</span>
                <span className="item-value">{appointmentData?.appointmentTime || 'Not specified'}</span>
              </div>
              <div className="summary-item">
                <span className="item-label">Type:</span>
                <span className="item-value">{appointmentData?.appointmentType || 'Consultation'}</span>
              </div>
              <div className="summary-item cost">
                <span className="item-label">Cost:</span>
                <span className="item-value">${cost}.00</span>
              </div>
            </div>
          </div>
          
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-method-options">
              <button 
                className={`payment-method-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('CARD')}
              >
                <i className="fas fa-credit-card"></i>
                <span>Credit/Debit Card</span>
              </button>
              <button 
                className={`payment-method-btn ${paymentMethod === 'INSURANCE' ? 'active' : ''}`}
                onClick={() => handlePaymentMethodChange('INSURANCE')}
              >
                <i className="fas fa-file-medical"></i>
                <span>Insurance</span>
              </button>
            </div>
          </div>
          
          {paymentError && (
            <div className="payment-error">
              <i className="fas fa-exclamation-circle"></i>
              {paymentError}
            </div>
          )}
          
          <form onSubmit={processPayment}>
            {paymentMethod === 'CARD' && (
              <div className="card-payment-form">
                <div className="form-group">
                  <label htmlFor="cardNumber">Card Number</label>
                  <div className="card-input-wrapper">
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="card-icons">
                      <i className="fab fa-cc-visa"></i>
                      <i className="fab fa-cc-mastercard"></i>
                      <i className="fab fa-cc-amex"></i>
                    </div>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group expiry">
                    <label>Expiry Date</label>
                    <div className="expiry-inputs">
                      <input
                        type="text"
                        name="expiryMonth"
                        placeholder="MM"
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        required
                        maxLength="2"
                      />
                      <span>/</span>
                      <input
                        type="text"
                        name="expiryYear"
                        placeholder="YY"
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        required
                        maxLength="2"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group cvv">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="password"
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                      maxLength="4"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="billingAddress">Billing Address</label>
                  <input
                    type="text"
                    id="billingAddress"
                    name="billingAddress"
                    placeholder="1234 Main St"
                    value={formData.billingAddress}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      placeholder="New York"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      placeholder="NY"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      placeholder="10001"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            
            {paymentMethod === 'INSURANCE' && (
              <div className="insurance-payment-form">
                <div className="form-group">
                  <label htmlFor="insuranceProvider">Insurance Provider</label>
                  <select
                    id="insuranceProvider"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Provider</option>
                    <option value="Aetna">Aetna</option>
                    <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                    <option value="Cigna">Cigna</option>
                    <option value="United Healthcare">United Healthcare</option>
                    <option value="Humana">Humana</option>
                    <option value="Kaiser Permanente">Kaiser Permanente</option>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="policyNumber">Policy Number</label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    placeholder="Policy Number"
                    value={formData.policyNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="memberId">Member ID</label>
                  <input
                    type="text"
                    id="memberId"
                    name="memberId"
                    placeholder="Member ID"
                    value={formData.memberId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="insurance-note">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    A copay of ${Math.round(cost * 0.2)}.00 will be collected at the time of your appointment.
                    The remaining amount will be billed to your insurance provider.
                  </p>
                </div>
              </div>
            )}
            
            <div className="payment-actions">
              <button type="button" className="cancel-payment-btn" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="process-payment-btn"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock"></i> Pay ${cost}.00
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className="payment-security-note">
            <i className="fas fa-shield-alt"></i>
            <p>Your payment information is secure and encrypted.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 