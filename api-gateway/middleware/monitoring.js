const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway-monitoring.log' })
  ]
});

// In-memory metrics storage
// In a production environment, use a more robust solution like Prometheus
const metrics = {
  totalRequests: 0,
  requestsByEndpoint: {},
  responseTimeByEndpoint: {},
  errorsByEndpoint: {},
  statusCodeCounts: {},
  activeRequests: 0
};

// Request tracking middleware
const requestTracker = (req, res, next) => {
  // Record request start time
  const startTime = process.hrtime();
  
  // Increment active requests
  metrics.activeRequests++;
  
  // Increment total requests
  metrics.totalRequests++;
  
  // Track requests by endpoint
  const endpoint = `${req.method} ${req.path}`;
  metrics.requestsByEndpoint[endpoint] = (metrics.requestsByEndpoint[endpoint] || 0) + 1;
  
  // Capture original end function
  const originalEnd = res.end;
  
  // Override end function to track response
  res.end = function() {
    // Calculate response time
    const hrtime = process.hrtime(startTime);
    const responseTimeMs = Math.round(hrtime[0] * 1000 + hrtime[1] / 1000000);
    
    // Update response time metrics
    if (!metrics.responseTimeByEndpoint[endpoint]) {
      metrics.responseTimeByEndpoint[endpoint] = {
        count: 0,
        totalTime: 0,
        average: 0,
        min: responseTimeMs,
        max: responseTimeMs
      };
    }
    
    const stats = metrics.responseTimeByEndpoint[endpoint];
    stats.count++;
    stats.totalTime += responseTimeMs;
    stats.average = stats.totalTime / stats.count;
    stats.min = Math.min(stats.min, responseTimeMs);
    stats.max = Math.max(stats.max, responseTimeMs);
    
    // Track status codes
    const statusCode = res.statusCode;
    metrics.statusCodeCounts[statusCode] = (metrics.statusCodeCounts[statusCode] || 0) + 1;
    
    // Track errors
    if (statusCode >= 400) {
      metrics.errorsByEndpoint[endpoint] = (metrics.errorsByEndpoint[endpoint] || 0) + 1;
    }
    
    // Decrement active requests
    metrics.activeRequests--;
    
    // Log the request
    const logEntry = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime: responseTimeMs,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    // Add user info if available
    if (req.user) {
      logEntry.userId = req.user.id;
      logEntry.userRole = req.user.role;
    }
    
    logger.info('Request completed', logEntry);
    
    // Call original end
    originalEnd.apply(res, arguments);
  };
  
  next();
};

// Metrics endpoint to expose gathered metrics
const metricsEndpoint = (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    metrics: {
      totalRequests: metrics.totalRequests,
      activeRequests: metrics.activeRequests,
      endpointStats: Object.keys(metrics.requestsByEndpoint).map(endpoint => ({
        endpoint,
        requests: metrics.requestsByEndpoint[endpoint],
        errors: metrics.errorsByEndpoint[endpoint] || 0,
        responseTime: metrics.responseTimeByEndpoint[endpoint] || { average: 0, min: 0, max: 0 }
      })),
      statusCodes: metrics.statusCodeCounts
    }
  });
};

// Reset metrics - for testing or when values get too large
const resetMetrics = () => {
  Object.keys(metrics).forEach(key => {
    if (typeof metrics[key] === 'number') {
      metrics[key] = 0;
    } else {
      metrics[key] = {};
    }
  });
};

// Middleware to handle rate limiting and suspicious activity
const securityMonitoring = (req, res, next) => {
  // For more advanced implementations, add IP-based rate limiting,
  // checking request patterns for potential attacks,
  // and monitoring excessive error responses from a single source
  
  next();
};

module.exports = {
  requestTracker,
  metricsEndpoint,
  resetMetrics,
  securityMonitoring
}; 