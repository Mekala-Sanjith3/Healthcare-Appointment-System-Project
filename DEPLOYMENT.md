# Healthcare Appointment System Deployment Guide

This document provides instructions for deploying the Healthcare Appointment System with CI/CD (Continuous Integration/Continuous Deployment).

## CI/CD Deployment Architecture

Our deployment strategy uses GitHub Actions for CI/CD and deploys to three separate platforms:

1. **Frontend**: Deployed to Netlify (React application)
2. **Backend API**: Deployed to Railway (Node.js Express server)
3. **API Gateway**: Deployed to Heroku (Node.js Express API Gateway)

![Deployment Architecture](deployment-architecture.png)

## Setup Prerequisites

Before deploying, you'll need to create accounts and obtain API keys for the following services:

1. [GitHub](https://github.com) - For source code hosting and GitHub Actions
2. [Netlify](https://netlify.com) - For frontend hosting
3. [Railway](https://railway.app) - For backend deployment
4. [Heroku](https://heroku.com) - For API Gateway deployment
5. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For cloud database (optional if using Railway's MongoDB integration)

## Setting Up GitHub Secrets

The CI/CD pipeline requires several secret keys to be configured in your GitHub repository:

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Add the following repository secrets:

- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `NETLIFY_SITE_ID` - Your Netlify site ID
- `RAILWAY_TOKEN` - Your Railway API token
- `HEROKU_API_KEY` - Your Heroku API key
- `HEROKU_EMAIL` - Your Heroku account email address
- `MONGODB_URI` - Your MongoDB connection string (if using external MongoDB)

## Deployment Process

Our CI/CD pipeline follows these steps:

1. **Build and Test**:
   - Checks out the code
   - Sets up Node.js environment
   - Installs dependencies
   - Runs linting
   - Builds the application
   - Runs tests
   - Uploads build artifacts

2. **Frontend Deployment**:
   - Downloads build artifacts
   - Deploys to Netlify

3. **Backend Deployment**:
   - Deploys the Express server to Railway

4. **API Gateway Deployment**:
   - Deploys the API Gateway to Heroku

## Manual Deployment Setup

### Frontend (Netlify)

1. Create a Netlify account and create a new site
2. From your Netlify dashboard, go to User Settings > Applications > Personal access tokens
3. Generate a new personal access token and save it
4. Get your site ID from Site Settings > General > Site details > API ID

### Backend (Railway)

1. Create a Railway account
2. Install the Railway CLI: `npm install -g @railway/cli`
3. Login to Railway: `railway login`
4. Initialize your project: `railway init`
5. Create a new Railway project or link to an existing one
6. Deploy manually once: `railway up`
7. Get your Railway token: `railway login --browserless`

### API Gateway (Heroku)

1. Create a Heroku account
2. Install the Heroku CLI: `npm install -g heroku`
3. Login to Heroku: `heroku login`
4. Create a new Heroku app: `heroku create healthcare-api-gateway`
5. Get your Heroku API key from Account Settings > API Key

## Environment Configuration

### Frontend Environment Variables (Netlify)

Configure these in the Netlify dashboard under Site Settings > Build & deploy > Environment:

- `REACT_APP_API_GATEWAY_URL` - URL of your API Gateway

### Backend Environment Variables (Railway)

Configure these in the Railway dashboard under your project's Variables tab:

- `PORT` - Port for the server (e.g., 8080)
- `JWT_SECRET` - Secret key for JWT authentication
- `MONGODB_URI` - MongoDB connection string (if not using Railway's MongoDB integration)

### API Gateway Environment Variables (Heroku)

Configure these in the Heroku dashboard under Settings > Config Vars:

- `PORT` - Port for the API Gateway (usually assigned by Heroku)
- `JWT_SECRET` - Secret key for JWT authentication
- `API_SERVICE_URL` - URL of your backend service
- `ALLOWED_ORIGINS` - Comma-separated list of allowed frontend origins
- `LOG_LEVEL` - Logging level (info, error, debug, etc.)

## Monitoring and Logs

- **Frontend**: Check Netlify dashboard for deploy logs and analytics
- **Backend**: Use Railway dashboard for logs and monitoring
- **API Gateway**: Use Heroku dashboard or CLI (`heroku logs --tail --app healthcare-api-gateway`)

## Database Setup

If using MongoDB Atlas:

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Configure database access (username/password)
4. Configure network access (IP whitelist)
5. Get your connection string and add it to your environment variables

## Troubleshooting Common Issues

### Build Failures

- Check that all dependencies are correctly specified in package.json
- Ensure tests and linting are passing locally before pushing
- Verify that the Node.js version in the workflow matches your local version

### Deployment Failures

- Check that all required environment variables are set
- Verify that API keys and tokens are still valid
- Check service status pages for any outages

### Application Errors After Deployment

- Verify environment variables are correctly set
- Check for CORS issues if frontend can't communicate with backend
- Ensure database connection is properly configured

## Rollback Procedure

If a deployment causes issues:

1. Go to the GitHub repository
2. Navigate to the Actions tab
3. Find the last successful workflow run
4. Rerun that workflow to deploy the previous working version

Alternatively, you can roll back to a specific commit:

```bash
git revert <commit-hash>
git push origin main
```

This will trigger a new deployment with the reverted changes.

## Continuous Integration Best Practices

- Write comprehensive tests for your application
- Use linting and code quality tools
- Keep dependencies up to date
- Review automated build and test results before merging PRs
- Consider implementing feature flags for safer deployments 