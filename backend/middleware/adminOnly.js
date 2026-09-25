const { ApiError } = require('./errorHandler');

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

const adminOnly = (req, res, next) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return next(new ApiError(401, 'Admin key missing or invalid.'));
  }
  next();
};

module.exports = adminOnly;
