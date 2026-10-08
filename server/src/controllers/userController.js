const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const getPagination = require('../utils/pagination');

const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid user ID', 400);
};

// GET /api/users?page=1&limit=10 (admin only)
exports.getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, 10);
  const total = await User.countDocuments();
  const users = await User.find().sort('-createdAt').skip(skip).limit(limit);
  res.status(200).json({ success: true, count: users.length, total, page, pages: Math.ceil(total / limit), data: users });
});

// PATCH /api/users/:id/role (admin only)
exports.updateUserRole = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) throw new AppError('Role must be "user" or "admin"', 400);
  if (req.params.id === req.user._id.toString()) throw new AppError('You cannot change your own role', 400);

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) throw new AppError('User not found', 404);
  res.status(200).json({ success: true, data: user });
});

// DELETE /api/users/:id (admin only) - also removes the user's jobs
exports.deleteUser = asyncHandler(async (req, res) => {
  checkId(req.params.id);
  if (req.params.id === req.user._id.toString()) throw new AppError('You cannot delete your own account', 400);

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  await Job.deleteMany({ createdBy: user._id });
  res.status(200).json({ success: true, message: 'User and their jobs deleted successfully' });
});
