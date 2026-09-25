const { findAll, findById, search, create, update, remove, getStats, isOpen } = require('../repositories/jobRepository');
const { ApiError } = require('../middleware/errorHandler');
const ApiResponse = require('../utils/apiResponse');
const { sanitizeText, toStringArray } = require('../middleware/validation');

const getJobs = async (req, res, next) => {
  try {
    const jobs = await findAll();
    ApiResponse.success(res, jobs);
  } catch (error) {
    next(error);
  }
};

const searchJobs = async (req, res, next) => {
  try {
    const criteria = {
      search: req.query.search,
      location: req.query.location,
      type: req.query.type,
      workMode: req.query.workMode,
      minSalary: req.query.minSalary ? parseInt(req.query.minSalary) : undefined,
      maxSalary: req.query.maxSalary ? parseInt(req.query.maxSalary) : undefined,
      isOpen: req.query.isOpen !== undefined ? req.query.isOpen === 'true' : undefined
    };

    const jobs = await search(criteria);
    ApiResponse.success(res, jobs);
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await findById(id);
    if (!job) {
      return ApiResponse.notFound(res, 'Job not found');
    }
    ApiResponse.success(res, job);
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const jobData = {
      title: sanitizeText(req.body.title),
      company: sanitizeText(req.body.company),
      companyLogo: req.body.companyLogo || generateLogo(req.body.company),
      industry: sanitizeText(req.body.industry),
      companyDescription: sanitizeText(req.body.companyDescription),
      companyWebsite: req.body.companyWebsite,
      location: sanitizeText(req.body.location),
      workMode: sanitizeText(req.body.workMode),
      type: sanitizeText(req.body.type),
      salary: sanitizeText(req.body.salary),
      experience: sanitizeText(req.body.experience),
      description: sanitizeText(req.body.description),
      requirements: toStringArray(req.body.requirements),
      skills: toStringArray(req.body.skills),
      eligibility: req.body.eligibility,
      selectionProcess: toStringArray(req.body.selectionProcess),
      deadline: req.body.deadline || null,
      isOpen: true
    };

    await create(jobData);
    ApiResponse.created(res, null, 'Job created successfully');
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.title) updates.title = sanitizeText(req.body.title);
    if (req.body.company) updates.company = sanitizeText(req.body.company);
    if (req.body.companyLogo) updates.companyLogo = req.body.companyLogo;
    if (req.body.industry) updates.industry = sanitizeText(req.body.industry);
    if (req.body.companyDescription) updates.companyDescription = sanitizeText(req.body.companyDescription);
    if (req.body.companyWebsite) updates.companyWebsite = req.body.companyWebsite;
    if (req.body.location) updates.location = sanitizeText(req.body.location);
    if (req.body.workMode) updates.workMode = sanitizeText(req.body.workMode);
    if (req.body.type) updates.type = sanitizeText(req.body.type);
    if (req.body.salary) updates.salary = sanitizeText(req.body.salary);
    if (req.body.experience) updates.experience = sanitizeText(req.body.experience);
    if (req.body.description) updates.description = sanitizeText(req.body.description);
    if (req.body.requirements) updates.requirements = toStringArray(req.body.requirements);
    if (req.body.skills) updates.skills = toStringArray(req.body.skills);
    if (req.body.eligibility) updates.eligibility = req.body.eligibility;
    if (req.body.selectionProcess) updates.selectionProcess = toStringArray(req.body.selectionProcess);
    if (req.body.deadline !== undefined) updates.deadline = req.body.deadline;
    if (req.body.isOpen !== undefined) updates.isOpen = req.body.isOpen;

    const result = await update(id, updates);
    if (!result) {
      return ApiResponse.notFound(res, 'Job not found');
    }
    ApiResponse.success(res, null, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    await remove(id);
    ApiResponse.success(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

const getStatsHandler = async (req, res, next) => {
  try {
    const stats = await getStats();
    ApiResponse.success(res, stats);
  } catch (error) {
    next(error);
  }
};

const generateLogo = (companyName) => {
  const words = companyName.split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return companyName.substring(0, 2).toUpperCase();
};

module.exports = {
  getJobs,
  searchJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getStats: getStatsHandler,
  isOpen
};
