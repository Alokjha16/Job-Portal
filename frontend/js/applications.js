// Applications page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  const emailParam = getQueryParam('email');
  if (emailParam) {
    document.getElementById('student-email').value = emailParam;
    loadApplications(emailParam);
  }

  setupEventListeners();
});

function setupEventListeners() {
  const searchButton = document.getElementById('search-applications');
  const emailInput = document.getElementById('student-email');

  searchButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email) {
      loadApplications(email);
    } else {
      showToast('Please enter your email address', 'error');
    }
  });

  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const email = emailInput.value.trim();
      if (email) {
        loadApplications(email);
      }
    }
  });
}

async function loadApplications(email) {
  const applicationsList = document.getElementById('applications-list');
  showLoading(applicationsList, 'Loading your applications...');

  try {
    const applications = await apiRequest(`/applications/student/email/${encodeURIComponent(email)}`);
    renderApplications(applications);
  } catch (error) {
    console.error('Error loading applications:', error);
    showError(applicationsList, 'Failed to load applications. Please check your email and try again.');
  }
}

async function renderApplications(applications) {
  const applicationsList = document.getElementById('applications-list');

  if (applications.length === 0) {
    showEmpty(applicationsList, 'No applications found for this email address.', 'jobs.html', 'Browse Opportunities');
    return;
  }

  // Get job details for each application
  const applicationsWithJobs = await Promise.all(
    applications.map(async (app) => {
      try {
        const job = await apiRequest(`/jobs/${app.jobId}`);
        return { ...app, job };
      } catch (error) {
        console.error('Error loading job for application:', error);
        return { ...app, job: null };
      }
    })
  );

  applicationsList.innerHTML = applicationsWithJobs.map(app => {
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
        <div class="application-card-details">
          <p><strong>Applied:</strong> ${formatDateTime(app.appliedAt)}</p>
          <p><strong>Student ID:</strong> ${escapeHtml(app.studentId)}</p>
          <p><strong>Branch:</strong> ${escapeHtml(app.branch)}</p>
          <p><strong>CGPA:</strong> ${escapeHtml(app.cgpa)}</p>
          <p><strong>Skills:</strong> ${escapeHtml(app.skills.join(', '))}</p>
        </div>
        <div class="status-timeline">
          <h4>Application Progress</h4>
          <div class="timeline-steps">
            ${renderTimeline(app.statusHistory, app.status)}
          </div>
        </div>
        <div class="application-card-date">
          Application ID: ${app.id}
        </div>
      </div>
    `;
  }).join('');
}

function renderTimeline(statusHistory, currentAppStatus) {
  const allStages = ['Submitted', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

  let currentStatus = currentAppStatus || 'Submitted';
  if (Array.isArray(statusHistory) && statusHistory.length > 0) {
    const lastHistory = statusHistory[statusHistory.length - 1];
    if (lastHistory && lastHistory.status) {
      currentStatus = lastHistory.status;
    }
  }

  const currentIndex = allStages.indexOf(currentStatus);

  return allStages.map((stage, index) => {
    let stepClass = '';
    if (stage === 'Rejected' && currentStatus === 'Rejected') {
      stepClass = 'rejected active';
    } else if (index < currentIndex && currentStatus !== 'Rejected') {
      stepClass = 'completed';
    } else if (index === currentIndex) {
      stepClass = 'active';
    }
    return `<div class="timeline-step ${stepClass}">${stage}</div>`;
  }).join('');
}
