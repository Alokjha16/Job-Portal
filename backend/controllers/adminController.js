const { findAll: findAllJobs, getStats: getJobStats } = require('../repositories/jobRepository');
const { findAll: findAllApplications, getStats: getApplicationStats } = require('../repositories/applicationRepository');
const ApiResponse = require('../utils/apiResponse');

const getOverview = async (req, res, next) => {
  try {
    const jobs = await findAllJobs();
    const applications = await findAllApplications();
    const jobStats = await getJobStats();
    const applicationStats = await getApplicationStats();

    const overview = {
      jobs: {
        total: jobStats.total,
        open: jobStats.open,
        closed: jobStats.closed,
        companies: jobStats.companies,
        byType: jobStats.byType,
        byLocation: jobStats.byLocation
      },
      applications: {
        total: applicationStats.total,
        byStatus: applicationStats.byStatus,
        byJob: applicationStats.byJob,
        byBranch: applicationStats.byBranch
      },
      placement: {
        season: process.env.PLACEMENT_SEASON || '2026-27',
        studentsPlaced: parseInt(process.env.STUDENTS_PLACED) || 184,
        averagePackage: calculateAveragePackage(jobs)
      },
      recent: {
        recentJobs: jobs.slice(-5).reverse(),
        recentApplications: applications.slice(-5).reverse()
      }
    };

    ApiResponse.success(res, overview);
  } catch (error) {
    next(error);
  }
};

const calculateAveragePackage = (jobs) => {
  if (jobs.length === 0) return '0 LPA';

  let totalMin = 0;
  let totalMax = 0;
  let count = 0;

  jobs.forEach(job => {
    const salaryMatch = job.salary.match(/₹?([\d.]+)-([\d.]+)\s*LPA/);
    if (salaryMatch) {
      totalMin += parseFloat(salaryMatch[1]);
      totalMax += parseFloat(salaryMatch[2]);
      count++;
    }
  });

  if (count === 0) return '0 LPA';

  const avgMin = (totalMin / count).toFixed(1);
  const avgMax = (totalMax / count).toFixed(1);

  return `₹${avgMin}-${avgMax} LPA`;
};

module.exports = { getOverview };
