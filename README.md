# College Placement Portal

A comprehensive web application for displaying placement opportunities and accepting student applications, built as a college-level project demonstrating both frontend and backend development skills.

## Problem Statement

"Placement Portal: Develop a web application for displaying placement opportunities and accepting student applications."

## Project Objective

Build a realistic college placement portal where students can view available placement opportunities, search and filter jobs, view complete job details, check eligibility criteria, apply for placement opportunities, submit their application, view their submitted applications, and see application status. The portal demonstrates practical implementation of both frontend (HTML5, CSS3) and backend (Node.js, Express.js) requirements.

## Features

### Student Features
- **Landing Page**: Professional homepage with placement statistics and featured opportunities
- **Job Browsing**: View all available placement opportunities with advanced search and filtering
- **Job Details**: Complete job information including company details, eligibility criteria, and selection process
- **Application Form**: Professional application submission with validation
- **Application Tracking**: View submitted applications with status timeline
- **Student Dashboard**: Personalized dashboard with application statistics and recommendations
- **Deadline Countdown**: Dynamic countdown to application deadlines
- **Saved Opportunities**: Bookmark jobs for later review
- **Recently Viewed**: Track recently viewed opportunities

### Admin Features
- **Admin Dashboard**: Overview of placement statistics and activities
- **Job Management**: View, create, edit, and delete job opportunities
- **Application Management**: View all applications and update status
- **Statistics**: Real-time placement statistics and analytics

### Technical Features
- **RESTful API**: Clean API architecture with proper HTTP methods and status codes
- **Data Validation**: Both client-side and server-side validation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Accessibility**: WCAG-compliant design with semantic HTML and ARIA labels
- **Toast Notifications**: Professional feedback system for user actions
- **Loading States**: Visual feedback during data fetching
- **Empty States**: Professional empty state designs

## Technology Stack

### Frontend (S1 - HTML5, CSS3)
- **HTML5**: Semantic markup, accessibility features, form elements
- **CSS3**: Custom styling, responsive design, CSS variables, animations
- **JavaScript (ES6+)**: Modern JavaScript, async/await, DOM manipulation
- **Vanilla JS**: No frontend frameworks - demonstrates core JavaScript skills

### Backend (S2 - Node.js, Express.js)
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web framework for REST API development
- **File-based Storage**: JSON files for data persistence (easily upgradeable to databases)
- **Middleware**: Custom middleware for validation, error handling, authentication
- **REST API**: Clean API design with proper separation of concerns

### Development Tools
- **npm**: Package management
- **nodemon**: Development server with auto-reload
- **Git**: Version control (recommended)

## Project Structure

```
WP/
├── backend/
│   ├── server.js                 # Main Express server
│   ├── routes/                   # API route definitions
│   │   ├── jobRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/              # Business logic
│   │   ├── jobController.js
│   │   ├── applicationController.js
│   │   └── adminController.js
│   ├── middleware/               # Express middleware
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── adminOnly.js
│   ├── repositories/             # Data access layer
│   │   ├── jobRepository.js
│   │   └── applicationRepository.js
│   ├── utils/                    # Utility functions
│   │   ├── fileHandler.js
│   │   └── apiResponse.js
│   └── data/                     # JSON data storage
│       ├── jobs.json
│       └── applications.json
├── frontend/
│   ├── index.html                # Landing page
│   ├── jobs.html                 # Job listing page
│   ├── job-details.html          # Job details page
│   ├── apply.html                # Application form
│   ├── applications.html         # Application tracking
│   ├── dashboard.html            # Student dashboard
│   ├── admin.html                # Admin panel
│   ├── css/
│   │   ├── style.css             # Main stylesheet
│   │   └── responsive.css        # Responsive design
│   └── js/
│       ├── common.js             # Shared utilities
│       ├── home.js               # Landing page logic
│       ├── jobs.js               # Job listing logic
│       ├── job-details.js        # Job details logic
│       ├── apply.js              # Application form logic
│       ├── applications.js       # Application tracking logic
│       ├── dashboard.js          # Dashboard logic
│       └── admin.js              # Admin panel logic
├── .env                         # Environment variables
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies
└── README.md                    # This file
```

## API Documentation

### Base URL
All API endpoints are prefixed with `/api`

### Jobs Endpoints

