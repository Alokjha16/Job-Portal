const { ApiError } = require('./errorHandler');

const validateJob = (isUpdate = false) => {
  return (req, res, next) => {
    const errors = {};
    const { title, company, location, type, salary, description, requirements, selectionProcess } = req.body;

    if (!isUpdate && !title) errors.title = 'Job title is required';
    if (!isUpdate && !company) errors.company = 'Company name is required';
    if (!isUpdate && !location) errors.location = 'Location is required';
    if (!isUpdate && !type) errors.type = 'Job type is required';
    if (!isUpdate && !salary) errors.salary = 'Salary is required';
    if (!isUpdate && !description) errors.description = 'Description is required';
    if (!isUpdate && !requirements) errors.requirements = 'Requirements are required';
    if (!isUpdate && !selectionProcess) errors.selectionProcess = 'Selection process is required';

    if (Object.keys(errors).length) {
      return next(new ApiError(400, 'Validation failed. Please correct the highlighted fields.', errors));
    }
    next();
  };
};

const validateURL = (url) => {
  if (!url) return false;
  try {
    const fullUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : `https://${url}`;
    new URL(fullUrl);
    return true;
  } catch {
    return false;
  }
};

const validateApplication = (req, res, next) => {
  const errors = {};
  const { jobId, studentName, studentId, email, phone, branch, year, cgpa, graduationYear, skills, resume } = req.body;

  if (!jobId) errors.jobId = 'Job ID is required';
  if (!studentName) errors.studentName = 'Student name is required';
  if (!studentId) errors.studentId = 'Student ID is required';
  if (!email) errors.email = 'Email is required';
  if (!phone) errors.phone = 'Phone number is required';
  if (!branch) errors.branch = 'Branch is required';
  if (!year) errors.year = 'Year is required';
  if (!cgpa) errors.cgpa = 'CGPA is required';
  if (!graduationYear) errors.graduationYear = 'Graduation year is required';
  if (!skills) errors.skills = 'Skills are required';
  if (!resume) errors.resume = 'Resume is required';

  // Email validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Phone validation
  if (phone && !/^\+?[\d\s-]{10,}$/.test(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  // CGPA validation
  if (cgpa && (cgpa < 0 || cgpa > 10)) {
    errors.cgpa = 'CGPA must be between 0 and 10';
  }

  // Resume URL validation
  if (resume && !validateURL(resume)) {
    errors.resume = 'Please enter a valid URL';
  }

  if (Object.keys(errors).length) {
    return next(new ApiError(400, 'Validation failed. Please correct the highlighted fields.', errors));
  }
  next();
};

const validateStatus = (req, res, next) => {
  const errors = {};
  const { status } = req.body;

  if (!status) errors.status = 'Status is required';
  if (status && !APPLICATION_STATUSES.includes(status)) {
    errors.status = `Status must be one of: ${APPLICATION_STATUSES.join(', ')}`;
  }

  if (Object.keys(errors).length) {
    return next(new ApiError(400, 'Validation failed. Please correct the highlighted fields.', errors));
  }
  next();
};

const APPLICATION_STATUSES = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text.trim().replace(/[<>]/g, '');
};

const toStringArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^\+?[\d\s-]{10,}$/.test(phone);
};

const validateCGPA = (cgpa) => {
  return cgpa >= 0 && cgpa <= 10;
};

module.exports = {
  validateJob,
  validateApplication,
  validateStatus,
  APPLICATION_STATUSES,
  sanitizeText,
  toStringArray,
  validateEmail,
  validatePhone,
  validateCGPA,
  validateURL
};
