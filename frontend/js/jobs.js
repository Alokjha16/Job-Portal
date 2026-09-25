// Jobs page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
  setupEventListeners();
  loadSavedJobsState();
});

let allJobs = [];
let filteredJobs = [];

async function loadJobs() {
  const jobsList = document.getElementById('jobs-list');
  showLoading(jobsList, 'Loading opportunities...');

  try {
    const jobs = await apiRequest('/jobs');
    allJobs = jobs;
    filteredJobs = [...allJobs];
    renderJobs(filteredJobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
    showError(jobsList, 'Failed to load opportunities. Please try again later.');
  }
}

function renderJobs(jobs) {
  const jobsList = document.getElementById('jobs-list');

  if (jobs.length === 0) {
    showEmpty(jobsList, 'No opportunities found matching your criteria.', 'jobs.html', 'Reset Filters');
    return;
  }

  jobsList.innerHTML = jobs.map(job => {
    const countdown = getCountdown(job.deadline);
    const countdownClass = countdown.closed ? 'closed' : '';
    const isSaved = isJobSaved(job.id);

    return `
      <div class="job-card">
        <div class="job-card-header">
          <div class="company-logo">${escapeHtml(job.companyLogo)}</div>
          <div class="job-card-title">
            <h3>${escapeHtml(job.title)}</h3>
            <div class="job-card-company">${escapeHtml(job.company)}</div>
          </div>
          <button class="btn btn-outline btn-sm" onclick="toggleSaveJob('${job.id}')" aria-label="${isSaved ? 'Remove from saved' : 'Save job'}">
            ${isSaved ? '♥ Saved' : '♡ Save'}
          </button>
        </div>
        <div class="job-card-meta">
          <span>${escapeHtml(job.location)}</span>
          <span>${escapeHtml(job.workMode)}</span>
          <span>${escapeHtml(job.type)}</span>
          <span>${escapeHtml(job.salary)}</span>
        </div>
        <div class="job-card-description">
          ${escapeHtml(job.description.substring(0, 150))}${job.description.length > 150 ? '...' : ''}
        </div>
        <div class="job-card-footer">
          <div class="countdown ${countdownClass}">${countdown.text}</div>
          <div class="job-card-actions">
            <button class="btn btn-primary btn-sm" onclick="viewJob('${job.id}')">View Details</button>
            <button class="btn btn-outline btn-sm" onclick="applyForJob('${job.id}')" ${countdown.closed ? 'disabled' : ''}>
              ${countdown.closed ? 'Closed' : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function setupEventListeners() {
  const searchForm = document.getElementById('search-form');
  const resetButton = document.getElementById('reset-filters');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filterJobs();
  });

  resetButton.addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('location-filter').value = '';
    document.getElementById('type-filter').value = '';
    document.getElementById('work-mode-filter').value = '';
    document.getElementById('sort-order').value = 'latest';
    filteredJobs = [...allJobs];
    renderJobs(filteredJobs);
  });
}

function filterJobs() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const locationFilter = document.getElementById('location-filter').value;
  const typeFilter = document.getElementById('type-filter').value;
  const workModeFilter = document.getElementById('work-mode-filter').value;
  const sortOrder = document.getElementById('sort-order').value;

  filteredJobs = allJobs.filter(job => {
    let matches = true;

    // Search filter
    if (searchTerm) {
      matches = matches && (
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    // Location filter
    if (locationFilter) {
      matches = matches && job.location.toLowerCase().includes(locationFilter.toLowerCase());
    }

    // Type filter
    if (typeFilter) {
      matches = matches && job.type.toLowerCase() === typeFilter.toLowerCase();
    }

    // Work mode filter
    if (workModeFilter) {
      matches = matches && job.workMode.toLowerCase() === workModeFilter.toLowerCase();
    }

    // Only show open jobs
    matches = matches && job.isOpen;

    return matches;
  });

  // Sort jobs
  filteredJobs.sort((a, b) => {
    switch (sortOrder) {
      case 'deadline':
        return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
      case 'salary-high':
        return parseSalary(b.salary) - parseSalary(a.salary);
      case 'salary-low':
        return parseSalary(a.salary) - parseSalary(b.salary);
      case 'latest':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  renderJobs(filteredJobs);
}

function parseSalary(salaryString) {
  const numbers = salaryString.match(/\d+/g);
  return numbers ? parseInt(numbers.join('')) : 0;
}

function viewJob(jobId) {
  addToRecentlyViewed(jobId);
  window.location.href = `job-details.html?id=${jobId}`;
}

function applyForJob(jobId) {
  window.location.href = `apply.html?id=${jobId}`;
}

function toggleSaveJob(jobId) {
  if (isJobSaved(jobId)) {
    removeSavedJob(jobId);
  } else {
    saveJob(jobId);
  }
  renderJobs(filteredJobs);
}

function loadSavedJobsState() {
  // Trigger re-render to update save button states
  if (allJobs.length > 0) {
    renderJobs(filteredJobs);
  }
}
