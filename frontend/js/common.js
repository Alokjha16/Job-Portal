// Common utilities and functions

// API base URL auto-detection
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname, port } = window.location;
    if ((protocol === 'http:' || protocol === 'https:') && port === '3000') {
      return '/api';
    }
    return 'http://localhost:3000/api';
  }
  return '/api';
};

const API_BASE = getApiBase();

// DOM element helpers
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Show loading state
const showLoading = (element, message = 'Loading...') => {
  element.innerHTML = `<div class="loading" aria-live="polite">${message}</div>`;
};

// Show error state
const showError = (element, message) => {
  element.innerHTML = `<div class="error" role="alert">${message}</div>`;
};

// Show empty state
const showEmpty = (element, message, actionLink = null, actionText = null) => {
  let html = `<div class="empty-state"><p>${message}</p>`;
  if (actionLink && actionText) {
    html += `<a href="${actionLink}">${actionText}</a>`;
  }
  html += '</div>';
  element.innerHTML = html;
};

// Show success message
const showSuccess = (element, message) => {
  element.innerHTML = `<div class="success" role="alert">${message}</div>`;
  setTimeout(() => {
    element.innerHTML = '';
  }, 3000);
};

// Toast notifications
const showToast = (message, type = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.setAttribute('role', 'alert');

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date with time
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Get query parameter from URL
const getQueryParam = (param) => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
};

// Set query parameter in URL
const setQueryParam = (param, value) => {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
};

// Remove query parameter from URL
const removeQueryParam = (param) => {
  const url = new URL(window.location);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
};

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage helpers
const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const getLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Save job to localStorage
const saveJob = (jobId) => {
  const savedJobs = getLocalStorage('savedJobs') || [];
  if (!savedJobs.includes(jobId)) {
    savedJobs.push(jobId);
    setLocalStorage('savedJobs', savedJobs);
    showToast('Job saved to your list', 'success');
  } else {
    showToast('Job already saved', 'info');
  }
};

// Remove job from localStorage
const removeSavedJob = (jobId) => {
  const savedJobs = getLocalStorage('savedJobs') || [];
  const updated = savedJobs.filter(id => id !== jobId);
  setLocalStorage('savedJobs', updated);
  showToast('Job removed from saved list', 'info');
};

// Check if job is saved
const isJobSaved = (jobId) => {
  const savedJobs = getLocalStorage('savedJobs') || [];
  return savedJobs.includes(jobId);
};

// Add to recently viewed
const addToRecentlyViewed = (jobId) => {
  const recentlyViewed = getLocalStorage('recentlyViewed') || [];
  const updated = [jobId, ...recentlyViewed.filter(id => id !== jobId)].slice(0, 10);
  setLocalStorage('recentlyViewed', updated);
};

// Get recently viewed jobs
const getRecentlyViewed = () => {
  return getLocalStorage('recentlyViewed') || [];
};

// Calculate countdown to deadline
const getCountdown = (deadline) => {
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;

  if (diff <= 0) {
    return { closed: true, text: 'Applications closed' };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return { closed: false, text: `${days} day${days !== 1 ? 's' : ''} remaining` };
  } else if (hours > 0) {
    return { closed: false, text: `${hours} hour${hours !== 1 ? 's' : ''} remaining` };
  } else {
    return { closed: false, text: 'Less than 1 hour remaining' };
  }
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Form validation helpers
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone) => {
  return /^\+?[\d\s-]{10,}$/.test(phone);
};

