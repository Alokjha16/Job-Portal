const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { validateJob } = require('../middleware/validation');

router.get('/', jobController.getJobs);
router.get('/search', jobController.searchJobs);
router.get('/stats', jobController.getStats);
router.get('/:id', jobController.getJobById);
router.post('/', validateJob(false), jobController.createJob);
router.put('/:id', validateJob(true), jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

module.exports = router;
