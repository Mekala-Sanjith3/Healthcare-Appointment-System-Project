# Database Reset and Application Setup Instructions

Follow these instructions to reset your database and run the application with the new credentials.

## 1. Reset the MySQL Database

1. Open MySQL Workbench and connect to your MySQL server
2. Open the `reset_database.sql` file in MySQL Workbench
3. Execute the entire script by clicking the lightning bolt icon
4. Verify that the database `hsa_db` has been created with all tables

This script will:
- Drop the existing `hsa_db` database if it exists
- Create a new `hsa_db` database
- Create all necessary tables
- Insert sample data including:
  - 1 admin account
  - 3 doctor accounts
  - 1 patient account
  - Doctor availability schedules
  - A sample appointment

## 2. Confirm Backend Configuration

1. Make sure your `application.properties` file in `backend/src/main/resources/` has the correct database settings:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hsa_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=Sanjith_2005
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Other configuration settings remain the same
```

2. Start your Spring Boot backend application

## 3. Run the Frontend Application

1. Start your React frontend application:
```
npm run dev
```

## 4. Test with Sample Accounts

You can now log in using the following accounts:

### Admin Account
- Email: admin@healthcare.com
- Password: Password@1

### Doctor Accounts
- Email: rajesh.kumar@healthcare.com
- Email: priya.sharma@healthcare.com
- Email: mohan.venkat@healthcare.com
- Password for all: Password@1

### Patient Account
- Email: rahul@example.com
- Password: Password@1

## 5. Register New Accounts

You can also register new patient, doctor, or admin accounts as needed using the registration forms.

The registration functionality has been fixed to properly handle the registration process for all user types. 