// Payment model structure
class Payment {
  constructor(data = {}) {
    this.id = data.id || `payment_${Date.now()}`;
    this.appointmentId = data.appointmentId;
    this.patientId = data.patientId;
    this.doctorId = data.doctorId;
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.status = data.status || 'PENDING'; // PENDING, COMPLETED, FAILED, REFUNDED
    this.paymentMethod = data.paymentMethod || 'CARD'; // CARD, PAYPAL, INSURANCE, etc.
    this.transactionId = data.transactionId;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt;
    this.cardDetails = data.cardDetails || {
      lastFourDigits: data.lastFourDigits || '',
      cardType: data.cardType || '',
      expiryMonth: data.expiryMonth || '',
      expiryYear: data.expiryYear || ''
    };
    // Insurance information if applicable
    this.insurance = data.insurance || {
      provider: data.insuranceProvider || '',
      policyNumber: data.insurancePolicyNumber || '',
      coveragePercentage: data.coveragePercentage || 0
    };
    // Additional metadata
    this.metadata = data.metadata || {};
  }
}

export default Payment; 