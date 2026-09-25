// Admin page JavaScript

let adminKey = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if admin key is already stored
  const storedKey = getLocalStorage('adminKey');
  if (storedKey) {
    document.getElementById('admin-key').value = storedKey;
    authenticateAdmin();
  }

  setupEventListeners();
});

function setupEventListeners() {
  const authButton = document.getElementById('authenticate-admin');
  const keyInput = document.getElementById('admin-key');

  authButton.addEventListener('click', authenticateAdmin);

  keyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      authenticateAdmin();
    }
  });
}

async function authenticateAdmin() {
  const keyInput = document.getElementById('admin-key');
  const key = keyInput.value.trim();

  if (!key) {
    showToast('Please enter admin key', 'error');
    return;
  }

  try {
    const data = await apiRequest('/admin/overview', {
      headers: {
        'X-Admin-Key': key
      }
    });

    adminKey = key;
    setLocalStorage('adminKey', key);
    await loadAdminDashboard();
    showToast('Authentication successful', 'success');
  } catch (error) {
    console.error('Error authenticating:', error);
    showToast('Authentication failed: Invalid admin key', 'error');
  }
}

async function loadAdminDashboard() {
  const adminContent = document.getElementById('admin-content');
  showLoading(adminContent, 'Loading admin dashboard...');

  try {
    const data = await apiRequest('/admin/overview', {
      headers: {
        'X-Admin-Key': adminKey
      }
    });

    renderAdminDashboard(data);
    await loadAllApplications();
    await loadAllJobs();
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    showError(adminContent, 'Failed to load admin dashboard. Please try again.');
  }
}

function renderAdminDashboard(data) {
  const adminContent = document.getElementById('admin-content');

  adminContent.innerHTML = `
    <div class="admin-overview">
      <div class="admin-overview-card">
        <h3>Jobs Overview</h3>
        <div class="stat-value">${data.jobs.total}</div>
        <div class="stat-label">Total Opportunities</div>
        <div class="stat-details">
          <p>Open: ${data.jobs.open}</p>
          <p>Closed: ${data.jobs.closed}</p>
          <p>Companies: ${data.jobs.companies}</p>
        </div>
      </div>

      <div class="admin-overview-card">
        <h3>Applications Overview</h3>
        <div class="stat-value">${data.applications.total}</div>
        <div class="stat-label">Total Applications</div>
        <div class="stat-details">
          <p>Submitted: ${data.applications.byStatus['Submitted'] || 0}</p>
          <p>Under Review: ${data.applications.byStatus['Under Review'] || 0}</p>
          <p>Shortlisted: ${data.applications.byStatus['Shortlisted'] || 0}</p>
          <p>Selected: ${data.applications.byStatus['Selected'] || 0}</p>
          <p>Rejected: ${data.applications.byStatus['Rejected'] || 0}</p>
        </div>
      </div>

      <div class="admin-overview-card">
        <h3>Placement Statistics</h3>
        <div class="stat-value">${data.placement.studentsPlaced}</div>
        <div class="stat-label">Students Placed</div>
        <div class="stat-details">
          <p>Season: ${data.placement.season}</p>
          <p>Average Package: ${data.placement.averagePackage}</p>
        </div>
      </div>
    </div>

    <div class="job-management">
      <h3>Job Management</h3>
      <div class="job-management-actions">
        <button class="btn btn-primary" onclick="loadAllJobs()">View All Jobs</button>
        <button class="btn btn-outline" onclick="showAddJobForm()">Add New Job</button>
      </div>
      <div id="jobs-management-content"></div>
    </div>

    <div class="dashboard-section">
      <h3>Application Management</h3>
      <div class="admin-actions">
        <button class="btn btn-primary" onclick="loadAllApplications()">View All Applications</button>
      </div>
      <div id="applications-management-content"></div>
    </div>

    <div class="admin-actions mt-3">
      <button class="btn btn-outline" onclick="logoutAdmin()">Logout</button>
    </div>
  `;
}

