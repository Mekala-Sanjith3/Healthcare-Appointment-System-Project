require('dotenv').config();

const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/auth',
    public: true
  },
  doctors: {
    url: process.env.DOCTORS_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/doctors',
    public: false
  },
  patients: {
    url: process.env.PATIENTS_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/patients',
    public: false
  },
  appointments: {
    url: process.env.APPOINTMENTS_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/appointments',
    public: false
  },
  medicalRecords: {
    url: process.env.MEDICAL_RECORDS_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/medical-records',
    public: false
  },
  payments: {
    url: process.env.PAYMENTS_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/payments',
    public: false
  },
  admin: {
    url: process.env.ADMIN_SERVICE_URL || process.env.API_SERVICE_URL || 'http://localhost:8080',
    prefix: '/api/admin',
    public: false,
    requireRole: 'ADMIN'
  }
};

// Public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register/patient',
  '/api/auth/register/doctor',
  '/api/health',
  '/health',
  '/api/public',
  '/metrics'
];

// Role-based access control configuration
const rbacRules = {
  'ADMIN': {
    // Admins can access everything
    allowAll: true
  },
  'DOCTOR': {
    allowedRoutes: [
      '/api/doctors',
      '/api/patients',
      '/api/appointments',
      '/api/medical-records'
    ],
    // Additional rules can be implemented in middleware
  },
  'PATIENT': {
    allowedRoutes: [
      '/api/patients/:id', // Where :id matches their own id
      '/api/appointments/:id', // Where :id matches their own id
      '/api/doctors/list',
      '/api/doctors/available'
    ]
  }
};

// Rate limiting configuration
const rateLimitConfig = {
  standard: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // limit each IP to 10 authentication attempts per hour
  }
};

// CORS configuration
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true
};

// Logging configuration
const loggingConfig = {
  level: LOG_LEVEL,
  format: 'json',
  filename: 'api-gateway.log'
};

module.exports = {
  PORT,
  NODE_ENV,
  JWT_SECRET,
  services,
  publicRoutes,
  rbacRules,
  rateLimitConfig,
  corsConfig,
  loggingConfig
}; 