#### Get All Jobs
```
GET /api/jobs
```
**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "1",
      "title": "Software Engineer",
      "company": "Nexora Technologies",
      "location": "Bangalore, India",
      "type": "Full-time",
      "salary": "₹12-18 LPA",
      "description": "...",
      "skills": ["Python", "Java", "JavaScript"],
      "eligibility": {
        "education": "B.E./B.Tech",
        "branches": ["Computer Science", "IT"],
        "minCGPA": 6.5,
        "maxBacklogs": 0,
        "graduationYear": 2026
      },
      "selectionProcess": ["Resume Shortlisting", "Technical Interview"],
      "deadline": "2026-10-31",
      "isOpen": true
    }
  ]
}
```

#### Search Jobs
```
GET /api/jobs/search?search=developer&location=Mumbai&type=Full-time
```
**Query Parameters:**
- `search` (optional): Search by company, role, or skills
- `location` (optional): Filter by location
- `type` (optional): Filter by job type
- `workMode` (optional): Filter by work mode
- `minSalary` (optional): Minimum salary
- `maxSalary` (optional): Maximum salary
- `isOpen` (optional): Filter by open/closed status

#### Get Job by ID
```
GET /api/jobs/:id
```

#### Get Job Statistics
```
GET /api/jobs/stats
```
**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "open": 8,
    "closed": 2,
    "byType": {
      "Full-time": 8,
      "Internship": 2
    },
    "companies": 8
  }
}
```

#### Create Job (Admin)
```
POST /api/jobs
Headers: { "X-Admin-Key": "admin123" }
Body: {
  "title": "Software Engineer",
  "company": "Company Name",
  "location": "Location",
  "type": "Full-time",
  "salary": "₹10-15 LPA",
  "description": "Job description",
  "requirements": ["Requirement 1", "Requirement 2"],
  "skills": ["Skill 1", "Skill 2"],
  "eligibility": { ... },
  "selectionProcess": ["Step 1", "Step 2"],
  "deadline": "2026-12-31"
}
```

#### Update Job (Admin)
```
PUT /api/jobs/:id
Headers: { "X-Admin-Key": "admin123" }
Body: { "isOpen": false }
```

#### Delete Job (Admin)
```
DELETE /api/jobs/:id
Headers: { "X-Admin-Key": "admin123" }
```

### Applications Endpoints

#### Get All Applications (Admin)
```
GET /api/applications
Headers: { "X-Admin-Key": "admin123" }
```

#### Get Application by ID
```
GET /api/applications/:id
```

#### Get Applications by Job
```
GET /api/applications/job/:jobId
```

#### Get Applications by Student Email
```
GET /api/applications/student/email/:email
```

#### Get Applications by Student ID
```
GET /api/applications/student/id/:studentId
```

#### Submit Application
```
POST /api/applications
Body: {
  "jobId": "1",
  "studentName": "John Doe",
  "studentId": "2024001",
  "email": "john.doe@college.edu",
  "phone": "+91 98765 43210",
  "branch": "Computer Science",
  "year": "Final Year",
  "cgpa": 8.5,
  "graduationYear": 2026,
  "skills": "Python, JavaScript, React",
  "resume": "https://drive.google.com/resume",
  "coverLetter": "Optional cover letter"
}
```

#### Update Application Status (Admin)
```
PATCH /api/applications/:id/status
Headers: { "X-Admin-Key": "admin123" }
Body: { "status": "Shortlisted" }
```

#### Get Application Statistics
```
GET /api/applications/stats
```

#### Check Eligibility
```
POST /api/applications/:jobId/check-eligibility
Body: {
  "education": "B.E./B.Tech",
  "branch": "Computer Science",
  "cgpa": 8.0,
  "backlogs": 0,
  "graduationYear": 2026
}
```

### Admin Endpoints

#### Get Admin Overview
```
GET /api/admin/overview
Headers: { "X-Admin-Key": "admin123" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": { "total": 10, "open": 8, "closed": 2, "companies": 8 },
    "applications": { "total": 50, "byStatus": { ... } },
    "placement": { "season": "2026-27", "studentsPlaced": 214, "averagePackage": "₹12-15 LPA" }
  }
}
```

## How to Install

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Git (optional, for version control)

### Installation Steps

1. **Clone or download the project**
   ```bash
   cd WP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```
   PORT=3000
   ADMIN_KEY=admin123
   PLACEMENT_SEASON=2026-27
   STUDENTS_PLACED=214
   ```

4. **Verify installation**
   Check that `node_modules` folder is created and dependencies are installed.

## How to Run

### Development Mode
```bash
npm run dev
```
This starts the server with auto-reload on file changes.

### Production Mode
```bash
npm start
```
This starts the server in production mode.

### Access the Application
Open your browser and navigate to:
- **Main Application**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin (use admin key: `admin123`)

## Sample API Requests

### Using cURL

#### Get all jobs
```bash
curl http://localhost:3000/api/jobs
```

#### Search jobs
```bash
curl "http://localhost:3000/api/jobs/search?search=python&location=Bangalore"
```

#### Submit application
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "1",
    "studentName": "John Doe",
    "studentId": "2024001",
    "email": "john.doe@college.edu",
    "phone": "+91 98765 43210",
    "branch": "Computer Science",
    "year": "Final Year",
    "cgpa": 8.5,
    "graduationYear": 2026,
    "skills": "Python, JavaScript",
    "resume": "https://drive.google.com/resume"
  }'
```

