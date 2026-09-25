// Home page JavaScript

document.addEventListener('DOMContentLoaded', async () => {
  await loadHomeStats();
  await loadFeaturedJobs();
});

async function loadHomeStats() {
  try {
    // Load jobs stats
    const jobsData = await apiRequest('/jobs/stats');

    // Load admin overview for placement stats
    const adminData = await apiRequest('/admin/overview', {
      headers: {
        'X-Admin-Key': 'admin123'
      }
    });

    const openJobs = jobsData.open || 0;
    const companies = jobsData.companies || 0;
    const placed = adminData.placement.studentsPlaced || 0;
    const avgPkg = adminData.placement.averagePackage || '12 LPA';

    animateCounter('jobs-count', openJobs);
    animateCounter('companies-count', companies);
    animateCounter('placed-count', placed);
    document.getElementById('avg-package').textContent = avgPkg;

  } catch (error) {
    console.error('Error loading home stats:', error);
    document.getElementById('jobs-count').textContent = '12+';
    document.getElementById('companies-count').textContent = '8+';
    document.getElementById('placed-count').textContent = '45+';
    document.getElementById('avg-package').textContent = '12 LPA';
  }
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const numericTarget = parseInt(targetValue) || 0;
  if (numericTarget === 0) {
    element.textContent = targetValue;
    return;
  }

  let current = 0;
  const increment = Math.max(1, Math.ceil(numericTarget / 30));
  const stepTime = 40;

  const timer = setInterval(() => {
    current += increment;
    if (current >= numericTarget) {
      element.textContent = numericTarget + '+';
      clearInterval(timer);
    } else {
      element.textContent = current;
    }
  }, stepTime);
}

async function loadFeaturedJobs() {
  const featuredContainer = document.getElementById('featured-jobs');
  showLoading(featuredContainer, 'Loading featured opportunities...');

  try {
    const jobs = await apiRequest('/jobs');
    // Get first 4 jobs as featured
    const featuredJobs = jobs.slice(0, 4);
    renderFeaturedJobs(featuredJobs);
  } catch (error) {
    console.error('Error loading featured jobs:', error);
    showError(featuredContainer, 'Failed to load featured opportunities. Please try again later.');
  }
}

function renderFeaturedJobs(jobs) {
  const featuredContainer = document.getElementById('featured-jobs');

  if (jobs.length === 0) {
    showEmpty(featuredContainer, 'No featured opportunities available at the moment.');
    return;
  }

  featuredContainer.innerHTML = jobs.map(job => {
    const countdown = getCountdown(job.deadline);
    const countdownClass = countdown.closed ? 'closed' : '';

    return `
      <div class="job-card">
        <div class="job-card-header">
          <div class="company-logo">${escapeHtml(job.companyLogo)}</div>
          <div class="job-card-title">
            <h3>${escapeHtml(job.title)}</h3>
            <div class="job-card-company">${escapeHtml(job.company)}</div>
          </div>
        </div>
        <div class="job-card-meta">
          <span>${escapeHtml(job.location)}</span>
          <span>${escapeHtml(job.workMode)}</span>
          <span>${escapeHtml(job.type)}</span>
          <span>${escapeHtml(job.salary)}</span>
        </div>
        <div class="job-card-description">
          ${escapeHtml(job.description.substring(0, 120))}${job.description.length > 120 ? '...' : ''}
        </div>
        <div class="job-card-footer">
          <div class="countdown ${countdownClass}">${countdown.text}</div>
          <div class="job-card-actions">
            <button class="btn btn-primary btn-sm" onclick="viewJob('${job.id}')">View Details</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function viewJob(jobId) {
  window.location.href = `job-details.html?id=${jobId}`;
}
