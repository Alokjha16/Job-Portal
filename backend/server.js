const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

// Favicon route (prevents 404 console errors)
app.get('/favicon.ico', (req, res) => res.status(204).end());

// API Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/jobs.html'));
});

app.get('/job-details', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/job-details.html'));
});

app.get('/apply', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/apply.html'));
});

app.get('/applications', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/applications.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server (only if run directly, not when imported by serverless)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`College Placement Portal running on http://localhost:${PORT}`);
  });
}

module.exports = app;
