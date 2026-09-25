const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminOnly = require('../middleware/adminOnly');

router.get('/overview', adminOnly, adminController.getOverview);

module.exports = router;
