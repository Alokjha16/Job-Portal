const { readJson, writeJson, updateJson, findInJson, filterJson, updateInJson, deleteFromJson } = require('../utils/fileHandler');

const findAll = async () => {
  return await readJson('jobs.json');
};

const findById = async (id) => {
  return await findInJson('jobs.json', job => job.id === id);
};

const search = async (criteria) => {
  const jobs = await readJson('jobs.json');
  return jobs.filter(job => {
    let matches = true;

    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      matches = matches && (
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    if (criteria.location) {
      matches = matches && job.location.toLowerCase().includes(criteria.location.toLowerCase());
    }

    if (criteria.type) {
      matches = matches && job.type.toLowerCase() === criteria.type.toLowerCase();
    }

    if (criteria.workMode) {
      matches = matches && job.workMode.toLowerCase() === criteria.workMode.toLowerCase();
    }

    if (criteria.minSalary) {
      const jobSalary = parseSalary(job.salary);
      matches = matches && jobSalary >= criteria.minSalary;
    }

    if (criteria.maxSalary) {
      const jobSalary = parseSalary(job.salary);
      matches = matches && jobSalary <= criteria.maxSalary;
    }

    if (criteria.isOpen !== undefined) {
      matches = matches && job.isOpen === criteria.isOpen;
    }

    return matches;
  });
};

const create = async (jobData) => {
  return await updateJson('jobs.json', (jobs) => {
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      postedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    jobs.push(newJob);
    return jobs;
  });
};

const update = async (id, updates) => {
  return await updateInJson('jobs.json', job => job.id === id, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
};

const remove = async (id) => {
  return await deleteFromJson('jobs.json', job => job.id === id);
};

const getStats = async () => {
  const jobs = await readJson('jobs.json');
  return {
    total: jobs.length,
    open: jobs.filter(job => job.isOpen).length,
    closed: jobs.filter(job => !job.isOpen).length,
    byType: jobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {}),
    byLocation: jobs.reduce((acc, job) => {
      acc[job.location] = (acc[job.location] || 0) + 1;
      return acc;
    }, {}),
    companies: new Set(jobs.map(job => job.company)).size
  };
};

const parseSalary = (salaryString) => {
  const numbers = salaryString.match(/\d+/g);
  return numbers ? parseInt(numbers.join('')) : 0;
};

const isOpen = (job) => {
  if (!job.isOpen) return false;
  if (!job.deadline) return true;
  return new Date(job.deadline) > new Date();
};

module.exports = {
  findAll,
  findById,
  search,
  create,
  update,
  remove,
  getStats,
  isOpen
};
