# Healthcare Appointment System - API Gateway

This API Gateway serves as the entry point for all client requests to the Healthcare Appointment System. It provides routing, authentication, rate limiting, and logging functionality.

## Features

- **Centralized Routing**: Routes requests to appropriate backend services
- **Authentication**: JWT-based authentication for secure API access
- **Rate Limiting**: Protects services from abuse and overload
- **Logging**: Comprehensive request and error logging
- **Error Handling**: Centralized error handling for all services

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example`:
   ```
   PORT=8000
   JWT_SECRET=your_jwt_secret_key_here
   API_SERVICE_URL=http://localhost:8080
   LOG_LEVEL=info
   ```

3. Start the gateway:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

The API Gateway forwards requests to the appropriate backend services:

| Route                | Service             | Description                      |
|----------------------|---------------------|----------------------------------|
| `/api/auth/*`        | Authentication      | User authentication/registration |
| `/api/doctors/*`     | Doctor Service      | Doctor management                |
| `/api/patients/*`    | Patient Service     | Patient management               |
| `/api/appointments/*`| Appointment Service | Appointment scheduling           |
| `/api/medical-records/*` | Medical Records | Medical records management      |
| `/api/payments/*`    | Payment Service     | Payment processing               |
| `/api/admin/*`       | Admin Service       | Administrative operations        |

## Configuration

### Environment Variables

- `PORT`: Port number for the API Gateway (default: 8000)
- `JWT_SECRET`: Secret key for JWT token validation
- `API_SERVICE_URL`: Base URL for the backend API service
- `LOG_LEVEL`: Logging level (info, error, debug, etc.)

## Architecture

This API Gateway implements the following architectural principles:

1. **Single Entry Point**: All requests go through the gateway
2. **Authentication/Authorization**: Centralized security checks
3. **Request Routing**: Routes to appropriate services
4. **Monitoring**: Logs all requests and errors

## Next Steps

Future enhancements could include:

1. **Service Discovery**: Dynamic service registration and discovery
2. **Circuit Breaking**: Prevent cascading failures
3. **Request Transformation**: Modify requests/responses as needed
4. **Load Balancing**: Distribute traffic across multiple service instances
5. **Response Caching**: Cache responses for improved performance 