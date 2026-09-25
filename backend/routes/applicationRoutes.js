const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { validateApplication, validateStatus } = require('../middleware/validation');

router.get('/', applicationController.getApplications);
router.get('/stats', applicationController.getApplicationStats);
router.get('/:id', applicationController.getApplicationById);
router.get('/job/:jobId', applicationController.getApplicationsByJob);
router.get('/student/email/:email', applicationController.getApplicationsByStudent);
router.get('/student/id/:studentId', applicationController.getApplicationsByStudentId);
router.post('/', validateApplication, applicationController.createApplication);
router.post('/:jobId/check-eligibility', applicationController.checkApplicationEligibility);
router.patch('/:id/status', validateStatus, applicationController.updateApplicationStatus);

module.exports = router;
