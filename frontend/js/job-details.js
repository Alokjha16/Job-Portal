// Job details page JavaScript

// Safe string conversion (avoids any dependency on escapeHtml)
function safe(val) {
  if (val === null || val === undefined) return '';
  const s = String(val);
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', async () => {
  let jobId = getQueryParam('id');
  if (!jobId) {
    jobId = '1';
  }
  console.log('[job-details] DOMContentLoaded, jobId:', jobId);
  await loadJobDetails(jobId);
  try { addToRecentlyViewed(jobId); } catch(e) {}
});

async function loadJobDetails(jobId) {
  const jobDetails = document.getElementById('job-details');
  console.log('[job-details] loadJobDetails called, element:', jobDetails);

  if (!jobDetails) {
    console.error('[job-details] #job-details element not found!');
    return;
  }

  showLoading(jobDetails, 'Loading job details...');

  try {
    console.log('[job-details] calling apiRequest /jobs/' + jobId);
    const job = await apiRequest(`/jobs/${jobId}`);
    console.log('[job-details] got job data:', job ? job.id : 'null');
    renderJobDetails(job);
  } catch (error) {
    console.error('[job-details] Error loading job details:', error);
    showError(jobDetails, 'Failed to load job details. Please try again.');
  }
}

function renderJobDetails(job) {
  console.log('[job-details] renderJobDetails called');
  const jobDetails = document.getElementById('job-details');

  if (!jobDetails) {
    console.error('[job-details] #job-details not found in renderJobDetails');
    return;
  }
  if (!job) {
    showError(jobDetails, 'Job data not available.');
    return;
  }

  try {
    const deadline = job.deadline || '';
    const countdown = getCountdown(deadline);
    const countdownClass = countdown.closed ? 'closed' : '';
    const isSaved = isJobSaved(job.id);

    const requirements = Array.isArray(job.requirements) ? job.requirements : [];
    const skills = Array.isArray(job.skills) ? job.skills : [];
    const selectionProcess = Array.isArray(job.selectionProcess) ? job.selectionProcess : [];
    const eligibility = (job.eligibility && typeof job.eligibility === 'object') ? job.eligibility : {};
    const branches = Array.isArray(eligibility.branches) ? eligibility.branches.join(', ') : String(eligibility.branches || '');

    console.log('[job-details] rendering HTML for:', job.title);

    jobDetails.innerHTML = `
      <div class="job-details-header">
        <div>
          <h1>${safe(job.title)}</h1>
          <div class="job-details-company">${safe(job.company)}</div>
          <div class="job-details-company">${safe(job.industry)}</div>
        </div>
        <div class="company-info-card">
          <h4>Company Information</h4>
          <p><strong>Industry:</strong> ${safe(job.industry)}</p>
          <p><strong>Description:</strong> ${safe(job.companyDescription)}</p>
          <p><strong>Website:</strong> ${job.companyWebsite ? `<a href="${safe(job.companyWebsite)}" target="_blank" rel="noopener noreferrer">${safe(job.companyWebsite)}</a>` : 'N/A'}</p>
        </div>
      </div>

      <div class="countdown ${countdownClass}">
        ${countdown.closed ? 'Applications Closed' : `Application closes in ${countdown.text}`}
      </div>

      <div class="job-details-meta">
        <div class="job-details-meta-item"><strong>Location</strong><span>${safe(job.location)}</span></div>
        <div class="job-details-meta-item"><strong>Work Mode</strong><span>${safe(job.workMode)}</span></div>
        <div class="job-details-meta-item"><strong>Job Type</strong><span>${safe(job.type)}</span></div>
        <div class="job-details-meta-item"><strong>Package</strong><span>${safe(job.salary)}</span></div>
        <div class="job-details-meta-item"><strong>Experience</strong><span>${safe(job.experience)}</span></div>
        <div class="job-details-meta-item"><strong>Posted Date</strong><span>${formatDate(job.postedDate)}</span></div>
        <div class="job-details-meta-item"><strong>Application Deadline</strong><span>${formatDate(job.deadline)}</span></div>
      </div>

      <div class="job-details-section">
        <h3>Job Description</h3>
        <p>${safe(job.description)}</p>
      </div>

      <div class="job-details-section">
        <h3>Key Requirements</h3>
        <ul>${requirements.length > 0 ? requirements.map(r => `<li>${safe(r)}</li>`).join('') : '<li>Refer to job description</li>'}</ul>
      </div>

      <div class="job-details-section">
        <h3>Required Skills</h3>
        <div class="skills-tags">${skills.length > 0 ? skills.map(s => `<span class="skill-tag">${safe(s)}</span>`).join('') : '<span class="skill-tag">General</span>'}</div>
      </div>

      <div class="job-details-section">
        <h3>Eligibility Criteria</h3>
        <ul>
          <li><strong>Education:</strong> ${safe(eligibility.education || 'B.E./B.Tech')}</li>
          <li><strong>Branches:</strong> ${safe(branches || 'All Branches')}</li>
          <li><strong>Minimum CGPA:</strong> ${eligibility.minCGPA !== undefined ? eligibility.minCGPA : 'N/A'}</li>
          <li><strong>Maximum Backlogs:</strong> ${eligibility.maxBacklogs !== undefined ? eligibility.maxBacklogs : '0'}</li>
          <li><strong>Graduation Year:</strong> ${eligibility.graduationYear || '2026'}</li>
        </ul>
      </div>

      <div class="job-details-section">
        <h3>Selection Process</h3>
        <ol class="selection-process">${selectionProcess.length > 0 ? selectionProcess.map(s => `<li>${safe(s)}</li>`).join('') : '<li>Technical Interview & HR Round</li>'}</ol>
      </div>

      <div class="job-details-actions">
        <button class="btn btn-primary" onclick="applyForJob('${safe(job.id)}')" ${countdown.closed ? 'disabled' : ''}>
          ${countdown.closed ? 'Applications Closed' : 'Apply Now'}
        </button>
        <button class="btn btn-outline" onclick="toggleSaveJob('${safe(job.id)}')">
          ${isSaved ? '&#9829; Remove from Saved' : '&#9825; Save Opportunity'}
        </button>
        <button class="btn btn-outline" onclick="goBack()">Back to Opportunities</button>
      </div>
    `;

    console.log('[job-details] HTML rendered successfully');
  } catch (err) {
    console.error('[job-details] Error inside renderJobDetails:', err);
    showError(jobDetails, 'Error rendering job details: ' + err.message);
  }
}

function applyForJob(jobId) {
  window.location.href = `apply.html?id=${jobId}`;
}

function toggleSaveJob(jid) {
  if (isJobSaved(jid)) {
    removeSavedJob(jid);
  } else {
    saveJob(jid);
  }
  loadJobDetails(jid);
}

function goBack() {
  window.location.href = 'jobs.html';
}
