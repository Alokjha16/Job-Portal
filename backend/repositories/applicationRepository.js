const { readJson, writeJson, updateJson, findInJson, filterJson, updateInJson } = require('../utils/fileHandler');

const findAll = async () => {
  return await readJson('applications.json');
};

const findById = async (id) => {
  return await findInJson('applications.json', app => app.id === id);
};

const findByJobId = async (jobId) => {
  return await filterJson('applications.json', app => app.jobId === jobId);
};

const findByStudentEmail = async (email) => {
  return await filterJson('applications.json', app => app.email === email);
};

const findByStudentId = async (studentId) => {
  return await filterJson('applications.json', app => app.studentId === studentId);
};

const create = async (applicationData) => {
  return await updateJson('applications.json', (applications) => {
    const newApplication = {
      id: Date.now().toString(),
      ...applicationData,
      status: 'Submitted',
      appliedAt: new Date().toISOString(),
      statusHistory: [{ status: 'Submitted', at: new Date().toISOString() }]
    };
    applications.push(newApplication);
    return applications;
  });
};

const updateStatus = async (id, status) => {
  let updatedApp = null;
  await updateJson('applications.json', (applications) => {
    const app = applications.find(a => a.id === id);
    if (app) {
      app.status = status;
      if (!Array.isArray(app.statusHistory)) {
        app.statusHistory = [];
      }
      app.statusHistory.push({ status, at: new Date().toISOString() });
      updatedApp = app;
    }
    return applications;
  });
  return updatedApp;
};

const existsForJobAndStudent = async (jobId, email) => {
  const applications = await readJson('applications.json');
  return applications.some(app => app.jobId === jobId && app.email === email);
};

const getStats = async () => {
  const applications = await readJson('applications.json');
  return {
    total: applications.length,
    byStatus: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}),
    byJob: applications.reduce((acc, app) => {
      acc[app.jobId] = (acc[app.jobId] || 0) + 1;
      return acc;
    }, {}),
    byBranch: applications.reduce((acc, app) => {
      acc[app.branch] = (acc[app.branch] || 0) + 1;
      return acc;
    }, {})
  };
};

const checkEligibility = async (jobId, studentData) => {
  const { readJson, findInJson } = require('../utils/fileHandler');
  const job = await findInJson('jobs.json', job => job.id === jobId);

  if (!job) {
    return { eligible: false, reason: 'Job not found' };
  }

  const eligibility = job.eligibility;
  const issues = [];

  // Check education
  if (eligibility.education && !eligibility.education.includes(studentData.education)) {
    issues.push(`Education requirement: ${eligibility.education.join(' or ')}`);
  }

  // Check branch
  if (eligibility.branches && !eligibility.branches.includes(studentData.branch)) {
    issues.push(`Branch requirement: ${eligibility.branches.join(' or ')}`);
  }

  // Check CGPA
  if (eligibility.minCGPA && studentData.cgpa < eligibility.minCGPA) {
    issues.push(`Minimum CGPA requirement: ${eligibility.minCGPA}`);
  }

  // Check backlogs
  if (eligibility.maxBacklogs !== undefined && studentData.backlogs > eligibility.maxBacklogs) {
    issues.push(`Maximum backlogs allowed: ${eligibility.maxBacklogs}`);
  }

  // Check graduation year
  if (eligibility.graduationYear && studentData.graduationYear !== eligibility.graduationYear) {
    issues.push(`Graduation year requirement: ${eligibility.graduationYear}`);
  }

  return {
    eligible: issues.length === 0,
    issues,
    job
  };
};

module.exports = {
  findAll,
  findById,
  findByJobId,
  findByStudentEmail,
  findByStudentId,
  create,
  updateStatus,
  existsForJobAndStudent,
  getStats,
  checkEligibility
};
