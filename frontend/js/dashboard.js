// Dashboard page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const emailParam = getQueryParam('email');
  if (emailParam) {
    document.getElementById('dashboard-email').value = emailParam;
    loadDashboard(emailParam);
  }

  setupEventListeners();
});

function setupEventListeners() {
  const loadButton = document.getElementById('load-dashboard');
  const emailInput = document.getElementById('dashboard-email');

  loadButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email) {
      loadDashboard(email);
    } else {
      showToast('Please enter your email address', 'error');
    }
  });

  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const email = emailInput.value.trim();
      if (email) {
        loadDashboard(email);
      }
    }
  });
}

async function loadDashboard(email) {
  const dashboardContent = document.getElementById('dashboard-content');
  showLoading(dashboardContent, 'Loading your dashboard...');

  try {
    // Load user's applications
    const applications = await apiRequest(`/applications/student/email/${encodeURIComponent(email)}`);

    // Load all jobs stats
    const jobsStats = await apiRequest('/jobs/stats');

    renderDashboard(applications, jobsStats, email);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showError(dashboardContent, 'Failed to load dashboard. Please check your email and try again.');
  }
}

async function renderDashboard(applications, jobsStats, email) {
  const dashboardContent = document.getElementById('dashboard-content');

  // Get job details for applications
  const applicationsWithJobs = await Promise.all(
    applications.map(async (app) => {
      try {
        const job = await apiRequest(`/jobs/${app.jobId}`);
        return { ...app, job };
      } catch (error) {
        return { ...app, job: null };
      }
    })
  );

  // Calculate stats
  const totalApplications = applications.length;
  const underReviewApplications = applications.filter(app => app.status === 'Under Review').length;
  const shortlistedApplications = applications.filter(app => app.status === 'Shortlisted').length;
  const selectedApplications = applications.filter(app => app.status === 'Selected').length;

  // Get recommendations based on skills and branch
  const recommendations = await getRecommendations(applications, jobsStats);

  dashboardContent.innerHTML = `
    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <h3>${totalApplications}</h3>
        <p>Total Applications</p>
      </div>
      <div class="dashboard-stat-card">
        <h3>${underReviewApplications}</h3>
        <p>Under Review</p>
      </div>
      <div class="dashboard-stat-card">
        <h3>${shortlistedApplications}</h3>
        <p>Shortlisted</p>
      </div>
      <div class="dashboard-stat-card">
        <h3>${selectedApplications}</h3>
        <p>Selected</p>
      </div>
    </div>

    <div class="dashboard-section">
      <h3>Placement Opportunities Overview</h3>
      <div class="jobs-stats">
        <p><strong>Total Opportunities:</strong> ${jobsStats.total}</p>
        <p><strong>Open Positions:</strong> ${jobsStats.open}</p>
        <p><strong>Closed Positions:</strong> ${jobsStats.closed}</p>
        <p><strong>Participating Companies:</strong> ${jobsStats.companies}</p>
      </div>
    </div>

    <div class="dashboard-section">
      <h3>Recent Applications</h3>
      ${applicationsWithJobs.length === 0 ?
        '<p>No applications yet. <a href="jobs.html">Browse opportunities</a> to start applying!</p>' :
        renderRecentApplications(applicationsWithJobs.slice(0, 5))
      }
    </div>

    <div class="dashboard-section">
      <h3>Recommended Opportunities</h3>
      ${recommendations.length === 0 ?
        '<p>No recommendations available at the moment. <a href="jobs.html">Browse all opportunities</a>.</p>' :
        renderRecommendations(recommendations)
      }
    </div>
  `;
}

function renderRecentApplications(applications) {
  return `
    <div class="applications-list">
      ${applications.map(app => {
        const statusClass = `status-${app.status.toLowerCase().replace(' ', '-')}`;
        const jobTitle = app.job ? escapeHtml(app.job.title) : 'Unknown Job';
        const company = app.job ? escapeHtml(app.job.company) : 'Unknown Company';

        return `
          <div class="application-card">
            <div class="application-card-header">
              <div class="application-card-title">
                <h3>${jobTitle}</h3>
                <div class="application-card-company">${company}</div>
              </div>
              <div class="application-status ${statusClass}">${escapeHtml(app.status)}</div>
            </div>
            <div class="application-card-date">
              Applied: ${formatDateTime(app.appliedAt)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderRecommendations(jobs) {
  return `
    <div class="recommended-jobs">
      ${jobs.map(job => {
        const countdown = getCountdown(job.deadline);
        return `
          <div class="recommended-job-card">
            <div class="recommended-job-info">
              <h4>${escapeHtml(job.title)}</h4>
              <p>${escapeHtml(job.company)} • ${escapeHtml(job.location)} • ${escapeHtml(job.salary)}</p>
            </div>
            <div class="job-card-actions">
              <button class="btn btn-primary btn-sm" onclick="viewJob('${job.id}')">View Details</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function getRecommendations(applications, jobsStats) {
  try {
    // Get all available jobs
    const allJobs = await apiRequest('/jobs');

    // Get user's applied job IDs
    const appliedJobIds = applications.map(app => app.jobId);

    // Filter out already applied jobs and closed jobs
    const availableJobs = allJobs.filter(job =>
      !appliedJobIds.includes(job.id) && job.isOpen
    );

    // Simple recommendation logic: jobs matching skills from applications
    // In a real system, this would be more sophisticated
    if (applications.length > 0) {
      const userSkills = new Set();
      applications.forEach(app => {
        app.skills.forEach(skill => userSkills.add(skill.toLowerCase()));
      });

      const recommended = availableJobs.filter(job => {
        const jobSkills = job.skills.map(s => s.toLowerCase());
        return jobSkills.some(skill => userSkills.has(skill));
      });

      return recommended.slice(0, 5);
    }

    // If no applications, return random open jobs
    return availableJobs.slice(0, 5);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

function viewJob(jobId) {
  window.location.href = `job-details.html?id=${jobId}`;
}