#### Get admin overview
```bash
curl http://localhost:3000/api/admin/overview \
  -H "X-Admin-Key: admin123"
```

### Using JavaScript/Fetch
```javascript
// Get all jobs
fetch('/api/jobs')
  .then(response => response.json())
  .then(data => console.log(data));

// Submit application
fetch('/api/applications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jobId: '1',
    studentName: 'John Doe',
    // ... other fields
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## S1 – HTML5, CSS3 Compliance

This project demonstrates S1 requirements through:

### HTML5
- **Semantic Markup**: Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- **Form Elements**: Various input types (text, email, tel, url, number, select, textarea)
- **Accessibility**: ARIA labels, roles, landmarks, and semantic structure
- **Form Validation**: Built-in HTML5 validation with custom JavaScript enhancement
- **Responsive Design**: Meta viewport tag for mobile optimization

### CSS3
- **Modern CSS Features**: CSS variables, flexbox, grid, transitions, animations
- **Responsive Design**: Media queries for mobile, tablet, and desktop
- **Custom Properties**: CSS variables for consistent theming
- **Professional Styling**: Clean, academic design with proper spacing and typography
- **Cross-browser Compatibility**: Standard CSS3 with fallbacks where needed

## S2 – Node.js, Express.js Compliance

This project demonstrates S2 requirements through:

### Node.js
- **Server-side JavaScript**: Complete backend built with Node.js runtime
- **Module System**: CommonJS modules for code organization
- **Async/Await**: Modern asynchronous programming patterns
- **File System Operations**: JSON file-based data storage
- **Environment Variables**: Configuration management with dotenv

### Express.js
- **REST API Development**: Clean RESTful API design with proper HTTP methods
- **Middleware**: Custom middleware for validation, error handling, authentication
- **Route Separation**: Organized route structure for maintainability
- **Controller Pattern**: Business logic separated from routing
- **Error Handling**: Comprehensive error handling middleware
- **Static File Serving**: Frontend served through Express static middleware
- **CORS Support**: Cross-origin resource sharing configuration

## Screenshots

*(Screenshots section placeholder - add actual screenshots of the application)*

### Landing Page
![Landing Page](screenshots/landing.png)

### Job Listing
![Job Listing](screenshots/jobs.png)

### Job Details
![Job Details](screenshots/job-details.png)

### Application Form
![Application Form](screenshots/apply.png)

### Student Dashboard
![Student Dashboard](screenshots/dashboard.png)

### Admin Panel
![Admin Panel](screenshots/admin.png)

## Future Scope

### Database Integration
- Upgrade from JSON file storage to MongoDB or PostgreSQL
- Implement proper database indexing and relationships
- Add database migrations and seeding

### Advanced Features
- User authentication and authorization system
- Email notifications for application updates
- File upload for resumes (currently using URL links)
- Advanced search with filters and sorting
- Analytics and reporting dashboard
- Interview scheduling system
- Placement statistics and analytics
- Company management portal
- Resume parsing and matching algorithms

### Performance Optimization
- Implement caching strategies
- Add pagination for large datasets
- Optimize database queries
- Add CDN for static assets

### Security Enhancements
- Implement proper authentication (JWT sessions)
- Add rate limiting
- Implement CSRF protection
- Add input sanitization and validation
- Secure file upload handling
- API rate limiting

### Testing
- Unit tests for controllers and repositories
- Integration tests for API endpoints
- End-to-end tests with automated testing tools
- Load testing for performance validation

## Academic Project Guidelines

This project is designed as a college-level academic project and demonstrates:

1. **Full-stack Development**: Both frontend and backend implementation
2. **Practical Skills**: Real-world application development practices
3. **Clean Code**: Organized, maintainable, and well-documented code
4. **Industry Standards**: Following best practices and conventions
5. **Scalability**: Architecture that can be extended and upgraded
6. **Documentation**: Comprehensive documentation for maintenance

## Troubleshooting

### Common Issues

#### Port already in use
```bash
# Change PORT in .env file or kill the process using the port
PORT=3001 npm start
```

#### Dependencies not installing
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Data file not found
```bash
# Ensure backend/data directory exists and contains JSON files
# Copy from .env.example if needed
```

## License

ISC License - Free for academic and educational use

## Support

For issues, questions, or contributions, please contact the development team or refer to the project documentation.

---

**Developed as a college-level placement portal project demonstrating full-stack web development skills with HTML5, CSS3, Node.js, and Express.js.**
