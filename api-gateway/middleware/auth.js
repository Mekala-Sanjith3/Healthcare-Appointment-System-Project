const jwt = require('jsonwebtoken');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway-auth.log' })
  ]
});

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/register/patient',
  '/api/auth/register/doctor',
  '/api/health',
  '/health'
];

const isPublicRoute = (path) => {
  return publicRoutes.includes(path) || 
         path.startsWith('/api/public') || 
         path.includes('/assets/');
};

const authenticateJWT = (req, res, next) => {

  if (isPublicRoute(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
      if (err) {
        logger.error(`Authentication failed: ${err.message} for path ${req.path}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Your session has expired or token is invalid'
        });
      }
      req.user = user;
      if (req.path.startsWith('/api/admin') && user.role !== 'ADMIN') {
        logger.warn(`Unauthorized access attempt to admin endpoint by ${user.email} with role ${user.role}`);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource'
        });
      }
      
      // Log the successful authentication
      logger.info(`Authenticated user ${user.email} with role ${user.role} for ${req.path}`);
      next();
    });
  } else {
    logger.warn(`Unauthorized access attempt to ${req.path}, no auth header provided`);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      logger.warn(`Authorization failed: No user or role in request for ${req.path}`);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      logger.warn(`Authorization failed: User ${req.user.email} with role ${req.user.role} attempted to access ${req.path} requiring roles ${roles}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorize,
  isPublicRoute
}; 