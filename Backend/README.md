# JobLink Backend API

A comprehensive backend API for the JobLink job portal application built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Role-based access control (Jobseeker/Employer)
  - Password reset functionality

- **Job Management**
  - CRUD operations for jobs
  - Advanced search and filtering
  - Job categories and types
  - Featured jobs
  - Company job management

- **Application System**
  - Job application submission
  - Application status tracking
  - Application management for employers
  - Communication tracking
  - Internal notes system

- **User Profiles**
  - Profile management for jobseekers and employers
  - Skills and experience tracking
  - Portfolio and social links
  - Resume upload functionality

- **Company Management**
  - Company profile creation and management
  - Company admin system
  - Company job statistics
  - Company reviews and ratings

- **Search & Discovery**
  - Full-text search across jobs and companies
  - Advanced filtering options
  - Pagination support
  - Search analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **File Upload**: Multer (for future file upload features)

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd joblink-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/joblink
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Jobs
- `GET /api/jobs` - Get all jobs with search/filters
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/categories` - Get job categories
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (Employer)
- `PUT /api/jobs/:id` - Update job (Employer)
- `DELETE /api/jobs/:id` - Delete job (Employer)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs
- `POST /api/jobs/:id/toggle-featured` - Toggle featured status

### Applications
- `POST /api/applications` - Apply for job (Jobseeker)
- `GET /api/applications/my-applications` - Get user's applications
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id/status` - Update application status (Employer)
- `POST /api/applications/:id/withdraw` - Withdraw application (Jobseeker)
- `GET /api/applications/job/:jobId` - Get job applications (Employer)
- `POST /api/applications/:id/note` - Add internal note (Employer)
- `POST /api/applications/:id/communication` - Add communication (Employer)
- `GET /api/applications/employer/dashboard` - Get employer dashboard

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get public user profile
- `GET /api/users/:id/applications` - Get user's applications
- `GET /api/users/:id/jobs` - Get user's posted jobs
- `POST /api/users/upload-avatar` - Upload avatar
- `POST /api/users/upload-resume` - Upload resume (Jobseeker)
- `GET /api/users/dashboard/stats` - Get dashboard statistics
- `DELETE /api/users/account` - Delete account

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company (Employer)
- `PUT /api/companies/:id` - Update company (Admin)
- `GET /api/companies/:id/jobs` - Get company jobs
- `POST /api/companies/:id/add-admin` - Add company admin
- `DELETE /api/companies/:id/remove-admin/:adminId` - Remove admin
- `GET /api/companies/employer/my-companies` - Get managed companies
- `GET /api/companies/industries` - Get industries

## Database Models

### User
- Basic user information
- Profile data (skills, experience, education)
- Social links (LinkedIn, GitHub, Portfolio)
- User type (jobseeker/employer)

### Job
- Job details (title, description, requirements)
- Salary information
- Company reference
- Skills and categories
- Application tracking

### Application
- Job and applicant references
- Application status tracking
- Cover letter and resume
- Interview and offer details
- Communication history

### Company
- Company information
- Admin management
- Statistics and reviews
- Job postings

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

## Error Handling

- Centralized error handling middleware
- Detailed error messages for development
- Secure error responses for production
- Validation error handling
- Database error handling

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS certificates
6. Use a process manager like PM2
7. Set up monitoring and logging

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/joblink |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `EMAIL_HOST` | SMTP host for emails | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
