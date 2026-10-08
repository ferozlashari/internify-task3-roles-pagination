const mongoose = require('mongoose');
const Job = require('../models/Job');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');
const getPagination = require('../utils/pagination');

const JOB_FIELDS = ['title', 'company', 'location', 'type', 'salary', 'description'];

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid job ID', 400);
};

// Admins can manage every job; normal users only the jobs they created.
const assertCanModify = (user, job) => {
  if (user.role !== 'admin' && !job.createdBy.equals(user._id)) {
    throw new AppError('Forbidden: you can only modify your own jobs', 403);
  }
};

// POST /api/jobs (any logged-in user)
exports.createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...pick(req.body, JOB_FIELDS), createdBy: req.user._id });
  res.status(201).json({ success: true, data: job });
});

// GET /api/jobs?page=1&limit=10&search=developer&location=remote&type=Full-time (public)
exports.getJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const { search, location, type } = req.query;
  const filter = {};

  if (typeof search === 'string' && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: regex }, { company: regex }, { description: regex }];
  }
  if (typeof location === 'string' && location.trim()) {
    filter.location = new RegExp(escapeRegex(location.trim()), 'i');
  }
  if (typeof type === 'string' && type.trim()) filter.type = type.trim();

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('createdBy', 'name');

  res.status(200).json({
    success: true,
    count: jobs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: jobs,
  });
});

// GET /api/jobs/:id (public)
exports.getJob = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const job = await Job.findById(req.params.id).populate('createdBy', 'name');
  if (!job) throw new AppError('Job not found', 404);
  res.status(200).json({ success: true, data: job });
});

// PUT /api/jobs/:id (owner or admin)
exports.updateJob = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  assertCanModify(req.user, job);

  job.set(pick(req.body, JOB_FIELDS));
  await job.save(); // runs schema validators
  await job.populate('createdBy', 'name');
  res.status(200).json({ success: true, data: job });
});

// DELETE /api/jobs/:id (owner or admin)
exports.deleteJob = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found', 404);
  assertCanModify(req.user, job);

  await job.deleteOne();
  res.status(200).json({ success: true, message: 'Job deleted successfully' });
});
