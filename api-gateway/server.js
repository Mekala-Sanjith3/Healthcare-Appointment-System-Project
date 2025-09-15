const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

// Import custom middleware
const { authenticateJWT, authorize, isPublicRoute } = require('./middleware/auth');
const { requestTracker, metricsEndpoint, securityMonitoring } = require('./middleware/monitoring');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway.log' })
  ]
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(requestTracker);
app.use(securityMonitoring);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Apply auth middleware
app.use(authenticateJWT);

// Setup proxy middleware
const apiProxy = createProxyMiddleware({
  target: process.env.API_SERVICE_URL || 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove /api prefix when forwarding to target
  },
  onProxyReq: (proxyReq, req, res) => {
    // Log the proxied request
    logger.info(`Proxying request [${req.method}]: ${req.path}`);
    
    // Add any required headers or modify the request
    if (req.user) {
      proxyReq.setHeader('X-User-Role', req.user.role);
      proxyReq.setHeader('X-User-ID', req.user.id);
    }
  },
  onError: (err, req, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).send('Proxy Error');
  }
});

// Define route-specific middleware
const setupRoutes = () => {
  // Admin routes require admin role
  app.use('/api/admin', authorize('ADMIN'));
  
  // Doctor-specific routes
  app.use('/api/doctors', (req, res, next) => {
    // Allow doctors to access their own data
    if (req.method === 'GET' && req.user && req.user.role === 'DOCTOR') {
      return next();
    }
    // Admin can access all doctor data
    if (req.user && req.user.role === 'ADMIN') {
      return next();
    }
    // For any other roles, restrict access to specific endpoints
    if (req.path === '/list' || req.path === '/available') {
      return next();
    }
    res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
  });
  
  // Patient-specific routes
  app.use('/api/patients', (req, res, next) => {
    // Allow patients to access their own data
    if (req.user && req.user.role === 'PATIENT' && req.path.includes(`/${req.user.id}`)) {
      return next();
    }
    // Doctors and admins can access patient data
    if (req.user && (req.user.role === 'DOCTOR' || req.user.role === 'ADMIN')) {
      return next();
    }
    res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to access this resource'
    });
  });
  
  // Setup service-specific routes
  const serviceRoutes = {
    '/api/auth': apiProxy,
    '/api/doctors': apiProxy,
    '/api/patients': apiProxy,
    '/api/appointments': apiProxy,
    '/api/medical-records': apiProxy,
    '/api/payments': apiProxy,
    '/api/admin': apiProxy
  };

  // Register routes
  Object.keys(serviceRoutes).forEach(route => {
    app.use(route, serviceRoutes[route]);
  });

  // Monitoring endpoints
  app.get('/metrics', authorize('ADMIN'), metricsEndpoint);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date() });
  });
};

// Setup routes
setupRoutes();

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  console.log(`API Gateway running on port ${PORT}`);
});

// Handle SIGTERM signal for graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack}`);
  process.exit(1);
}); 