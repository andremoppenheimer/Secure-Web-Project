# Secure Task Management System

## Overview
The Secure Task Management System is an enhanced version of a simple CRUD web application designed to manage tasks. It introduces robust security features to protect against common web application vulnerabilities, focusing on securing user authentication, task management operations, and data handling. The project addresses critical security risks based on the OWASP Top Ten 2021, ensuring that the application is secure, scalable, and user-friendly.

## Features and Security Objectives

### Core Features:
- **Login:** Users can log in securely using email and password.
- **Task Management:** Admin users can manage tasks (create, edit, delete), while regular users can only view tasks.

### Security Objectives:
address critical risks from the OWASP Top Ten 2021: Broken Access Control through Role-Based Access Control (RBAC) ensures users perform only authorized actions; Cryptographic Failures are mitigated with BCrypt for secure password hashing; Injection risks are reduced via input validation, sanitization, and parameterized queries with mongoose; Insecure Design is tackled by modular architecture and secure data handling; and Security Misconfiguration is addressed by helmet.js for secure headers and enforcing HTTPS for encrypted communication.

## Project Structure

```plaintext
├── models/
│   ├── user.js              # User model for MongoDB
│   └── task.js              # Task model for MongoDB
├── login.html               # Login page html
├── passport-config.js       # Initializing passport to user authentication
├── script-login.js          # Login page script
├── script.js                # admin index page script
├── server.js                # Establish server, db connection, Middlewares and routes. It will be divided in more files in next versions
├── style.css                # frontend UI
├── user_index.html          # user index page html
├── user_scrip.js            # user index page script
└── README.md                # Project documentation (this file)
```


## Setup and Installation Instructions

### 1. Clone the repository:
```bash
git clone https://github.com/your-username/secure-task-management.git
cd secure-task-management
```
### 2. Install dependencies: 
```bash
npm install
```
### 3. Run the application
```bash
npm start
```
### 4. Access the application:
Open your browser and navigate to http://localhost:3000 for development version.
## Usage Guidelines

### Key Features:
- **Login:** Use the registered email and password to log in to the application.
- **Create Tasks:** Admin users can create new tasks via the task management page.
- **Edit and Delete Tasks:** Admin users can edit or delete tasks.
- **Search Tasks:** Filter tasks by assigned user.

### User Roles:
- **Admin:** Full access to create, edit, delete, and manage tasks.
- **User:** Read-only access to view tasks assigned to them.

## Security Improvements

The following security features were implemented to address critical vulnerabilities:

1. **Password Hashing:** User passwords are hashed using bcrypt, ensuring that they are not stored in plaintext.
2. **Session Management:** Session data is stored securely in MongoDB Atlas, with cookies configured for HttpOnly, Secure, and SameSite attributes to prevent session hijacking.
3. **Role-Based Access Control (RBAC):** Fine-grained access control ensures that only authorized users (admins) can perform sensitive actions.
4. **CSRF Protection:** Implemented using the csurf middleware to protect against cross-site request forgery.
5. **Input Validation and Sanitization:** User input is sanitized and validated using express-validator to mitigate SQL injection and XSS attacks.
6. **HTTPS Enforcement:** HTTPS is enforced in the production environment to protect data in transit.

## Testing Process

The following testing tools were used to validate the security of the application:

- **Static Application Security Testing (SAST):** Tools like Bearer were used to scan for common vulnerabilities such as hard-coded secrets, insecure cookies, and input validation issues.
- **Functional Testing:** The application’s core features (CRUD operations, authentication, and RBAC) were tested to ensure that they function as expected.
- **Security Testing:** Specific security-related tests focused on input sanitization, CSRF protection, and session handling.

### Key Testing Findings:
- **Hard-Coded Secrets:** Needs to replace hard-coded secrets with environment variables for improved security.
- **Unsanitized Input in NoSQL Query:** False positive identified; proper input sanitization already in place.
- **Logger Information Leakage:** Needs to remove sensitive information from console logs to prevent data leakage.
- **Insecure Cookie Configuration:** Will be fixed in production environment by ensuring cookies are only transmitted over HTTPS.

## Contributions

This project leverages several open-source libraries and tools that contribute to its functionality and security:

- **Express**: web framework for Node.js that handles HTTP requests and responses.
- **express-session**: Manages user sessions by storing session data on the server side, enabling persistent login states.
- **cookie-parser**: Parses cookies sent by the client and makes them available in `req.cookies` for handling session cookies and other custom cookies.
- **csurf**: Provides middleware to protect against Cross-Site Request Forgery (CSRF) attacks by validating the CSRF token.
- **passport**: Authentication middleware for Node.js, supporting a variety of login strategies such as local authentication and OAuth.
- **express-flash**: A simple way to manage temporary flash messages, typically used to notify users about success or error actions.
- **path**: A built-in Node.js module that helps handle and transform file paths across different operating systems.
- **mongoose**: An Object Data Modeling (ODM) library for MongoDB, providing schema-based solutions for modeling application data.
- **connect-mongo**: A MongoDB session store for **express-session**, enabling persistent session storage across server restarts.
- **express-validator**: Middleware that validates and sanitizes incoming data to prevent SQL injection, XSS, and other attacks.
- **helmet**: A collection of security middleware that sets HTTP headers to secure the app from various web vulnerabilities.

These libraries were selected to provide a robust foundation for a secure, scalable web application.

## References

- **[Express.js](https://expressjs.com/)**  
  Express is a fast, minimalist web framework for Node.js used to build server-side applications.
  
- **[express-session](https://www.npmjs.com/package/express-session)**  
  This module enables session handling for Node.js applications, providing features like session persistence across requests.
  
- **[cookie-parser](https://www.npmjs.com/package/cookie-parser)**  
  A middleware to parse cookies in the incoming HTTP request, allowing the server to work with cookies easily.

- **[csurf](https://www.npmjs.com/package/csurf)**  
  A middleware for Node.js that helps protect against CSRF attacks by verifying the CSRF token.

- **[passport](http://www.passportjs.org/)**  
  Passport is a powerful and flexible authentication middleware for Node.js, supporting a variety of strategies for authenticating users.

- **[express-flash](https://www.npmjs.com/package/express-flash)**  
  Express-flash allows the app to show temporary flash messages (useful for notifying users about certain actions).

- **[path](https://nodejs.org/api/path.html)**  
  Path is a built-in Node.js module that allows you to work with and manipulate file paths across different platforms.

- **[mongoose](https://mongoosejs.com/)**  
  Mongoose is an ODM for MongoDB and provides schema-based solutions to interact with MongoDB data in a structured way.

- **[connect-mongo](https://www.npmjs.com/package/connect-mongo)**  
  MongoDB-based session store for **express-session**, making it possible to persist session data in MongoDB.

- **[express-validator](https://express-validator.github.io/docs/)**  
  A set of express.js middleware for validating and sanitizing user input to ensure security and data integrity.

- **[helmet](https://helmetjs.github.io/)**  
  Helmet helps secure your app by setting various HTTP headers that protect it from common web vulnerabilities like XSS, clickjacking, and others.

