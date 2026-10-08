const express = require('express');
const { createJob, getJobs, getJob, updateJob, deleteJob } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getJobs).post(protect, createJob);
router.route('/:id').get(getJob).put(protect, updateJob).delete(protect, deleteJob);

module.exports = router;
