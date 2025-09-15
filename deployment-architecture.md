```
                                 +-------------------+
                                 |                   |
                                 | GitHub Repository |
                                 |                   |
                                 +--------+----------+
                                          |
                                          | (push to main)
                                          v
+------------------+           +----------+-----------+
|                  |           |                      |
| GitHub Actions   +---------->+    CI/CD Pipeline    |
|                  |           |                      |
+------------------+           +----------+-----------+
                                          |
                         +---------------------------------+
                         |                |                |
                         v                v                v
        +-----------------+    +-----------------+  +----------------+
        |                 |    |                 |  |                |
        |  Build & Test   |    |   Lint & Test   |  |   Run Tests    |
        |                 |    |                 |  |                |
        +--------+--------+    +--------+--------+  +-------+--------+
                 |                      |                    |
                 |                      |                    |
                 v                      v                    v
        +-----------------+    +-----------------+  +-----------------+
        |                 |    |                 |  |                 |
        | Deploy Frontend |    | Deploy Backend  |  | Deploy Gateway  |
        |  (to Netlify)   |    |  (to Railway)   |  |  (to Heroku)    |
        |                 |    |                 |  |                 |
        +-----------------+    +-----------------+  +-----------------+
                |                      |                    |
                v                      v                    v
        +-----------------+    +-----------------+  +-----------------+
        |                 |    |                 |  |                 |
        |  React Frontend |    |   Express API   |  |   API Gateway   |
        |    (Netlify)    |    |    (Railway)    |  |    (Heroku)     |
        |                 |    |                 |  |                 |
        +--------+--------+    +--------+--------+  +-------+---------+
                 |                      |                    |
                 |                      |                    |
                 |                      v                    |
                 |             +------------------+          |
                 |             |                  |          |
                 |             |  MongoDB Atlas   |          |
                 |             |                  |          |
                 |             +------------------+          |
                 |                                           |
                 |                                           |
                 +-------------------+------------------------+
                                    |
                                    v
                          +--------------------+
                          |                    |
                          |    End Users       |
                          |                    |
                          +--------------------+
```

## CI/CD Deployment Flow Explanation

1. **Source Code**: Developers push code to GitHub repository
2. **GitHub Actions Trigger**: A push to main branch triggers CI/CD pipeline
3. **Build & Test Phase**: Builds the application and runs tests
4. **Deployment Phase**: 
   - Frontend deployed to Netlify
   - Backend API deployed to Railway
   - API Gateway deployed to Heroku
5. **Database Connection**: Backend connects to MongoDB Atlas
6. **User Access**: End users access the application via Netlify frontend

This architecture provides:
- Separation of concerns (frontend, backend, gateway)
- Scalability (each component can scale independently)
- Reliability (distributed across multiple cloud providers)
- Automated deployments (no manual steps required) 