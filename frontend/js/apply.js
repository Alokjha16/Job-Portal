// Apply page JavaScript

let currentJob = null;

document.addEventListener('DOMContentLoaded', async () => {
  let jobId = getQueryParam('id');
  if (!jobId) {
    // Default to first job if not specified
    jobId = '1';
  }
  
  await loadJobSummary(jobId);
  setupFormHandler(jobId);
});

async function loadJobSummary(jobId) {
  const jobSummary = document.getElementById('job-summary');
  showLoading(jobSummary, 'Loading job information...');

  try {
    const job = await apiRequest(`/jobs/${jobId}`);
    renderJobSummary(job);
  } catch (error) {
    console.error('Error loading job summary:', error);
    showError(jobSummary, 'Failed to load job information. The opportunity may not exist or has been removed.');
  }
}

function renderJobSummary(job) {
  currentJob = job; // Store job data for success screen
  const jobSummary = document.getElementById('job-summary');
  const countdown = getCountdown(job.deadline);

  if (countdown.closed) {
    jobSummary.innerHTML = `
      <h3>${escapeHtml(job.title)}</h3>
      <p><strong>Company:</strong> ${escapeHtml(job.company)}</p>
      <p><strong>Location:</strong> ${escapeHtml(job.location)}</p>
      <p><strong>Type:</strong> ${escapeHtml(job.type)}</p>
      <p><strong>Package:</strong> ${escapeHtml(job.salary)}</p>
      <div class="countdown closed">Applications are closed for this position</div>
    `;
    document.getElementById('application-form-container').classList.add('hidden');
  } else {
    jobSummary.innerHTML = `
      <h3>${escapeHtml(job.title)}</h3>
      <p><strong>Company:</strong> ${escapeHtml(job.company)}</p>
      <p><strong>Location:</strong> ${escapeHtml(job.location)}</p>
      <p><strong>Type:</strong> ${escapeHtml(job.type)}</p>
      <p><strong>Package:</strong> ${escapeHtml(job.salary)}</p>
      <div class="countdown">${countdown.text}</div>
    `;
  }
}

