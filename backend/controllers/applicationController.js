const {
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
} = require('../repositories/applicationRepository');
const { findById: findJob } = require('../repositories/jobRepository');
const { ApiError } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { sanitizeText, toStringArray } = require('../middleware/validation');

const getApplications = async (req, res, next) => {
  try {
    const applications = await findAll();
    ApiResponse.success(res, applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await findById(id);
    if (!application) {
      return ApiResponse.notFound(res, 'Application not found');
    }
    ApiResponse.success(res, application);
  } catch (error) {
    next(error);
  }
};

const getApplicationsByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const applications = await findByJobId(jobId);
    ApiResponse.success(res, applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationsByStudent = async (req, res, next) => {
  try {
    const { email } = req.params;
    const applications = await findByStudentEmail(email);
    ApiResponse.success(res, applications);
  } catch (error) {
    next(error);
  }
};

const getApplicationsByStudentId = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const applications = await findByStudentId(studentId);
    ApiResponse.success(res, applications);
  } catch (error) {
    next(error);
  }
};

const createApplication = async (req, res, next) => {
  try {
    const { jobId, studentName, studentId, email, phone, branch, year, cgpa, graduationYear, skills, resume, coverLetter } = req.body;

    // Check if job exists
    const job = await findJob(jobId);
    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }

    // Check if job is still open
    if (!job.isOpen || (job.deadline && new Date(job.deadline) < new Date())) {
      return ApiResponse.badRequest(res, 'Applications are closed for this position');
    }

    // Check for duplicate application
    const exists = await existsForJobAndStudent(jobId, email);
    if (exists) {
      return ApiResponse.conflict(res, 'You have already applied for this job');
    }

    const applicationData = {
      jobId,
      studentName: sanitizeText(studentName),
      studentId: sanitizeText(studentId),
      email: sanitizeText(email),
      phone: sanitizeText(phone),
      branch: sanitizeText(branch),
      year: sanitizeText(year),
      cgpa: parseFloat(cgpa),
      graduationYear: parseInt(graduationYear),
      skills: toStringArray(skills),
      resume: sanitizeText(resume),
      coverLetter: coverLetter ? sanitizeText(coverLetter) : ''
    };

    const result = await create(applicationData);
    ApiResponse.created(res, result[result.length - 1], 'Application submitted successfully');
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await updateStatus(id, status);
    if (!result) {
      return ApiResponse.notFound(res, 'Application not found');
    }
    ApiResponse.success(res, null, 'Application status updated successfully');
  } catch (error) {
    next(error);
  }
};

const getApplicationStats = async (req, res, next) => {
  try {
    const stats = await getStats();
    ApiResponse.success(res, stats);
  } catch (error) {
    next(error);
  }
};

const checkApplicationEligibility = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const studentData = req.body;

    const eligibilityCheck = await checkEligibility(jobId, studentData);
    ApiResponse.success(res, eligibilityCheck);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  getApplicationsByJob,
  getApplicationsByStudent,
  getApplicationsByStudentId,
  createApplication,
  updateApplicationStatus,
  getApplicationStats,
  checkApplicationEligibility
};