async function loadAllJobs() {
  const container = document.getElementById('jobs-management-content');
  showLoading(container, 'Loading jobs...');

  try {
    const jobs = await apiRequest('/jobs', {
      headers: {
        'X-Admin-Key': adminKey
      }
    });
    renderJobsManagement(jobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
    showError(container, 'Failed to load jobs.');
  }
}

function renderJobsManagement(jobs) {
  const container = document.getElementById('jobs-management-content');

  if (jobs.length === 0) {
    showEmpty(container, 'No jobs found.');
    return;
  }

  container.innerHTML = `
    <div class="jobs-list">
      ${jobs.map(job => `
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
            <span>${escapeHtml(job.type)}</span>
            <span>${escapeHtml(job.salary)}</span>
            <span class="${job.isOpen ? 'status-submitted' : 'status-rejected'}">${job.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <div class="job-card-actions">
            <button class="btn btn-primary btn-sm" onclick="editJob('${job.id}')">Edit</button>
            <button class="btn btn-outline btn-sm" onclick="toggleJobStatus('${job.id}', ${job.isOpen})">${job.isOpen ? 'Close' : 'Open'}</button>
            <button class="btn btn-outline btn-sm" onclick="deleteJob('${job.id}')">Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function loadAllApplications() {
  const container = document.getElementById('applications-management-content');
  showLoading(container, 'Loading applications...');

  try {
    const applications = await apiRequest('/applications', {
      headers: {
        'X-Admin-Key': adminKey
      }
    });
    await renderApplicationsManagement(applications);
  } catch (error) {
    console.error('Error loading applications:', error);
    showError(container, 'Failed to load applications.');
  }
}

async function renderApplicationsManagement(applications) {
  const container = document.getElementById('applications-management-content');

  if (applications.length === 0) {
    showEmpty(container, 'No applications found.');
    return;
  }

  // Get job details for each application
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

  container.innerHTML = applicationsWithJobs.map(app => {
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
          <p><strong>Student:</strong> ${escapeHtml(app.studentName)} (${escapeHtml(app.studentId)})</p>
          <p><strong>Email:</strong> ${escapeHtml(app.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(app.phone)}</p>
          <p><strong>Branch:</strong> ${escapeHtml(app.branch)}</p>
          <p><strong>CGPA:</strong> ${escapeHtml(app.cgpa)}</p>
          <p><strong>Applied:</strong> ${formatDateTime(app.appliedAt)}</p>
          <p><strong>Skills:</strong> ${escapeHtml(app.skills.join(', '))}</p>
        </div>
        <div class="application-card-actions">
          <select class="status-update" data-app-id="${app.id}" aria-label="Update application status">
            <option value="Submitted" ${app.status === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
            <option value="Shortlisted" ${app.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
            <option value="Interview Scheduled" ${app.status === 'Interview Scheduled' ? 'selected' : ''}>Interview Scheduled</option>
            <option value="Selected" ${app.status === 'Selected' ? 'selected' : ''}>Selected</option>
            <option value="Rejected" ${app.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="updateApplicationStatus('${app.id}')">Update Status</button>
        </div>
      </div>
    `;
  }).join('');
}

async function updateApplicationStatus(applicationId) {
  const select = document.querySelector(`select[data-app-id="${applicationId}"]`);
  const newStatus = select.value;

  try {
    await apiRequest(`/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: {
        'X-Admin-Key': adminKey
      },
      body: JSON.stringify({ status: newStatus })
    });

    showToast('Status updated successfully', 'success');
    loadAllApplications(); // Reload the list
  } catch (error) {
    console.error('Error updating status:', error);
    showToast('Failed to update status: ' + error.message, 'error');
  }
}

async function toggleJobStatus(jobId, currentStatus) {
  try {
    await apiRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'X-Admin-Key': adminKey
      },
      body: JSON.stringify({ isOpen: !currentStatus })
    });

    showToast(`Job ${currentStatus ? 'closed' : 'opened'} successfully`, 'success');
    loadAllJobs(); // Reload the list
  } catch (error) {
    console.error('Error updating job status:', error);
    showToast('Failed to update job status: ' + error.message, 'error');
  }
}

async function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
    return;
  }

  try {
    await apiRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': adminKey
      }
    });

    showToast('Job deleted successfully', 'success');
    loadAllJobs(); // Reload the list
  } catch (error) {
    console.error('Error deleting job:', error);
    showToast('Failed to delete job: ' + error.message, 'error');
  }
}

function showAddJobForm() {
  // For simplicity, we'll redirect to a placeholder
  // In a full implementation, this would show a modal or form
  showToast('Add job form would open here (not implemented in this demo)', 'info');
}

function editJob(jobId) {
  // For simplicity, we'll redirect to a placeholder
  // In a full implementation, this would show a modal or form with pre-filled data
  showToast('Edit job form would open here (not implemented in this demo)', 'info');
}

function logoutAdmin() {
  removeLocalStorage('adminKey');
  adminKey = null;
  document.getElementById('admin-key').value = '';
  document.getElementById('admin-content').innerHTML = `
    <div class="empty-state">
      <p>Enter admin key to access the admin panel.</p>
    </div>
  `;
  showToast('Logged out successfully', 'success');
}