const validateCGPA = (cgpa) => {
  const num = parseFloat(cgpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Show form error
const showFieldError = (fieldId, message) => {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
  const inputElement = document.getElementById(fieldId);
  if (inputElement) {
    inputElement.setAttribute('aria-invalid', 'true');
  }
};

// Clear form error
const clearFieldError = (fieldId) => {
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  const inputElement = document.getElementById(fieldId);
  if (inputElement) {
    inputElement.removeAttribute('aria-invalid');
  }
};

// Clear all form errors
const clearAllErrors = () => {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  const inputElements = document.querySelectorAll('[aria-invalid="true"]');
  inputElements.forEach(el => {
    el.removeAttribute('aria-invalid');
  });
};

// Default embedded sample jobs for seamless fallback
const MOCK_DEFAULT_JOBS = [
  {
    "id": "1",
    "title": "Software Engineer",
    "company": "Nexora Technologies",
    "companyLogo": "NT",
    "industry": "Software Development",
    "companyDescription": "Nexora Technologies is a leading software development company specializing in enterprise solutions and cloud computing.",
    "companyWebsite": "https://nexoratech.example.com",
    "location": "Bangalore, India",
    "workMode": "On-site",
    "type": "Full-time",
    "salary": "₹12-18 LPA",
    "experience": "0-2 years",
    "description": "We are looking for a talented Software Engineer to join our team. You will be working on cutting-edge technologies and building scalable solutions.",
    "requirements": ["B.E./B.Tech in CS/IT", "Minimum CGPA: 6.5", "Python, Java, or Node.js"],
    "skills": ["Python", "Java", "JavaScript", "React", "Node.js", "SQL", "Git"],
    "eligibility": { "education": "B.E./B.Tech", "branches": ["Computer Science", "Information Technology"], "minCGPA": 6.5, "maxBacklogs": 0, "graduationYear": 2026 },
    "selectionProcess": ["Resume Shortlisting", "Online Assessment", "Technical Interview", "HR Interview"],
    "deadline": "2026-10-31",
    "postedDate": "2026-09-15",
    "isOpen": true,
    "createdAt": "2026-09-15T10:00:00.000Z"
  },
  {
    "id": "2",
    "title": "Data Scientist",
    "company": "Vertex Systems",
    "companyLogo": "VS",
    "industry": "Data Analytics & AI",
    "companyDescription": "Vertex Systems specializes in data analytics, machine learning solutions, and AI-powered business intelligence.",
    "companyWebsite": "https://vertexsystems.example.com",
    "location": "Hyderabad, India",
    "workMode": "Hybrid",
    "type": "Full-time",
    "salary": "₹14-20 LPA",
    "experience": "0-2 years",
    "description": "Join our AI and ML team to work on innovative data science projects.",
    "requirements": ["B.E./B.Tech/M.Tech in CS/Stats", "Minimum CGPA: 7.0", "Python, ML, TensorFlow"],
    "skills": ["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"],
    "eligibility": { "education": "B.E./B.Tech/M.Tech", "branches": ["Computer Science", "Data Science"], "minCGPA": 7.0, "maxBacklogs": 0, "graduationYear": 2026 },
    "selectionProcess": ["Resume Shortlisting", "Technical Assessment", "Technical Interview", "HR Interview"],
    "deadline": "2026-11-15",
    "postedDate": "2026-09-18",
    "isOpen": true,
    "createdAt": "2026-09-18T14:30:00.000Z"
  },
  {
    "id": "3",
    "title": "Frontend Developer",
    "company": "BluePeak Digital",
    "companyLogo": "BP",
    "industry": "Digital Solutions",
    "companyDescription": "BluePeak Digital creates cutting-edge web and mobile applications.",
    "companyWebsite": "https://bluepeakdigital.example.com",
    "location": "Mumbai, India",
    "workMode": "Remote",
    "type": "Full-time",
    "salary": "₹10-15 LPA",
    "experience": "0-2 years",
    "description": "We are seeking a skilled Frontend Developer to build user-friendly interfaces.",
    "requirements": ["B.E./B.Tech", "Minimum CGPA: 6.0", "HTML5, CSS3, JavaScript, React"],
    "skills": ["HTML5", "CSS3", "JavaScript", "React", "TypeScript"],
    "eligibility": { "education": "B.E./B.Tech", "branches": ["Computer Science", "Information Technology"], "minCGPA": 6.0, "maxBacklogs": 0, "graduationYear": 2026 },
    "selectionProcess": ["Resume Shortlisting", "Coding Test", "Technical Interview", "HR Interview"],
    "deadline": "2026-10-20",
    "postedDate": "2026-09-20",
    "isOpen": true,
    "createdAt": "2026-09-20T09:15:00.000Z"
  }
];

// Fallback handling when server connection fails
const handleApiFallback = (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  let storedJobs = getLocalStorage('portal_jobs') || MOCK_DEFAULT_JOBS;
  let storedApps = getLocalStorage('portal_applications') || [];

  // GET /jobs
  if (method === 'GET' && endpoint === '/jobs') {
    return storedJobs;
  }

  // GET /jobs/stats
  if (method === 'GET' && endpoint === '/jobs/stats') {
    return {
      total: storedJobs.length,
      open: storedJobs.filter(j => j.isOpen).length,
      closed: storedJobs.filter(j => !j.isOpen).length,
      companies: new Set(storedJobs.map(j => j.company)).size
    };
  }

  // GET /jobs/:id
  if (method === 'GET' && endpoint.startsWith('/jobs/')) {
    const id = endpoint.replace('/jobs/', '');
    const job = storedJobs.find(j => j.id === id);
    if (job) return job;
    throw new Error('Job not found');
  }

  // POST /applications
  if (method === 'POST' && endpoint === '/applications') {
    const appData = JSON.parse(options.body || '{}');
    const newApp = {
      id: 'APP-' + Date.now(),
      jobId: appData.jobId,
      studentName: appData.studentName,
      studentId: appData.studentId,
      email: appData.email,
      phone: appData.phone,
      branch: appData.branch,
      year: appData.year,
      cgpa: appData.cgpa,
      graduationYear: appData.graduationYear,
      skills: appData.skills ? appData.skills.split(',').map(s => s.trim()) : [],
      resume: appData.resume,
      coverLetter: appData.coverLetter || '',
      status: 'Submitted',
      appliedAt: new Date().toISOString(),
      statusHistory: [{ status: 'Submitted', timestamp: new Date().toISOString() }]
    };
    storedApps.push(newApp);
    setLocalStorage('portal_applications', storedApps);
    return newApp;
  }

  // GET /applications/student/email/:email
  if (method === 'GET' && endpoint.startsWith('/applications/student/email/')) {
    const email = decodeURIComponent(endpoint.replace('/applications/student/email/', ''));
    return storedApps.filter(a => a.email.toLowerCase() === email.toLowerCase());
  }

  // GET /applications
  if (method === 'GET' && endpoint === '/applications') {
    return storedApps;
  }

  // GET /admin/overview
  if (method === 'GET' && endpoint === '/admin/overview') {
    return {
      jobs: {
        total: storedJobs.length,
        open: storedJobs.filter(j => j.isOpen).length,
        closed: storedJobs.filter(j => !j.isOpen).length,
        companies: new Set(storedJobs.map(j => j.company)).size
      },
      applications: {
        total: storedApps.length,
        byStatus: storedApps.reduce((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {})
      },
      placement: {
        season: '2025-2026',
        studentsPlaced: storedApps.filter(a => a.status === 'Selected').length,
        averagePackage: '12.5 LPA'
      }
    };
  }

  // PATCH /applications/:id/status
  if (method === 'PATCH' && endpoint.includes('/applications/') && endpoint.endsWith('/status')) {
    const parts = endpoint.split('/');
    const appId = parts[2];
    let reqData = {};
    try { reqData = typeof options.body === 'string' ? JSON.parse(options.body) : (options.body || {}); } catch(e){}
    const status = reqData.status || 'Under Review';
    const appIndex = storedApps.findIndex(a => a.id === appId);
    if (appIndex !== -1) {
      storedApps[appIndex].status = status;
      if (!Array.isArray(storedApps[appIndex].statusHistory)) {
        storedApps[appIndex].statusHistory = [];
      }
      storedApps[appIndex].statusHistory.push({ status, timestamp: new Date().toISOString() });
      setLocalStorage('portal_applications', storedApps);
      return storedApps[appIndex];
    }
  }

  throw new Error(`Offline fallback not available for ${method} ${endpoint}`);
};

// API request helper with fallback & timeout support
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const fetchWithTimeout = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);

    try {
      const mergedHeaders = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const mergedOptions = {
        ...options,
        headers: mergedHeaders,
        signal: controller.signal
      };

      const response = await fetch(url, mergedOptions);
      clearTimeout(timer);
      const data = await response.json();

      if (!response.ok) {
        const err = new Error(data.message || 'Request failed');
        err.details = data.details;
        throw err;
      }

      return data.data !== undefined ? data.data : data;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  try {
    return await fetchWithTimeout();
  } catch (error) {
    console.warn(`API server unreachable or timed out at ${url}, falling back to local handler:`, error.message);
    try {
      return handleApiFallback(endpoint, options);
    } catch (fallbackErr) {
      console.error('API request & fallback error:', fallbackErr);
      throw error;
    }
  }
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $,
    $$,
    showLoading,
    showError,
    showEmpty,
    showSuccess,
    showToast,
    formatDate,
    formatDateTime,
    getQueryParam,
    setQueryParam,
    removeQueryParam,
    debounce,
    setLocalStorage,
    getLocalStorage,
    removeLocalStorage,
    saveJob,
    removeSavedJob,
    isJobSaved,
    addToRecentlyViewed,
    getRecentlyViewed,
    getCountdown,
    escapeHtml,
    validateEmail,
    validatePhone,
    validateCGPA,
    validateURL,
    showFieldError,
    clearFieldError,
    clearAllErrors,
    apiRequest
  };
}