function setupFormHandler(jobId) {
  const form = document.getElementById('application-form');
  const cancelBtn = document.getElementById('cancel-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await submitApplication(jobId);
    }
  });

  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (jobId) {
        window.location.href = `job-details.html?id=${jobId}`;
      } else {
        window.location.href = 'jobs.html';
      }
    });
  }

  // Real-time validation
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const cgpaInput = document.getElementById('cgpa');
  const resumeInput = document.getElementById('resume');

  if (emailInput) {
    emailInput.addEventListener('blur', () => {
      if (emailInput.value && !validateEmail(emailInput.value)) {
        showFieldError('email', 'Please enter a valid email address');
      } else {
        clearFieldError('email');
      }
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener('blur', () => {
      if (phoneInput.value && !validatePhone(phoneInput.value)) {
        showFieldError('phone', 'Please enter a valid phone number');
      } else {
        clearFieldError('phone');
      }
    });
  }

  if (cgpaInput) {
    cgpaInput.addEventListener('blur', () => {
      if (cgpaInput.value && !validateCGPA(cgpaInput.value)) {
        showFieldError('cgpa', 'CGPA must be between 0 and 10');
      } else {
        clearFieldError('cgpa');
      }
    });
  }

  if (resumeInput) {
    resumeInput.addEventListener('blur', () => {
      if (resumeInput.value && !validateURL(resumeInput.value)) {
        showFieldError('resume', 'Please enter a valid URL');
      } else {
        clearFieldError('resume');
      }
    });
  }
}

function validateForm() {
  clearAllErrors();
  let isValid = true;
  let firstErrorElement = null;

  const markError = (fieldId, message) => {
    showFieldError(fieldId, message);
    if (!firstErrorElement) {
      firstErrorElement = document.getElementById(fieldId);
    }
    isValid = false;
  };

  const studentName = document.getElementById('student-name').value.trim();
  const studentId = document.getElementById('student-id').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const branch = document.getElementById('branch').value;
  const year = document.getElementById('year').value;
  const cgpa = document.getElementById('cgpa').value;
  const graduationYear = document.getElementById('graduation-year').value;
  const skills = document.getElementById('skills').value.trim();
  const resume = document.getElementById('resume').value.trim();

  // Required field validation
  if (!studentName) {
    markError('student-name', 'Full name is required');
  }

  if (!studentId) {
    markError('student-id', 'Student ID is required');
  }

  if (!email) {
    markError('email', 'Email is required');
  } else if (!validateEmail(email)) {
    markError('email', 'Please enter a valid email address');
  }

  if (!phone) {
    markError('phone', 'Phone number is required');
  } else if (!validatePhone(phone)) {
    markError('phone', 'Please enter a valid phone number');
  }

  if (!branch) {
    markError('branch', 'Branch is required');
  }

  if (!year) {
    markError('year', 'Year is required');
  }

  if (!cgpa) {
    markError('cgpa', 'CGPA is required');
  } else if (!validateCGPA(cgpa)) {
    markError('cgpa', 'CGPA must be between 0 and 10');
  }

  if (!graduationYear) {
    markError('graduation-year', 'Graduation year is required');
  }

  if (!skills) {
    markError('skills', 'Skills are required');
  }

  if (!resume) {
    markError('resume', 'Resume link is required');
  } else if (!validateURL(resume)) {
    markError('resume', 'Please enter a valid URL');
  }

  if (!isValid && firstErrorElement) {
    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstErrorElement.focus();
  }

  return isValid;
}

async function submitApplication(jobId) {
  const form = document.getElementById('application-form');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  const cancelBtn = document.getElementById('cancel-btn');
  const originalSubmitText = submitBtn ? submitBtn.textContent : 'Submit Application';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
  }
  if (cancelBtn) {
    cancelBtn.disabled = true;
  }

  const formData = new FormData(form);

  const applicationData = {
    jobId: jobId || '1',
    studentName: formData.get('studentName'),
    studentId: formData.get('studentId'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    branch: formData.get('branch'),
    year: formData.get('year'),
    cgpa: parseFloat(formData.get('cgpa')),
    graduationYear: parseInt(formData.get('graduationYear')),
    skills: formData.get('skills'),
    resume: formData.get('resume'),
    coverLetter: formData.get('coverLetter')
  };

  try {
    const result = await apiRequest('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });

    // Show success screen
    document.getElementById('application-form-container').classList.add('hidden');
    document.getElementById('success-screen').classList.remove('hidden');

    // Populate success details
    document.getElementById('success-app-id').textContent = result.id || ('APP-' + Date.now());
    document.getElementById('success-company').textContent = currentJob ? currentJob.company : 'N/A';
    document.getElementById('success-role').textContent = currentJob ? currentJob.title : 'N/A';
    document.getElementById('success-date').textContent = formatDateTime(result.appliedAt || new Date().toISOString());
    // Update View My Applications link to pass student's email
    const viewAppsBtn = document.querySelector('#success-screen a[href^="applications.html"]');
    if (viewAppsBtn) {
      viewAppsBtn.href = `applications.html?email=${encodeURIComponent(applicationData.email)}`;
    }

    showToast('Application submitted successfully!', 'success');

  } catch (error) {
    console.error('Error submitting application:', error);
    if (error.details && typeof error.details === 'object') {
      Object.keys(error.details).forEach(key => {
        const hyphenatedKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        showFieldError(hyphenatedKey, error.details[key]);
        showFieldError(key, error.details[key]);
      });
      const firstErrKey = Object.keys(error.details)[0];
      const hyphenatedFirstKey = firstErrKey.replace(/([A-Z])/g, '-$1').toLowerCase();
      const el = document.getElementById(hyphenatedFirstKey) || document.getElementById(firstErrKey);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }
    showToast('Failed to submit application: ' + error.message, 'error');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalSubmitText;
    }
    if (cancelBtn) {
      cancelBtn.disabled = false;
    }
  }
}
